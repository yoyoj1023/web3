use anyhow::Result;
use plonky2::field::types::Field;
use plonky2::iop::witness::{PartialWitness, WitnessWrite};
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::circuit_data::CircuitConfig;
use plonky2::plonk::config::{GenericConfig, PoseidonGoldilocksConfig};

/// 課程示例：使用 Plonky2 證明第 100 個 Fibonacci 數的計算
/// 這個示例展示了完整的 Plonky2 開發流程：
/// 1. 電路設計
/// 2. 約束構建  
/// 3. 見證賦值
/// 4. 證明生成與驗證
fn main() -> Result<()> {
    const D: usize = 2;
    type C = PoseidonGoldilocksConfig;
    type F = <C as GenericConfig<D>>::F;

    println!("=== Plonky2 課程示例：Fibonacci 證明 ===\n");

    // 1. 電路配置
    println!("1. 配置電路...");
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);

    // 2. 定義電路變數
    println!("2. 定義電路變數...");
    let initial_a = builder.add_virtual_target(); // F(0) = 0
    let initial_b = builder.add_virtual_target(); // F(1) = 1
    
    // 3. 構建 Fibonacci 計算鏈
    println!("3. 構建 Fibonacci 計算電路...");
    let mut prev_target = initial_a;
    let mut curr_target = initial_b;
    
    // 計算 F(2) 到 F(100)，共需要 99 次迭代
    for i in 0..99 {
        // next = prev + curr (Fibonacci 遞推關係)
        let next_target = builder.add(prev_target, curr_target);
        
        // 狀態更新：為下一次迭代準備
        prev_target = curr_target;
        curr_target = next_target;
        
        // 進度顯示（只顯示前幾步）
        if i < 5 {
            println!("   構建 F({}) = F({}) + F({}) 的約束", i + 2, i + 1, i);
        } else if i == 5 {
            println!("   ... (繼續構建到 F(100))");
        }
    }

    // 4. 定義公開輸入（可被外部驗證的值）
    println!("4. 註冊公開輸入...");
    builder.register_public_input(initial_a);    // F(0) = 0
    builder.register_public_input(initial_b);    // F(1) = 1  
    builder.register_public_input(curr_target);  // F(100)

    // 5. 構建電路數據結構
    println!("5. 編譯電路...");
    let data = builder.build::<C>();
    println!("   電路大小: {} 個約束", data.common.degree());
    println!("   公開輸入數量: {}", data.common.num_public_inputs);

    // 6. 準備見證（私有輸入值）
    println!("6. 準備見證數據...");
    let mut pw = PartialWitness::new();
    pw.set_target(initial_a, F::ZERO)?;  // F(0) = 0
    pw.set_target(initial_b, F::ONE)?;   // F(1) = 1
    println!("   設置 F(0) = 0");
    println!("   設置 F(1) = 1");

    // 7. 生成零知識證明
    println!("7. 生成零知識證明...");
    let start_time = std::time::Instant::now();
    let proof = data.prove(pw)?;
    let prove_time = start_time.elapsed();
    
    println!("   證明生成完成！");
    println!("   生成時間: {:?}", prove_time);
    println!("   證明大小: {} bytes", proof.to_bytes().len());

    // 8. 顯示計算結果
    println!("8. 驗證公開輸入...");
    println!("   F(0) = {}", proof.public_inputs[0]);
    println!("   F(1) = {}", proof.public_inputs[1]); 
    println!("   F(100) = {} (在黃金域中)", proof.public_inputs[2]);
    
    // 計算實際的 F(100) 進行對比（使用標準算術）
    let mut a = 0u128;
    let mut b = 1u128;
    for _ in 0..99 {
        let next = a + b;
        a = b;
        b = next;
    }
    println!("   F(100) = {} (標準算術)", b);
    println!("   註：由於黃金域的模運算，兩個值會不同");

    // 9. 驗證零知識證明
    println!("9. 驗證零知識證明...");
    let start_time = std::time::Instant::now();
    data.verify(proof.clone())?;
    let verify_time = start_time.elapsed();
    
    println!("   證明驗證成功！");
    println!("   驗證時間: {:?}", verify_time);

    // 10. 性能總結
    println!("\n=== 性能總結 ===");
    println!("約束數量: {}", data.common.degree());
    println!("證明大小: {} KB", proof.to_bytes().len() / 1024);
    println!("生成時間: {:?}", prove_time);
    println!("驗證時間: {:?}", verify_time);
    println!("性能比率: 生成/驗證 = {:.1}x", 
             prove_time.as_millis() as f64 / verify_time.as_millis() as f64);

    // 11. 教學要點
    println!("\n=== 關鍵學習要點 ===");
    println!("1. 電路設計：使用執行軌跡的思維模式");
    println!("2. 約束構建：add() 操作自動創建加法約束");
    println!("3. 公開/私有：F(0),F(1),F(100) 是公開的，中間步驟是私有的");
    println!("4. 零知識性：驗證者只知道結果，不知道計算過程");
    println!("5. 簡潔性：證明大小固定，與計算規模無關");

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fibonacci_circuit() -> Result<()> {
        // 測試較小的 Fibonacci 數列
        const D: usize = 2;
        type C = PoseidonGoldilocksConfig;
        type F = <C as GenericConfig<D>>::F;

        let config = CircuitConfig::standard_recursion_config();
        let mut builder = CircuitBuilder::<F, D>::new(config);

        // 計算 F(5) = 5 的電路
        let initial_a = builder.add_virtual_target();
        let initial_b = builder.add_virtual_target();
        
        let mut prev = initial_a;
        let mut curr = initial_b;
        
        // F(2) = 1, F(3) = 2, F(4) = 3, F(5) = 5
        for _ in 0..4 {
            let next = builder.add(prev, curr);
            prev = curr;
            curr = next;
        }

        builder.register_public_input(initial_a);
        builder.register_public_input(initial_b);
        builder.register_public_input(curr);

        let data = builder.build::<C>();

        let mut pw = PartialWitness::new();
        pw.set_target(initial_a, F::ZERO)?;
        pw.set_target(initial_b, F::ONE)?;

        let proof = data.prove(pw)?;
        
        // 驗證結果
        assert_eq!(proof.public_inputs[0], F::ZERO); // F(0) = 0
        assert_eq!(proof.public_inputs[1], F::ONE);  // F(1) = 1
        assert_eq!(proof.public_inputs[2], F::from_canonical_u64(5)); // F(5) = 5

        data.verify(proof)?;
        
        Ok(())
    }

    #[test]
    fn test_fibonacci_values() {
        // 驗證標準 Fibonacci 數列的正確性
        fn fib(n: usize) -> u64 {
            if n <= 1 { return n as u64; }
            let mut a = 0u64;
            let mut b = 1u64;
            for _ in 2..=n {
                let next = a + b;
                a = b;
                b = next;
            }
            b
        }

        assert_eq!(fib(0), 0);
        assert_eq!(fib(1), 1);
        assert_eq!(fib(2), 1);
        assert_eq!(fib(3), 2);
        assert_eq!(fib(4), 3);
        assert_eq!(fib(5), 5);
        assert_eq!(fib(10), 55);
    }
}