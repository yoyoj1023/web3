from typing import List

class Solution:
    def getConcatenation(self, nums: List[int]) -> List[int]:
        # 方法1: 使用加法運算符
        return nums + nums
        
        # 方法2: 使用乘法運算符（也可以）
        # return nums * 2
        
        # 方法3: 使用列表推導式
        # return [nums[i % len(nums)] for i in range(2 * len(nums))]
        
        # 方法4: 使用 extend
        # ans = nums.copy()
        # ans.extend(nums)
        # return ans

        # 方法5: 暴力展開，迴圈放入新的陣列 (by yoyo1023)
        # newlength = len(nums)*2
        # ans = [None] * newlength
        # for i in range(newlength):
        #     ans[i] = nums[i % len(nums)]
        # return ans


# ===== 測試區域 =====
def test_example_1():
    """測試範例 1"""
    solution = Solution()
    nums = [1, 2, 1]
    expected = [1, 2, 1, 1, 2, 1]
    result = solution.getConcatenation(nums)
    assert result == expected, f"預期 {expected}, 但得到 {result}"
    print(f"✓ 測試範例 1 通過: nums={nums} -> {result}")


def test_example_2():
    """測試範例 2"""
    solution = Solution()
    nums = [1, 3, 2, 1]
    expected = [1, 3, 2, 1, 1, 3, 2, 1]
    result = solution.getConcatenation(nums)
    assert result == expected, f"預期 {expected}, 但得到 {result}"
    print(f"✓ 測試範例 2 通過: nums={nums} -> {result}")


def test_single_element():
    """測試單一元素"""
    solution = Solution()
    nums = [5]
    expected = [5, 5]
    result = solution.getConcatenation(nums)
    assert result == expected, f"預期 {expected}, 但得到 {result}"
    print(f"✓ 測試單一元素通過: nums={nums} -> {result}")


def test_two_elements():
    """測試兩個元素"""
    solution = Solution()
    nums = [1, 2]
    expected = [1, 2, 1, 2]
    result = solution.getConcatenation(nums)
    assert result == expected, f"預期 {expected}, 但得到 {result}"
    print(f"✓ 測試兩個元素通過: nums={nums} -> {result}")


def test_large_numbers():
    """測試大數值"""
    solution = Solution()
    nums = [1000, 999, 1]
    expected = [1000, 999, 1, 1000, 999, 1]
    result = solution.getConcatenation(nums)
    assert result == expected, f"預期 {expected}, 但得到 {result}"
    print(f"✓ 測試大數值通過: nums={nums} -> {result}")


def test_all_same():
    """測試所有元素相同"""
    solution = Solution()
    nums = [7, 7, 7]
    expected = [7, 7, 7, 7, 7, 7]
    result = solution.getConcatenation(nums)
    assert result == expected, f"預期 {expected}, 但得到 {result}"
    print(f"✓ 測試所有元素相同通過: nums={nums} -> {result}")


def run_all_tests():
    """執行所有測試"""
    print("=" * 60)
    print("開始執行測試...")
    print("=" * 60)
    
    tests = [
        test_example_1,
        test_example_2,
        test_single_element,
        test_two_elements,
        test_large_numbers,
        test_all_same
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"✗ {test.__name__} 失敗: {e}")
            failed += 1
        except Exception as e:
            print(f"✗ {test.__name__} 發生錯誤: {e}")
            failed += 1
    
    print("=" * 60)
    print(f"測試結果: {passed} 通過, {failed} 失敗")
    print("=" * 60)
    
    if failed == 0:
        print("🎉 所有測試通過！")
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)