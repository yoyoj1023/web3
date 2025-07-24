#!/usr/bin/env python3
"""
FRI 作弊者演示
展示當 Paul 試圖作弊時如何被 Vera 發現

這個演示程式展示了：
- 當 Paul 宣稱他有次數為 2 的多項式，但實際上次數更高時
- Vera 如何通過隨機抽查發現不一致性
"""

import random
import hashlib
from typing import List, Dict
from fri_demo import Polynomial, Vera

class CheatingPaul:
    """作弊的證明者"""
    
    def __init__(self, claimed_degree: int, actual_polynomial: Polynomial):
        self.actual_polynomial = actual_polynomial
        self.claimed_degree = claimed_degree
        self.commitment_layers = {}
        
        print(f"😈 作弊 Paul 的真實多項式: {actual_polynomial}")
        print(f"🤥 但他宣告: 我的多項式次數不大於 {claimed_degree}")
        print(f"❗ 真實次數: {actual_polynomial.degree}")
    
    def create_initial_commitment(self, domain_size: int = 8) -> List[int]:
        """創建初始承諾 - 基於真實的（高次）多項式"""
        domain = list(range(domain_size))
        values = [self.actual_polynomial.evaluate(x) for x in domain]
        
        commitment_hash = hashlib.sha256(str(values).encode()).hexdigest()[:16]
        
        self.commitment_layers[0] = {
            'domain': domain,
            'values': values,
            'commitment': commitment_hash
        }
        
        print(f"\n🔒 作弊 Paul 創建 L0 層承諾:")
        print(f"   定義域: {domain}")
        print(f"   多項式值: {values}")
        print(f"   承諾哈希: {commitment_hash}")
        print(f"   ⚠️  注意：這些值來自次數為 {self.actual_polynomial.degree} 的多項式！")
        
        return values
    
    def fold_polynomial_dishonestly(self, random_challenge: int, layer: int) -> List[int]:
        """
        作弊的摺疊過程
        Paul 試圖操縱摺疊結果，讓它看起來像是來自低次多項式
        """
        current_layer = self.commitment_layers[layer]
        values = current_layer['values']
        
        print(f"\n🎲 第 {layer + 1} 輪摺疊，Vera 的隨機挑戰: r{layer + 1} = {random_challenge}")
        print("😈 Paul 試圖作弊...")
        
        # 正常的摺疊過程
        even_values = []
        odd_values = []
        new_domain = []
        
        for i in range(0, len(values), 2):
            if i + 1 < len(values):
                even_val = values[i]
                odd_val = values[i + 1]
                
                even_values.append(even_val)
                odd_values.append(odd_val)
                new_domain.append(i // 2)
        
        # 正確的摺疊
        correct_folded = [even_values[i] + random_challenge * odd_values[i] for i in range(len(even_values))]
        
        # Paul 試圖修改結果（作弊）
        # 他可能會試圖讓結果看起來更「合理」
        cheated_folded = correct_folded.copy()
        
        # 作弊策略：隨機修改一些值
        for i in range(len(cheated_folded)):
            if random.random() < 0.3:  # 30% 的機會修改值
                modification = random.randint(-5, 5)
                original_val = cheated_folded[i]
                cheated_folded[i] += modification
                print(f"   😈 作弊：將 index {i} 的值從 {original_val} 修改為 {cheated_folded[i]}")
        
        # 創建新層的承諾
        commitment_hash = hashlib.sha256(str(cheated_folded).encode()).hexdigest()[:16]
        
        self.commitment_layers[layer + 1] = {
            'domain': new_domain,
            'values': cheated_folded,
            'commitment': commitment_hash,
            'even_values': even_values,
            'odd_values': odd_values,
            'random_challenge': random_challenge,
            'original_correct_values': correct_folded  # 保存正確值用於對比
        }
        
        print(f"🔒 作弊 Paul 創建 L{layer + 1} 層承諾:")
        print(f"   新定義域: {new_domain}")
        print(f"   作弊後值: {cheated_folded}")
        print(f"   正確應為: {correct_folded}")
        print(f"   承諾哈希: {commitment_hash}")
        
        return cheated_folded
    
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
            original_even_idx = query_index * 2
            original_odd_idx = query_index * 2 + 1
            
            if (original_even_idx < len(self.commitment_layers[layer - 1]['values']) and
                original_odd_idx < len(self.commitment_layers[layer - 1]['values'])):
                
                proof['even_value'] = self.commitment_layers[layer - 1]['values'][original_even_idx]
                proof['odd_value'] = self.commitment_layers[layer - 1]['values'][original_odd_idx]
                proof['random_challenge'] = layer_data['random_challenge']
                
                # 額外信息：顯示 Paul 如何作弊
                correct_folded = proof['even_value'] + proof['random_challenge'] * proof['odd_value']
                proof['correct_value'] = correct_folded
                proof['is_cheated'] = (correct_folded != proof['value'])
        
        return proof
    
    def get_final_constant(self) -> int:
        """獲得最終的常數值"""
        last_layer = max(self.commitment_layers.keys())
        final_values = self.commitment_layers[last_layer]['values']
        return final_values[0] if final_values else 0

def run_cheating_demo():
    """運行作弊者演示"""
    print("=" * 70)
    print("🚨 歡迎來到「作弊者會被抓到」演示！")
    print("=" * 70)
    
    # 作弊場景：Paul 實際有一個次數為 3 的多項式，但宣稱次數為 2
    actual_poly = Polynomial([1, 2, 1, 1])  # 1 + 2x + x² + x³ (次數為3)
    cheating_paul = CheatingPaul(claimed_degree=2, actual_polynomial=actual_poly)
    vera = Vera()
    
    # 步驟 1: 作弊 Paul 創建承諾
    print("\n" + "="*50)
    print("📋 步驟 1: 承諾階段")
    print("="*50)
    initial_values = cheating_paul.create_initial_commitment(8)
    
    # 步驟 2: 摺疊階段（帶作弊）
    print("\n" + "="*50)
    print("🔄 步驟 2: 摺疊階段（帶作弊）")
    print("="*50)
    
    current_layer = 0
    current_values = initial_values
    
    # 進行摺疊（作弊版本）
    while len(current_values) > 1:
        random_challenge = vera.generate_random_challenge()
        current_values = cheating_paul.fold_polynomial_dishonestly(random_challenge, current_layer)
        current_layer += 1
    
    final_constant = cheating_paul.get_final_constant()
    print(f"\n🎯 最終常數: {final_constant}")
    
    # 步驟 3: 查詢和驗證階段（這裡會發現作弊）
    print("\n" + "="*50)
    print("🔍 步驟 3: 查詢驗證階段")
    print("="*50)
    
    # 進行多次查詢以提高發現作弊的機會
    num_queries = 5
    cheating_detected = False
    
    for query_num in range(num_queries):
        print(f"\n🎲 隨機查詢 #{query_num + 1}:")
        
        # 隨機選擇一層和一個索引
        layer_to_query = random.randint(1, current_layer)
        max_index = len(cheating_paul.commitment_layers[layer_to_query]['values']) - 1
        query_index = random.randint(0, max_index)
        
        print(f"   📍 查詢 L{layer_to_query} 層，索引 {query_index}")
        
        # Paul 提供證明
        proof = cheating_paul.provide_query_proof(query_index, layer_to_query)
        
        if proof and 'is_cheated' in proof:
            print(f"   📋 Paul 宣稱的值: {proof['value']}")
            print(f"   🧮 正確計算應為: {proof['correct_value']}")
            
            if proof['is_cheated']:
                print(f"   🚨 發現作弊！數值不一致！")
                print(f"   🔍 驗證: {proof['even_value']} + {proof['random_challenge']} * {proof['odd_value']} = {proof['correct_value']}")
                print(f"   ❌ 但 Paul 提供的是: {proof['value']}")
                cheating_detected = True
            else:
                # 驗證摺疊一致性
                is_consistent = vera.verify_folding_consistency(proof)
                if not is_consistent:
                    cheating_detected = True
    
    # 最終結果
    print("\n" + "="*50)
    print("🏁 最終結果")
    print("="*50)
    
    if cheating_detected:
        print("🚨 成功發現作弊！")
        print("⚖️  Vera 拒絕相信 Paul 的宣稱")
        print("💡 這證明了 FRI 協議能夠有效檢測作弊行為")
        print(f"📊 使用的隨機挑戰: {vera.random_challenges}")
        print(f"🔢 Paul 的虛假最終常數: {final_constant}")
        print("\n✅ FRI 協議的安全性得到驗證！")
    else:
        print("😕 這次沒有發現作弊...")
        print("💡 增加查詢次數可以提高發現作弊的機率")
        print("🎲 或者 Paul 這次運氣很好，但長期來看作弊會被發現")
    
    print("\n🎓 作弊者演示完成！")
    print("💡 這展示了為什麼 FRI 是一個強大的驗證協議")

if __name__ == "__main__":
    # 設置隨機種子
    random.seed(123)  # 使用不同的種子以獲得不同的作弊模式
    run_cheating_demo() 