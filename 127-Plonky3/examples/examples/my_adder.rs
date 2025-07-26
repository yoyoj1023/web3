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

/// 表示一條加法指令
#[derive(Clone, Copy, Debug)]
struct Instruction {
    dest: usize, // 目標寄存器索引 0-3
    src1: usize, // 來源1寄存器索引 0-3
    src2: usize, // 來源2寄存器索引 0-3
}

/// 通用加法處理器 Chip 結構
pub struct AdderChip;

/// 通用加法處理器的列數（16 列）
/// 4 個寄存器值 + 4*3 個選擇器
const NUM_ADDER_COLS: usize = 16;

/// 表示通用加法處理器的一行數據
/// 包含 4 個寄存器值和 12 個選擇器
#[derive(Clone, Copy)]
pub struct AdderRow<F> {
    // 寄存器值
    pub r0: F,
    pub r1: F,
    pub r2: F,
    pub r3: F,
    // 目標選擇器 (one-hot)
    pub dest_0: F,
    pub dest_1: F,
    pub dest_2: F,
    pub dest_3: F,
    // 來源1選擇器 (one-hot)
    pub src1_0: F,
    pub src1_1: F,
    pub src1_2: F,
    pub src1_3: F,
    // 來源2選擇器 (one-hot)
    pub src2_0: F,
    pub src2_1: F,
    pub src2_2: F,
    pub src2_3: F,
}

/// 實現從切片到 AdderRow 的借用轉換
impl<F> Borrow<AdderRow<F>> for [F] {
    fn borrow(&self) -> &AdderRow<F> {
        debug_assert_eq!(self.len(), NUM_ADDER_COLS);
        let (prefix, shorts, suffix) = unsafe { self.align_to::<AdderRow<F>>() };
        debug_assert!(prefix.is_empty(), "Alignment should match");
        debug_assert!(suffix.is_empty(), "Alignment should match");
        debug_assert_eq!(shorts.len(), 1);
        &shorts[0]
    }
}

/// 為 AdderChip 實現 BaseAir trait
impl<F> BaseAir<F> for AdderChip {
    fn width(&self) -> usize {
        NUM_ADDER_COLS
    }
}

/// 為 AdderChip 實現 Air trait，定義約束條件
impl<AB: AirBuilder> Air<AB> for AdderChip {
    fn eval(&self, builder: &mut AB) {
        let main = builder.main();

        // 獲取當前行和下一行的數據
        let (local, next) = (
            main.row_slice(0).expect("Matrix is empty?"),
            main.row_slice(1).expect("Matrix only has 1 row?"),
        );
        let local: &AdderRow<AB::Var> = (*local).borrow();
        let next: &AdderRow<AB::Var> = (*next).borrow();

        // 約束 1：選擇器有效性 (Selector Validity)
        // 確保所有選擇器欄位的值都是 0 或 1
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

        // 計算加法結果
        let add_result = src1_val + src2_val;

        // 約束每個寄存器的下一狀態
        // 如果 dest_i 是 1，則 next_reg[i] = add_result
        // 如果 dest_i 是 0，則 next_reg[i] = local_reg[i]
        let regs = [&local.r0, &local.r1, &local.r2, &local.r3];
        let next_regs = [&next.r0, &next.r1, &next.r2, &next.r3];
        let dest_selectors = [&local.dest_0, &local.dest_1, &local.dest_2, &local.dest_3];

        for i in 0..4 {
            let expected_next = regs[i].clone() * (AB::Expr::ONE - dest_selectors[i].clone()) 
                              + add_result.clone() * dest_selectors[i].clone();
            when_transition.assert_eq(next_regs[i].clone(), expected_next);
        }
    }
}

/// 生成通用加法處理器的執行軌跡
impl AdderChip {
    pub fn generate_trace<F: PrimeField64>(
        program: Vec<Instruction>,
        initial_regs: [F; 4],
    ) -> RowMajorMatrix<F> {
        let n = program.len();
        assert!(n > 0, "Program cannot be empty");
        
        // 確保長度為 2 的冪次（為了與 Plonky3 兼容）
        let trace_len = if n.is_power_of_two() { n } else { n.next_power_of_two() };
        
        let mut trace = RowMajorMatrix::new(
            F::zero_vec(trace_len * NUM_ADDER_COLS),
            NUM_ADDER_COLS,
        );

        let (prefix, rows, suffix) = unsafe { trace.values.align_to_mut::<AdderRow<F>>() };
        assert!(prefix.is_empty(), "Alignment should match");
        assert!(suffix.is_empty(), "Alignment should match");
        assert_eq!(rows.len(), trace_len);

        // 初始化當前寄存器狀態
        let mut current_regs = initial_regs;

        // 處理每條指令
        for (i, instruction) in program.iter().enumerate() {
            // 建立當前行
            let mut row = AdderRow {
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
            };

            // 設定選擇器 (one-hot 編碼)
            match instruction.dest {
                0 => row.dest_0 = F::from_u64(1),
                1 => row.dest_1 = F::from_u64(1),
                2 => row.dest_2 = F::from_u64(1),
                3 => row.dest_3 = F::from_u64(1),
                _ => panic!("Invalid dest register: {}", instruction.dest),
            }

            match instruction.src1 {
                0 => row.src1_0 = F::from_u64(1),
                1 => row.src1_1 = F::from_u64(1),
                2 => row.src1_2 = F::from_u64(1),
                3 => row.src1_3 = F::from_u64(1),
                _ => panic!("Invalid src1 register: {}", instruction.src1),
            }

            match instruction.src2 {
                0 => row.src2_0 = F::from_u64(1),
                1 => row.src2_1 = F::from_u64(1),
                2 => row.src2_2 = F::from_u64(1),
                3 => row.src2_3 = F::from_u64(1),
                _ => panic!("Invalid src2 register: {}", instruction.src2),
            }

            // 將行加入 trace
            rows[i] = row;

            // 更新寄存器狀態（為下一行準備）
            let src1_val = current_regs[instruction.src1];
            let src2_val = current_regs[instruction.src2];
            let add_result = src1_val + src2_val;
            current_regs[instruction.dest] = add_result;
        }

        // 如果需要填充額外的行（維持最後狀態）
        for i in n..trace_len {
            rows[i] = rows[n - 1];
        }

        trace
    }
}

// 類型定義（與 Fibonacci 範例相同）
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
    println!("🔧 開始通用加法處理器零知識證明器...");

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

    // 創建通用加法處理器 Chip
    let chip = AdderChip;

    // 定義測試程式（增加更多指令以滿足 STARK 最小大小要求）
    println!("📝 定義測試程式：");
    let mut program = vec![
        Instruction { dest: 2, src1: 0, src2: 1 }, // r2 = r0 + r1   (1 + 2 = 3)
        Instruction { dest: 3, src1: 2, src2: 2 }, // r3 = r2 + r2   (3 + 3 = 6)
        Instruction { dest: 0, src1: 3, src2: 1 }, // r0 = r3 + r1   (6 + 2 = 8)
    ];
    
    // 添加更多指令以達到 2^6 = 64 條指令
    while program.len() < 64 {
        program.push(Instruction { dest: 1, src1: 1, src2: 1 }); // r1 = r1 + r1 (doubling)
        if program.len() < 64 {
            program.push(Instruction { dest: 2, src1: 2, src2: 0 }); // r2 = r2 + r0
        }
        if program.len() < 64 {
            program.push(Instruction { dest: 3, src1: 3, src2: 1 }); // r3 = r3 + r1
        }
        if program.len() < 64 {
            program.push(Instruction { dest: 0, src1: 0, src2: 2 }); // r0 = r0 + r2
        }
    }

    // 只顯示前幾條重要指令
    for (i, inst) in program.iter().take(10).enumerate() {
        println!("  指令 {}: r{} = r{} + r{}", i + 1, inst.dest, inst.src1, inst.src2);
    }
    if program.len() > 10 {
        println!("  ... 還有 {} 條指令", program.len() - 10);
    }

    // 設定初始寄存器狀態
    let initial_regs = [Val::from_u64(1), Val::from_u64(2), Val::from_u64(0), Val::from_u64(0)];
    println!("🏁 初始寄存器狀態: [r0={}, r1={}, r2={}, r3={}]", 
             initial_regs[0].as_canonical_u64(),
             initial_regs[1].as_canonical_u64(), 
             initial_regs[2].as_canonical_u64(),
             initial_regs[3].as_canonical_u64());

    // 生成執行軌跡
    println!("📊 生成執行軌跡...");
    let trace = AdderChip::generate_trace::<Val>(program.clone(), initial_regs);

    // 手動驗證執行結果（只顯示前幾步和最後結果）
    println!("✨ 程式執行過程：");
    let mut regs = [1u64, 2u64, 0u64, 0u64];
    println!("  初始狀態: [r0={}, r1={}, r2={}, r3={}]", regs[0], regs[1], regs[2], regs[3]);
    
    for (i, inst) in program.iter().enumerate() {
        let src1_val = regs[inst.src1];
        let src2_val = regs[inst.src2];
        let result = src1_val + src2_val;
        regs[inst.dest] = result;
        
        // 只顯示前 5 步的詳細執行過程
        if i < 5 {
            println!("  執行指令 {}: r{} = r{} + r{} = {} + {} = {} -> [r0={}, r1={}, r2={}, r3={}]", 
                     i + 1, inst.dest, inst.src1, inst.src2, src1_val, src2_val, result,
                     regs[0], regs[1], regs[2], regs[3]);
        }
    }
    
    if program.len() > 5 {
        println!("  ... 執行了 {} 條指令", program.len() - 5);
    }

    println!("🎯 最終寄存器狀態: [r0={}, r1={}, r2={}, r3={}]", regs[0], regs[1], regs[2], regs[3]);

    // 生成證明
    println!("🔐 正在生成 STARK 證明...");
    let proof = prove(&config, &chip, trace, &vec![]);
    println!("✅ 證明生成完成！");

    // 驗證證明
    println!("🔍 正在驗證證明...");
    match verify(&config, &chip, &proof, &vec![]) {
        Ok(_) => println!("🎉 證明驗證成功！通用加法處理器執行正確性已得到證明。"),
        Err(e) => println!("❌ 證明驗證失敗：{:?}", e),
    }

    println!("🏁 通用加法處理器零知識證明器運行完畢！");
} 