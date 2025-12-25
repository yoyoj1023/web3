class Solution:
    def findErrorNums(self, nums: List[int]) -> List[int]:
        """
        找出重複的數字和缺失的數字
        
        方法：使用集合和數學計算
        1. 用 set 找出重複的數字（實際總和 vs 集合總和的差）
        2. 用數學公式找出缺失的數字（理論總和 vs 集合總和的差）
        
        時間複雜度：O(n)
        空間複雜度：O(n)
        """
        n = len(nums)
        
        # 計算實際總和
        actual_sum = sum(nums)
        
        # 計算去重後的總和（集合總和）
        unique_sum = sum(set(nums))
        
        # 計算理論總和（1 到 n 的總和）
        expected_sum = n * (n + 1) // 2
        
        # 重複的數字 = 實際總和 - 去重總和
        duplicate = actual_sum - unique_sum
        
        # 缺失的數字 = 理論總和 - 去重總和
        missing = expected_sum - unique_sum
        
        return [duplicate, missing]
    
    # 方法二：使用 Counter（更直觀的解法）
    def findErrorNums_v2(self, nums: List[int]) -> List[int]:
        """
        使用 Counter 統計每個數字出現次數
        
        時間複雜度：O(n)
        空間複雜度：O(n)
        """
        from collections import Counter
        
        n = len(nums)
        count = Counter(nums)
        
        duplicate = -1
        missing = -1
        
        # 找出重複和缺失的數字
        for i in range(1, n + 1):
            if count[i] == 2:
                duplicate = i
            elif count[i] == 0:
                missing = i
        
        return [duplicate, missing]
    
    # 方法三：原地標記法（空間複雜度 O(1)）
    def findErrorNums_v3(self, nums: List[int]) -> List[int]:
        """
        使用原地標記法，將索引對應的值標記為負數
        
        時間複雜度：O(n)
        空間複雜度：O(1) - 不計算輸出空間
        """
        duplicate = -1
        missing = -1
        
        # 找重複的數字
        for num in nums:
            index = abs(num) - 1
            if nums[index] < 0:
                # 如果已經是負數，說明這個數字之前出現過
                duplicate = abs(num)
            else:
                # 標記為負數
                nums[index] = -nums[index]
        
        # 找缺失的數字
        for i in range(len(nums)):
            if nums[i] > 0:
                # 正數說明 i+1 這個數字沒有出現過
                missing = i + 1
        
        return [duplicate, missing]

    # 方法4: 僅對遞增陣列有效 by yoyo1023
    def findErrorNums_v4(self, nums: List[int]) -> List[int]:
        """
        方法4: 僅對遞增陣列有效 by yoyo1023
        """
        result = [0] * 2
        for i in range(len(nums) - 1):
            if nums[i] == nums[i+1]:
                result[0] = nums[i]
                result[1] = nums[i] + 1
        return result

# 測試案例
if __name__ == "__main__":
    solution = Solution()
    
    # Test case 1
    nums1 = [1, 2, 2, 4]
    print(f"Input: {nums1}")
    print(f"Output: {solution.findErrorNums(nums1)}")  # Expected: [2, 3]
    
    # Test case 2
    nums2 = [1, 1]
    print(f"\nInput: {nums2}")
    print(f"Output: {solution.findErrorNums(nums2)}")  # Expected: [1, 2]
    
    # Test case 3
    nums3 = [3, 2, 3, 4, 6, 5]
    print(f"\nInput: {nums3}")
    print(f"Output: {solution.findErrorNums(nums3)}")  # Expected: [3, 1]
    
    # Test case 4
    nums4 = [2, 2]
    print(f"\nInput: {nums4}")
    print(f"Output: {solution.findErrorNums(nums4)}")  # Expected: [2, 1]