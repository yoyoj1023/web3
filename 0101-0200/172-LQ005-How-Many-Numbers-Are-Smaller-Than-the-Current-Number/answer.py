from typing import List

class Solution:
    def smallerNumbersThanCurrent(self, nums: List[int]) -> List[int]:
        """
        解法一：排序 + 映射
        時間複雜度：O(n log n)
        空間複雜度：O(n)
        """
        # 創建一個排序後的數組（帶索引）
        sorted_nums = sorted(nums)
        
        # 使用字典記錄每個數字對應有多少個比它小的數
        # 注意：如果有重複數字，只記錄第一次出現的位置
        num_to_count = {}
        for i, num in enumerate(sorted_nums):
            if num not in num_to_count:
                num_to_count[num] = i
        
        # 根據原數組的順序，查找結果
        result = [num_to_count[num] for num in nums]
        return result
    
    def smallerNumbersThanCurrent_v2(self, nums: List[int]) -> List[int]:
        """
        解法二：計數排序（最優解）
        時間複雜度：O(n + k)，k = 101（數字範圍）
        空間複雜度：O(k)
        """
        # 創建計數數組（因為 0 <= nums[i] <= 100）
        count = [0] * 101
        
        # 統計每個數字出現的次數
        for num in nums:
            count[num] += 1
        
        # 計算前綴和：count[i] 表示小於 i 的數字總數
        for i in range(1, 101):
            count[i] += count[i - 1]
        
        # 構建結果數組
        result = []
        for num in nums:
            if num == 0:
                result.append(0)
            else:
                result.append(count[num - 1])
        
        return result
    
    def smallerNumbersThanCurrent_v3(self, nums: List[int]) -> List[int]:
        """
        解法三：暴力解法
        時間複雜度：O(n²)
        空間複雜度：O(1)
        """
        result = []
        for i in range(len(nums)):
            count = 0
            for j in range(len(nums)):
                if j != i and nums[j] < nums[i]:
                    count += 1
            result.append(count)
        return result
    
    def smallerNumbersThanCurrent_v4(self, nums: List[int]) -> List[int]:
        """
        解法四：暴力解法（by yoyo1023）
        時間複雜度：O(n²)
        空間複雜度：O(n)
        
        說明：這個方法不需要檢查 j != i，因為即使 j == i，
        nums[j] < nums[i] 也不會成立（一個數不會小於自己）
        """
        result = [0] * len(nums)
        counter = 0
        for i in range(len(nums)):
            for j in range(len(nums)):
                if nums[j] < nums[i]:
                    counter += 1
            result[i] = counter
            counter = 0
        return result


# 測試代碼
if __name__ == "__main__":
    solution = Solution()
    
    # 測試案例 1
    nums1 = [8, 1, 2, 2, 3]
    print(f"輸入: {nums1}")
    print(f"輸出: {solution.smallerNumbersThanCurrent(nums1)}")
    print(f"預期: [4, 0, 1, 1, 3]")
    print()
    
    # 測試案例 2
    nums2 = [6, 5, 4, 8]
    print(f"輸入: {nums2}")
    print(f"輸出: {solution.smallerNumbersThanCurrent(nums2)}")
    print(f"預期: [2, 1, 0, 3]")
    print()
    
    # 測試案例 3
    nums3 = [7, 7, 7, 7]
    print(f"輸入: {nums3}")
    print(f"輸出: {solution.smallerNumbersThanCurrent(nums3)}")
    print(f"預期: [0, 0, 0, 0]")
    print()
    
    # 測試計數排序解法
    print("測試計數排序解法 (v2):")
    print(f"輸入: {nums1}")
    print(f"輸出: {solution.smallerNumbersThanCurrent_v2(nums1)}")
    print()
    
    # 測試用戶的暴力解法
    print("測試用戶的暴力解法 (v4):")
    print(f"輸入: {nums1}")
    print(f"輸出: {solution.smallerNumbersThanCurrent_v4(nums1)}")
    print(f"輸入: {nums2}")
    print(f"輸出: {solution.smallerNumbersThanCurrent_v4(nums2)}")
    print()