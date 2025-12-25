from typing import List

class Solution:
    def shuffle(self, nums: List[int], n: int) -> List[int]:
        # 方法1: 使用列表推導式，交錯取前後半部的元素
        # return [nums[i // 2] if i % 2 == 0 else nums[n + i // 2] for i in range(2 * n)]
        
        # 方法2: 使用 zip 函數將前後半部配對，然後展開
        # result = []
        # for x, y in zip(nums[:n], nums[n:]):
        #     result.extend([x, y])
        # return result
        
        # 方法3: 更簡潔的 zip 方法
        # return [val for pair in zip(nums[:n], nums[n:]) for val in pair]
        
        # 方法4: 使用索引迴圈
        # result = []
        # for i in range(n):
        #     result.append(nums[i])      # xi
        #     result.append(nums[n + i])  # yi
        # return result

        # 方法5: 預先分配列表空間，使用索引賦值 (by yoyo1023)
        result = [0] * (2 * n)  # 先創建一個長度為 2n 的列表
        for i in range(n):
            result[i*2] = nums[i]          # 放入 x_i
            result[1 + i*2] = nums[n + i]  # 放入 y_i
        return result


# ===== 測試區域 =====
def test_example_1():
    """測試範例 1"""
    solution = Solution()
    nums = [2, 5, 1, 3, 4, 7]
    n = 3
    expected = [2, 3, 5, 4, 1, 7]
    result = solution.shuffle(nums, n)
    assert result == expected, f"預期 {expected}, 但得到 {result}"
    print(f"✓ 測試範例 1 通過: nums={nums}, n={n} -> {result}")


def test_example_2():
    """測試範例 2"""
    solution = Solution()
    nums = [1, 2, 3, 4, 4, 3, 2, 1]
    n = 4
    expected = [1, 4, 2, 3, 3, 2, 4, 1]
    result = solution.shuffle(nums, n)
    assert result == expected, f"預期 {expected}, 但得到 {result}"
    print(f"✓ 測試範例 2 通過: nums={nums}, n={n} -> {result}")


def test_example_3():
    """測試範例 3"""
    solution = Solution()
    nums = [1, 1, 2, 2]
    n = 2
    expected = [1, 2, 1, 2]
    result = solution.shuffle(nums, n)
    assert result == expected, f"預期 {expected}, 但得到 {result}"
    print(f"✓ 測試範例 3 通過: nums={nums}, n={n} -> {result}")


def test_single_pair():
    """測試單一配對 (n=1)"""
    solution = Solution()
    nums = [5, 10]
    n = 1
    expected = [5, 10]
    result = solution.shuffle(nums, n)
    assert result == expected, f"預期 {expected}, 但得到 {result}"
    print(f"✓ 測試單一配對通過: nums={nums}, n={n} -> {result}")


def test_large_n():
    """測試較大的 n"""
    solution = Solution()
    nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    n = 5
    expected = [1, 6, 2, 7, 3, 8, 4, 9, 5, 10]
    result = solution.shuffle(nums, n)
    assert result == expected, f"預期 {expected}, 但得到 {result}"
    print(f"✓ 測試較大的 n 通過: nums={nums}, n={n} -> {result}")


def test_same_values():
    """測試相同數值"""
    solution = Solution()
    nums = [3, 3, 3, 7, 7, 7]
    n = 3
    expected = [3, 7, 3, 7, 3, 7]
    result = solution.shuffle(nums, n)
    assert result == expected, f"預期 {expected}, 但得到 {result}"
    print(f"✓ 測試相同數值通過: nums={nums}, n={n} -> {result}")


def run_all_tests():
    """執行所有測試"""
    print("=" * 60)
    print("開始執行測試...")
    print("=" * 60)
    
    tests = [
        test_example_1,
        test_example_2,
        test_example_3,
        test_single_pair,
        test_large_n,
        test_same_values
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