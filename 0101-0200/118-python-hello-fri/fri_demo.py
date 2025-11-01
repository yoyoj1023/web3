#!/usr/bin/env python3
"""
FRI (Fast Reed-Solomon Interactive Oracle Proofs) 演示
實現「誠實多項式」遊戲

這個演示程式展示了 FRI 協議的核心概念：
- Paul (證明者) 宣稱他有一個次數不大於 2 的多項式
- Vera (驗證者) 通過摺疊和隨機抽查來驗證這個宣稱
"""

import random
import hashlib
from typing import List, Tuple, Dict

class Polynomial:
    """簡單的多項式類"""
    
    def __init__(self, coefficients: List[int]):
        """
        初始化多項式
        coefficients: [常數項, x的係數, x²的係數, ...]
        例如：[1, 2, 1] 代表 1 + 2x + x²
        """
        self.coefficients = coefficients
        self.degree = len(coefficients) - 1
    
    def evaluate(self, x: int) -> int:
        """計算多項式在 x 點的值"""
        result = 0
        for i, coeff in enumerate(self.coefficients):
            result += coeff * (x ** i)
        return result
    
    def __str__(self):
        terms = []
        for i, coeff in enumerate(self.coefficients):
            if coeff == 0:
                continue
            if i == 0:
                terms.append(str(coeff))
            elif i == 1:
                if coeff == 1:
                    terms.append("x")
                else:
                    terms.append(f"{coeff}x")
            else:
                if coeff == 1:
                    terms.append(f"x^{i}")
                else:
                    terms.append(f"{coeff}x^{i}")
        return " + ".join(terms) if terms else "0"

class Paul:
    """證明者 (Prover)"""
    
    def __init__(self, polynomial: Polynomial):
        self.secret_polynomial = polynomial
        self.commitment_layers = {}  # 存儲每一層的承諾
        print(f"🤐 Paul 心裡的秘密多項式: {polynomial}")
        print(f"📢 Paul 宣告: 我的多項式次數不大於 {polynomial.degree}")
    
    def create_initial_commitment(self, domain_size: int = 8) -> List[int]:
        """創建初始承諾 - 在指定域上計算多項式值"""
        domain = list(range(domain_size))
        values = [self.secret_polynomial.evaluate(x) for x in domain]
        
        # 簡化的承諾 - 實際上應該是梅克爾樹
        commitment_hash = hashlib.sha256(str(values).encode()).hexdigest()[:16]
        
        self.commitment_layers[0] = {
            'domain': domain,
            'values': values,
            'commitment': commitment_hash
        }
        
        print(f"\n🔒 Paul 創建 L0 層承諾:")
        print(f"   定義域: {domain}")
        print(f"   多項式值: {values}")
        print(f"   承諾哈希: {commitment_hash}")
        
        return values
    
    def fold_polynomial(self, random_challenge: int, layer: int) -> List[int]:
        """執行多項式摺疊"""
        current_layer = self.commitment_layers[layer]
        domain = current_layer['domain']
        values = current_layer['values']
        
        print(f"\n🎲 第 {layer + 1} 輪摺疊，Vera 的隨機挑戰: r{layer + 1} = {random_challenge}")
        
        # 將值分為偶數和奇數位置
        even_values = []
        odd_values = []
        new_domain = []
        
        for i in range(0, len(values), 2):
            if i + 1 < len(values):
                even_val = values[i]
                odd_val = values[i + 1]
                
                # 摺疊公式: folded = even + r * odd
                folded_val = even_val + random_challenge * odd_val
                
                even_values.append(even_val)
                odd_values.append(odd_val)
                new_domain.append(i // 2)
                
                print(f"   摺疊 index {i},{i+1}: {even_val} + {random_challenge} * {odd_val} = {folded_val}")
        
        # 計算新的摺疊值
        new_values = [even_values[i] + random_challenge * odd_values[i] for i in range(len(even_values))]
        
        # 創建新層的承諾
        commitment_hash = hashlib.sha256(str(new_values).encode()).hexdigest()[:16]
        
        self.commitment_layers[layer + 1] = {
            'domain': new_domain,
            'values': new_values,
            'commitment': commitment_hash,
            'even_values': even_values,
            'odd_values': odd_values,
            'random_challenge': random_challenge
        }
        
        print(f"🔒 Paul 創建 L{layer + 1} 層承諾:")
        print(f"   新定義域: {new_domain}")
        print(f"   摺疊後值: {new_values}")
        print(f"   承諾哈希: {commitment_hash}")
        
        return new_values
    
    def get_final_constant(self) -> int:
        """獲得最終的常數值"""
        last_layer = max(self.commitment_layers.keys())
        final_values = self.commitment_layers[last_layer]['values']
        return final_values[0] if final_values else 0
    
    def provide_query_proof(self, query_index: int, layer: int) -> Dict:
        """為特定查詢提供證明"""
        if layer not in self.commitment_layers:
            return None
        
        layer_data = self.commitment_layers[layer]
        
        if query_index >= len(layer_data['values']):
            return None
        
        proof = {
            'layer': layer,
            'index': query_index,
            'value': layer_data['values'][query_index]
        }
        
        # 如果不是第一層，還需要提供構成這個值的偶數和奇數部分
        if layer > 0:
            # 找到對應的前一層的索引
            original_even_idx = query_index * 2
            original_odd_idx = query_index * 2 + 1
            
            if (original_even_idx < len(self.commitment_layers[layer - 1]['values']) and
                original_odd_idx < len(self.commitment_layers[layer - 1]['values'])):
                
                proof['even_value'] = self.commitment_layers[layer - 1]['values'][original_even_idx]
                proof['odd_value'] = self.commitment_layers[layer - 1]['values'][original_odd_idx]
                proof['random_challenge'] = layer_data['random_challenge']
        
        return proof

class Vera:
    """驗證者 (Verifier)"""
    
    def __init__(self):
        self.random_challenges = []
        self.layer_commitments = []
    
    def generate_random_challenge(self) -> int:
        """生成隨機挑戰"""
        challenge = random.randint(1, 10)  # 為了演示使用小數字
        self.random_challenges.append(challenge)
        return challenge
    
    def verify_folding_consistency(self, proof: Dict) -> bool:
        """驗證摺疊的一致性"""
        if 'even_value' not in proof or 'odd_value' not in proof:
            return True  # 第一層沒有前置條件
        
        even_val = proof['even_value']
        odd_val = proof['odd_value']
        random_challenge = proof['random_challenge']
        expected_folded = even_val + random_challenge * odd_val
        actual_folded = proof['value']
        
        print(f"   🔍 驗證摺疊: {even_val} + {random_challenge} * {odd_val} = {expected_folded}")
        print(f"   📋 Paul 提供的值: {actual_folded}")
        
        is_consistent = (expected_folded == actual_folded)
        print(f"   ✅ 摺疊一致性: {'通過' if is_consistent else '失敗'}")
        
        return is_consistent

def run_fri_demo():
    """運行 FRI 演示"""
    print("=" * 60)
    print("🎮 歡迎來到「誠實多項式」遊戲！")
    print("=" * 60)
    
    # 步驟 1: Paul 準備他的秘密多項式
    secret_poly = Polynomial([1, 2, 1])  # 1 + 2x + x² (次數為2)
    paul = Paul(secret_poly)
    vera = Vera()
    
    # 步驟 2: Paul 創建初始承諾
    print("\n" + "="*40)
    print("📋 步驟 1: 承諾階段")
    print("="*40)
    initial_values = paul.create_initial_commitment(8)
    
    # 步驟 3: 摺疊階段
    print("\n" + "="*40)
    print("🔄 步驟 2: 摺疊階段")
    print("="*40)
    
    current_layer = 0
    current_values = initial_values
    
    # 進行摺疊直到剩下一個常數
    while len(current_values) > 1:
        random_challenge = vera.generate_random_challenge()
        current_values = paul.fold_polynomial(random_challenge, current_layer)
        current_layer += 1
    
    final_constant = paul.get_final_constant()
    print(f"\n🎯 最終常數: {final_constant}")
    
    # 步驟 4: 查詢和驗證階段
    print("\n" + "="*40)
    print("🔍 步驟 3: 查詢驗證階段")
    print("="*40)
    
    # 隨機選擇一些查詢點進行驗證
    num_queries = 2
    all_consistent = True
    
    for query_num in range(num_queries):
        print(f"\n🎲 隨機查詢 #{query_num + 1}:")
        
        # 隨機選擇一層和一個索引
        layer_to_query = random.randint(1, current_layer)
        max_index = len(paul.commitment_layers[layer_to_query]['values']) - 1
        query_index = random.randint(0, max_index)
        
        print(f"   📍 查詢 L{layer_to_query} 層，索引 {query_index}")
        
        # Paul 提供證明
        proof = paul.provide_query_proof(query_index, layer_to_query)
        
        if proof:
            # Vera 驗證
            is_consistent = vera.verify_folding_consistency(proof)
            all_consistent = all_consistent and is_consistent
        
    # 最終結果
    print("\n" + "="*40)
    print("🏁 最終結果")
    print("="*40)
    
    if all_consistent:
        print("✅ 所有隨機查詢都通過驗證！")
        print("🎉 Vera 相信 Paul 的多項式次數確實不大於 2")
        print(f"📊 使用的隨機挑戰: {vera.random_challenges}")
        print(f"🔢 最終常數: {final_constant}")
    else:
        print("❌ 發現不一致，Paul 可能在作弊！")
    
    print("\n🎓 FRI 協議核心概念演示完成！")
    print("💡 透過摺疊和隨機抽查，我們可以高效地驗證多項式的次數")

if __name__ == "__main__":
    # 設置隨機種子以便重現結果
    random.seed(42)
    run_fri_demo() 