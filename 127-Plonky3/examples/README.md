# Plonky3 範例執行指南

歡迎來到 Plonky3 範例集合！本目錄包含了多個零知識證明（Zero-Knowledge Proof）的實作範例和教學材料，幫助您深入理解 Plonky3 框架的運作原理。

## 📚 專案概述

Plonky3 是一個高效能的零知識證明框架，本範例集包含：
- **實作範例**：可執行的程式範例，展示不同的證明場景
- **教學材料**：從基礎理論到進階實作的完整學習路徑
- **理論說明**：深入的數學推導和概念解釋

## 🛠️ 環境要求

在開始之前，請確保您的系統已安裝：

1. **Rust 編程環境**
   ```bash
   # 檢查 Rust 版本（建議使用最新穩定版）
   rustc --version
   cargo --version
   ```

2. **Git 版本控制**
   ```bash
   git --version
   ```

如果尚未安裝 Rust，請訪問 [https://rustup.rs/](https://rustup.rs/) 進行安裝。

## 🚀 快速開始

### 執行範例程式

所有範例程式都位於 `examples/examples/` 目錄下，可以使用以下命令執行：

```bash
# 基本執行格式
cargo run --release --example <範例名稱>

# 範例：執行斐波那契證明器
cargo run --release --example my_fibonacci
```

> **注意**：使用 `--release` 標誌可以大幅提升證明生成的效能。

## 📋 可用範例

### 1. 斐波那契數列證明器 (`my_fibonacci`)
```bash
cargo run --release --example my_fibonacci
```
**功能**：證明斐波那契數列的正確計算
**學習重點**：
- 基本的 AIR（Algebraic Intermediate Representation）設計
- 執行軌跡（Execution Trace）生成
- 初始約束和轉移約束的實作

### 2. 通用加法器 (`my_adder`)
```bash
cargo run --release --example my_adder
```
**功能**：證明一系列加法指令的正確執行
**學習重點**：
- 狀態管理和寄存器操作
- 選擇器（Selectors）的使用
- 條件邏輯的代數表示

### 3. 算術邏輯單元 (`my_alu`)
```bash
cargo run --release --example my_alu
```
**功能**：支援加法和減法運算的進階處理器
**學習重點**：
- 操作碼（Opcodes）處理
- 多指令類型的證明系統
- 條件約束的實作

### 4. 質數體證明 (`prove_prime_field_31`)
```bash
cargo run --release --example prove_prime_field_31
```
**功能**：在質數體 F₃₁ 上的證明演示
**學習重點**：
- 不同有限體的應用
- 體運算的證明技術

## 📖 教學材料

### Lesson 1: FRI 基礎理論 (`lesson1-fri-fundamental-and-example/`)
**內容**：
- FRI（Fast Reed-Solomon Interactive Oracle Proofs）協議詳解
- 完整的數學推導和手算範例
- 摺疊（Folding）過程的深入解析

**閱讀順序**：
1. `README.md` - 主要理論內容
2. `README1.md` - 補充說明

### Lesson 2: Plonky3 概念 (`lesson2-plonky3-concept/`)
**內容**：Plonky3 框架的核心概念和架構

### Lesson 3: 斐波那契證明器實作 (`lesson3-fibonacci-prover/`)
**內容**：
- 從零開始實作斐波那契證明器
- AIR 設計的詳細指導
- 實作步驟和驗證方法

**建議搭配**：`my_fibonacci` 範例

### Lesson 4: 通用加法器實作 (`lesson4-universal-adder/`)
**內容**：
- 狀態機的設計與實作
- 選擇器機制的應用
- 指令處理的證明方法

**建議搭配**：`my_adder` 範例

### Lesson 5: ALU 實作 (`lesson5-adder-subtractor-alu/`)
**內容**：
- 多指令類型的處理
- 操作碼選擇器的設計
- 條件邏輯的代數實現

**建議搭配**：
- `my_alu` 範例
- `ALU_實作報告.md` - 詳細的實作報告

## 🎯 學習路徑建議

### 初學者路徑
1. **理論基礎**：閱讀 `lesson1` 了解 FRI 協議
2. **概念理解**：學習 `lesson2` 的 Plonky3 概念
3. **實作入門**：跟隨 `lesson3` 實作斐波那契證明器
4. **執行驗證**：運行 `my_fibonacci` 範例

### 進階路徑
1. **狀態管理**：學習 `lesson4` 並實作通用加法器
2. **指令處理**：學習 `lesson5` 並實作 ALU
3. **實際應用**：運行所有範例程式
4. **深入研究**：閱讀實作報告和思考題

## 🔧 故障排除

### 常見問題

1. **編譯錯誤**
   ```bash
   # 清理並重新編譯
   cargo clean
   cargo build --release
   ```

2. **執行緩慢**
   - 確保使用 `--release` 標誌
   - 檢查系統記憶體是否充足

3. **找不到範例**
   ```bash
   # 確認目前位置在 Plonky3 根目錄
   pwd
   # 列出所有可用範例
   ls examples/examples/
   ```

### 效能建議

- **記憶體**：建議至少 8GB RAM
- **編譯**：始終使用 `--release` 模式
- **並行**：利用多核心處理器的優勢

## 💡 進階使用

### 自定義範例
1. 在 `examples/examples/` 目錄下創建新的 `.rs` 檔案
2. 實作您的證明邏輯
3. 使用 `cargo run --release --example <您的檔案名>` 執行

### 調試技巧
```bash
# 查看詳細輸出
RUST_LOG=debug cargo run --release --example my_fibonacci

# 查看編譯過程
cargo build --release --example my_fibonacci --verbose
```

## 📚 進一步學習

### 相關資源
- [Plonky3 官方文檔](https://github.com/Plonky3/Plonky3)
- [STARK 協議原理](https://starkware.co/stark/)
- [FRI 協議論文](https://eccc.weizmann.ac.il/report/2017/134/)

### 建議練習
1. 修改現有範例，增加新功能
2. 實作不同的計算邏輯
3. 優化證明生成效能
4. 探索不同的有限體應用

## 🤝 貢獻指南

歡迎提交問題報告、功能建議或程式碼改進！請參考主專案的貢獻指南。

## 📄 授權資訊

本專案採用與 Plonky3 相同的授權條款。詳細資訊請參考根目錄的 LICENSE 檔案。

---

**祝您學習愉快！如有任何問題，歡迎查閱教學材料或提交 Issue。**
