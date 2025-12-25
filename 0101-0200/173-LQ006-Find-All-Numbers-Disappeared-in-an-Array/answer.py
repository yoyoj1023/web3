from typing import List

class Solution:
    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:
        """
        方法1: Bucket Array (桶陣列標記法) - by yoyo1023
        時間複雜度: O(n) - 遍歷數組兩次
        空間複雜度: O(n) - 使用額外的 bucket 數組
        
        思路: 創建一個與原數組等長的 bucket 數組，將出現過的數字對應位置標記為1，
              最後收集未被標記的位置
        """
        result = []
        bucket = [0] * len(nums)
        for i in range(len(nums)):
            bucket[nums[i] - 1] = 1
        for i in range(len(nums)):
            if bucket[i] == 0:
                result.append(i + 1)
        return result
    
    def findDisappearedNumbers_v2(self, nums: List[int]) -> List[int]:
        """
        方法2: Set 差集法
        時間複雜度: O(n) - 創建集合和計算差集都是 O(n)
        空間複雜度: O(n) - 使用 set 存儲數字
        
        思路: 利用集合的差集運算，找出完整集合 [1,n] 中缺少的元素
        """
        n = len(nums)
        return list(set(range(1, n + 1)) - set(nums))
    
    def findDisappearedNumbers_v3(self, nums: List[int]) -> List[int]:
        """
        方法3: 原地修改 - 負數標記法 (最優解，符合 Follow up 要求)
        時間複雜度: O(n) - 遍歷數組兩次
        空間複雜度: O(1) - 不使用額外空間（返回結果不計入）
        
        思路: 將每個數字對應的索引位置的值標記為負數，表示該數字出現過。
              最後遍歷數組，值為正數的索引位置就是缺失的數字
        """
        # 第一次遍歷：將出現過的數字對應的索引位置標記為負數
        for i in range(len(nums)):
            index = abs(nums[i]) - 1  # 使用絕對值，因為可能已經被標記為負數
            if nums[index] > 0:
                nums[index] = -nums[index]
        
        # 第二次遍歷：收集仍為正數的索引，這些就是缺失的數字
        result = []
        for i in range(len(nums)):
            if nums[i] > 0:
                result.append(i + 1)
        
        # 恢復原數組（可選，視需求而定）
        for i in range(len(nums)):
            nums[i] = abs(nums[i])
        
        return result
    
    def findDisappearedNumbers_v4(self, nums: List[int]) -> List[int]:
        """
        方法4: 原地修改 - 加 n 標記法
        時間複雜度: O(n) - 遍歷數組兩次
        空間複雜度: O(1) - 不使用額外空間（返回結果不計入）
        
        思路: 將每個數字對應的索引位置的值加上 n，表示該數字出現過。
              最後遍歷數組，值小於等於 n 的索引位置就是缺失的數字
        """
        n = len(nums)
        
        # 第一次遍歷：將出現過的數字對應的索引位置加 n
        for i in range(n):
            index = (nums[i] - 1) % n  # 使用模運算，因為可能已經被加過 n
            nums[index] += n
        
        # 第二次遍歷：收集值小於等於 n 的索引，這些就是缺失的數字
        result = []
        for i in range(n):
            if nums[i] <= n:
                result.append(i + 1)
        
        # 恢復原數組（可選）
        for i in range(n):
            nums[i] = (nums[i] - 1) % n + 1
        
        return result
    
    def findDisappearedNumbers_v5(self, nums: List[int]) -> List[int]:
        """
        方法5: 排序後遍歷
        時間複雜度: O(n log n) - 主要是排序的時間
        空間複雜度: O(1) 或 O(n) - 取決於排序算法的實現
        
        思路: 先排序，然後遍歷檢查每個位置是否缺失數字
        注意: 這不是最優解，但是一種可行的思路
        """
        nums.sort()
        result = []
        expected = 1
        
        for num in nums:
            # 跳過重複的數字
            if num == expected:
                expected += 1
            elif num > expected:
                # 添加所有缺失的數字
                while expected < num:
                    result.append(expected)
                    expected += 1
                expected += 1
        
        # 處理最後可能缺失的數字
        n = len(nums)
        while expected <= n:
            result.append(expected)
            expected += 1
        
        return result
    
    def findDisappearedNumbers_v6(self, nums: List[int]) -> List[int]:
        """
        方法6: Hash Map / Dictionary (字典映射法)
        時間複雜度: O(n) - 遍歷數組一次建立字典，再遍歷 1 到 n
        空間複雜度: O(n) - 使用字典存儲出現過的數字
        
        思路: 使用字典（Hash Map）記錄所有出現過的數字，
              然後遍歷 [1, n] 找出不在字典中的數字
        
        與方法1的比較：
        - 方法1 (Bucket Array): 使用固定大小的數組，索引直接對應數字
        - 方法6 (Dictionary): 使用哈希表，key 為數字，更靈活
        
        優點：
        - 如果數字範圍很大但實際數字很少時，字典更省空間
        - 更符合一般的哈希表思維模式
        
        缺點：
        - 哈希表有額外開銷（比數組稍慢）
        - 對於這題的特定場景（數字範圍就是 [1,n]），數組更優
        """
        # 建立字典，記錄所有出現過的數字
        num_dict = {}
        for num in nums:
            num_dict[num] = True  # 或者可以用 num_dict[num] = 1
        
        # 也可以用這種更 Pythonic 的寫法：
        # num_dict = {num: True for num in nums}
        
        # 找出 [1, n] 中不在字典裡的數字
        result = []
        for i in range(1, len(nums) + 1):
            if i not in num_dict:
                result.append(i)
        
        return result
    
    def findDisappearedNumbers_v6_variant(self, nums: List[int]) -> List[int]:
        """
        方法6變體: 使用 Counter (計數字典)
        時間複雜度: O(n)
        空間複雜度: O(n)
        
        思路: 使用 collections.Counter 統計每個數字出現的次數
              雖然這題不需要知道次數，但 Counter 提供了更豐富的功能
        """
        from collections import Counter
        
        counter = Counter(nums)
        result = []
        
        for i in range(1, len(nums) + 1):
            if i not in counter:
                result.append(i)
        
        return result


"""
總結：

方法比較：
┌──────────┬────────────────────┬──────────────┬──────────────┬────────────────────┐
│   方法   │       描述         │  時間複雜度  │  空間複雜度  │       推薦度       │
├──────────┼────────────────────┼──────────────┼──────────────┼────────────────────┤
│ 方法1    │ Bucket Array       │    O(n)      │    O(n)      │ ★★★☆☆ 易理解     │
│ 方法2    │ Set 差集法         │    O(n)      │    O(n)      │ ★★★★☆ 簡潔易讀   │
│ 方法3    │ 負數標記法         │    O(n)      │    O(1)      │ ★★★★★ 最優解     │
│ 方法4    │ 加 n 標記法        │    O(n)      │    O(1)      │ ★★★★☆ 最優解變體 │
│ 方法5    │ 排序後遍歷         │  O(n log n)  │  O(1)/O(n)   │ ★★☆☆☆ 不推薦     │
│ 方法6    │ Dictionary 映射    │    O(n)      │    O(n)      │ ★★★☆☆ 哈希表思維 │
└──────────┴────────────────────┴──────────────┴──────────────┴────────────────────┘

最佳解法：
- 面試推薦：方法3（負數標記法）或方法4（加 n 標記法）
  * 符合 Follow up 要求：O(n) 時間 + O(1) 空間
  * 原地修改，不使用額外空間
  * 展現對算法優化的深入理解
  
- 實際應用：方法2（Set 差集法）
  * 代碼最簡潔，可讀性最高
  * Python 的 set 操作經過高度優化
  * 如果不嚴格要求空間複雜度，這是最實用的方案

方法1 vs 方法6 (Array vs Dictionary)：
- 方法1 Bucket Array:
  ✓ 訪問速度更快 O(1) - 直接索引
  ✓ 內存連續，緩存友好
  ✓ 適合數字範圍固定的場景（本題最優）
  
- 方法6 Dictionary:
  ✓ 更靈活，適合數字範圍很大但數量少的場景
  ✓ 符合通用的哈希表解題思維
  ✗ 有哈希表額外開銷
  ✗ 對於本題的特定場景，略遜於數組

關鍵技巧：
1. 利用數組索引和數值的對應關係（數值範圍是 [1, n]，索引範圍是 [0, n-1]）
2. 原地修改技巧：負數標記、加 n 標記
3. 集合運算：差集可以簡化邏輯
4. 數據結構選擇：根據數據特性選擇數組或哈希表
"""