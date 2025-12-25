Q2. Shuffle the Array

Given the array nums consisting of 2n elements in the form [x1,x2,...,xn,y1,y2,...,yn].

Return the array in the form [x1,y1,x2,y2,...,xn,yn].


給定一個含有 $2n$ 個元素的陣列 `nums`，其形式為 `[x1, x2, ..., xn, y1, y2, ..., yn]`。

請將陣列重新排列，並以 `[x1, y1, x2, y2, ..., xn, yn]` 的形式回傳。


### 範例說明：
若輸入 `nums = [2, 5, 1, 3, 4, 7], n = 3`
則輸出 `[2, 3, 5, 4, 1, 7]`
（解釋：$x_1=2, x_2=5, x_3=1, y_1=3, y_2=4, y_3=7$，重新排列後變成 $x_1, y_1, x_2, y_2, x_3, y_3$）


Example 1:

Input: nums = [2,5,1,3,4,7], n = 3
Output: [2,3,5,4,1,7] 
Explanation: Since x1=2, x2=5, x3=1, y1=3, y2=4, y3=7 then the answer is [2,3,5,4,1,7].
Example 2:

Input: nums = [1,2,3,4,4,3,2,1], n = 4
Output: [1,4,2,3,3,2,4,1]
Example 3:

Input: nums = [1,1,2,2], n = 2
Output: [1,2,1,2]
 

Constraints:

1 <= n <= 500
nums.length == 2n
1 <= nums[i] <= 10^3