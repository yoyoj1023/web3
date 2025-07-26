當然！繼 Fibonacci 之後，建構一個能執行指令的「通用加法器」是一個絕佳的進階練習。這個題目能引導學習者思考如何處理「狀態 (State)」和「可配置的操作 (Configurable Operations)」，這是建構更複雜 ZK-VM (零知識虛擬機) 的基石。

這是一個基於這個想法的實作題草案。

---

### **Plonky3 實作挑戰：打造通用加法處理器 (Universal Adder CPU)**

#### **題目目標**

在上一個練習中，我們為一個固定的計算（費波那契數列）建立了證明。現在，我們將挑戰一個更通用的場景：一個可以執行一系列「加法指令」的簡單 CPU。

本習題旨在引導你實作一個可以證明「給定一個初始狀態和一系列指令，我們正確地執行了所有加法運算並得到了最終狀態」的系統。完成後，你將學會：

1.  **管理狀態**：如何在執行軌跡 (Trace) 中表示和更新一組寄存器 (Registers)。
2.  **使用選擇器 (Selectors)**：如何使用二進位選擇器欄位來動態地決定每一行要執行哪種操作。
3.  **定義更複雜的 AIR**：為一個有條件邏輯的計算撰寫代數約束。
4.  **從「程式」生成 Trace**：將一個抽象的指令序列轉換為 Plonky3 所需的具體執行軌跡。

#### **概念說明：一個只有 `ADD` 指令的 CPU**

想像一個擁有 4 個寄存器 (`r0`, `r1`, `r2`, `r3`) 的極簡 CPU。它只能理解一種指令：

`ADD dest, src1, src2`

這個指令的意思是「將 `src1` 寄存器和 `src2` 寄存器的值相加，並將結果存入 `dest` 寄存器」。例如，`ADD r0, r1, r2` 就會執行 `r0 = r1 + r2`。其他寄存器（此例中為 `r3`）的值保持不變。

我們的目標是證明一個「程式」（一連串的 `ADD` 指令）被正確執行了。

#### **Trace 設計**

為了證明這一點，我們的執行軌跡在每一行都需要捕捉到兩件事：
1.  **當前狀態**：執行指令前，所有寄存器的值。
2.  **當前指令**：我們要執行哪個 `ADD` 操作。

因此，我們的 Trace 將包含以下欄位（以 4 個寄存器為例）：

| 欄位名稱 | 描述 |
| :--- | :--- |
| `r0`, `r1`, `r2`, `r3` | **值欄位**：在執行本行指令 *之前*，4 個寄存器的值。 |
| `dest_0`, `dest_1`, `dest_2`, `dest_3` | **目標選擇器**：one-hot 編碼。若 `dest_i` 為 1，表示 `ri` 是目標寄存器。 |
| `src1_0`, `src1_1`, `src1_2`, `src1_3` | **來源1選擇器**：one-hot 編碼。若 `src1_i` 為 1，表示 `ri` 是來源1寄存器。 |
| `src2_0`, `src2_1`, `src2_2`, `src2_3` | **來源2選擇器**：one-hot 編碼。若 `src2_i` 為 1，表示 `ri` 是來源2寄存器。 |

總共 `4 + 4*3 = 16` 個欄位。

**狀態轉移規則**：
從第 `i` 行到第 `i+1` 行，寄存器的值必須根據第 `i` 行的選擇器來更新。
*   **對於目標寄存器 `dest`**：`next_row.dest = current_row.src1 + current_row.src2`。
*   **對於非目標寄存器**：`next_row.reg = current_row.reg` (值保持不變)。

#### **實作步驟**

**第一步：設定專案與資料結構**

1.  在 `Plonky3/examples` 目錄下建立 `my_adder.rs`。
2.  為了方便表示指令，先定義一個簡單的結構：
    ```rust
    #[derive(Clone, Copy)]
    struct Instruction {
        dest: usize, // 寄存器索引 0-3
        src1: usize,
        src2: usize,
    }
    ```
3.  定義 `AdderChip` 結構 `pub struct AdderChip;`，並為其實現 `Chip` trait。

**第二步：生成執行軌跡**

這是將抽象指令轉換為具體 Trace 的關鍵。為 `AdderChip` 實現一個輔助函式：
`generate_trace(&self, program: Vec<Instruction>, initial_regs: [F; 4]) -> RowMajorMatrix<F>`

1.  **初始化**：設定一個 `current_regs` 變數來追蹤當前寄存器的值，初始值為 `initial_regs`。初始化一個空的 `trace` 向量。
2.  **迴圈處理指令**：遍歷 `program` 中的每一條 `Instruction`。
    *   **建立 Row**：為當前指令建立一個 16 欄的 `row` 向量。
    *   **填入值**：將 `current_regs` 的值填入 `row` 的前 4 個位置。
    *   **填入選擇器**：根據當前 `Instruction` 的 `dest`, `src1`, `src2` 索引，將對應的 one-hot 選擇器欄位設為 `F::one()`，其餘設為 `F::zero()`。
    *   **加入 Trace**：將完成的 `row` 加入 `trace` 向量。
    *   **更新狀態**：根據指令計算出 *下一個* 狀態的寄存器值，並更新 `current_regs` 變數，為下一次迴圈做準備。
3.  **回傳**：將 `trace` 向量轉換為 `RowMajorMatrix` 並回傳。

**第三步：實現 `Machine` Trait，定義 AIR**

為 `AdderChip` 實現 `Machine` trait，並在 `eval()` 函式中定義約束。

1.  **獲取欄位**：從 `main.local()` 和 `main.next()` 中獲取當前行和下一行的所有 16 個欄位。將它們分組為 `local_regs`, `local_selectors` 和 `next_regs` 會很有幫助。
2.  **約束 1：選擇器有效性 (Selector Validity)**
    *   使用 `builder.assert_bool(s)` 確保所有 12 個選擇器欄位的值都是 0 或 1。
    *   使用 `builder.assert_one(...)` 確保每一組選擇器（dest, src1, src2）都是 one-hot 的。例如：`builder.assert_one(local_selectors.dest_0 + local_selectors.dest_1 + ...)`。
3.  **約束 2：狀態轉移 (State Transition)**
    *   **計算來源值**：使用選擇器和寄存器值計算出 `src1_val` 和 `src2_val`。這可以透過點積 (dot product) 來優雅地實現：
        `src1_val = local_regs[0] * local_selectors.src1_0 + local_regs[1] * local_selectors.src1_1 + ...`
    *   **計算加法結果**：`add_result = src1_val + src2_val`。
    *   **約束每個寄存器的下一狀態**：對於每個寄存器 `i` (從 0 到 3)，建立以下約束：
        `next_regs[i] = local_regs[i] * (F::one() - local_selectors.dest_i) + add_result * local_selectors.dest_i`
        這個公式的含義是：
        *   如果 `dest_i` 是 1 (此寄存器是目標)，則 `1 - dest_i` 為 0，下一狀態等於 `add_result`。
        *   如果 `dest_i` 是 0 (此寄存器不是目標)，則 `1 - dest_i` 為 1，下一狀態等於 `local_regs[i]` (保持不變)。
        使用 `builder.assert_eq(...)` 來施加此約束。

**第四步：編寫 `main` 函式來證明與驗證**

1.  **定義一個程式**：建立一個 `Vec<Instruction>` 作為你的測試程式。例如：
    ```rust
    // r2 = r0 + r1   (1 + 2 = 3)
    // r3 = r2 + r2   (3 + 3 = 6)
    // r0 = r3 + r1   (6 + 2 = 8)
    let program = vec![
        Instruction { dest: 2, src1: 0, src2: 1 },
        Instruction { dest: 3, src1: 2, src2: 2 },
        Instruction { dest: 0, src1: 3, src2: 1 },
    ];
    ```
2.  **設定初始狀態**：定義初始的 4 個寄存器值，例如 `[1, 2, 0, 0]`。
3.  **生成 Trace、證明與驗證**：呼叫你寫好的 `generate_trace` 函式，然後呼叫 `prove()` 和 `verify()`。

#### **驗證與思考**

1.  **執行**：使用 `cargo run --release --example my_adder` 執行你的程式，並確認證明與驗證皆成功。
2.  **手動驗證**：你的程式執行完畢後，最後一行的寄存器狀態應該是什麼？手動計算一次，並與你 Trace 中的最後一個狀態進行比較，以確認你的 `generate_trace` 邏輯是正確的。
3.  **思考題 (請在繳交的說明文件中回答)**：
    *   **無效指令**：如果在生成 Trace 時，你不小心將某一行的 `dest` 選擇器全部設為 0，`prove()` 會在哪個環節失敗？是因爲哪個約束被違反了？
    *   **狀態竄改**：如果在 `generate_trace` 後，但在 `prove` 前，你手動修改了某個非目標寄存器的值（例如，在 `r0 = r3 + r1` 這一行，你同時手動修改了 `r2` 的值），`prove()` 會在哪個環節失敗？是因爲哪個約束被違反了？
    *   **擴展指令集**：如果你想為這個 CPU 增加一個 `MOV dest, src` 指令（將 `src` 的值複製到 `dest`），你會如何修改你的 Trace 設計和 `eval()` 函式中的約束？（提示：可能需要一個新的 `op_selector` 欄位來區分 `ADD` 和 `MOV`）。