# 11_Simple Voting Project

一、學習投票合約的基礎： 
```
1.暫不考慮安全性(重複投票)、歷史紀錄、通用性...等
2.將來可應用於 DAO
3.可視需要擴增功能
```

二、Solidity 語法說明： 關於輸出中文與 unicode

```solidity

// 儲存候選人得票數量，key 為候選人名稱
    mapping (string => uint256) public votesReceived;

// 為指定候選人投票
    function voteForCandidate(string memory candidate) public {
        // 檢查候選人是否合法
        require(validCandidate(candidate), unicode"候選人不存在");
        votesReceived[candidate] += 1;
    }
```

```
1.若需要 Solidity 返回、操作中文或其他 unicode 編碼文字，需要在字串前標註 unicode 關鍵字
```
