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

/// 費波那契數列 Chip 結構
pub struct FibonacciChip;

/// 費波那契數列的列數（兩列：a 和 b）
const NUM_FIBONACCI_COLS: usize = 2;

/// 表示費波那契數列的一行數據
pub struct FibonacciRow<F> {
    pub a: F,  // F(i)
    pub b: F,  // F(i+1)
}

impl<F> FibonacciRow<F> {
    const fn new(a: F, b: F) -> Self {
        Self { a, b }
    }
}

/// 實現從切片到 FibonacciRow 的借用轉換
impl<F> Borrow<FibonacciRow<F>> for [F] {
    fn borrow(&self) -> &FibonacciRow<F> {
        debug_assert_eq!(self.len(), NUM_FIBONACCI_COLS);
        let (prefix, shorts, suffix) = unsafe { self.align_to::<FibonacciRow<F>>() };
        debug_assert!(prefix.is_empty(), "Alignment should match");
        debug_assert!(suffix.is_empty(), "Alignment should match");
        debug_assert_eq!(shorts.len(), 1);
        &shorts[0]
    }
}

/// 為 FibonacciChip 實現 BaseAir trait
impl<F> BaseAir<F> for FibonacciChip {
    fn width(&self) -> usize {
        NUM_FIBONACCI_COLS
    }
}

/// 為 FibonacciChip 實現 Air trait，定義約束條件
impl<AB: AirBuilder> Air<AB> for FibonacciChip {
    fn eval(&self, builder: &mut AB) {
        let main = builder.main();

        // 獲取當前行和下一行的數據
        let (local, next) = (
            main.row_slice(0).expect("Matrix is empty?"),
            main.row_slice(1).expect("Matrix only has 1 row?"),
        );
        let local: &FibonacciRow<AB::Var> = (*local).borrow();
        let next: &FibonacciRow<AB::Var> = (*next).borrow();

        // 初始約束：第一行必須是 a=0, b=1
        let mut when_first_row = builder.when_first_row();
        when_first_row.assert_eq(local.a.clone(), AB::Expr::ZERO);
        when_first_row.assert_one(local.b.clone());

        // 轉移約束：定義費波那契數列的遞迴關係
        let mut when_transition = builder.when_transition();
        
        // next_a = current_b
        when_transition.assert_eq(next.a.clone(), local.b.clone());
        
        // next_b = current_a + current_b
        when_transition.assert_eq(next.b.clone(), local.a.clone() + local.b.clone());
    }
}

/// 生成費波那契數列的執行軌跡
impl FibonacciChip {
    pub fn generate_trace<F: PrimeField64>(n: usize) -> RowMajorMatrix<F> {
        assert!(n.is_power_of_two(), "Trace length must be a power of two");

        let mut trace = RowMajorMatrix::new(
            F::zero_vec(n * NUM_FIBONACCI_COLS), 
            NUM_FIBONACCI_COLS
        );

        let (prefix, rows, suffix) = unsafe { trace.values.align_to_mut::<FibonacciRow<F>>() };
        assert!(prefix.is_empty(), "Alignment should match");
        assert!(suffix.is_empty(), "Alignment should match");
        assert_eq!(rows.len(), n);

        // 設定初始值：F(0) = 0, F(1) = 1
        rows[0] = FibonacciRow::new(F::from_u64(0), F::from_u64(1));

        // 計算後續的費波那契數列值
        for i in 1..n {
            rows[i].a = rows[i - 1].b;
            rows[i].b = rows[i - 1].a + rows[i - 1].b;
        }

        trace
    }
}

// 類型定義
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
    println!("🔢 開始費波那契數列零知識證明器...");

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

    // 創建費波那契 Chip
    let chip = FibonacciChip;

    // 生成 1000 行的執行軌跡（需要是 2 的冪次）
    let n = 1024; // 2^10 = 1024, 最接近 1000 的 2 的冪次
    println!("📊 生成 {} 行的費波那契數列執行軌跡...", n);
    let trace = FibonacciChip::generate_trace::<Val>(n);

    // 顯示前幾行的結果
    println!("✨ 費波那契數列前幾項：");
    for i in 0..10.min(n) {
        let a = trace.get(i, 0).unwrap();
        let b = trace.get(i, 1).unwrap();
        println!("  F({}) = {:?}, F({}) = {:?}", i, a, i + 1, b);
    }

    // 生成證明
    println!("🔐 正在生成 STARK 證明...");
    let proof = prove(&config, &chip, trace, &vec![]);
    println!("✅ 證明生成完成！");

    // 驗證證明
    println!("🔍 正在驗證證明...");
    match verify(&config, &chip, &proof, &vec![]) {
        Ok(_) => println!("🎉 證明驗證成功！費波那契數列計算正確性已得到證明。"),
        Err(e) => println!("❌ 證明驗證失敗：{:?}", e),
    }

    println!("🏁 費波那契數列零知識證明器運行完畢！");
} 