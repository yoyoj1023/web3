from typing import List

# 找出陣列中最大連續 1 的數量
class Solution:
    def findMaxConsecutiveOnes(self, nums: List[int]) -> int:
        """
        方法1: 使用一個計數器記錄當前連續 1 的數量
        思路：
        1. 遍歷陣列，用一個計數器記錄當前連續 1 的數量
        2. 當遇到 1 時，計數器加 1
        3. 當遇到 0 時，更新最大值並重置計數器
        4. 返回最大值
        
        時間複雜度：O(n)
        空間複雜度：O(1)
        """
        max_count = 0  # 記錄最大連續 1 的數量
        current_count = 0  # 記錄當前連續 1 的數量
        
        for num in nums:
            if num == 1:
                current_count += 1
                max_count = max(max_count, current_count)
            else:
                current_count = 0
        
        return max_count
    
    def findMaxConsecutiveOnes2(self, nums: List[int]) -> int:
        """
        方法2: 使用 if 判斷來更新最大值 (by yoyo1023)
        思路：
        1. 使用計數器記錄當前連續 1 的數量
        2. 當遇到 1 時，計數器加 1，並判斷是否大於最大值
        3. 當遇到 0 時，重置計數器
        4. 返回最大值
        
        時間複雜度：O(n)
        空間複雜度：O(1)
        """
        counter = 0
        max_count = 0

        for i in range(len(nums)):
            if nums[i] == 1:
                counter += 1
                if counter > max_count:
                    max_count = counter
            if nums[i] == 0:
                counter = 0
        return max_count
    
    def findMaxConsecutiveOnes3(self, nums: List[int]) -> int:
        """
        方法3: 使用字串處理的方式
        思路：
        1. 將陣列轉換成字串
        2. 用 '0' 分割字串，得到所有連續 1 的子字串
        3. 找出最長的子字串長度
        
        時間複雜度：O(n)
        空間複雜度：O(n) - 需要額外空間存儲字串
        """
        # 將數字陣列轉換成字串，例如 [1,1,0,1,1,1] -> "110111"
        str_nums = ''.join(map(str, nums))
        # 用 '0' 分割，得到所有連續 1 的部分，例如 ["11", "111"]
        # 返回最長的長度
        return max(len(x) for x in str_nums.split('0')) if str_nums else 0


def main():
    solution = Solution()
    
    # 測試資料
    test_cases = [
        ([1, 1, 0, 1, 1, 1], 3, "測試案例 1"),
        ([1, 0, 1, 1, 0, 1], 2, "測試案例 2"),
        ([1, 1, 1, 1, 1], 5, "測試案例 3 (全部為 1)"),
        ([0, 0, 0, 0], 0, "測試案例 4 (全部為 0)"),
        ([1], 1, "測試案例 5 (單一元素)")
    ]
    
    methods = [
        (solution.findMaxConsecutiveOnes, "方法1: 計數器 + max()"),
        (solution.findMaxConsecutiveOnes2, "方法2: 計數器 + if 判斷"),
        (solution.findMaxConsecutiveOnes3, "方法3: 字串處理")
    ]
    
    for method_func, method_name in methods:
        print(f"{'='*50}")
        print(f"{method_name}")
        print(f"{'='*50}")
        
        for nums, expected, test_name in test_cases:
            result = method_func(nums)
            print(f"{test_name}:")
            print(f"  輸入: nums = {nums}")
            print(f"  輸出: {result}")
            print(f"  預期: {expected}")
            print(f"  結果: {'✓ 通過' if result == expected else '✗ 失敗'}")
            print()
        
        print()


if __name__ == "__main__":
    main()