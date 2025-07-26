好的，這是一個絕佳的進階題目！在「通用加法器」的基礎上增加減法功能，能完美地引導學習者掌握一個核心概念：**如何使用選擇器 (Selectors) 來實現條件邏輯 (Conditional Logic) 或操作碼 (Opcodes)**。這離打造一個真正的 ZK-VM 又更近了一步。

這是一個基於這個想法的實作題草案。

---

### **Plonky3 實作挑戰：升級！打造通用算術邏輯單元 (ALU)**

#### **題目目標**

在前一個練習中，我們打造了一個只能執行 `ADD` 指令的 CPU。現在，我們將為它升級，加入 `SUB` (減法) 指令，將其從一個「加法器」變成一個更通用的「算術邏輯單元」(Arithmetic Logic Unit, ALU)。

本習題旨在引導你實作一個能夠證明「我們正確地執行了一系列 `ADD` 和 `SUB` 指令」的系統。完成後，你將精通：

1.  **使用操作選擇器 (Operation Selectors)**：如何在 Trace 中引入新的欄位來區分不同的指令類型。
2.  **實現條件約束 (Conditional Constraints)**：如何撰寫一個代數約束，使其能根據選擇器的值執行不同的計算邏輯（`if/else` 的代數形式）。
3.  **擴展現有設計**：學習如何在既有的 Chip 和 AIR 設計上，以模組化的方式添加新功能。

#### **概念說明：一個擁有 `ADD` 和 `SUB` 的 ALU**

我們的 ALU 依然擁有 4 個寄存器 (`r0` 到 `r3`)，但現在它能理解兩種指令：
1.  `ADD dest, src1, src2`  => `dest = src1 + src2`
2.  `SUB dest, src1, src2`  => `dest = src1 - src2`

我們的挑戰是，在同一個證明系統中，同時支援這兩種運算。

#### **Trace 設計升級**

為了支援新指令，我們需要在 Trace 中加入「操作選擇器」，用來告訴證明系統每一行應該執行加法還是減法。我們將在原有的 16 個欄位基礎上，增加 2 個新的選擇器欄位：

| 欄位名稱 | 描述 |
| :--- | :--- |
| `r0`, `r1`, `r2`, `r3` | **值欄位**：寄存器的當前值。 (4 欄) |
| `dest_0..3`, `src1_0..3`, `src2_0..3` | **寄存器選擇器**：one-hot 編碼。 (12 欄) |
| `op_add`, `op_sub` | **操作選擇器**：one-hot 編碼。 (新增 2 欄) |
| | - 若是 `ADD` 指令，則 `op_add=1`, `op_sub=0`。 |
| | - 若是 `SUB` 指令，則 `op_add=0`, `op_sub=1`。 |

總共 `4 + 12 + 2 = 18` 個欄位。

#### **實作步驟**

**第一步：更新專案與資料結構**

1.  將你之前的 `my_adder.rs` 複製為 `my_alu.rs`，我們將在此基礎上修改。
2.  更新你的指令表示方式，使其能夠包含操作類型。使用 `enum` 是一個很好的實踐：
    ```rust
    #[derive(Clone, Copy)]
    enum Opcode {
        ADD,
        SUB,
    }

    #[derive(Clone, Copy)]
    struct Instruction {
        op: Opcode,
        dest: usize,
        src1: usize,
        src2: usize,
    }
    ```
3.  將 `AdderChip` 重命名為 `AluChip`。

**第二步：更新執行軌跡的生成**

修改 `generate_trace` 函式，使其能夠處理新的 `Instruction` 結構和 18 欄的 Trace。

1.  **迴圈處理指令**：當你遍歷 `program` 中的每條 `Instruction` 時：
    *   **建立 18 欄的 Row**。
    *   **填入值與寄存器選擇器**：這部分邏輯與之前相同。
    *   **填入操作選擇器**：根據 `instruction.op` 的值，設定 `op_add` 和 `op_sub` 欄位。
        *   如果是 `Opcode::ADD`，則將 `op_add` 設為 `F::one()`，`op_sub` 設為 `F::zero()`。
        *   如果是 `Opcode::SUB`，則將 `op_add` 設為 `F::zero()`，`op_sub` 設為 `F::one()`。
    *   **更新狀態**：根據指令的 `op` 類型，正確地計算 `current_regs` 的下一個狀態（執行加法或減法）。

**第三步：實現 `Machine` Trait，定義新的 AIR**

這是本習題的核心。修改 `AluChip` 的 `eval()` 函式以適應新的設計。

1.  **獲取欄位**：從 `main.local()` 獲取所有 18 個欄位。將新增的 `op_add` 和 `op_sub` 欄位也存取出來。
2.  **更新選擇器有效性約束**：
    *   除了原有的寄存器選擇器約束，還需要為新的操作選擇器增加約束：
        *   `builder.assert_bool(op_add)` 和 `builder.assert_bool(op_sub)`
        *   `builder.assert_one(op_add + op_sub)` (確保兩者是 one-hot 的)
3.  **實現條件化的狀態轉移約束**：
    *   計算 `src1_val` 和 `src2_val` 的邏輯不變。
    *   **計算 `result` 的方式需要徹底改變**。我們需要一個單一的代數表達式來根據選擇器決定結果。這正是 Plonky3 的威力所在：
        ```rust
        // result = if (op_add == 1) { src1_val + src2_val } else { src1_val - src2_val }
        // 上述邏輯的代數形式：
        let add_result = src1_val + src2_val;
        let sub_result = src1_val - src2_val;
        let result = add_result * op_add + sub_result * op_sub;
        ```
        *   **請仔細思考這個表達式**：當 `op_add` 為 1 時，`op_sub` 為 0，`result` 就等於 `add_result`。反之，當 `op_sub` 為 1 時，`op_add` 為 0，`result` 就等於 `sub_result`。
    *   **更新寄存器狀態的約束公式不變**！它依然是：
        `next_regs[i] = local_regs[i] * (F::one() - local_selectors.dest_i) + result * local_selectors.dest_i`
        我們只需要將上面計算出的、更強大的 `result` 傳入這個公式即可。

**第四步：編寫 `main` 函式來測試 ALU**

1.  **定義一個混合程式**：建立一個包含 `ADD` 和 `SUB` 指令的 `Vec<Instruction>`。
    ```rust
    // r0=1, r1=2, r2=5, r3=0
    // r0 = r0 + r1   // r0 = 1 + 2 = 3
    // r1 = r2 - r0   // r1 = 5 - 3 = 2
    // r3 = r0 + r1   // r3 = 3 + 2 = 5
    let program = vec![
        Instruction { op: Opcode::ADD, dest: 0, src1: 0, src2: 1 },
        Instruction { op: Opcode::SUB, dest: 1, src1: 2, src2: 0 },
        Instruction { op: Opcode::ADD, dest: 3, src1: 0, src2: 1 },
    ];
    let initial_regs = [F::from_canonical_u32(1), F::from_canonical_u32(2), F::from_canonical_u32(5), F::zero()];
    ```
2.  使用新的 `AluChip` 和上述程式，生成 Trace，並進行證明與驗證。

#### **驗證與思考**

1.  **執行**：使用 `cargo run --release --example my_alu` 執行你的程式，並確認成功。
2.  **手動驗證**：根據上述範例程式和初始值，手動計算最終的寄存器狀態應該是多少？它是否與你程式運行的結果一致？
3.  **思考題 (請在繳交的說明文件中回答)**：
    *   **約束的力量**：如果在生成 Trace 時，`op_add` 欄位為 1，但你在計算下一個狀態時錯誤地執行了減法。`prove()` 會在哪個約束上失敗？請解釋原因。
    *   **設計抉擇**：我們用了兩個 one-hot 欄位 (`op_add`, `op_sub`)。我們能否只用一個欄位，比如 `is_sub` (1 代表減法，0 代表加法) 來實現？如果可以，`eval` 中的約束需要如何修改？這樣做有什麼優缺點？
    *   **下一步：乘法**：如果要進一步為這個 ALU 添加 `MUL dest, src1, src2` 指令，你需要對 Trace 設計和 `eval` 函式做出哪些修改？請寫出修改後，用於計算 `result` 的那個關鍵代數表達式。