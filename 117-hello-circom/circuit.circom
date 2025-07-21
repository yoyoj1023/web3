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