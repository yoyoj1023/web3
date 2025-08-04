# 模組六隨堂測驗：動手實踐 - Fibonacci 經典範例與 API

**測驗時間：** 40 分鐘  
**總分：** 100 分  
**及格分數：** 70 分

---

## 📝 第一部分：選擇題（每題 8 分，共 32 分）

### 1. 在 Plonky2 中，CircuitBuilder 的主要作用是什麼？
A. 編譯 Rust 代碼
B. 定義電路約束和變數的工具
C. 生成零知識證明
D. 驗證證明的正確性

### 2. `add_virtual_target()` 方法的作用是什麼？
A. 添加一個常數值
B. 添加一個電路中的變數（線）
C. 執行加法運算
D. 連接兩個變數

### 3. 在 Fibonacci 示例中，`register_public_input()` 註冊了哪些值？
A. 所有中間計算結果
B. 只有最終的 Fibonacci 數
C. F(0)、F(1) 和 F(100)
D. 整個計算過程

### 4. PartialWitness 在零知識證明中的角色是什麼？
A. 定義電路結構
B. 提供私有輸入值的賦值
C. 驗證證明正確性
D. 生成公開參數

---

## ✍️ 第二部分：簡答題（每題 10 分，共 30 分）

### 5. 解釋 Plonky2 開發的完整流程
請按順序說明從電路設計到證明驗證的 8 個主要步驟。

### 6. 分析 Fibonacci 示例中的約束設計
請說明：
a) 如何實現 F(n) = F(n-1) + F(n-2) 的遞推關係
b) 複製約束在狀態轉移中的作用
c) 公開輸入與私有見證的區別

### 7. 比較不同約束操作的成本
請分析以下操作在電路中的約束成本：
a) 加法操作 (`builder.add()`)
b) 乘法操作 (`builder.mul()`)  
c) 常數乘法 (`mul_const()`)
d) 複製約束 (`connect()`)

---

## 🧠 第三部分：編程應用題（28 分）

### 8. 電路設計練習（14分）
請設計一個電路來證明知道滿足以下條件的秘密數 x：
- x² + 3x + 2 = 0
- x 是整數

要求：
a) 設計電路結構和約束
b) 寫出 CircuitBuilder 的關鍵代碼
c) 設計見證賦值策略

### 9. 性能優化練習（14分）
原始代碼（低效）：
```rust
let mut result = builder.zero();
for i in 0..1000 {
    let temp = builder.mul(x, x);
    result = builder.add(result, temp);
}
```

請：
a) 識別性能問題
b) 提供優化版本
c) 估算約束數量的改善

---

## 💡 第四部分：調試與分析題（10 分）

### 10. 錯誤分析與修復
以下代碼有什麼問題？請分析並提供修復方案：

```rust
fn broken_circuit() -> Result<()> {
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);
    
    let x = builder.add_virtual_target();
    let y = builder.add_virtual_target();
    let z = builder.add(x, y);
    
    builder.register_public_input(x);
    builder.register_public_input(z);
    
    let data = builder.build::<C>();
    let proof = data.prove(pw)?;  // 編譯錯誤在這裡
    
    data.verify(proof)
}
```

---

# 📊 測驗解答

## 第一部分：選擇題解答

### 1. 答案：B
**解釋：** CircuitBuilder 是定義電路約束和變數的核心工具，它提供了 `add_virtual_target()`、`add()`、`mul()` 等方法來構建電路結構和約束關係。

### 2. 答案：B  
**解釋：** `add_virtual_target()` 添加一個電路中的變數（在 Plonky2 術語中稱為 Target），這個變數可以在後續的約束中使用，並在證明時賦予具體值。

### 3. 答案：C
**解釋：** 在 Fibonacci 示例中，公開輸入包括初始值 F(0)=0、F(1)=1 和最終結果 F(100)。中間的計算步驟是私有的，外部驗證者無法看到。

### 4. 答案：B
**解釋：** PartialWitness 負責為電路中的變數提供具體的數值賦值，這些值通常是私有的，只有證明者知道，是生成零知識證明的關鍵輸入。

---

## 第二部分：簡答題解答

### 5. Plonky2 開發完整流程（10分）

**完整的 8 個步驟（每步 1.25 分）：**

1. **電路配置**：創建 `CircuitConfig` 和 `CircuitBuilder`
2. **定義變數**：使用 `add_virtual_target()` 添加電路變數
3. **構建約束**：使用 `add()`、`mul()` 等操作定義計算邏輯
4. **註冊公開輸入**：用 `register_public_input()` 指定可驗證的值
5. **編譯電路**：調用 `build()` 生成 `CircuitData`
6. **準備見證**：創建 `PartialWitness` 並用 `set_target()` 賦值
7. **生成證明**：調用 `data.prove(pw)` 生成零知識證明
8. **驗證證明**：調用 `data.verify(proof)` 驗證證明正確性

### 6. Fibonacci 約束設計分析（10分）

**a) 遞推關係實現（3.5分）**
```rust
// 在每次迭代中：
let next_target = builder.add(prev_target, curr_target);
// 這創建了約束：next = prev + curr

// 狀態更新：
prev_target = curr_target;
curr_target = next_target;
```

**b) 複製約束的作用（3.5分）**
- 複製約束隱含在變數賦值中實現狀態轉移
- `prev_target = curr_target` 確保下一步的 prev 等於當前步的 curr
- `curr_target = next_target` 確保下一步的 curr 等於當前步的 next
- 這些約束保證了 Fibonacci 序列的連續性

**c) 公開輸入 vs 私有見證（3分）**
```
公開輸入：F(0)=0, F(1)=1, F(100)=結果
- 任何人都可以看到和驗證
- 用於確認計算的起點和終點

私有見證：中間的 F(2), F(3), ..., F(99)
- 只有證明者知道
- 實現零知識特性：證明計算正確但不洩露過程
```

### 7. 約束操作成本分析（10分）

**a) 加法操作（2.5分）**
```rust
builder.add(a, b)  // 成本：1 個約束
```
- 創建線性約束：`a + b - result = 0`
- 成本最低的基本運算

**b) 乘法操作（2.5分）**  
```rust
builder.mul(a, b)  // 成本：1 個約束
```
- 創建二次約束：`a × b - result = 0`
- 比加法略複雜，但仍然高效

**c) 常數乘法（2.5分）**
```rust
mul_const(target, constant)  // 成本：1 個約束
```
- 優化的常數乘法，避免通用乘法門
- 與變數乘法相同成本，但實現更簡單

**d) 複製約束（2.5分）**
```rust
builder.connect(a, b)  // 成本：0 個額外約束
```
- 通過置換參數實現，不增加約束數量
- 最高效的約束類型

---

## 第三部分：編程應用題解答

### 8. 電路設計練習（14分）

**a) 電路結構設計（5分）**
```
目標：證明 x² + 3x + 2 = 0，其中 x 是整數

分析：x² + 3x + 2 = (x+1)(x+2) = 0
所以 x = -1 或 x = -2

電路約束：
1. y = x²
2. z = 3x  
3. result = y + z + 2
4. result = 0
```

**b) CircuitBuilder 代碼（5分）**
```rust
fn quadratic_proof() -> Result<()> {
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);
    
    // 定義秘密輸入 x
    let x = builder.add_virtual_target();
    
    // 計算 x²
    let x_squared = builder.mul(x, x);
    
    // 計算 3x
    let three = builder.constant(F::from_canonical_u64(3));
    let three_x = builder.mul(three, x);
    
    // 計算 x² + 3x
    let partial_sum = builder.add(x_squared, three_x);
    
    // 計算 x² + 3x + 2
    let two = builder.constant(F::from_canonical_u64(2));
    let result = builder.add(partial_sum, two);
    
    // 約束結果為 0
    let zero = builder.zero();
    builder.connect(result, zero);
    
    // 公開輸入：只有結果（應該是0）
    builder.register_public_input(result);
    
    let data = builder.build::<C>();
    // ... 見證和證明生成
}
```

**c) 見證賦值策略（4分）**
```rust
// 見證賦值
let mut pw = PartialWitness::new();

// 選擇 x = -1（在黃金域中表示）
let x_value = F::from_canonical_u64(p - 1); // -1 mod p
pw.set_target(x, x_value)?;

// 驗證：(-1)² + 3(-1) + 2 = 1 - 3 + 2 = 0 ✓
```

### 9. 性能優化練習（14分）

**a) 性能問題識別（5分）**
```
問題1：重複計算 x²
- 在循環中 1000 次計算相同的 x²
- 每次都創建新的約束

問題2：約束數量爆炸  
- 創建了 1000 個乘法約束
- 創建了 1000 個加法約束
- 總計：2000 個約束

問題3：沒有利用常數優化
- 可以預先計算 1000 × x²
```

**b) 優化版本（5分）**
```rust
// 優化版本
let x_squared = builder.mul(x, x);           // 1 個約束
let thousand = builder.constant(F::from_canonical_u64(1000));
let result = builder.mul(thousand, x_squared); // 1 個約束

// 或者更進一步優化
let result = mul_const(&mut builder, x_squared, 1000); // 1 個約束
```

**c) 約束數量改善（4分）**
```
原始版本：
- 乘法約束：1000 個
- 加法約束：1000 個  
- 總計：2000 個約束

優化版本：
- 乘法約束：2 個（x² 和 1000×x²）
- 加法約束：0 個
- 總計：2 個約束

改善比例：2000 → 2，減少 99.9%
```

---

## 第四部分：調試與分析題解答

### 10. 錯誤分析與修復（10分）

**錯誤分析（5分）**
```
主要問題：
1. PartialWitness pw 未定義就使用
2. 沒有為變數 x, y 設置具體值
3. 變數 y 定義了但未使用，可能導致約束不完整

編譯錯誤原因：
- pw 變數未聲明
- 編譯器無法推斷 pw 的類型
```

**修復方案（5分）**
```rust
fn fixed_circuit() -> Result<()> {
    const D: usize = 2;
    type C = PoseidonGoldilocksConfig;
    type F = <C as GenericConfig<D>>::F;
    
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);
    
    let x = builder.add_virtual_target();
    let y = builder.add_virtual_target();
    let z = builder.add(x, y);
    
    builder.register_public_input(x);
    builder.register_public_input(y);  // 添加 y 為公開輸入
    builder.register_public_input(z);
    
    let data = builder.build::<C>();
    
    // 正確創建和設置 PartialWitness
    let mut pw = PartialWitness::new();
    pw.set_target(x, F::from_canonical_u64(10))?;
    pw.set_target(y, F::from_canonical_u64(20))?;
    
    let proof = data.prove(pw)?;
    
    data.verify(proof)
}
```

---

## 🎯 評分等級

- **90-100分：** 優秀 - 熟練掌握 Plonky2 API，能獨立設計和優化電路
- **80-89分：** 良好 - 很好理解 API 使用，能完成基本電路設計
- **70-79分：** 及格 - 基本掌握主要 API 和開發流程
- **60-69分：** 不及格 - 需要重新學習 API 使用方法
- **60分以下：** 不及格 - 建議重新完整學習本模組和動手實踐

## 📚 復習建議

如果分數不理想，建議：
1. **重新運行 fibonacci_course.rs**，理解每一行代碼
2. **熟練掌握主要 API**：CircuitBuilder, Target, PartialWitness
3. **練習電路設計**：從簡單例子開始逐步複雜化
4. **學習約束優化**：理解不同操作的成本差異
5. **掌握調試技巧**：能夠識別和修復常見錯誤