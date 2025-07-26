這是一個基於 Plonky3 官網 Fibonacci 範例的實作題草案，旨在引導學習者從無到有建立一個可以運作的專案。

---

### **Plonky3 實作挑戰：實現費波那契數列證明器 (Fibonacci Prover)**

#### **題目目標**

本習題旨在引導你使用 Rust 和 Plonky3 函式庫，親手實現一個用於證明費波那契數列計算的零知識證明系統。完成後，你將能夠：

1.  **定義一個 Plonky3 "Chip"**：了解如何將特定計算（費波那契數列）封裝成 Plonky3 的可重用元件。
2.  **生成執行軌跡 (Execution Trace)**：為費波那契數列的計算過程產出一個有效的 Trace。
3.  **實作代數中間表示 (AIR)**：使用 Plonky3 的 `Machine` trait 來定義計算的初始約束 (Initial Constraints) 和轉移約束 (Transition Constraints)。
4.  **生成與驗證證明**：編寫主程式來實際生成一個 STARK 證明，並驗證其有效性。

#### **前置準備**

1.  **Rust 環境**：確保你已安裝最新穩定版的 Rust 和 Cargo。
    *   可以透過 `rustup --version` 和 `cargo --version` 來檢查。
2.  **Git**：你需要 Git 來複製 Plonky3 的官方儲存庫。
3.  **複製 Plonky3 儲存庫**：本專案需要依賴 Plonky3 的核心元件。將官方儲存庫複製到你的本地電腦：
    ```bash
    git clone https://github.com/Plonky3/Plonky3.git
    cd Plonky3
    ```
    *（接下來的步驟將假設你在 `Plonky3` 目錄下進行操作）*

#### **題目說明**

費波那契數列是一個經典的遞迴數列，其定義為：
*   `F(0) = 0`
*   `F(1) = 1`
*   `F(n) = F(n-1) + F(n-2)` for `n > 1`

我們將建立一個證明，宣稱「我們正確地計算了 N 次費波那契數列的迭代」。為了實現這一點，我們的執行軌跡 (Trace) 將包含兩列：`a` 和 `b`。在第 `i` 行，這兩列的值將分別對應 `F(i)` 和 `F(i+1)`。

因此，整個計算的正確性可以由以下規則來保證：
1.  **初始狀態**：在第一行 (row 0)，`a` 必須是 0，`b` 必須是 1。
2.  **狀態轉移**：對於任何一行 `i`，下一行 `i+1` 的值必須滿足：
    *   `next_row.a` 應該等於 `current_row.b`
    *   `next_row.b` 應該等於 `current_row.a + current_row.b`

你的任務就是將這些規則用 Plonky3 的 API 轉譯成程式碼。

#### **實作步驟**

**第一步：設定專案**

1.  在 `Plonky3/examples` 目錄下，建立一個新的 rust 檔案，例如 `my_fibonacci.rs`。
2.  你可以參考 `Plonky3/examples/fibonacci.rs` 的結構，但我們強烈建議你親手打出程式碼，而不是直接複製貼上，以加深理解。

**第二步：定義 `FibonacciChip`**

1.  建立一個公開的結構 `pub struct FibonacciChip;`。
2.  為它實現 `Chip` trait。這個 Chip 不需要任何設定或欄位，所以可以為 `Config` 和 `Bus` 指定為 `()` 和 `()`.

**第三步：實現 `Machine` Trait，定義 AIR**

這是本習題的核心。你需要為 `FibonacciChip` 實現 `Machine` trait。

1.  **`eval()` 函式**：這個函式是定義所有代數約束的地方。它接收一個 `builder` 物件，你可以用它來加入約束。
    *   **存取 Trace 欄位**：你需要先從 `builder` 的 `main.local_mut()` 和 `main.next_mut()` 取得當前行 (local) 和下一行 (next) 的欄位。我們的 Trace 有兩列，可以這樣取得：
        ```rust
        let local_slice = main.local_mut();
        let a = local_slice[0];
        let b = local_slice[1];

        let next_slice = main.next_mut();
        let next_a = next_slice[0];
        let next_b = next_slice[1];
        ```
    *   **定義初始約束**：使用 `builder.when_first_row()` 來定義只在第一行生效的約束。你需要確保 `a` 等於 0，`b` 等於 1。
        ```rust
        // builder.when_first_row().assert_eq(a, F::zero());
        // ...
        ```
    *   **定義轉移約束**：使用 `builder.when_transition()` 來定義適用於所有狀態轉移的約束。你需要在此處陳述 `next_a == b` 和 `next_b == a + b`。
        ```rust
        // builder.when_transition().assert_eq(next_a, b);
        // ...
        ```

**第四步：生成執行軌跡 (Trace)**

1.  為 `FibonacciChip` 實現一個輔助函式，例如 `generate_trace`，它接收一個 `n` (迭代次數) 作為輸入，並回傳一個 `RowMajorMatrix<F>`。
2.  這個函式的邏輯應該是：
    *   初始化一個空的 Trace 向量。
    *   設定初始值 `a = F::zero()`, `b = F::one()`。
    *   迴圈 `n` 次，每一次：
        *   將 `[a, b]` 這個 row 加入 Trace 中。
        *   更新 `a` 和 `b` 的值以符合費波那契數列的規則 (`let next_b = a + b; a = b; b = next_b;`)。
    *   將產生的向量轉換成 `RowMajorMatrix`。

**第五步：編寫 `main` 函式來證明與驗證**

1.  在 `main` 函式中，設定好你的 Runtime 和 Chip。
2.  呼叫你在第四步中建立的 `generate_trace` 函式來生成一個有 1000 行的 Trace。
3.  使用 `chip.prove()` 函式，傳入 Runtime、Config 和 Trace 來生成證明。
4.  使用 `chip.verify()` 函式，傳入 Runtime、Config 和證明，來驗證證明的有效性。
5.  在證明的生成與驗證前後，印出提示訊息，並在驗證成功後印出成功訊息。

#### **驗證與思考**

1.  **執行**：在 `Plonky3` 根目錄下，使用以下指令執行你的程式：
    ```bash
    cargo run --release --example my_fibonacci
    ```
    如果一切順利，你應該會看到證明生成和驗證成功的訊息。

2.  **思考題 (請在繳交的說明文件中回答)**：
    *   **破壞 Trace**：如果在生成 Trace 後，但在 `prove()` 之前，你手動修改 Trace 中的某個值 (例如，`trace.values[10] = F::random(rng)`)，再次執行會發生什麼事？為什麼？
    *   **破壞約束**：如果在 `eval()` 函式中，你將轉移約束 `next_b == a + b` 錯誤地寫成 `next_b == a + b + F::one()`，但使用原本正確的 Trace，執行 `prove()` 會發生什麼事？為什麼？
    *   **通用性**：如何修改你的程式碼，使其能夠證明盧卡斯數列 (Lucas Numbers)，其規則為 `L(n) = L(n-1) + L(n-2)`，但初始值為 `L(0) = 2`, `L(1) = 1`？

#### **繳交項目**

1.  一個包含你所有程式碼的 GitHub 儲存庫連結。
2.  一份 `README.md` 文件，包含：
    *   如何執行你的專案的簡單說明。
    *   對上述「驗證與思考」中三個問題的詳細回答。