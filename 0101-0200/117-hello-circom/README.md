# Circom Hello World - ZK-SNARKs 入門教學

這是一個 ZK-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) 的基礎 Circom Hello World 範例專案。本專案將教您如何從零開始建立一個簡單的零知識證明電路。

環境為 Node.js v18.20.8

## 🎯 專案目標

學習如何建立一個簡單的乘法器電路，證明我們知道兩個數字 `a` 和 `b`，使得 `a * b = c`，而不洩露 `a` 和 `b` 的具體值。

## 📁 專案結構

```
117-hello-circom/
├── circuit.circom           # 電路定義檔案
├── input.json              # 電路輸入資料
├── circuit.r1cs            # 編譯後的約束系統
├── circuit.wasm            # 編譯後的 WebAssembly 檔案
├── circuit.sym             # 符號檔案
├── circuit_js/             # JavaScript 見證計算器
│   ├── circuit.wasm
│   ├── generate_witness.js
│   └── witness_calculator.js
├── witness.wtns            # 計算出的見證
├── pot12_*.ptau           # Powers of Tau 儀式檔案
├── circuit_*.zkey         # 電路特定的可信設定檔案
├── verification_key.json  # 驗證密鑰
├── proof.json             # 生成的證明
└── public.json            # 公開輸入/輸出
```

## 🛠️ 環境搭建

### 1. 安裝 Node.js 和 npm

確保您的系統已安裝 Node.js (版本 14 或更高)：

```bash
# 檢查 Node.js 版本
node --version

# 檢查 npm 版本
npm --version
```

```bash
# 查看已安裝的 Node.js 版本
nvm ls

# 切換 Node.js 版本 v18.20.8
nvm use 18.20.8
```

### 2. 安裝 Circom 編譯器

```bash
# 安裝 circom 編譯器
npm install -g circom

# 驗證安裝
circom --version
```

### 3. 安裝 snarkjs 工具

```bash
# 安裝 snarkjs CLI 工具
npm install -g snarkjs

# 驗證安裝
snarkjs --version
```

## 💡 電路撰寫

我們的電路檔案 `circuit.circom` 定義了一個簡單的乘法器：

```circom
pragma circom 2.0.0;

/*
 * 這是一個簡單的乘法器電路
 * Template 名稱是 Multiplier
 */
template Multiplier() {
    // 輸入信號 (signals)
    // a 和 b 是私有輸入 (private inputs)，證明者 (Prover) 知道，但驗證者 (Verifier) 不知道
    signal input a;
    signal input b;

    // 輸出信號 (signal)
    // c 是公開輸出 (public output)，證明者和驗證者都知道
    signal output c;

    // 電路的約束 (constraints)
    // 這個約束定義了 a * b 必須等於 c
    c <== a * b;
}

/*
 * 這是我們電路的主元件
 * 我們實例化了上面的 Multiplier template
 */
component main = Multiplier();
```

### 電路關鍵概念：

- **signal**: Circom 中的基本資料類型，代表電路中的信號
- **input**: 輸入信號，可以是私有的或公開的
- **output**: 輸出信號，通常是公開的
- **<==**: 約束操作符，定義電路的約束條件
- **template**: 電路模板，可以重複使用
- **component**: 電路元件的實例

## 🔧 電路編譯

將 Circom 電路編譯成約束系統和 WebAssembly：

```bash
# 進入專案目錄
cd 117-hello-circom

# 編譯電路
circom circuit.circom --r1cs --wasm --sym
```

這個命令會生成：
- `circuit.r1cs`: R1CS (Rank-1 Constraint System) 約束系統
- `circuit_js/circuit.wasm`: WebAssembly 檔案，用於計算見證
- `circuit.sym`: 符號檔案，包含變數名稱映射

## 🔐 可信設定 (Trusted Setup)

ZK-SNARKs 需要一個可信設定過程，包含兩個階段：

### 階段 1: Powers of Tau 儀式

```bash
# 開始 Powers of Tau 儀式
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

# 第一次貢獻
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="第一次貢獻" -v

# 準備第二階段
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
```

### 階段 2: 電路特定設定

```bash
# 生成電路的 zkey 檔案
snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey

# 貢獻到電路特定的可信設定
snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="電路貢獻" -v

# 匯出驗證密鑰
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
```

## 📊 計算見證 (Witness Calculation)

見證是滿足電路約束的所有信號的值。我們的輸入檔案 `input.json`：

```json
{
    "a": "3",
    "b": "11"
}
```

計算見證：

```bash
# 使用 JavaScript 計算見證
node circuit_js/generate_witness.js circuit_js/circuit.wasm input.json witness.wtns
```

或者使用 snarkjs：

```bash
# 使用 snarkjs 計算見證
snarkjs wtns calculate circuit_js/circuit.wasm input.json witness.wtns
```

## 🛡️ 產生證明 (Proof Generation)

使用見證和可信設定生成零知識證明：

```bash
# 生成證明
snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json
```

這會生成：
- `proof.json`: 零知識證明
- `public.json`: 公開輸入和輸出（在我們的例子中是 `c = 33`）

## ✅ 驗證證明 (Proof Verification)

驗證生成的證明是否有效：

```bash
# 驗證證明
snarkjs groth16 verify verification_key.json public.json proof.json
```

如果驗證成功，您會看到：
```
[INFO]  snarkJS: OK!
```

## 🔍 檔案說明

### 輸入檔案 (input.json)
```json
{
    "a": "3",      // 私有輸入：第一個數字
    "b": "11"      // 私有輸入：第二個數字
}
```

### 公開輸出 (public.json)
```json
[
 "33"              // 公開輸出：a * b 的結果
]
```

### 證明檔案 (proof.json)
包含 Groth16 證明的所有組件：
- `pi_a`, `pi_b`, `pi_c`: 證明的橢圓曲線點
- `protocol`: 使用的協議 (groth16)
- `curve`: 使用的橢圓曲線 (bn128)

## 🚀 完整工作流程

以下是完整的 ZK-SNARKs 工作流程：

```bash
# 1. 編譯電路
circom circuit.circom --r1cs --wasm --sym

# 2. 可信設定階段 1
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="第一次貢獻" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

# 3. 可信設定階段 2
snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey
snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="電路貢獻" -v
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

# 4. 計算見證
snarkjs wtns calculate circuit_js/circuit.wasm input.json witness.wtns

# 5. 生成證明
snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json

# 6. 驗證證明
snarkjs groth16 verify verification_key.json public.json proof.json
```

## 🎓 學習要點

1. **零知識**: 證明者可以證明知道滿足 `a * b = 33` 的 `a` 和 `b` 值，而不洩露具體的 `a` 和 `b`
2. **簡潔性**: 無論電路多複雜，證明大小都是常數
3. **非互動式**: 證明一旦生成，任何人都可以獨立驗證
4. **可信設定**: Groth16 需要可信設定，但這是一次性的

## 🔧 故障排除

### 常見問題：

1. **circom 命令找不到**
   ```bash
   npm install -g circom
   ```

2. **snarkjs 命令找不到**
   ```bash
   npm install -g snarkjs
   ```

3. **記憶體不足**
   - 減少 Powers of Tau 的參數 (例如從 12 改為 10)

4. **驗證失敗**
   - 檢查 input.json 格式是否正確
   - 確保所有步驟按順序執行

## 📚 進階學習

- 學習更複雜的電路設計
- 了解不同的 ZK 協議 (PLONK, STARK)
- 探索 ZK 應用場景 (隱私保護, 擴容方案)
- 研究電路優化技巧

## 🌟 結語

恭喜！您已經成功學會了 ZK-SNARKs 的基本概念和完整工作流程。這個簡單的乘法器電路是通往更複雜零知識應用的第一步。

---

**注意**: 這個範例僅用於學習目的。在生產環境中使用時，請確保進行適當的安全審查和測試。 