# 最終模組：動手實作 - 理論與實踐 (Hands-on Lab)

## 模組目標
將理論知識轉化為實際技能。

## 心智模型
從「紙上談兵」到「實戰演練」，真正掌握 PLONK 的精髓。

---

## 第一課：電路設計練習

### 1.1 簡單電路：平方根檢查

**問題**：證明你知道 x 使得 x² = y，但不透露 x 的值

**電路設計**：
```
門1: x × x = y
```

**PLONK 配置**：
- q_L = 0
- q_R = 0  
- q_O = -1
- q_M = 1
- q_C = 0

**線路值**（假設 x = 5, y = 25）：
- w_a = 5
- w_b = 5
- w_c = 25

**練習 1.1**：為 x = 7, y = 49 填寫線路值。

### 1.2 中等電路：MiMC 哈希函數

**MiMC 算法**：
```
for i in range(rounds):
    x = (x + key + constants[i])^3
return x
```

**電路分解**（單輪）：
```
門1: temp1 = x + key + c_i
門2: temp2 = temp1 × temp1  
門3: result = temp2 × temp1
```

**複製約束**：
- 門1的輸出 = 門2的左輸入
- 門1的輸出 = 門3的右輸入
- 門2的輸出 = 門3的左輸入

**練習 1.2**：為 3 輪 MiMC 設計完整電路。

### 1.3 複雜電路：Fibonacci 數列

**問題**：證明第 n 個 Fibonacci 數是 F_n

**電路設計**：
```
F_0 = 0
F_1 = 1
for i from 2 to n:
    F_i = F_{i-1} + F_{i-2}
```

**門的設計**：
```
門i: w_a[i] + w_b[i] = w_c[i]
```

其中：
- w_a[i] = F_{i-2}
- w_b[i] = F_{i-1}  
- w_c[i] = F_i

**複製約束**：
- w_c[i] = w_b[i+1]
- w_b[i] = w_a[i+1]

**練習 1.3**：為計算 F_10 設計完整電路，並列出所有複製約束。

---

## 第二課：多項式構造實戰

### 2.1 手算線路多項式

**電路**：
```
門1: 2 + 3 = 5
門2: 5 × 4 = 20
```

**域設置**：使用 F_17，ω = 3（因為 3² = 9 ≠ 1, 3⁴ = 81 ≡ 13 ≠ 1, 但 3^8 ≡ 1）

等一下，讓我們用更簡單的設置：F_5, ω = 2（因為 2⁴ = 16 ≡ 1 (mod 5)）

**線路值**：
- w_a = [2, 5]  
- w_b = [3, 4]
- w_c = [5, 20] ≡ [5, 0] (mod 5)

**多項式插值**：
目標：找到 w_a(X) 使得 w_a(ω⁰) = w_a(1) = 2, w_a(ω¹) = w_a(2) = 5

使用拉格朗日插值：
```
w_a(X) = 2 × (X-2)/(1-2) + 5 × (X-1)/(2-1)
       = 2 × (X-2)/(-1) + 5 × (X-1)/1
       = -2(X-2) + 5(X-1)
       = -2X + 4 + 5X - 5
       = 3X - 1
```

**驗證**：
- w_a(1) = 3×1 - 1 = 2 ✓
- w_a(2) = 3×2 - 1 = 5 ✓

**練習 2.1**：計算 w_b(X) 和 w_c(X)。

### 2.2 約束多項式構造

**選擇子設置**：
- 門1（加法）：q_L=1, q_R=1, q_O=-1, q_M=0, q_C=0
- 門2（乘法）：q_L=0, q_R=0, q_O=-1, q_M=1, q_C=0

**選擇子多項式**：
```
q_L(X) = 1 × (X-2)/(1-2) + 0 × (X-1)/(2-1) = -(X-2) = -X+2
q_M(X) = 0 × (X-2)/(1-2) + 1 × (X-1)/(2-1) = X-1
```

**約束多項式**：
```
P(X) = q_L(X)w_a(X) + q_R(X)w_b(X) + q_O(X)w_c(X) + q_M(X)w_a(X)w_b(X) + q_C(X)
```

**練習 2.2**：計算 P(1) 和 P(2)，驗證它們都等於 0。

### 2.3 商多項式計算

**零化多項式**：
```
Z_H(X) = (X-1)(X-2) = X² - 3X + 2
```

**商多項式**：
```
t(X) = P(X) / Z_H(X)
```

由於 P(1) = P(2) = 0，P(X) 必定能被 Z_H(X) 整除。

**練習 2.3**：執行多項式長除法，計算 t(X)。

---

## 第三課：程式碼庫探索

### 3.1 Plonky2 原始碼結構

**核心模塊**：
```
plonky2/
├── field/           # 有限體實現
├── fri/             # FRI 承諾方案
├── gates/           # 各種門的實現
├── hash/            # 哈希函數
├── iop/             # IOP (Interactive Oracle Proof)
├── plonk/           # PLONK 協議核心
├── poly/            # 多項式運算
└── util/            # 工具函數
```

### 3.2 門的實現分析

**找到加法門**：
```rust
// plonky2/src/gates/arithmetic_gate.rs
pub struct ArithmeticGate {
    pub num_ops: usize,
}

impl Gate for ArithmeticGate {
    fn eval_unfiltered(&self, vars: EvaluationVars) -> Vec<F> {
        // 實現 q_L * w_a + q_R * w_b + q_O * w_c + q_M * (w_a * w_b) + q_C
    }
}
```

**練習 3.1**：閱讀 `arithmetic_gate.rs`，找到對應我們學習的 PLONK 公式的程式碼。

### 3.3 多項式承諾的實現

**FRI 實現**：
```rust
// plonky2/src/fri/prover.rs
pub fn prove(&self, polynomial: &Polynomial) -> FriProof {
    // FRI 證明生成
}

// plonky2/src/fri/verifier.rs  
pub fn verify(&self, proof: &FriProof) -> bool {
    // FRI 證明驗證
}
```

**練習 3.2**：追蹤一個多項式從承諾到打開的完整流程。

### 3.4 置換參數的實現

**置換多項式**：
```rust
// plonky2/src/plonk/permutation_argument.rs
pub fn compute_permutation_z_polys(
    gate_constraints: &[GateConstraint],
    permutation: &Permutation,
) -> Vec<Polynomial> {
    // 計算置換多項式 Z(X)
}
```

**練習 3.3**：理解置換多項式的具體計算過程。

---

## 第四課：使用高階語言

### 4.1 Circom 實現

**安裝 Circom**：
```bash
npm install -g circom
npm install -g snarkjs
```

**簡單電路**：
```javascript
// square.circom
pragma circom 2.0.0;

template Square() {
    signal input x;
    signal output y;
    
    y <== x * x;
}

component main = Square();
```

**編譯和測試**：
```bash
circom square.circom --r1cs --wasm --sym
echo '{"x": "5"}' > input.json
node square_js/generate_witness.js square_js/square.wasm input.json witness.wtns
```

**練習 4.1**：實現 MiMC 哈希的 Circom 版本。

### 4.2 Noir 實現

**安裝 Noir**：
```bash
curl -L noirup.dev | bash
noirup
```

**簡單電路**：
```rust
// main.nr
fn main(x: Field, y: pub Field) {
    assert(x * x == y);
}
```

**測試**：
```bash
nargo check
nargo test
nargo prove
nargo verify
```

**練習 4.2**：用 Noir 實現 Fibonacci 數列驗證。

### 4.3 Plonky2 直接使用

**Rust 項目設置**：
```toml
[dependencies]
plonky2 = "0.1"
```

**簡單電路**：
```rust
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::field::goldilocks_field::GoldilocksField;

fn main() {
    let mut builder = CircuitBuilder::<GoldilocksField, 2>::new();
    
    // 添加輸入
    let x = builder.add_virtual_target();
    let y = builder.add_virtual_target();
    
    // 添加約束：x * x = y
    let x_squared = builder.mul(x, x);
    builder.connect(x_squared, y);
    
    // 設為公開輸入
    builder.register_public_input(y);
    
    // 構建電路
    let data = builder.build::<C>();
}
```

**練習 4.3**：實現一個簡單的範圍檢查電路。

---

## 第五課：性能分析與優化

### 5.1 基準測試

**測試電路**：
- 小型：100 個門
- 中型：10,000 個門  
- 大型：1,000,000 個門

**指標測量**：
```rust
use std::time::Instant;

let start = Instant::now();
let proof = prover.prove(witness);
let prove_time = start.elapsed();

let start = Instant::now();
let is_valid = verifier.verify(proof);
let verify_time = start.elapsed();

println!("Prove time: {:?}", prove_time);
println!("Verify time: {:?}", verify_time);
println!("Proof size: {} bytes", proof.len());
```

**練習 5.1**：測試不同電路大小的性能表現。

### 5.2 瓶頸識別

**常見瓶頸**：
1. **FFT 計算**：多項式運算的主要成本
2. **哈希計算**：Merkle tree 構建
3. **記憶體訪問**：大型多項式的存取

**分析工具**：
```bash
# CPU 分析
perf record ./your_program
perf report

# 記憶體分析  
valgrind --tool=massif ./your_program
```

**練習 5.2**：分析你的電路的性能瓶頸。

### 5.3 優化策略

**並行化**：
```rust
use rayon::prelude::*;

// 並行 FFT
let coeffs: Vec<_> = (0..n).into_par_iter()
    .map(|i| compute_coeff(i))
    .collect();
```

**記憶體優化**：
```rust
// 流式處理大型多項式
for chunk in polynomial.chunks(CHUNK_SIZE) {
    process_chunk(chunk);
}
```

**練習 5.3**：實現一個優化版本的電路，並比較性能。

---

## 第六課：實際應用開發

### 6.1 零知識投票系統

**需求**：
- 用戶可以秘密投票
- 任何人可以驗證投票總數
- 無法追蹤個人投票

**電路設計**：
```
// 每個投票
輸入：voter_id (private), vote (private), nullifier (public)
約束：
1. vote ∈ {0, 1}  // 範圍檢查
2. nullifier = hash(voter_id, election_id)  // 防重投
3. 公開 vote 的承諾
```

**練習 6.1**：實現完整的投票電路。

### 6.2 隱私保護的身份驗證

**需求**：
- 證明年齡 ≥ 18
- 不透露具體年齡
- 防止重放攻擊

**電路設計**：
```
輸入：age (private), threshold=18 (public), nonce (public)
約束：
1. age ≥ threshold
2. 輸出 hash(age, nonce)
```

**練習 6.2**：添加額外約束（如年齡 ≤ 120）。

### 6.3 零知識機器學習

**需求**：
- 證明 ML 模型的預測結果
- 不透露模型參數
- 保護輸入數據隱私

**電路設計**：
```
輸入：features (private), weights (private), prediction (public)
約束：
1. prediction = model(features, weights)
2. 模型計算的正確性
```

**練習 6.3**：實現一個簡單的線性回歸證明。

---

## 第七課：生產環境考慮

### 7.1 安全性檢查清單

**可信設置**：
- [ ] 使用經過審計的可信設置
- [ ] 驗證設置參數的正確性
- [ ] 確保設置過程的透明性

**實現安全**：
- [ ] 使用經過審計的庫
- [ ] 防止旁道攻擊
- [ ] 安全的隨機數生成

**協議安全**：
- [ ] 正確的域參數選擇
- [ ] 適當的安全參數
- [ ] 防止常見攻擊向量

### 7.2 可擴展性設計

**批量處理**：
```rust
// 批量驗證多個證明
fn batch_verify(proofs: &[Proof]) -> bool {
    let combined = combine_proofs(proofs);
    verify_single(combined)
}
```

**遞歸證明**：
```rust
// 證明其他證明的有效性
fn recursive_verify(inner_proof: Proof) -> Proof {
    // 構建驗證電路
    // 生成包裝證明
}
```

**練習 7.1**：實現一個支持批量驗證的系統。

### 7.3 部署和監控

**部署檢查**：
- 性能基準測試
- 記憶體使用監控
- 錯誤處理機制

**監控指標**：
```rust
struct Metrics {
    prove_time_avg: Duration,
    verify_time_avg: Duration,
    proof_size_avg: usize,
    success_rate: f64,
}
```

**練習 7.2**：設計一個完整的監控系統。

---

## 模組總結

通過本模組的實踐，您已經：

1. **親手設計**了各種複雜度的 PLONK 電路
2. **深入探索**了實際的 ZK 系統實現
3. **使用高階語言**快速構建 ZK 應用
4. **分析和優化**了系統性能
5. **開發實際應用**並考慮生產環境需求

### 核心技能

- 電路設計和約束分析
- 多項式操作和性能優化  
- 實際系統的實現和部署
- 安全性考慮和最佳實踐

## 最終檢驗

確認您現在能夠：
- [ ] 獨立設計中等複雜度的 ZK 電路
- [ ] 閱讀和理解 ZK 系統的原始碼
- [ ] 使用主流工具開發 ZK 應用
- [ ] 分析和優化 ZK 系統的性能
- [ ] 考慮生產環境的各種需求

## 恭喜畢業！

您現在已經完全掌握了 PLONK 協議的精髓，具備了：
- 深入的理論理解
- 扎實的實踐技能
- 系統性的思維方式
- 解決實際問題的能力

準備好探索更廣闊的零知識證明世界了！下一步，您可以：
- 深入研究 Plonky3 和最新發展
- 探索其他 ZK 系統（STARKs, Nova 等）
- 開發自己的 ZK 應用
- 為開源 ZK 項目做出貢獻

**零知識證明的未來在您手中！** 🚀