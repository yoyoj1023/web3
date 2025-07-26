use core::borrow::Borrow;

use p3_air::{Air, AirBuilder, BaseAir};
use p3_baby_bear::{BabyBear, Poseidon2BabyBear};
use p3_challenger::DuplexChallenger;
use p3_commit::ExtensionMmcs;
use p3_dft::Radix2DitParallel;
use p3_field::extension::BinomialExtensionField;
use p3_field::{Field, PrimeField64, PrimeCharacteristicRing};
use p3_fri::{TwoAdicFriPcs, create_test_fri_params};
use p3_matrix::{Matrix, dense::RowMajorMatrix};
use p3_merkle_tree::MerkleTreeMmcs;
use p3_symmetric::{PaddingFreeSponge, TruncatedPermutation};
use p3_uni_stark::{StarkConfig, prove, verify};
use rand::SeedableRng;
use rand::rngs::SmallRng;

/// 操作類型：支援加法和減法
#[derive(Clone, Copy, Debug, PartialEq)]
enum Opcode {
    ADD,
    SUB,
}

/// 表示一條 ALU 指令
#[derive(Clone, Copy, Debug)]
struct Instruction {
    op: Opcode,     // 操作類型
    dest: usize,    // 目標寄存器索引 0-3
    src1: usize,    // 來源1寄存器索引 0-3
    src2: usize,    // 來源2寄存器索引 0-3
}

/// 通用算術邏輯單元 Chip 結構
pub struct AluChip;

/// ALU 的列數（18 列）
/// 4 個寄存器值 + 4*3 個寄存器選擇器 + 2 個操作選擇器
const NUM_ALU_COLS: usize = 18;

/// 表示 ALU 的一行數據
/// 包含 4 個寄存器值、12 個寄存器選擇器和 2 個操作選擇器
#[derive(Clone, Copy)]
pub struct AluRow<F> {
    // 寄存器值 (4 列)
    pub r0: F,
    pub r1: F,
    pub r2: F,
    pub r3: F,
    // 目標選擇器 (one-hot, 4 列)
    pub dest_0: F,
    pub dest_1: F,
    pub dest_2: F,
    pub dest_3: F,
    // 來源1選擇器 (one-hot, 4 列)
    pub src1_0: F,
    pub src1_1: F,
    pub src1_2: F,
    pub src1_3: F,
    // 來源2選擇器 (one-hot, 4 列)
    pub src2_0: F,
    pub src2_1: F,
    pub src2_2: F,
    pub src2_3: F,
    // 操作選擇器 (one-hot, 2 列)
    pub op_add: F,
    pub op_sub: F,
}

/// 實現從切片到 AluRow 的借用轉換
impl<F> Borrow<AluRow<F>> for [F] {
    fn borrow(&self) -> &AluRow<F> {
        debug_assert_eq!(self.len(), NUM_ALU_COLS);
        let (prefix, shorts, suffix) = unsafe { self.align_to::<AluRow<F>>() };
        debug_assert!(prefix.is_empty(), "Alignment should match");
        debug_assert!(suffix.is_empty(), "Alignment should match");
        debug_assert_eq!(shorts.len(), 1);
        &shorts[0]
    }
}

/// 為 AluChip 實現 BaseAir trait
impl<F> BaseAir<F> for AluChip {
    fn width(&self) -> usize {
        NUM_ALU_COLS
    }
}

/// 為 AluChip 實現 Air trait，定義約束條件
impl<AB: AirBuilder> Air<AB> for AluChip {
    fn eval(&self, builder: &mut AB) {
        let main = builder.main();

        // 獲取當前行和下一行的數據
        let (local, next) = (
            main.row_slice(0).expect("Matrix is empty?"),
            main.row_slice(1).expect("Matrix only has 1 row?"),
        );
        let local: &AluRow<AB::Var> = (*local).borrow();
        let next: &AluRow<AB::Var> = (*next).borrow();

        // 約束 1：選擇器有效性 (Selector Validity)
        
        // 寄存器選擇器必須是 0 或 1
        builder.assert_bool(local.dest_0.clone());
        builder.assert_bool(local.dest_1.clone());
        builder.assert_bool(local.dest_2.clone());
        builder.assert_bool(local.dest_3.clone());
        
        builder.assert_bool(local.src1_0.clone());
        builder.assert_bool(local.src1_1.clone());
        builder.assert_bool(local.src1_2.clone());
        builder.assert_bool(local.src1_3.clone());
        
        builder.assert_bool(local.src2_0.clone());
        builder.assert_bool(local.src2_1.clone());
        builder.assert_bool(local.src2_2.clone());
        builder.assert_bool(local.src2_3.clone());

        // 操作選擇器必須是 0 或 1
        builder.assert_bool(local.op_add.clone());
        builder.assert_bool(local.op_sub.clone());

        // 確保每一組選擇器都是 one-hot 的
        builder.assert_one(
            local.dest_0.clone() + local.dest_1.clone() + local.dest_2.clone() + local.dest_3.clone()
        );
        builder.assert_one(
            local.src1_0.clone() + local.src1_1.clone() + local.src1_2.clone() + local.src1_3.clone()
        );
        builder.assert_one(
            local.src2_0.clone() + local.src2_1.clone() + local.src2_2.clone() + local.src2_3.clone()
        );
        
        // 操作選擇器也必須是 one-hot 的
        builder.assert_one(local.op_add.clone() + local.op_sub.clone());

        // 約束 2：狀態轉移 (State Transition)
        let mut when_transition = builder.when_transition();
        
        // 計算來源值 (使用點積)
        let src1_val = local.r0.clone() * local.src1_0.clone()
                     + local.r1.clone() * local.src1_1.clone()
                     + local.r2.clone() * local.src1_2.clone()
                     + local.r3.clone() * local.src1_3.clone();

        let src2_val = local.r0.clone() * local.src2_0.clone()
                     + local.r1.clone() * local.src2_1.clone()
                     + local.r2.clone() * local.src2_2.clone()
                     + local.r3.clone() * local.src2_3.clone();

        // 🔥 核心：條件化的運算結果計算
        // 根據操作選擇器決定執行加法還是減法
        let add_result = src1_val.clone() + src2_val.clone();
        let sub_result = src1_val - src2_val;
        
        // 使用選擇器來條件化選擇結果
        // result = add_result * op_add + sub_result * op_sub
        // 當 op_add=1, op_sub=0 時：result = add_result
        // 當 op_add=0, op_sub=1 時：result = sub_result
        let result = add_result * local.op_add.clone() + sub_result * local.op_sub.clone();

        // 約束每個寄存器的下一狀態
        // 如果 dest_i 是 1，則 next_reg[i] = result
        // 如果 dest_i 是 0，則 next_reg[i] = local_reg[i]
        let regs = [&local.r0, &local.r1, &local.r2, &local.r3];
        let next_regs = [&next.r0, &next.r1, &next.r2, &next.r3];
        let dest_selectors = [&local.dest_0, &local.dest_1, &local.dest_2, &local.dest_3];

        for i in 0..4 {
            let expected_next = regs[i].clone() * (AB::Expr::ONE - dest_selectors[i].clone()) 
                              + result.clone() * dest_selectors[i].clone();
            when_transition.assert_eq(next_regs[i].clone(), expected_next);
        }
    }
}

/// 生成 ALU 的執行軌跡
impl AluChip {
    pub fn generate_trace<F: PrimeField64>(
        program: Vec<Instruction>,
        initial_regs: [F; 4],
    ) -> RowMajorMatrix<F> {
        let n = program.len();
        assert!(n > 0, "Program cannot be empty");
        
        // 確保長度為 2 的冪次（為了與 Plonky3 兼容）
        let trace_len = if n.is_power_of_two() { n } else { n.next_power_of_two() };
        
        let mut trace = RowMajorMatrix::new(
            F::zero_vec(trace_len * NUM_ALU_COLS),
            NUM_ALU_COLS,
        );

        let (prefix, rows, suffix) = unsafe { trace.values.align_to_mut::<AluRow<F>>() };
        assert!(prefix.is_empty(), "Alignment should match");
        assert!(suffix.is_empty(), "Alignment should match");
        assert_eq!(rows.len(), trace_len);

        // 初始化當前寄存器狀態
        let mut current_regs = initial_regs;

        // 處理每條指令
        for (i, instruction) in program.iter().enumerate() {
            // 建立當前行 (18 列)
            let mut row = AluRow {
                r0: current_regs[0],
                r1: current_regs[1],
                r2: current_regs[2],
                r3: current_regs[3],
                dest_0: F::from_u64(0),
                dest_1: F::from_u64(0),
                dest_2: F::from_u64(0),
                dest_3: F::from_u64(0),
                src1_0: F::from_u64(0),
                src1_1: F::from_u64(0),
                src1_2: F::from_u64(0),
                src1_3: F::from_u64(0),
                src2_0: F::from_u64(0),
                src2_1: F::from_u64(0),
                src2_2: F::from_u64(0),
                src2_3: F::from_u64(0),
                op_add: F::from_u64(0),
                op_sub: F::from_u64(0),
            };

            // 設定目標寄存器選擇器 (one-hot 編碼)
            match instruction.dest {
                0 => row.dest_0 = F::from_u64(1),
                1 => row.dest_1 = F::from_u64(1),
                2 => row.dest_2 = F::from_u64(1),
                3 => row.dest_3 = F::from_u64(1),
                _ => panic!("Invalid dest register: {}", instruction.dest),
            }

            // 設定來源1寄存器選擇器 (one-hot 編碼)
            match instruction.src1 {
                0 => row.src1_0 = F::from_u64(1),
                1 => row.src1_1 = F::from_u64(1),
                2 => row.src1_2 = F::from_u64(1),
                3 => row.src1_3 = F::from_u64(1),
                _ => panic!("Invalid src1 register: {}", instruction.src1),
            }

            // 設定來源2寄存器選擇器 (one-hot 編碼)
            match instruction.src2 {
                0 => row.src2_0 = F::from_u64(1),
                1 => row.src2_1 = F::from_u64(1),
                2 => row.src2_2 = F::from_u64(1),
                3 => row.src2_3 = F::from_u64(1),
                _ => panic!("Invalid src2 register: {}", instruction.src2),
            }

            // 設定操作選擇器 (one-hot 編碼)
            match instruction.op {
                Opcode::ADD => {
                    row.op_add = F::from_u64(1);
                    row.op_sub = F::from_u64(0);
                }
                Opcode::SUB => {
                    row.op_add = F::from_u64(0);
                    row.op_sub = F::from_u64(1);
                }
            }

            // 將行加入 trace
            rows[i] = row;

            // 更新寄存器狀態（為下一行準備）
            let src1_val = current_regs[instruction.src1];
            let src2_val = current_regs[instruction.src2];
            
            let result = match instruction.op {
                Opcode::ADD => src1_val + src2_val,
                Opcode::SUB => src1_val - src2_val,
            };
            
            current_regs[instruction.dest] = result;
        }

        // 如果需要填充額外的行（維持最後狀態）
        for i in n..trace_len {
            rows[i] = rows[n - 1];
        }

        trace
    }
}

// 類型定義（與之前的範例相同）
type Val = BabyBear;
type Perm = Poseidon2BabyBear<16>;
type MyHash = PaddingFreeSponge<Perm, 16, 8, 8>;
type MyCompress = TruncatedPermutation<Perm, 2, 8, 16>;
type ValMmcs = MerkleTreeMmcs<<Val as Field>::Packing, <Val as Field>::Packing, MyHash, MyCompress, 8>;
type Challenge = BinomialExtensionField<Val, 4>;
type ChallengeMmcs = ExtensionMmcs<Val, Challenge, ValMmcs>;
type Challenger = DuplexChallenger<Val, Perm, 16, 8>;
type Dft = Radix2DitParallel<Val>;
type Pcs = TwoAdicFriPcs<Val, Dft, ValMmcs, ChallengeMmcs>;
type MyConfig = StarkConfig<Pcs, Challenge, Challenger>;

fn main() {
    println!("🔧 開始通用算術邏輯單元 (ALU) 零知識證明器...");

    // 設定隨機數生成器和密碼學組件
    let mut rng = SmallRng::seed_from_u64(42);
    let perm = Perm::new_from_rng_128(&mut rng);
    let hash = MyHash::new(perm.clone());
    let compress = MyCompress::new(perm.clone());
    let val_mmcs = ValMmcs::new(hash, compress);
    let challenge_mmcs = ChallengeMmcs::new(val_mmcs.clone());
    let dft = Dft::default();

    // 創建 FRI 參數
    let fri_params = create_test_fri_params(challenge_mmcs, 2);
    let pcs = Pcs::new(dft, val_mmcs, fri_params);
    let challenger = Challenger::new(perm);
    let config = MyConfig::new(pcs, challenger);

    // 創建 ALU Chip
    let chip = AluChip;

    // 定義測試程式：混合 ADD 和 SUB 指令
    println!("📝 定義 ALU 測試程式：");
    let mut program = vec![
        Instruction { op: Opcode::ADD, dest: 0, src1: 0, src2: 1 }, // r0 = r0 + r1 = 1 + 2 = 3
        Instruction { op: Opcode::SUB, dest: 1, src1: 2, src2: 0 }, // r1 = r2 - r0 = 5 - 3 = 2
        Instruction { op: Opcode::ADD, dest: 3, src1: 0, src2: 1 }, // r3 = r0 + r1 = 3 + 2 = 5
        Instruction { op: Opcode::SUB, dest: 2, src1: 3, src2: 1 }, // r2 = r3 - r1 = 5 - 2 = 3
    ];

    // 添加更多指令以達到 2^6 = 64 條指令
    while program.len() < 64 {
        program.push(Instruction { op: Opcode::ADD, dest: 0, src1: 0, src2: 1 }); // r0 = r0 + r1
        if program.len() < 64 {
            program.push(Instruction { op: Opcode::SUB, dest: 1, src1: 1, src2: 0 }); // r1 = r1 - r0
        }
        if program.len() < 64 {
            program.push(Instruction { op: Opcode::ADD, dest: 2, src1: 2, src2: 3 }); // r2 = r2 + r3
        }
        if program.len() < 64 {
            program.push(Instruction { op: Opcode::SUB, dest: 3, src1: 3, src2: 2 }); // r3 = r3 - r2
        }
    }

    // 只顯示前幾條重要指令
    for (i, inst) in program.iter().take(8).enumerate() {
        let op_str = match inst.op {
            Opcode::ADD => "ADD",
            Opcode::SUB => "SUB",
        };
        println!("  指令 {}: {} r{} = r{} {} r{}", 
                 i + 1, op_str, inst.dest, inst.src1, 
                 if inst.op == Opcode::ADD { "+" } else { "-" }, 
                 inst.src2);
    }
    if program.len() > 8 {
        println!("  ... 還有 {} 條指令", program.len() - 8);
    }

    // 設定初始寄存器狀態
    let initial_regs = [
        Val::from_u64(1), // r0 = 1
        Val::from_u64(2), // r1 = 2  
        Val::from_u64(5), // r2 = 5
        Val::from_u64(0)  // r3 = 0
    ];
    println!("🏁 初始寄存器狀態: [r0={}, r1={}, r2={}, r3={}]", 
             initial_regs[0].as_canonical_u64(),
             initial_regs[1].as_canonical_u64(), 
             initial_regs[2].as_canonical_u64(),
             initial_regs[3].as_canonical_u64());

    // 生成執行軌跡
    println!("📊 生成執行軌跡...");
    let trace = AluChip::generate_trace::<Val>(program.clone(), initial_regs);

    // 手動驗證執行結果（只顯示前幾步和最後結果）
    println!("✨ ALU 執行過程：");
    let mut regs = [1u64, 2u64, 5u64, 0u64];
    println!("  初始狀態: [r0={}, r1={}, r2={}, r3={}]", regs[0], regs[1], regs[2], regs[3]);
    
    for (i, inst) in program.iter().enumerate() {
        let src1_val = regs[inst.src1];
        let src2_val = regs[inst.src2];
        
        let result = match inst.op {
            Opcode::ADD => src1_val + src2_val,
            Opcode::SUB => {
                if src1_val >= src2_val {
                    src1_val - src2_val
                } else {
                    // 在有限域中的減法
                    let p = (1u64 << 31) - (1u64 << 27) + 1; // BabyBear 的模數
                    (src1_val + p - src2_val) % p
                }
            }
        };
        
        regs[inst.dest] = result;
        
        // 只顯示前 6 步的詳細執行過程
        if i < 6 {
            let op_str = match inst.op {
                Opcode::ADD => "+",
                Opcode::SUB => "-",
            };
            println!("  執行指令 {}: r{} = r{} {} r{} = {} {} {} = {} -> [r0={}, r1={}, r2={}, r3={}]", 
                     i + 1, inst.dest, inst.src1, op_str, inst.src2, 
                     src1_val, op_str, src2_val, result,
                     regs[0], regs[1], regs[2], regs[3]);
        }
    }
    
    if program.len() > 6 {
        println!("  ... 執行了 {} 條指令", program.len() - 6);
    }

    println!("🎯 最終寄存器狀態: [r0={}, r1={}, r2={}, r3={}]", regs[0], regs[1], regs[2], regs[3]);

    // 生成證明
    println!("🔐 正在生成 STARK 證明...");
    let proof = prove(&config, &chip, trace, &vec![]);
    println!("✅ 證明生成完成！");

    // 驗證證明
    println!("🔍 正在驗證證明...");
    match verify(&config, &chip, &proof, &vec![]) {
        Ok(_) => println!("🎉 證明驗證成功！ALU 執行正確性已得到證明。"),
        Err(e) => println!("❌ 證明驗證失敗：{:?}", e),
    }

    println!("🏁 通用算術邏輯單元 (ALU) 零知識證明器運行完畢！");
    
    // 🤔 思考題提示
    println!("\n💭 思考題：");
    println!("1. 條件約束的威力：操作選擇器如何實現 if/else 邏輯？");
    println!("2. 如果用單一 is_sub 欄位替代 op_add/op_sub，約束該如何修改？");
    println!("3. 如何進一步添加 MUL 指令？需要修改哪些部分？");
} 