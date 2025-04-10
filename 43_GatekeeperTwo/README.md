# GatekeeperTwo - Ethernaut CTF Challenge

## 專案概述
本專案為 Ethernaut CTF 中 GatekeeperTwo 關卡的自寫攻略。在此挑戰中，目標是繞過合約中多重防禦的檢查條件。

## 攻略關鍵
- 繞過三個不同的檢查條件：
  - gateOne: 利用合約呼叫與交易發起者不一致的方式進行操作。
  - gateTwo: 透過部署合約或使用特殊技術達到 extcodesize 檢查的要求。
  - gateThree: 運用位元運算與 keccak256 哈希來計算出合適的 key 值。
- 分析 Solidity 裡的低層邏輯並利用 assembly 優化呼叫選項。

## 所需知識儲備
- Solidity 語言及其安全性最佳實踐
- Ethereum 智能合約內部機制（例如：tx.origin, msg.sender, extcodesize）
- 位元運算與哈希函數（keccak256）的運用
- 基本區塊鏈及智能合約部署流程

## 執行環境
- Node.js 與 Hardhat（或 Truffle）工具
- Solidity 編譯器版本 0.8.0 以上
- Ethereum 測試網路（例如：Ganache）
