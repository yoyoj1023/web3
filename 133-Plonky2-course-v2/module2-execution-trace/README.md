# 模組二：計算的語言 - 從執行軌跡到多項式約束
## The Language of Computation - From Execution Trace to Polynomial Constraints

**課程目標：** 掌握 Plonky2（以及 STARKs）的算術化方式，並深入比較其與標準 PLONK 的不同。

**心智模型：** 如果標準 PLONK 是用圖形化的方式自由設計電路，那麼 AIR 就像是用 Excel 表格來描述一個逐步執行的計算過程。

---

## 1. 執行軌跡 (Execution Trace)

### 1.1 核心概念

**執行軌跡**將計算過程表示為一個二維表格：
- **每一行**代表計算的一個時間步驟（狀態）
- **每一列**代表一個暫存器或變數

### 1.2 Fibonacci 範例

讓我們用 Fibonacci 數列來具體理解：

```
F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
```

**執行軌跡表格：**

| Step | a | b | c |
|------|---|---|---|
| 0    | 0 | 1 | 1 |
| 1    | 1 | 1 | 2 |
| 2    | 1 | 2 | 3 |
| 3    | 2 | 3 | 5 |
| 4    | 3 | 5 | 8 |
| ... | ... | ... | ... |

**含義解釋：**
- `a`：前前一個 Fibonacci 數
- `b`：前一個 Fibonacci 數  
- `c`：當前 Fibonacci 數
- 每一行都滿足：`c = a + b`

### 1.3 與傳統電路的對比

**傳統電路思維：**
```
[a] ——————————\
              ADD —— [c]
[b] ——————————/
```

**執行軌跡思維：**
```
時間軸上的狀態序列：
狀態0: {a=0, b=1, c=1}
狀態1: {a=1, b=1, c=2}  
狀態2: {a=1, b=2, c=3}
...
```

---

## 2. AIR (Algebraic Intermediate Representation)

### 2.1 什麼是 AIR？

AIR 是一種**基於執行軌跡的算術化方法**，它用多項式約束來描述：
1. 每一行內部的關係
2. 相鄰行之間的關係
3. 特殊位置（開始/結束）的約束

### 2.2 多項式約束的類型

#### A. 轉移約束 (Transition Constraints)

**定義**：相鄰兩行之間的關係約束

**Fibonacci 轉移約束：**
```
// 對於每一行 i (除了最後一行)
c[i] = a[i] + b[i]           // 內部約束
a[i+1] = b[i]                // 轉移約束 1  
b[i+1] = c[i]                // 轉移約束 2
```

**多項式形式：**
```
// 設 row_i = (a[i], b[i], c[i])
// 設 row_{i+1} = (a[i+1], b[i+1], c[i+1])

約束 1: c[i] - a[i] - b[i] = 0
約束 2: a[i+1] - b[i] = 0  
約束 3: b[i+1] - c[i] = 0
```

#### B. 邊界約束 (Boundary Constraints)

**定義**：對特定行（通常是第一行或最後一行）的約束

**Fibonacci 邊界約束：**
```
// 初始狀態
a[0] = 0
b[0] = 1

// 如果要驗證特定結果
c[n] = expected_result
```

### 2.3 完整的 AIR 定義

對於 Fibonacci 序列，完整的 AIR 包含：

```rust
// 邊界約束
fn boundary_constraints(trace: &Trace) -> Vec<Constraint> {
    vec![
        trace[0][0] - F::ZERO,      // a[0] = 0
        trace[0][1] - F::ONE,       // b[0] = 1  
    ]
}

// 轉移約束
fn transition_constraints(current: &[F], next: &[F]) -> Vec<F> {
    let (a_curr, b_curr, c_curr) = (current[0], current[1], current[2]);
    let (a_next, b_next, c_next) = (next[0], next[1], next[2]);
    
    vec![
        c_curr - a_curr - b_curr,   // c = a + b
        a_next - b_curr,            // a[i+1] = b[i]
        b_next - c_curr,            // b[i+1] = c[i]
    ]
}
```

---

## 3. 算術化的大對比

### 3.1 設計哲學差異

| 特性 | PLONK | AIR |
|------|-------|-----|
| **思維模式** | 電路圖 | 時間序列 |
| **約束來源** | 門的邏輯關係 | 狀態轉移規則 |
| **靈活性** | 極高（任意連接） | 中等（結構化） |
| **適用場景** | 通用計算 | 重複/規律計算 |

### 3.2 約束表達方式

#### PLONK 約束示例
```rust
// 每個門都是獨立的約束
gate1: q_L·w_a + q_R·w_b + q_O·w_c + q_M·w_a·w_b + q_C = 0
gate2: q_L·w_d + q_R·w_e + q_O·w_f + q_M·w_d·w_e + q_C = 0

// 通過複製約束連接
copy_constraint: w_c = w_d
```

#### AIR 約束示例  
```rust
// 轉移約束直接表達狀態變化
transition: next_state = f(current_state)
// 邊界約束定義初始/最終狀態  
boundary: initial_state = init_values
```

### 3.3 效率對比

| 方面 | PLONK | AIR |
|------|-------|-----|
| **設置複雜度** | 高（需設計門和連接） | 低（直接描述狀態轉移） |
| **約束數量** | 多（每個門一個約束） | 少（每種轉移一個約束） |
| **重複計算效率** | 低 | 高 |
| **並行化友好度** | 中等 | 高 |

---

## 4. Plonky2 的混合模型

### 4.1 核心創新：用 PLONK 實現 AIR

Plonky2 的天才之處在於：**使用 PLONK 的底層架構來高效實現 AIR 風格的約束**。

### 4.2 實現策略

#### A. 狀態表示
```rust
// 在 Plonky2 中，執行軌跡的每一行對應多個 PLONK 變數
struct FibonacciRow {
    a: Target,      // PLONK target
    b: Target,      // PLONK target  
    c: Target,      // PLONK target
}
```

#### B. 轉移約束實現
```rust
// 使用 PLONK 的門來實現 AIR 的轉移約束
impl CircuitBuilder {
    fn add_fibonacci_transition(&mut self, 
                               current: &FibonacciRow, 
                               next: &FibonacciRow) {
        // 內部約束：c = a + b
        let sum = self.add(current.a, current.b);
        self.connect(sum, current.c);
        
        // 轉移約束：使用複製約束實現狀態傳遞
        self.connect(current.b, next.a);  // a[i+1] = b[i]
        self.connect(current.c, next.b);  // b[i+1] = c[i]
    }
}
```

#### C. 複製約束的巧妙運用

**關鍵洞察：** Plonky2 用 PLONK 的複製約束來高效地表達「第 i+1 行的某個值等於第 i 行的某個值」，從而完美地模擬出轉移約束。

```rust
// 傳統 AIR 需要特殊的轉移約束機制
// Plonky2 將其轉化為 PLONK 的複製約束
self.connect(trace[i].output, trace[i+1].input);
```

### 4.3 混合模型的優勢

1. **保持靈活性**：仍可使用 PLONK 的任意門約束
2. **結構化效率**：對重複計算有 AIR 級別的效率  
3. **開發友好**：可以混合使用兩種約束風格
4. **遞迴友好**：複製約束在遞迴驗證中更容易處理

---

## 5. 實戰練習

### 練習 1：設計執行軌跡

為以下計算設計執行軌跡：計算 `x^4`（使用重複平方法）

<details>
<summary>解答</summary>

```
| Step | x | result |
|------|---|--------|
| 0    | x | x      |
| 1    | x | x²     |
| 2    | x | x⁴     |

轉移約束：
result[i+1] = result[i] × result[i]

邊界約束：
result[0] = x
```

</details>

### 練習 2：AIR 約束設計

為計數器電路設計 AIR：每步將計數器加 1，從 0 計數到 n。

<details>
<summary>解答</summary>

```rust
// 執行軌跡
| Step | counter |
|------|---------|
| 0    | 0       |
| 1    | 1       |
| 2    | 2       |
| ...  | ...     |
| n    | n       |

// 轉移約束
counter[i+1] = counter[i] + 1

// 邊界約束  
counter[0] = 0
counter[n] = n
```

</details>

### 練習 3：混合模型實現

思考如何在 Plonky2 中實現練習 2 的計數器。

<details>
<summary>解答</summary>

```rust
struct CounterRow {
    counter: Target,
}

impl CircuitBuilder {
    fn add_counter_step(&mut self, current: Target) -> Target {
        let one = self.one();
        let next = self.add(current, one);
        next
    }
    
    fn build_counter_circuit(&mut self, n: usize) -> Target {
        let mut current = self.zero(); // 初始值 0
        
        for _ in 0..n {
            current = self.add_counter_step(current);
        }
        
        current // 返回最終值
    }
}
```

</details>

---

## 6. 深入思考

### 思考題 1
為什麼說 AIR 更適合描述虛擬機（VM）的執行過程？

### 思考題 2
在什麼情況下，Plonky2 的混合模型會比純 AIR 或純 PLONK 更有優勢？

### 思考題 3  
如果要證明一個排序算法的正確性，你會選擇 PLONK 風格還是 AIR 風格的約束？為什麼？

---

## 7. 下一步預習

在下一個模組中，我們將探索：
- **FRI 承諾方案**如何取代 KZG 實現透明性
- **承諾-折疊-重複**的數學美學
- 為什麼 FRI 更適合 Plonky2 的遞迴目標

---

**關鍵要點回顧：**
1. **執行軌跡**提供了描述計算的時間序列視角
2. **AIR** 通過轉移和邊界約束自然地表達結構化計算
3. **Plonky2 的混合模型**巧妙地用 PLONK 的機制實現 AIR 的效率
4. 不同的算術化方法適合不同類型的計算任務
5. 理解這些差異是選擇合適工具的關鍵