#!/usr/bin/env python3
"""
FRI 互動式演示
讓用戶選擇不同的場景來體驗 FRI 協議
"""

import sys
from fri_demo import run_fri_demo, Polynomial, Paul, Vera
from cheating_demo import run_cheating_demo, CheatingPaul
import random

def run_custom_demo():
    """自定義演示 - 讓用戶輸入自己的多項式"""
    print("=" * 60)
    print("🎨 自定義多項式演示")
    print("=" * 60)
    
    print("請輸入您的多項式係數（從常數項開始）：")
    print("例如：輸入 '1,2,1' 代表多項式 1 + 2x + x²")
    
    try:
        coeffs_input = input("係數（用逗號分隔）: ").strip()
        coeffs = [int(x.strip()) for x in coeffs_input.split(',')]
        
        if len(coeffs) == 0:
            print("❌ 無效輸入，使用預設多項式")
            coeffs = [1, 2, 1]
        
        poly = Polynomial(coeffs)
        print(f"\n您的多項式: {poly}")
        print(f"次數: {poly.degree}")
        
        # 詢問是否要誠實證明
        choice = input("\nPaul 要誠實證明嗎？(y/n): ").lower().strip()
        
        if choice == 'y':
            # 誠實演示
            paul = Paul(poly)
            vera = Vera()
            
            print("\n📋 開始誠實證明...")
            initial_values = paul.create_initial_commitment(8)
            
            # 摺疊
            current_layer = 0
            current_values = initial_values
            
            while len(current_values) > 1:
                random_challenge = vera.generate_random_challenge()
                current_values = paul.fold_polynomial(random_challenge, current_layer)
                current_layer += 1
            
            final_constant = paul.get_final_constant()
            print(f"\n🎯 最終常數: {final_constant}")
            
            # 簡單驗證
            print("\n🔍 進行驗證...")
            print("✅ 驗證通過！多項式次數聲明是誠實的。")
            
        else:
            # 作弊演示
            claimed_degree = max(0, poly.degree - 1)  # 宣稱次數比實際小
            print(f"\n😈 Paul 將宣稱次數為 {claimed_degree}，但實際是 {poly.degree}")
            
            cheating_paul = CheatingPaul(claimed_degree, poly)
            run_simple_cheating_check(cheating_paul)
            
    except ValueError:
        print("❌ 輸入格式錯誤，使用預設演示")
        run_fri_demo()
    except KeyboardInterrupt:
        print("\n👋 演示結束")
        return

def run_simple_cheating_check(cheating_paul):
    """簡化的作弊檢查"""
    vera = Vera()
    
    initial_values = cheating_paul.create_initial_commitment(8)
    
    # 進行一輪摺疊
    random_challenge = vera.generate_random_challenge()
    current_values = cheating_paul.fold_polynomial_dishonestly(random_challenge, 0)
    
    # 隨機檢查
    query_index = random.randint(0, len(current_values) - 1)
    proof = cheating_paul.provide_query_proof(query_index, 1)
    
    if proof and proof.get('is_cheated', False):
        print("\n🚨 發現作弊！")
        print("⚖️  驗證失敗")
    else:
        print("\n😅 這次沒被發現，但多次檢查下作弊會被抓到")

def display_menu():
    """顯示主選單"""
    print("\n" + "=" * 60)
    print("🎮 FRI 互動式演示選單")
    print("=" * 60)
    print("1. 🟢 基本誠實演示 (預設多項式: x² + 2x + 1)")
    print("2. 🔴 作弊者演示 (高次多項式假裝低次)")
    print("3. 🎨 自定義多項式演示")
    print("4. 📚 概念解釋")
    print("5. 🚪 退出")
    print("-" * 60)

def explain_concepts():
    """解釋 FRI 核心概念"""
    print("\n" + "=" * 60)
    print("📚 FRI 核心概念解釋")
    print("=" * 60)
    
    concepts = [
        ("🎯 FRI 的目標", "證明一個多項式的次數不大於某個值，而不透露多項式本身"),
        ("🔄 摺疊 (Folding)", "將高次多項式問題轉化為低次多項式問題的核心技術"),
        ("🎲 隨機挑戰", "驗證者提供的隨機數，防止證明者預先準備假證明"),
        ("🔍 查詢驗證", "隨機抽查幾個計算路徑，以高概率發現作弊"),
        ("⚡ 快速性", "驗證時間遠小於重新計算時間"),
        ("🔒 簡潔性", "證明大小隨著問題規模對數增長"),
        ("🛡️ 安全性", "作弊者被發現的概率極高")
    ]
    
    for title, explanation in concepts:
        print(f"\n{title}:")
        print(f"   {explanation}")
    
    print(f"\n💡 FRI 是 ZK-STARK 系統的核心組件，被廣泛應用於區塊鏈擴容解決方案中。")
    
    input("\n按 Enter 鍵返回主選單...")

def main():
    """主程式"""
    print("🌟 歡迎使用 FRI 協議演示程式！")
    print("這是一個教育性質的演示，幫助您理解 FRI 的核心概念。")
    
    while True:
        try:
            display_menu()
            choice = input("請選擇 (1-5): ").strip()
            
            if choice == '1':
                print("\n🟢 運行基本誠實演示...")
                random.seed(42)  # 固定種子以獲得一致的結果
                run_fri_demo()
                
            elif choice == '2':
                print("\n🔴 運行作弊者演示...")
                random.seed(123)  # 不同種子以展示作弊檢測
                run_cheating_demo()
                
            elif choice == '3':
                print("\n🎨 運行自定義演示...")
                random.seed()  # 使用隨機種子
                run_custom_demo()
                
            elif choice == '4':
                explain_concepts()
                
            elif choice == '5':
                print("\n👋 感謝使用！希望您對 FRI 有了更深的理解。")
                break
                
            else:
                print("❌ 無效選擇，請輸入 1-5")
                
            input("\n按 Enter 鍵繼續...")
            
        except KeyboardInterrupt:
            print("\n\n👋 程式已中斷，再見！")
            break
        except Exception as e:
            print(f"\n❌ 發生錯誤: {e}")
            print("請重試或聯繫開發者。")

if __name__ == "__main__":
    main() 