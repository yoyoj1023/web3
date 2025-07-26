![Plonky3-powered-by-polygon](https://github.com/Plonky3/Plonky3/assets/86010/7ec356ad-b0f3-4c4c-aa1d-3a151c1065e7)

[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/Plonky3/Plonky3/blob/main/LICENSE-MIT)
[![License](https://img.shields.io/github/license/Plonky3/Plonky3)](https://github.com/Plonky3/Plonky3/blob/main/LICENSE-APACHE)

Plonky3 is a toolkit which provides a set of primitives, such as polynomial commitment schemes, for implementing polynomial IOPs (PIOPs). It is mainly used to power STARK-based zkVMs, though in principle it may be used for PLONK-based circuits or other PIOPs.

For questions or discussions, please use the Telegram group, [t.me/plonky3](https://t.me/plonky3).

## 🎓 Plonky3 學習教程 - 零知識證明系統開發完整指南

### 📚 教程概覽

在 `examples/` 目錄下，我們精心設計了一套完整的 Plonky3 學習課程，包含 **5 個循序漸進的習題**，帶領你從零基礎掌握零知識證明系統的開發。無論你是密碼學新手還是區塊鏈開發者，這套教程都能幫助你深入理解 STARK 證明系統的核心原理和實際應用。

### 🎯 學習曲線設計

我們的學習路徑採用**理論與實踐並重**的設計理念，每個習題都建立在前一個的基礎之上：

#### 📖 第一階段：理論基礎建立
**[Lesson 1: FRI 基礎理論與手算練習](examples/lesson1-fri-fundamental-and-example/)**
- **學習目標**：深入理解 FRI（Fast Reed-Solomon Interactive Oracle Proof）協議
- **核心內容**：
  - 多項式摺疊（Polynomial Folding）的數學原理
  - 有限域運算的實際應用
  - Verifier 與 Prover 互動機制
  - 完整的手算驗證範例（在 𝔽₁₇ 中計算 f(x) = x³ + 2x² + 3x + 4）
- **技能提升**：建立對零知識證明底層數學的直觀理解
- **適合對象**：希望深入理解 FRI 協議運作機制的學習者

#### 🧠 第二階段：概念體系掌握
**[Lesson 2: Plonky3 核心概念問答挑戰](examples/lesson2-plonky3-concept/)**
- **學習目標**：全面掌握 Plonky3 的核心概念和術語
- **核心內容**：
  - AIR（代數中間表示）的設計原理
  - 執行軌跡（Execution Trace）的生成與驗證
  - FRI 協議在 STARK 中的關鍵作用
  - 遞迴證明（Recursive Proofs）的應用場景
  - Plonky3 模組化架構的優勢
- **學習方式**：10道問答題 + 10道是非題，涵蓋從基礎定義到高級應用
- **技能提升**：形成完整的零知識證明知識體系
- **適合對象**：準備深入學習 Plonky3 實作的開發者

#### 💻 第三階段：實作能力培養
**[Lesson 3: 費波那契數列證明器實作](examples/lesson3-fibonacci-prover/)**
- **學習目標**：掌握 Plonky3 基本開發流程，實現第一個完整的證明系統
- **核心內容**：
  - 定義 Plonky3 "Chip" 組件
  - 生成執行軌跡（Execution Trace）
  - 實作 AIR 約束（初始約束 + 轉移約束）
  - 生成與驗證 STARK 證明
- **實作重點**：
  - 設計費波那契數列的 AIR 規格
  - 處理邊界約束（F(0)=0, F(1)=1）
  - 實現狀態轉移約束（F(n) = F(n-1) + F(n-2)）
- **技能提升**：具備基本的零知識證明系統開發能力
- **適合對象**：有 Rust 基礎，希望入門 Plonky3 開發的程式設計師

#### 🔧 第四階段：系統架構進階
**[Lesson 4: 通用加法處理器實作](examples/lesson4-universal-adder/)**
- **學習目標**：學習處理狀態管理和可配置操作，為建構 ZK-VM 打下基礎
- **核心內容**：
  - 設計具有多個寄存器的 CPU 模型
  - 使用選擇器（Selectors）實現動態操作選擇
  - 實現 one-hot 編碼和約束驗證
  - 處理複雜的狀態轉移邏輯
- **實作重點**：
  - 4個寄存器的狀態管理
  - ADD 指令的完整實現
  - 選擇器欄位的約束設計
  - 從指令序列生成執行軌跡
- **技能提升**：掌握複雜狀態系統的零知識證明設計
- **適合對象**：希望建構虛擬機器證明系統的進階開發者

#### 🚀 第五階段：高級系統設計
**[Lesson 5: 算術邏輯單元 (ALU) 實作](examples/lesson5-adder-subtractor-alu/)**
- **學習目標**：掌握條件邏輯和操作碼處理，實現完整的 ALU 系統
- **核心內容**：
  - 操作選擇器（Operation Selectors）的設計
  - 條件約束（Conditional Constraints）的實現
  - 多指令類型的統一處理框架
  - 模組化擴展現有系統
- **實作重點**：
  - 同時支援 ADD 和 SUB 指令
  - 設計操作碼選擇機制
  - 實現條件化的代數約束
  - 處理複雜的狀態轉移邏輯
- **技能提升**：具備設計複雜零知識虛擬機器的能力
- **適合對象**：準備開發生產級 ZK-VM 系統的專業開發者

### 📈 學習成果與能力進階

完成這套教程後，你將能夠：

🎯 **理論掌握**
- 深入理解 FRI 協議的數學原理和實現細節
- 掌握 STARK 證明系統的完整工作流程
- 理解零知識證明的密碼學基礎

🛠️ **實作能力**
- 獨立設計和實現 AIR 規格
- 熟練使用 Plonky3 框架開發證明系統
- 處理複雜的狀態管理和約束設計

🏗️ **系統設計**
- 設計可擴展的零知識虛擬機器架構
- 實現高效的證明生成和驗證流程
- 掌握模組化系統設計原則

🚀 **實際應用**
- 為區塊鏈擴容方案開發 ZK-Rollup 系統
- 實現隱私保護的計算驗證方案
- 建構高性能的零知識證明基礎設施

### 🎓 開始學習

建議按照 Lesson 1 → Lesson 2 → Lesson 3 → Lesson 4 → Lesson 5 的順序進行學習。每個習題都包含詳細的說明文件、實作指導和思考題，確保你能夠紮實地掌握每一個概念。

📝 **學習建議**：
- 理論習題請務必親手計算，建立數學直觀
- 程式習題請親自編寫代碼，避免直接複製
- 完成每個習題後請思考擴展應用的可能性
- 建議維護學習筆記，記錄重要概念和實作細節


## Status

Fields:
- [x] Mersenne31
  - [x] "complex" extension field
  - [x] ~128 bit extension field
  - [x] AVX2
  - [x] AVX-512
  - [x] NEON
- [x] General 31 bit fields (BabyBear and KoalaBear)
  - [x] ~128 bit extension field
  - [x] AVX2
  - [x] AVX-512
  - [x] NEON
- [x] Goldilocks
  - [x] ~128 bit extension field

Generalized vector commitment schemes
- [x] generalized Merkle tree

Polynomial commitment schemes
- [x] FRI-based PCS
- [ ] tensor PCS
- [ ] univariate-to-multivariate adapter
- [ ] multivariate-to-univariate adapter

PIOPs
- [x] univariate STARK
- [ ] multivariate STARK
- [ ] PLONK

Codes
- [x] Brakedown
- [x] Reed-Solomon

Interpolation
- [x] Barycentric interpolation
- [x] radix-2 DIT FFT
- [x] radix-2 Bowers FFT
- [ ] four-step FFT
- [x] Mersenne circle group FFT

Hashes
- [x] Rescue
- [x] Poseidon
- [x] Poseidon2
- [x] BLAKE3
  - [ ] modifications to tune BLAKE3 for hashing small leaves
- [x] Keccak-256
- [x] Monolith


## Benchmarks

Many variations are possible, with different fields, hashes, and so forth, which can be controlled through the command line.

For example, to prove 2^20 Poseidon2 permutations of width 16, using the `KoalaBear` field, `Radix2DitParallel` DFT, and `KeccakF` as the Merkle tree hash:
```bash
RUSTFLAGS="-Ctarget-cpu=native" cargo run --example prove_prime_field_31 --release --features parallel -- --field koala-bear --objective poseidon-2-permutations --log-trace-length 17 --discrete-fourier-transform radix-2-dit-parallel --merkle-hash keccak-f
```

Currently the options for the command line arguments are:
- `--field` (`-f`): `mersenne-31` or `koala-bear` or `baby-bear`.
- `--objective` (`-o`): `blake-3-permutations, poseidon-2-permutations, keccak-f-permutations`.
- `--log-trace-length` (`-l`): Accepts any integer between `0` and `255`. The number of permutations proven is `trace_length, 8*trace_length` and `trace_length/24` for `blake3, poseidon2` and `keccakf` respectively. 
- `--discrete-fourier-transform` (`-d`): `radix-2-dit-parallel, recursive-dft`. This option should be omitted if the field choice is `mersenne-31` as the circle stark currently only supports a single discrete fourier transform.
- `--merkle-hash` (`-m`): `poseidon-2, keccak-f`.

Extra speedups may be possible with some configuration changes:
- `JEMALLOC_SYS_WITH_MALLOC_CONF=retain:true,dirty_decay_ms:-1,muzzy_decay_ms:-1` will cause jemalloc to hang on to virtual memory. This may not affect the very first proof much, but can help significantly with subsequent proofs as fewer pages (if any) will need to be newly assigned by the OS. These settings might not be suitable for all production environments, e.g. if the process' virtual memory is limited by `ulimit` or `max_map_count`.
- Adding `lto = "fat"` in the top-level `Cargo.toml` may improve performance slightly, at the cost of longer compilation times.

## CPU features

Plonky3 contains optimizations that rely on newer CPU instructions unavailable in older processors. These instruction sets include x86's [BMI1 and 2](https://en.wikipedia.org/wiki/X86_Bit_manipulation_instruction_set), [AVX2](https://en.wikipedia.org/wiki/Advanced_Vector_Extensions#Advanced_Vector_Extensions_2), and [AVX-512](https://en.wikipedia.org/wiki/AVX-512). Rustc does not emit those instructions by default; they must be explicitly enabled through the `target-feature` compiler option (or implicitly by setting `target-cpu`). To enable all features that are supported on your machine, you can set `target-cpu` to `native`. For example, to run the tests:
```bash
RUSTFLAGS="-Ctarget-cpu=native" cargo test
```

Support for some instructions, such as AVX-512, is still experimental. They are only available in the nightly build of Rustc and are enabled by the [`nightly-features` feature flag](#nightly-only-optimizations). To use them, you must enable the flag in Rustc (e.g. by setting `target-feature`) and you must also enable the `nightly-features` feature.


## Nightly-only optimizations

Some optimizations (in particular, AVX-512-optimized math) rely on features that are currently available only in the nightly build of Rustc. To use them, you need to enable the `nightly-features` feature. For example, to run the tests:
```bash
cargo test --features nightly-features
```


## Known issues

The verifier might panic upon receiving certain invalid proofs.


## License

Licensed under either of

* Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
* MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.


## Guidance for external contributors

Do you feel keen and able to help with Plonky3? That's great! We
encourage external contributions!

We want to make it easy for you to contribute, but at the same time, we
must manage the burden of reviewing external contributions. We are a
small team, and the time we spend reviewing external contributions is
time we are not developing ourselves.

We also want to help you avoid inadvertently duplicating work that
is already underway, or building something that we will not
want to incorporate.

First and foremost, please keep in mind that this is a highly
technical piece of software and contributing is only suitable for
experienced mathematicians, cryptographers, and software engineers.

The Polygon Zero Team reserves the right to accept or reject any
external contribution for any reason, including a simple lack of time
to maintain it (now or in the future); we may even decline to review
something that is not considered a sufficiently high priority for us.

To avoid disappointment, please communicate your intention to
contribute openly, while respecting the limited time and availability
we have to review and provide guidance for external contributions. It
is a good idea to drop a note in our public Discord #development
channel about your intention to work on something, whether an issue, a
new feature, or a performance improvement. This is probably all that's
really required to avoid duplication of work with other contributors.

What follows are some more specific requests for how to write PRs in a
way that will make them easy for us to review. Deviating from these
guidelines may result in your PR being rejected, ignored, or forgotten.


### General guidance for your PR

Obviously, PRs will not be considered unless they pass our Github
CI. The GitHub CI is not executed for PRs from forks, but you can
simulate the GitHub CI by running the commands in
`.github/workflows/ci.yml`.

Under no circumstances should a single PR mix different purposes: Your
PR is either a bug fix, a new feature, or a performance improvement,
never a combination. Nor should you include, for example, two
unrelated performance improvements in one PR. Please just submit
separate PRs. The goal is to make reviewing your PR as simple as
possible, and you should be thinking about how to compose the PR to
minimize the burden on the reviewer.

Plonky3 uses stable Rust, so any PR that depends on unstable features
is likely to be rejected. It's possible that we may relax this policy
in the future, but we aim to minimize the use of unstable features;
please discuss with us before enabling any.

Please do not submit any PRs consisting of merely minor fixes to documentation.
They will not be accepted. If you find something that bothers you particularly,
make an issue and we will fix it when we find the time.

Here are a few specific guidelines for the three main categories of
PRs that we expect:


#### The PR fixes a bug

In the PR description, please clearly but briefly describe

1. the bug (could be a reference to a GH issue; if it is from a
   discussion (on Discord/email/etc. for example), please copy in the
   relevant parts of the discussion);
2. what turned out to cause the bug; and
3. how the PR fixes the bug.

Wherever possible, PRs that fix bugs should include additional tests
that (i) trigger the original bug and (ii) pass after applying the PR.


#### The PR implements a new feature

If you plan to contribute the implementation of a new feature, please
double-check with the Polygon Zero team that it is a sufficient
priority for us that it will be reviewed and integrated.

In the PR description, please clearly but briefly describe

1. what the feature does
2. the approach taken to implement it

All PRs for new features must include a suitable test suite.


#### The PR improves performance

Performance improvements are particularly welcome! Please note that it
can be quite difficult to establish true improvements for the
workloads we care about. To help filter out false positives, the PR
description for a performance improvement must clearly identify

1. the target bottleneck (only one per PR to avoid confusing things!)
2. how performance is measured
3. characteristics of the machine used (CPU, OS, #threads if appropriate)
4. performance before and after the PR


### Licensing

Unless you explicitly state otherwise, any contribution intentionally
submitted for inclusion in the work by you, as defined in the
Apache-2.0 license, shall be dual licensed as above, without any
additional terms or conditions.
