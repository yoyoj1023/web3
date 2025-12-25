from typing import List

class Solution:
    def buildArray(self, target: List[int], n: int) -> List[str]:
        """
        方法1: 線性掃描法 (by yoyo1023)
        時間複雜度: O(max(target))，最多遍歷到 target 的最大值
        空間複雜度: O(1)，不計算輸出結果的空間
        
        思路：
        - 從 1 開始遍歷數字流
        - 遇到每個數字都先 Push
        - 如果是 target 中的下一個數字就保留，否則 Pop
        """
        operations = []
        target_index = 0  # 追蹤 target 中的當前位置
        
        # 遍歷從 1 到 n 的數字流
        for num in range(1, n + 1):
            # 如果已經構建完 target，直接返回
            if target_index == len(target):
                break
            
            # 對每個數字都先 Push
            operations.append("Push")
            
            # 如果當前數字是 target 中的下一個數字
            if num == target[target_index]:
                # 保留它，移動到 target 的下一個位置
                target_index += 1
            else:
                # 如果不是，Pop 掉它
                operations.append("Pop")
        
        return operations
    
    def buildArray2(self, target: List[int], n: int) -> List[str]:
        """
        方法2: 使用集合優化查找
        時間複雜度: O(max(target))，遍歷到 target 的最大值
        空間複雜度: O(len(target))，需要額外的集合空間
        
        思路：
        - 將 target 轉換為集合，提供 O(1) 的查找時間
        - 遍歷 1 到 target 最大值
        - 判斷當前數字是否在集合中
        """
        operations = []
        target_set = set(target)
        
        # 只需要遍歷到 target 的最大值
        for num in range(1, target[-1] + 1):
            operations.append("Push")
            # 如果當前數字不在 target 中，需要 Pop
            if num not in target_set:
                operations.append("Pop")
        
        return operations
    
    def buildArray3(self, target: List[int], n: int) -> List[str]:
        """
        方法3: 直接遍歷 target 數組
        時間複雜度: O(max(target))，需要處理所有從 1 到 max(target) 的數字
        空間複雜度: O(1)，不計算輸出結果的空間
        
        思路：
        - 使用一個指針 current 記錄當前處理的數字
        - 遍歷 target 中的每個元素
        - 對於 current 到 target 元素之間的數字，都需要 Push 和 Pop
        """
        operations = []
        current = 1  # 當前數字流的位置
        
        for target_num in target:
            # 處理 current 到 target_num 之間的所有數字
            while current < target_num:
                operations.append("Push")
                operations.append("Pop")
                current += 1
            
            # 到達 target 中的數字，只需要 Push
            operations.append("Push")
            current += 1
        
        return operations
    
    def buildArray4(self, target: List[int], n: int) -> List[str]:
        """
        方法4: 計算間隔差值法
        時間複雜度: O(len(target))，只遍歷 target 數組一次
        空間複雜度: O(1)，不計算輸出結果的空間
        
        思路：
        - 計算 target 中相鄰元素之間的間隔
        - 間隔-1 就是需要 Push+Pop 的次數
        - 這是最優化的方法，只遍歷 target 一次
        """
        operations = []
        prev = 0  # 前一個數字（初始為 0）
        
        for num in target:
            # num 和 prev 之間有 (num - prev - 1) 個數字需要 Push+Pop
            gap = num - prev - 1
            for _ in range(gap):
                operations.append("Push")
                operations.append("Pop")
            
            # 當前 target 數字只需要 Push
            operations.append("Push")
            prev = num
        
        return operations
    
    def buildArray5(self, target: List[int], n: int) -> List[str]:
        """
        方法5: 列表推導式優化版
        時間複雜度: O(len(target))，只遍歷 target 數組一次
        空間複雜度: O(1)，不計算輸出結果的空間
        
        思路：
        - 與方法4類似，但使用列表推導式和 extend 來優化代碼
        - 更加簡潔和 Pythonic
        """
        operations = []
        prev = 0
        
        for num in target:
            # 對於中間跳過的數字，添加 ["Push", "Pop"]
            operations.extend(["Push", "Pop"] * (num - prev - 1))
            # 對於 target 中的數字，添加 "Push"
            operations.append("Push")
            prev = num
        
        return operations


"""
========================================
所有方法的時間與空間複雜度總結
========================================

設：
- len(target) = m（target 數組的長度）
- max(target) = k（target 中的最大值）
- n = 給定的整數上限

方法1: 線性掃描法
├─ 時間複雜度: O(k)
│  └─ 最多遍歷到 target 的最大值
├─ 空間複雜度: O(1)
│  └─ 只使用常數額外空間
└─ 優點: 實現簡單，邏輯清晰
   缺點: 需要遍歷到 k，即使 target 很稀疏

方法2: 使用集合優化查找
├─ 時間複雜度: O(m + k)
│  ├─ O(m) 用於建立集合
│  └─ O(k) 用於遍歷到最大值
├─ 空間複雜度: O(m)
│  └─ 需要額外的集合空間存儲 target
└─ 優點: 查找速度快 O(1)
   缺點: 需要額外空間，實際上不比方法1快

方法3: 直接遍歷 target 數組
├─ 時間複雜度: O(k)
│  └─ 需要處理從 1 到 k 的所有數字
├─ 空間複雜度: O(1)
│  └─ 只使用常數額外空間
└─ 優點: 邏輯清晰，易於理解
   缺點: 與方法1類似，需要遍歷到 k

方法4: 計算間隔差值法 ⭐ 最優解
├─ 時間複雜度: O(m)
│  └─ 只需要遍歷 target 數組一次
├─ 空間複雜度: O(1)
│  └─ 只使用常數額外空間
└─ 優點: 時間複雜度最優，只與 target 長度相關
   缺點: 無

方法5: 列表推導式優化版 ⭐ 最優解（代碼最簡潔）
├─ 時間複雜度: O(m)
│  └─ 只需要遍歷 target 數組一次
├─ 空間複雜度: O(1)
│  └─ 只使用常數額外空間
└─ 優點: 代碼簡潔，Pythonic，時間複雜度最優
   缺點: 無

========================================
推薦方案
========================================
✅ 最優解: 方法4 和 方法5
   - 時間複雜度最優 O(m)，只與 target 長度相關
   - 不受 n 和 max(target) 的影響
   - 空間複雜度 O(1)
   - 方法5 代碼更簡潔

✅ 易讀解: 方法1 和 方法3
   - 邏輯最直觀，容易理解
   - 適合面試時先想到的解法
   - 可以作為基礎解法，再優化到方法4/5

注意事項：
1. 所有複雜度分析都不包含輸出結果所需的空間
2. 輸出結果的長度最多為 O(k)（最壞情況是交替 Push 和 Pop）
3. 由於 target 是嚴格遞增的，我們可以利用這個性質進行優化
4. 方法4 和方法5 是最優解，因為它們只遍歷 target 一次
"""