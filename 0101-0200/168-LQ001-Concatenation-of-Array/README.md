Q1. Concatenation of Array

Given an integer array nums of length n, you want to create an array ans of length 2n where ans[i] == nums[i] and ans[i + n] == nums[i] for 0 <= i < n (0-indexed).

Specifically, ans is the concatenation of two nums arrays.

Return the array ans.


給定一個長度為 $n$ 的整數陣列 `nums`，你需要建立一個長度為 $2n$ 的陣列 `ans`，並滿足以下條件：對於所有的 $0 \le i < n$，`ans[i] == nums[i]` 且 `ans[i + n] == nums[i]`（索引從 0 開始計算）。

具體來說，`ans` 是由兩個 `nums` 陣列**串聯（拼接）**而成的。

請回傳陣列 `ans`。

---

### 範例說明：
如果輸入 `nums = [1, 2, 1]`
則輸出 `ans = [1, 2, 1, 1, 2, 1]`

```

Example 1:

Input: nums = [1,2,1]
Output: [1,2,1,1,2,1]
Explanation: The array ans is formed as follows:
- ans = [nums[0],nums[1],nums[2],nums[0],nums[1],nums[2]]
- ans = [1,2,1,1,2,1]
Example 2:

Input: nums = [1,3,2,1]
Output: [1,3,2,1,1,3,2,1]
Explanation: The array ans is formed as follows:
- ans = [nums[0],nums[1],nums[2],nums[3],nums[0],nums[1],nums[2],nums[3]]
- ans = [1,3,2,1,1,3,2,1]
 

Constraints:

n == nums.length
1 <= n <= 1000
1 <= nums[i] <= 1000