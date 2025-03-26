import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

// 計算哈希值
const commitment = keccak256(ethers.utils.defaultAbiCoder.encode(["string"], ["mySecret"]));
 
// 得到一個 bytes32 值，被加密中
// 0x5c6e1f3d...

// 提交 Commit，此時我的秘密遭到加密
await contract.commit(commitment);

// 揭示 Reveal
await contract.reveal("myScrect");

// 如果 _value 正確，合約會驗證成功，並將結果記錄下來