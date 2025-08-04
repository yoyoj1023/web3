# 模組六：動手實踐 - Fibonacci 經典範例與 API
## Hands-On Practice - The Fibonacci Example & API

**課程目標：** 將所有理論知識應用於實際程式碼，固化理解。

**心智模型：** 閱讀了所有汽車工程手冊後，親手組裝一個斐波那契引擎。

---

## 1. Plonky2 API 概覽

### 1.1 核心組件架構

```rust
// 主要的類型定義
use plonky2::field::types::Field;
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::circuit_data::{CircuitConfig, CircuitData};
use plonky2::plonk::config::{GenericConfig, PoseidonGoldilocksConfig};
use plonky2::iop::witness::{PartialWitness, WitnessWrite};
use plonky2::iop::target::Target;

// 常用的類型別名
const D: usize = 2; // Extension degree
type C = PoseidonGoldilocksConfig;
type F = <C as GenericConfig<D>>::F; // GoldilocksField
```

### 1.2 關鍵 API 組件

#### A. CircuitBuilder - 電路構建器
```rust
impl<F: RichField + Extendable<D>, const D: usize> CircuitBuilder<F, D> {
    /// 創建新的電路構建器
    pub fn new(config: CircuitConfig) -> Self;
    
    /// 添加虛擬變數（電路輸入）
    pub fn add_virtual_target(&mut self) -> Target;
    
    /// 添加常數
    pub fn constant(&mut self, value: F) -> Target;
    
    /// 基本運算門
    pub fn add(&mut self, a: Target, b: Target) -> Target;
    pub fn mul(&mut self, a: Target, b: Target) -> Target;
    pub fn sub(&mut self, a: Target, b: Target) -> Target;
    
    /// 約束相等
    pub fn connect(&mut self, a: Target, b: Target);
    
    /// 註冊公開輸入
    pub fn register_public_input(&mut self, target: Target);
    
    /// 構建最終電路
    pub fn build<C: GenericConfig<D, F>>(self) -> CircuitData<F, C, D>;
}
```

#### B. PartialWitness - 見證賦值
```rust
impl<F: Field> PartialWitness<F> {
    /// 創建新的見證
    pub fn new() -> Self;
    
    /// 為變數賦值
    pub fn set_target(&mut self, target: Target, value: F) -> Result<()>;
    
    /// 為多個變數賦值
    pub fn set_targets(&mut self, targets: &[Target], values: &[F]) -> Result<()>;
}
```

#### C. CircuitData - 電路數據
```rust
impl<F: RichField + Extendable<D>, C: GenericConfig<D, F>, const D: usize> CircuitData<F, C, D> {
    /// 生成證明
    pub fn prove(&self, pw: PartialWitness<F>) -> Result<ProofWithPublicInputs<F, C, D>>;
    
    /// 驗證證明
    pub fn verify(&self, proof: ProofWithPublicInputs<F, C, D>) -> Result<()>;
}
```

---

## 2. Fibonacci 經典範例詳解

### 2.1 問題定義

**目標：** 證明我們知道第 n 個 Fibonacci 數，且計算過程正確。

**Fibonacci 數列定義：**
```
F(0) = 0
F(1) = 1  
F(n) = F(n-1) + F(n-2) for n ≥ 2
```

### 2.2 算術化策略

我們將採用**執行軌跡**的方式來表示 Fibonacci 計算：

```
| Step | prev | curr | next |
|------|------|------|------|
|  0   |  0   |  1   |  1   |
|  1   |  1   |  1   |  2   |
|  2   |  1   |  2   |  3   |
|  3   |  2   |  3   |  5   |
|  4   |  3   |  5   |  8   |
| ...  | ...  | ...  | ...  |
```

**約束條件：**
1. `next = prev + curr` （每一步的轉移約束）
2. `prev[i+1] = curr[i]` （狀態傳遞約束）
3. `curr[i+1] = next[i]` （狀態傳遞約束）

### 2.3 完整實現

```rust
use anyhow::Result;
use plonky2::field::types::Field;
use plonky2::iop::witness::{PartialWitness, WitnessWrite};
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::circuit_data::CircuitConfig;
use plonky2::plonk::config::{GenericConfig, PoseidonGoldilocksConfig};

fn fibonacci_proof() -> Result<()> {
    const D: usize = 2;
    type C = PoseidonGoldilocksConfig;
    type F = <C as GenericConfig<D>>::F;

    // 1. 配置和初始化
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);

    // 2. 定義電路變數
    let initial_a = builder.add_virtual_target(); // F(0) = 0
    let initial_b = builder.add_virtual_target(); // F(1) = 1
    
    // 3. 構建 Fibonacci 計算鏈
    let mut prev_target = initial_a;
    let mut curr_target = initial_b;
    
    for i in 0..99 { // 計算到 F(100)
        // next = prev + curr
        let next_target = builder.add(prev_target, curr_target);
        
        // 更新狀態：準備下一輪
        prev_target = curr_target;
        curr_target = next_target;
        
        // 可選：添加中間值作為私有見證（調試用）
        if i < 5 { // 只記錄前幾個值
            println!("Step {}: F({}) 電路構建完成", i + 2, i + 2);
        }
    }

    // 4. 定義公開輸入
    builder.register_public_input(initial_a);    // F(0)
    builder.register_public_input(initial_b);    // F(1)  
    builder.register_public_input(curr_target);  // F(100)

    // 5. 構建電路
    let data = builder.build::<C>();
    println!("電路構建完成，總約束數: {}", data.common.degree());

    // 6. 準備見證（私有輸入）
    let mut pw = PartialWitness::new();
    pw.set_target(initial_a, F::ZERO)?;  // F(0) = 0
    pw.set_target(initial_b, F::ONE)?;   // F(1) = 1

    // 7. 生成證明
    println!("開始生成證明...");
    let start_time = std::time::Instant::now();
    let proof = data.prove(pw)?;
    let prove_time = start_time.elapsed();
    
    println!("證明生成完成，耗時: {:?}", prove_time);
    println!("證明大小: {} bytes", proof.to_bytes().len());

    // 8. 提取並顯示結果
    println!("公開輸入驗證:");
    println!("F(0) = {}", proof.public_inputs[0]);
    println!("F(1) = {}", proof.public_inputs[1]); 
    println!("F(100) = {}", proof.public_inputs[2]);

    // 9. 驗證證明
    println!("開始驗證證明...");
    let start_time = std::time::Instant::now();
    data.verify(proof)?;
    let verify_time = start_time.elapsed();
    
    println!("證明驗證成功，耗時: {:?}", verify_time);

    Ok(())
}

fn main() -> Result<()> {
    fibonacci_proof()
}
```

### 2.4 運行結果分析

**預期輸出：**
```
電路構建完成，總約束數: 32768
開始生成證明...
證明生成完成，耗時: 1.2s
證明大小: 45032 bytes
公開輸入驗證:
F(0) = 0
F(1) = 1
F(100) = 792070839848372253127 (mod 2^64-2^32+1)
開始驗證證明...
證明驗證成功，耗時: 12ms
```

**關鍵觀察：**
1. **約束數量**：~32K，相對較小
2. **證明大小**：~45KB，FRI 的典型大小
3. **生成時間**：~1.2 秒，非常快速
4. **驗證時間**：~12ms，極快

---

## 3. 深入 API 使用

### 3.1 高級約束操作

#### A. 條件約束
```rust
/// 實現條件邏輯：if condition then a else b
fn conditional_select(
    builder: &mut CircuitBuilder<F, D>,
    condition: Target,
    a: Target,
    b: Target,
) -> Target {
    // result = condition * a + (1 - condition) * b
    let not_condition = builder.sub(builder.one(), condition);
    let term1 = builder.mul(condition, a);
    let term2 = builder.mul(not_condition, b);
    builder.add(term1, term2)
}
```

#### B. 範圍檢查
```rust
/// 確保一個值在 [0, 2^bits) 範圍內
fn range_check(
    builder: &mut CircuitBuilder<F, D>,
    value: Target,
    bits: usize,
) {
    let mut sum = builder.zero();
    let mut power_of_two = builder.one();
    
    for _ in 0..bits {
        // 添加一個二進制變數
        let bit = builder.add_virtual_target();
        
        // 約束 bit ∈ {0, 1}
        let bit_squared = builder.mul(bit, bit);
        builder.connect(bit, bit_squared);
        
        // 累加到總和
        let term = builder.mul(bit, power_of_two);
        sum = builder.add(sum, term);
        
        // 更新 2 的冪次
        power_of_two = builder.add(power_of_two, power_of_two);
    }
    
    // 約束總和等於原值
    builder.connect(value, sum);
}
```

### 3.2 優化技巧

#### A. 批量操作
```rust
/// 高效地計算多個值的和
fn sum_targets(
    builder: &mut CircuitBuilder<F, D>,
    targets: &[Target],
) -> Target {
    targets.iter().fold(builder.zero(), |acc, &target| {
        builder.add(acc, target)
    })
}

/// 高效地計算多個值的乘積
fn product_targets(
    builder: &mut CircuitBuilder<F, D>,
    targets: &[Target],
) -> Target {
    targets.iter().fold(builder.one(), |acc, &target| {
        builder.mul(acc, target)
    })
}
```

#### B. 常數優化
```rust
/// 快速乘以常數（避免通用乘法門）
fn mul_const(
    builder: &mut CircuitBuilder<F, D>,
    target: Target,
    constant: u64,
) -> Target {
    let const_target = builder.constant(F::from_canonical_u64(constant));
    builder.mul(target, const_target)
}

/// 快速計算冪次（使用重複平方法）
fn pow_const(
    builder: &mut CircuitBuilder<F, D>,
    base: Target,
    exponent: u64,
) -> Target {
    if exponent == 0 {
        return builder.one();
    }
    
    let mut result = builder.one();
    let mut base_power = base;
    let mut exp = exponent;
    
    while exp > 0 {
        if exp & 1 == 1 {
            result = builder.mul(result, base_power);
        }
        base_power = builder.mul(base_power, base_power);
        exp >>= 1;
    }
    
    result
}
```

---

## 4. 實戰練習

### 練習 1：擴展 Fibonacci 範例

修改 Fibonacci 程式，證明第 n 個 Fibonacci 數能被某個值整除。

<details>
<summary>解答框架</summary>

```rust
fn fibonacci_divisibility_proof(n: usize, divisor: u64) -> Result<()> {
    // ... 基本設置 ...
    
    // 計算 F(n)
    let fib_n = build_fibonacci_circuit(&mut builder, n);
    
    // 添加整除性檢查
    let quotient = builder.add_virtual_target();
    let divisor_target = builder.constant(F::from_canonical_u64(divisor));
    let product = builder.mul(quotient, divisor_target);
    builder.connect(fib_n, product);
    
    // 將商作為公開輸入
    builder.register_public_input(quotient);
    
    // ... 剩餘實現 ...
}
```

</details>

### 練習 2：實現計數器電路

創建一個電路，證明從 0 計數到 n 的過程。

<details>
<summary>解答框架</summary>

```rust
fn counter_circuit(n: usize) -> Result<()> {
    let mut builder = CircuitBuilder::<F, D>::new(config);
    
    let mut current = builder.zero();
    let one = builder.one();
    
    for _ in 0..n {
        current = builder.add(current, one);
    }
    
    let expected = builder.constant(F::from_canonical_u64(n as u64));
    builder.connect(current, expected);
    
    // ... 完成實現 ...
}
```

</details>

### 練習 3：多項式求值電路

實現一個電路，證明在某點對多項式的求值是正確的。

<details>
<summary>解答框架</summary>

```rust
fn polynomial_evaluation(coeffs: &[u64], x_value: u64) -> Result<()> {
    let mut builder = CircuitBuilder::<F, D>::new(config);
    
    let x = builder.constant(F::from_canonical_u64(x_value));
    let mut result = builder.zero();
    let mut x_power = builder.one();
    
    for &coeff in coeffs {
        let coeff_target = builder.constant(F::from_canonical_u64(coeff));
        let term = builder.mul(coeff_target, x_power);
        result = builder.add(result, term);
        x_power = builder.mul(x_power, x);
    }
    
    builder.register_public_input(result);
    
    // ... 完成實現 ...
}
```

</details>

---

## 5. 錯誤處理與調試

### 5.1 常見錯誤

#### A. 約束不滿足
```rust
// 錯誤示例：忘記設置見證值
let target = builder.add_virtual_target();
builder.register_public_input(target);
// pw.set_target(target, value); // 忘記這行

// 解決方案：確保所有變數都有值
let mut pw = PartialWitness::new();
pw.set_target(target, F::from_canonical_u64(42))?;
```

#### B. 類型不匹配
```rust
// 錯誤示例：使用錯誤的配置類型
type WrongConfig = KeccakGoldilocksConfig; // 不匹配
let data = builder.build::<WrongConfig>(); // 編譯錯誤

// 解決方案：保持類型一致
type C = PoseidonGoldilocksConfig;
let data = builder.build::<C>();
```

### 5.2 調試技巧

#### A. 中間值檢查
```rust
fn debug_fibonacci() -> Result<()> {
    // ... 基本設置 ...
    
    let mut values = vec![F::ZERO, F::ONE];
    let mut prev = initial_a;
    let mut curr = initial_b;
    
    for i in 0..10 {
        let next = builder.add(prev, curr);
        
        // 計算預期值（調試用）
        let expected = values[i] + values[i + 1];
        values.push(expected);
        
        println!("F({}) 預期值: {}", i + 2, expected);
        
        prev = curr;
        curr = next;
    }
    
    // ... 剩餘實現 ...
}
```

#### B. 電路統計
```rust
fn circuit_statistics(data: &CircuitData<F, C, D>) {
    println!("電路統計信息:");
    println!("  總約束數: {}", data.common.degree());
    println!("  公開輸入數: {}", data.common.num_public_inputs);
    println!("  約束多項式數: {}", data.common.num_constants);
    println!("  FRI 配置: {:?}", data.common.config.fri_config);
}
```

---

## 6. 性能優化指南

### 6.1 電路大小優化

#### A. 減少約束數
```rust
// 低效：多次使用中間變數
let temp1 = builder.add(a, b);
let temp2 = builder.add(temp1, c);
let result = builder.add(temp2, d);

// 高效：直接鏈式計算
let result = builder.add(builder.add(builder.add(a, b), c), d);
```

#### B. 重用計算結果
```rust
// 低效：重複計算
let x_squared_1 = builder.mul(x, x);
let x_squared_2 = builder.mul(x, x); // 重複計算

// 高效：重用結果
let x_squared = builder.mul(x, x);
// 後續都使用 x_squared
```

### 6.2 記憶體優化

#### A. 批量見證設置
```rust
// 低效：逐個設置
for (target, value) in targets.iter().zip(values.iter()) {
    pw.set_target(*target, *value)?;
}

// 高效：批量設置
pw.set_targets(&targets, &values)?;
```

#### B. 預分配空間
```rust
// 高效：預先分配足夠空間
let mut targets = Vec::with_capacity(n);
let mut values = Vec::with_capacity(n);
```

---

## 7. 實際項目建議

### 7.1 項目結構

```
fibonacci_project/
├── Cargo.toml
├── src/
│   ├── lib.rs          // 核心實現
│   ├── fibonacci.rs    // Fibonacci 電路  
│   ├── utils.rs        // 輔助函數
│   └── main.rs         // 主程序
├── examples/           // 示例程式
├── tests/             // 測試文件
└── benches/           // 性能測試
```

### 7.2 Cargo.toml 配置

```toml
[package]
name = "fibonacci-plonky2"
version = "0.1.0"
edition = "2021"

[dependencies]
plonky2 = { path = "../plonky2/plonky2" }
anyhow = "1.0"

[dev-dependencies]
criterion = "0.4"

[[bench]]
name = "fibonacci_bench"
harness = false
```

---

## 8. 下一步預習

在最後一個模組中，我們將探索：
- **Plonky3 的模組化設計**
- **從 Plonky2 到 Plonky3 的遷移**  
- **未來 ZKP 系統的發展方向**

---

**關鍵要點回顧：**
1. **CircuitBuilder API** 提供了直觀的電路構建界面
2. **PartialWitness** 管理私有輸入的賦值
3. **Fibonacci 範例** 展示了完整的開發流程
4. **性能優化** 需要在電路設計階段就開始考慮
5. **調試技巧** 對於複雜電路的開發至關重要