# 模組四：簽署與驗證流程

## 📚 學習目標

完成本模組後，您將能夠：
- ✅ 完整理解 ECDSA 的簽署流程和每個步驟的作用
- ✅ 掌握 ECDSA 的驗證流程和數學原理
- ✅ 理解簽署和驗證之間的數學關聯
- ✅ 識別流程中的關鍵安全點
- ✅ 能夠追蹤完整的簽章生成和驗證過程

**預計學習時間：** 4-5 小時

---

## 1. ECDSA 流程概覽

### 1.1 整體架構

ECDSA 由三個主要階段組成：

```
階段 1：設置（Setup）
├─ 選擇橢圓曲線參數
├─ 生成金鑰對
└─ 公開分發公鑰

階段 2：簽署（Signing）
├─ 計算訊息雜湊
├─ 生成隨機數 k
├─ 計算簽章 (r, s)
└─ 輸出簽章

階段 3：驗證（Verification）
├─ 計算訊息雜湊
├─ 計算驗證點
├─ 檢查簽章有效性
└─ 輸出結果（有效/無效）
```

### 1.2 參與者和資訊流

```
Alice（簽署者）                    Bob（驗證者）
═════════════                      ═══════════

私鑰 d                             
公鑰 Q = d × G  ──────────────→   公鑰 Q

訊息 m                             訊息 m
      ↓                                 ↓
簽署流程                           
      ↓
簽章 (r, s)     ──────────────→   簽章 (r, s)
                                        ↓
                                   驗證流程
                                        ↓
                                   ✓ 有效 / ✗ 無效
```

### 1.3 安全性保證

ECDSA 確保：
```
✓ 只有擁有私鑰 d 的人能生成有效簽章
✓ 任何人都可以用公鑰 Q 驗證簽章
✓ 簽章與特定訊息綁定（無法轉移到其他訊息）
✓ 無法從簽章和公鑰反推出私鑰
✓ 無法偽造簽章（在計算上不可行）
```

---

## 2. 階段 1：系統設置

### 2.1 域參數選擇

在開始簽署和驗證之前，必須選擇標準的橢圓曲線參數：

```
域參數 = (p, a, b, G, n, h)

p: 有限體的質數模數
   定義了有限體 𝔽p

a, b: 橢圓曲線方程式的係數
      y² ≡ x³ + ax + b (mod p)

G: 基準點（Generator Point）
   橢圓曲線上的一個點 G = (xG, yG)

n: 基準點 G 的階數
   滿足 n × G = 𝒪（無窮遠點）
   n 是一個大質數

h: 餘因子（Cofactor）
   h = #E(𝔽p) / n
   對於安全的曲線，通常 h = 1
```

### 2.2 標準參數範例

#### secp256k1（Bitcoin 使用）

```python
# secp256k1 參數
p = 2**256 - 2**32 - 977
  = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F

a = 0
b = 7

# 曲線方程式
y² ≡ x³ + 7 (mod p)

# 基準點 G
G = (
    0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798,
    0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8
)

# 階數
n = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141

# 餘因子
h = 1
```

#### P-256（NIST P-256）

```python
# P-256 參數
p = 2**256 - 2**224 + 2**192 + 2**96 - 1
  = 0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF

a = p - 3
  = 0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC

b = 0x5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B

# 基準點 G
G = (
    0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296,
    0x4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5
)

# 階數
n = 0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551

# 餘因子
h = 1
```

### 2.3 金鑰對生成

**私鑰生成：**
```python
def generate_private_key(n):
    """
    生成私鑰
    
    參數：
        n: 曲線的階數
        
    返回：
        d: 私鑰（整數）
    """
    # 使用密碼學安全的隨機數生成器
    import secrets
    
    # 生成範圍 [1, n-1] 的隨機整數
    d = secrets.randbelow(n - 1) + 1
    
    return d

# 錯誤示範（不安全）：
# import random
# d = random.randint(1, n-1)  # ✗ 不要使用！偽隨機數不安全
```

**公鑰生成：**
```python
def generate_public_key(d, G, curve):
    """
    從私鑰生成公鑰
    
    參數：
        d: 私鑰（整數）
        G: 基準點（橢圓曲線上的點）
        curve: 橢圓曲線參數
        
    返回：
        Q: 公鑰（橢圓曲線上的點）
    """
    # Q = d × G（標量乘法）
    Q = scalar_multiply(d, G, curve)
    
    return Q

# 範例
d = 12345  # 私鑰（實際應該是大隨機數）
Q = generate_public_key(d, G, curve)
# Q 是橢圓曲線上的一個點 (xQ, yQ)
```

**金鑰對結構：**
```
金鑰對 = (d, Q)

私鑰 d:
- 類型：整數
- 範圍：1 ≤ d ≤ n-1
- 大小：256 bits（對於 secp256k1）
- 編碼：32 bytes
- 保密性：絕對保密

公鑰 Q:
- 類型：橢圓曲線上的點 (x, y)
- 未壓縮格式：04 || x || y（65 bytes）
- 壓縮格式：02/03 || x（33 bytes）
- 公開性：可以公開
```

---

## 3. 階段 2：簽署流程

### 3.1 簽署流程總覽

```
輸入：
- 訊息 m
- 私鑰 d
- 域參數 (p, a, b, G, n)

輸出：
- 簽章 (r, s)

步驟：
1. 計算訊息雜湊：z = Hash(m)
2. 選擇隨機數：k ∈ [1, n-1]
3. 計算曲線點：(x₁, y₁) = k × G
4. 計算 r：r = x₁ mod n
5. 計算 s：s = k⁻¹(z + rd) mod n
6. 如果 r = 0 或 s = 0，回到步驟 2
7. 輸出簽章 (r, s)
```

### 3.2 步驟詳解

#### 步驟 1：計算訊息雜湊

**目的：**
- 將任意長度的訊息轉換為固定長度的雜湊值
- 確保完整性（訊息的任何修改都會改變雜湊值）

**實現：**
```python
def hash_message(message, hash_function='sha256'):
    """
    計算訊息的雜湊值
    
    參數：
        message: 原始訊息（bytes 或 string）
        hash_function: 雜湊函數名稱
        
    返回：
        z: 雜湊值（整數）
    """
    import hashlib
    
    # 確保訊息是 bytes
    if isinstance(message, str):
        message = message.encode('utf-8')
    
    # 計算雜湊
    if hash_function == 'sha256':
        h = hashlib.sha256(message).digest()
    elif hash_function == 'sha3_256':
        h = hashlib.sha3_256(message).digest()
    else:
        raise ValueError(f"不支援的雜湊函數: {hash_function}")
    
    # 轉換為整數
    z = int.from_bytes(h, byteorder='big')
    
    return z

# 範例
message = "Transfer 10 BTC to Alice"
z = hash_message(message)
# z 是一個 256 位元的整數
```

**雜湊函數選擇：**
```
Bitcoin/Ethereum（secp256k1）：
- Bitcoin: SHA-256
- Ethereum: Keccak-256

NIST 曲線：
- P-256: SHA-256
- P-384: SHA-384
- P-521: SHA-512

要求：
✓ 抗碰撞性（Collision Resistance）
✓ 抗原像攻擊（Preimage Resistance）
✓ 抗第二原像攻擊（Second Preimage Resistance）
```

**雜湊值截斷（如果需要）：**
```python
def truncate_hash(z, n):
    """
    如果雜湊值的位元長度大於 n 的位元長度，
    則截斷雜湊值
    
    參數：
        z: 雜湊值
        n: 曲線的階數
        
    返回：
        z': 截斷後的雜湊值
    """
    z_bits = z.bit_length()
    n_bits = n.bit_length()
    
    if z_bits > n_bits:
        # 保留最左邊的 n_bits 位元
        z = z >> (z_bits - n_bits)
    
    return z
```

#### 步驟 2：選擇隨機數 k

**重要性：** 這是 ECDSA 中**最關鍵**的步驟！

**要求：**
```
1. k 必須是真隨機數（不是偽隨機）
2. k 的範圍：1 ≤ k ≤ n-1
3. k 必須對每個簽名都不同
4. k 必須保密（絕不能洩露）
5. k 在簽名後應立即銷毀
```

**方法 1：真隨機數生成**
```python
def generate_random_k(n):
    """
    生成隨機數 k（傳統方法）
    
    風險：依賴系統的隨機數生成器質量
    """
    import secrets
    
    # 使用密碼學安全的隨機數生成器
    k = secrets.randbelow(n - 1) + 1
    
    return k
```

**方法 2：RFC 6979 確定性簽名**
```python
def generate_deterministic_k(message_hash, private_key, n):
    """
    使用 RFC 6979 生成確定性的 k
    
    優點：
    - 不需要隨機數生成器
    - 相同輸入產生相同 k（但對外看起來隨機）
    - 避免 k 重複使用問題
    
    方法：
    k = HMAC_DRBG(私鑰 || 訊息雜湊)
    """
    import hmac
    import hashlib
    
    # 實現 HMAC-DRBG（簡化版本）
    # 完整實現請參考 RFC 6979
    
    # 將私鑰和雜湊轉換為 bytes
    h1 = message_hash.to_bytes(32, byteorder='big')
    x = private_key.to_bytes(32, byteorder='big')
    
    # 初始化
    v = b'\x01' * 32
    k_hmac = b'\x00' * 32
    
    # HMAC-DRBG 更新
    k_hmac = hmac.new(k_hmac, v + b'\x00' + x + h1, hashlib.sha256).digest()
    v = hmac.new(k_hmac, v, hashlib.sha256).digest()
    k_hmac = hmac.new(k_hmac, v + b'\x01' + x + h1, hashlib.sha256).digest()
    v = hmac.new(k_hmac, v, hashlib.sha256).digest()
    
    # 生成 k
    while True:
        v = hmac.new(k_hmac, v, hashlib.sha256).digest()
        k = int.from_bytes(v, byteorder='big')
        
        if 1 <= k < n:
            return k
        
        # 如果不在範圍內，繼續生成
        k_hmac = hmac.new(k_hmac, v + b'\x00', hashlib.sha256).digest()
        v = hmac.new(k_hmac, v, hashlib.sha256).digest()

# 推薦使用 RFC 6979
```

**為什麼 k 如此重要？**
```
如果 k 重複使用：
簽章 1：s₁ = k⁻¹(z₁ + r·d) mod n
簽章 2：s₂ = k⁻¹(z₂ + r·d) mod n

攻擊者可以：
k = (z₁ - z₂) / (s₁ - s₂) mod n
d = (s₁·k - z₁) / r mod n

→ 私鑰完全洩露！
```

#### 步驟 3：計算曲線點 (x₁, y₁) = k × G

**目的：**
生成一個臨時的橢圓曲線點，用於創建簽章的第一部分 r。

**實現：**
```python
def compute_signature_point(k, G, curve):
    """
    計算簽章點
    
    參數：
        k: 隨機數
        G: 基準點
        curve: 橢圓曲線參數
        
    返回：
        (x₁, y₁): 曲線上的點
    """
    # 標量乘法：k × G
    point = scalar_multiply(k, G, curve)
    
    x1, y1 = point
    return x1, y1

# 這裡使用與公鑰生成相同的點乘法運算
# k × G 和 d × G 使用相同的算法
```

**點乘法演算法（雙倍加法）：**
```python
def scalar_multiply(k, P, curve):
    """
    標量乘法：計算 k × P
    
    使用雙倍加法（Double-and-Add）算法
    複雜度：O(log k)
    """
    if k == 0:
        return POINT_AT_INFINITY
    
    if k == 1:
        return P
    
    # 將 k 轉換為二進制
    binary = bin(k)[2:]  # 移除 '0b' 前綴
    
    # 初始化結果為無窮遠點
    result = POINT_AT_INFINITY
    
    # 從最高位開始
    for bit in binary:
        # 加倍
        result = point_double(result, curve)
        
        # 如果位元是 1，加上 P
        if bit == '1':
            result = point_add(result, P, curve)
    
    return result

# 範例：計算 13 × G
# 13 = 1101₂ = 8 + 4 + 1
# 
# 步驟：
# bit '1': result = G
# bit '1': result = 2G + G = 3G
# bit '0': result = 6G
# bit '1': result = 12G + G = 13G
```

#### 步驟 4：計算 r = x₁ mod n

**目的：**
從簽章點提取 x 座標作為簽章的第一部分。

**實現：**
```python
def compute_r(x1, n):
    """
    計算簽章的 r 值
    
    參數：
        x1: 簽章點的 x 座標
        n: 曲線的階數
        
    返回：
        r: 簽章的第一部分
    """
    r = x1 % n
    
    # 檢查 r 是否為 0
    if r == 0:
        # 這種情況極其罕見（概率 ≈ 1/n）
        # 需要重新選擇 k
        raise ValueError("r = 0，需要重新選擇 k")
    
    return r
```

**為什麼使用 x₁ mod n？**
```
1. x₁ 是在 𝔽p 中的值（範圍 [0, p-1]）
2. 簽章運算在模 n 下進行
3. 通常 p ≈ n，所以這個運算通常不改變值
4. 使用 x₁（而不是 y₁）是慣例

對於 secp256k1：
p = 2²⁵⁶ - 2³² - 977
n = 2²⁵⁶ - 432420386565659656852420866394968145599

x₁ 通常小於 n，所以 r ≈ x₁
```

#### 步驟 5：計算 s = k⁻¹(z + rd) mod n

**目的：**
創建簽章的第二部分，將訊息雜湊和私鑰結合起來。

**數學意義：**
```
s = k⁻¹(z + rd) mod n

展開：
k·s ≡ z + r·d (mod n)

這個等式包含：
- z: 訊息雜湊（公開）
- r: 簽章的第一部分（公開）
- s: 簽章的第二部分（將要公開）
- d: 私鑰（保密）
- k: 隨機數（保密）

因為 k 是隨機的，s 看起來也是隨機的
但驗證者可以用公鑰 Q = d×G 來驗證這個關係
```

**實現：**
```python
def compute_s(k, z, r, d, n):
    """
    計算簽章的 s 值
    
    參數：
        k: 隨機數
        z: 訊息雜湊
        r: 簽章的第一部分
        d: 私鑰
        n: 曲線的階數
        
    返回：
        s: 簽章的第二部分
    """
    # 計算 k 的模反元素
    k_inv = mod_inverse(k, n)
    
    # 計算 s = k⁻¹(z + r·d) mod n
    s = (k_inv * (z + r * d)) % n
    
    # 檢查 s 是否為 0
    if s == 0:
        # 這種情況極其罕見
        # 需要重新選擇 k
        raise ValueError("s = 0，需要重新選擇 k")
    
    return s

def mod_inverse(a, m):
    """
    計算 a 在模 m 下的反元素
    使用擴展歐幾里得算法
    
    返回：a⁻¹ mod m
    """
    def extended_gcd(a, b):
        if a == 0:
            return b, 0, 1
        gcd, x1, y1 = extended_gcd(b % a, a)
        x = y1 - (b // a) * x1
        y = x1
        return gcd, x, y
    
    gcd, x, _ = extended_gcd(a % m, m)
    
    if gcd != 1:
        raise ValueError("模反元素不存在")
    
    return (x % m + m) % m

# 範例
k = 12345
z = 0xabcdef...
r = 0x123456...
d = 0x789abc...  # 私鑰
n = 0xffffff...

s = compute_s(k, z, r, d, n)
```

**為什麼需要模反元素？**
```
我們要計算：s = k⁻¹(z + rd) mod n

這需要計算 k⁻¹ mod n，即找到一個數 k_inv 使得：
k · k_inv ≡ 1 (mod n)

因為 n 是質數，根據費馬小定理：
k⁻¹ ≡ k^(n-2) (mod n)

但擴展歐幾里得算法更高效：
複雜度 O(log n)
```

#### 步驟 6：檢查和重試

**檢查條件：**
```python
if r == 0 or s == 0:
    # 重新選擇 k 並重新計算
    # 這種情況極其罕見（概率 ≈ 2/n ≈ 2/2²⁵⁶）
    goto step_2
```

**為什麼需要檢查？**
```
r = 0 或 s = 0 會導致無效的簽章：
- r = 0：驗證時會除以 0
- s = 0：驗證時會除以 0

雖然極其罕見，但必須處理
```

#### 步驟 7：輸出簽章

**簽章格式：**
```
簽章 = (r, s)

其中：
- r, s 都是整數
- 1 ≤ r < n
- 1 ≤ s < n

編碼：
- 每個值 32 bytes（對於 256 位元曲線）
- 總大小：64 bytes（原始格式）
- DER 編碼：約 70-72 bytes
```

**簽章規範化（可選）：**
```python
def normalize_signature(r, s, n):
    """
    規範化簽章（低 s 值）
    
    Bitcoin 要求 s ≤ n/2（BIP 62）
    這可以防止交易延展性攻擊
    """
    if s > n // 2:
        s = n - s
    
    return r, s
```

### 3.3 完整簽署實現

```python
def ecdsa_sign(message, private_key, curve_params):
    """
    ECDSA 簽署算法完整實現
    
    參數：
        message: 要簽署的訊息
        private_key: 私鑰 d
        curve_params: 橢圓曲線參數 (p, a, b, G, n)
        
    返回：
        (r, s): 簽章
    """
    p, a, b, G, n = curve_params
    d = private_key
    
    # 步驟 1：計算訊息雜湊
    z = hash_message(message)
    z = truncate_hash(z, n)  # 如果需要
    
    # 重試循環（處理 r=0 或 s=0 的情況）
    while True:
        # 步驟 2：生成隨機數 k
        # 使用 RFC 6979（推薦）或真隨機數
        k = generate_deterministic_k(z, d, n)
        
        # 步驟 3：計算簽章點
        x1, y1 = compute_signature_point(k, G, (p, a, b))
        
        # 步驟 4：計算 r
        r = x1 % n
        
        if r == 0:
            continue  # 重新選擇 k
        
        # 步驟 5：計算 s
        k_inv = mod_inverse(k, n)
        s = (k_inv * (z + r * d)) % n
        
        if s == 0:
            continue  # 重新選擇 k
        
        # 可選：規範化簽章
        if s > n // 2:
            s = n - s
        
        # 步驟 7：返回簽章
        return (r, s)
    
    # 注意：銷毀 k（實際實現中需要安全清除記憶體）

# 使用範例
message = "Transfer 10 BTC to Alice"
private_key = 0x123456789abcdef...
curve_params = (p, a, b, G, n)  # secp256k1 或其他

signature = ecdsa_sign(message, private_key, curve_params)
print(f"簽章: r={hex(signature[0])}, s={hex(signature[1])}")
```

### 3.4 簽署流程圖

```
開始
  ↓
[輸入訊息 m 和私鑰 d]
  ↓
計算雜湊：z = Hash(m)
  ↓
生成隨機數 k ∈ [1, n-1]
  ↓
計算點：(x₁, y₁) = k × G
  ↓
計算 r = x₁ mod n
  ↓
r == 0? ─Yes→ [重新生成 k]
  ↓ No                ↓
計算 k⁻¹ mod n    ←──┘
  ↓
計算 s = k⁻¹(z + r·d) mod n
  ↓
s == 0? ─Yes→ [重新生成 k]
  ↓ No
輸出簽章 (r, s)
  ↓
銷毀 k
  ↓
結束
```

---

## 4. 階段 3：驗證流程

### 4.1 驗證流程總覽

```
輸入：
- 訊息 m
- 簽章 (r, s)
- 公鑰 Q
- 域參數 (p, a, b, G, n)

輸出：
- True（簽章有效）或 False（簽章無效）

步驟：
1. 驗證 r, s ∈ [1, n-1]
2. 計算訊息雜湊：z = Hash(m)
3. 計算 s 的反元素：w = s⁻¹ mod n
4. 計算：u₁ = z·w mod n
5. 計算：u₂ = r·w mod n
6. 計算點：(x₁, y₁) = u₁×G + u₂×Q
7. 驗證：r ≡ x₁ mod n
```

### 4.2 步驟詳解

#### 步驟 1：驗證簽章格式

**目的：**
確保簽章的值在有效範圍內。

**實現：**
```python
def validate_signature_format(r, s, n):
    """
    驗證簽章格式
    
    參數：
        r, s: 簽章的兩個部分
        n: 曲線的階數
        
    返回：
        True 如果格式有效，否則 False
    """
    # 檢查 r 和 s 是否是整數
    if not isinstance(r, int) or not isinstance(s, int):
        return False
    
    # 檢查 r 和 s 是否在有效範圍內
    if not (1 <= r < n):
        return False
    
    if not (1 <= s < n):
        return False
    
    return True

# 如果格式無效，直接拒絕
if not validate_signature_format(r, s, n):
    return False  # 簽章無效
```

**為什麼需要這個檢查？**
```
防止以下攻擊：
- r = 0 或 s = 0：會導致除以零錯誤
- r ≥ n 或 s ≥ n：不符合規範
- 負數值：不符合規範
- 非整數值：格式錯誤
```

#### 步驟 2：計算訊息雜湊

**實現：**
```python
# 使用與簽署時相同的雜湊函數
z = hash_message(message)
z = truncate_hash(z, n)  # 如果需要

# ⚠️ 重要：必須使用與簽署時完全相同的雜湊函數和訊息
```

**常見錯誤：**
```
✗ 使用不同的雜湊函數
✗ 訊息格式不一致（編碼問題）
✗ 訊息被修改（即使是一個字節）

正確做法：
✓ 使用標準的雜湊函數
✓ 統一的訊息編碼（UTF-8）
✓ 確保訊息完整性
```

#### 步驟 3：計算 w = s⁻¹ mod n

**目的：**
計算 s 的模反元素，用於後續驗證計算。

**實現：**
```python
def compute_w(s, n):
    """
    計算 w = s⁻¹ mod n
    
    參數：
        s: 簽章的第二部分
        n: 曲線的階數
        
    返回：
        w: s 的模反元素
    """
    w = mod_inverse(s, n)
    return w

# 範例
s = 0x123456...
n = 0xffffff...
w = compute_w(s, n)

# 驗證：s · w ≡ 1 (mod n)
assert (s * w) % n == 1
```

**數學意義：**
```
在簽署時我們有：
s = k⁻¹(z + r·d) mod n

兩邊乘以 k：
k·s = z + r·d mod n

兩邊乘以 s⁻¹：
k = s⁻¹·z + s⁻¹·r·d mod n
k = w·z + w·r·d mod n

這就是為什麼我們需要 w = s⁻¹
```

#### 步驟 4-5：計算 u₁ 和 u₂

**數學推導：**
```
從簽署過程我們知道：
k·s ≡ z + r·d (mod n)

兩邊乘以 s⁻¹（即 w）：
k ≡ w·z + w·r·d (mod n)

令：
u₁ = w·z mod n
u₂ = w·r mod n

則：
k ≡ u₁ + u₂·d (mod n)
```

**實現：**
```python
def compute_verification_scalars(z, r, w, n):
    """
    計算驗證用的標量 u₁ 和 u₂
    
    參數：
        z: 訊息雜湊
        r: 簽章的第一部分
        w: s⁻¹ mod n
        n: 曲線的階數
        
    返回：
        (u₁, u₂): 驗證標量
    """
    u1 = (z * w) % n
    u2 = (r * w) % n
    
    return u1, u2

# 範例
u1, u2 = compute_verification_scalars(z, r, w, n)
```

#### 步驟 6：計算驗證點 (x₁, y₁) = u₁×G + u₂×Q

**核心驗證步驟！**

**數學原理：**
```
我們要證明：
k × G 的 x 座標 ≡ r (mod n)

從步驟 4-5：
k ≡ u₁ + u₂·d (mod n)

因此：
k × G ≡ (u₁ + u₂·d) × G (mod n)
k × G ≡ u₁×G + u₂·d×G (mod n)

因為 Q = d×G：
k × G ≡ u₁×G + u₂×Q (mod n)

所以我們計算 u₁×G + u₂×Q，
如果簽章有效，它的 x 座標應該等於 r
```

**實現：**
```python
def compute_verification_point(u1, u2, G, Q, curve):
    """
    計算驗證點
    
    參數：
        u1: 第一個標量
        u2: 第二個標量
        G: 基準點
        Q: 公鑰
        curve: 橢圓曲線參數
        
    返回：
        (x₁, y₁): 驗證點
    """
    # 計算 u₁ × G
    point1 = scalar_multiply(u1, G, curve)
    
    # 計算 u₂ × Q
    point2 = scalar_multiply(u2, Q, curve)
    
    # 點加法：u₁×G + u₂×Q
    verification_point = point_add(point1, point2, curve)
    
    x1, y1 = verification_point
    return x1, y1

# 範例
x1, y1 = compute_verification_point(u1, u2, G, Q, curve)
```

**優化：同時多標量乘法**
```python
def multi_scalar_multiply(scalars, points, curve):
    """
    同時多標量乘法（更高效）
    
    計算：s₁×P₁ + s₂×P₂ + ... + sₙ×Pₙ
    
    使用 Shamir's Trick 可以比單獨計算更快
    """
    # 實現 Shamir's Trick
    # 這裡展示簡化版本
    
    result = POINT_AT_INFINITY
    
    # 找出最大的標量位元長度
    max_bits = max(s.bit_length() for s in scalars)
    
    # 從最高位開始
    for i in range(max_bits - 1, -1, -1):
        # 加倍
        result = point_double(result, curve)
        
        # 對每個標量-點對
        for scalar, point in zip(scalars, points):
            if scalar & (1 << i):  # 檢查第 i 位
                result = point_add(result, point, curve)
    
    return result

# 使用優化版本
verification_point = multi_scalar_multiply([u1, u2], [G, Q], curve)
```

#### 步驟 7：驗證 r ≡ x₁ mod n

**最終驗證！**

**實現：**
```python
def verify_signature_final(r, x1, n):
    """
    最終驗證步驟
    
    參數：
        r: 簽章的第一部分
        x1: 驗證點的 x 座標
        n: 曲線的階數
        
    返回：
        True 如果簽章有效，否則 False
    """
    # 計算 x₁ mod n
    x1_mod_n = x1 % n
    
    # 檢查是否相等
    if r == x1_mod_n:
        return True  # 簽章有效！
    else:
        return False  # 簽章無效

# 範例
is_valid = verify_signature_final(r, x1, n)

if is_valid:
    print("✓ 簽章有效")
else:
    print("✗ 簽章無效")
```

**為什麼這個驗證有效？**
```
簽署時：
1. 選擇 k
2. 計算 (x₁, y₁) = k×G
3. r = x₁ mod n
4. s = k⁻¹(z + r·d) mod n

驗證時：
1. 計算 w = s⁻¹
2. 計算 u₁ = z·w, u₂ = r·w
3. 計算 (x₁', y₁') = u₁×G + u₂×Q

如果簽章有效：
u₁×G + u₂×Q
= (z·w)×G + (r·w)×Q
= w·(z×G + r×Q)
= w·(z×G + r×d×G)    [因為 Q = d×G]
= w·(z + r·d)×G
= s⁻¹·(z + r·d)×G
= k⁻¹·(z + r·d)·s⁻¹·s×G    [因為 s = k⁻¹(z+r·d)]
= k⁻¹·k×G
= k×G

所以 x₁' = x₁，驗證通過！
```

### 4.3 完整驗證實現

```python
def ecdsa_verify(message, signature, public_key, curve_params):
    """
    ECDSA 驗證算法完整實現
    
    參數：
        message: 原始訊息
        signature: 簽章 (r, s)
        public_key: 公鑰 Q
        curve_params: 橢圓曲線參數 (p, a, b, G, n)
        
    返回：
        True 如果簽章有效，否則 False
    """
    r, s = signature
    Q = public_key
    p, a, b, G, n = curve_params
    
    # 步驟 1：驗證簽章格式
    if not validate_signature_format(r, s, n):
        return False
    
    # 驗證公鑰在曲線上
    if not is_point_on_curve(Q, (p, a, b)):
        return False
    
    # 步驟 2：計算訊息雜湊
    z = hash_message(message)
    z = truncate_hash(z, n)
    
    # 步驟 3：計算 w = s⁻¹ mod n
    try:
        w = mod_inverse(s, n)
    except ValueError:
        return False  # s 沒有反元素（不應該發生）
    
    # 步驟 4-5：計算 u₁ 和 u₂
    u1 = (z * w) % n
    u2 = (r * w) % n
    
    # 步驟 6：計算驗證點
    try:
        point1 = scalar_multiply(u1, G, (p, a, b))
        point2 = scalar_multiply(u2, Q, (p, a, b))
        verification_point = point_add(point1, point2, (p, a, b))
        
        # 檢查是否是無窮遠點
        if verification_point == POINT_AT_INFINITY:
            return False
        
        x1, y1 = verification_point
    except Exception:
        return False  # 計算過程中出錯
    
    # 步驟 7：驗證 r ≡ x₁ mod n
    if r == (x1 % n):
        return True  # ✓ 簽章有效
    else:
        return False  # ✗ 簽章無效

# 使用範例
message = "Transfer 10 BTC to Alice"
signature = (r, s)  # 從簽署過程獲得
public_key = Q  # 簽署者的公鑰
curve_params = (p, a, b, G, n)  # secp256k1 或其他

is_valid = ecdsa_verify(message, signature, public_key, curve_params)

if is_valid:
    print("✓ 簽章驗證成功！訊息確實由公鑰擁有者簽署。")
else:
    print("✗ 簽章驗證失敗！訊息可能被篡改或簽章無效。")
```

### 4.4 驗證流程圖

```
開始
  ↓
[輸入訊息 m、簽章 (r,s)、公鑰 Q]
  ↓
驗證 1 ≤ r < n? ─No→ [返回 False]
  ↓ Yes
驗證 1 ≤ s < n? ─No→ [返回 False]
  ↓ Yes
驗證 Q 在曲線上? ─No→ [返回 False]
  ↓ Yes
計算雜湊：z = Hash(m)
  ↓
計算 w = s⁻¹ mod n
  ↓
計算 u₁ = z·w mod n
  ↓
計算 u₂ = r·w mod n
  ↓
計算 (x₁, y₁) = u₁×G + u₂×Q
  ↓
是無窮遠點? ─Yes→ [返回 False]
  ↓ No
r == x₁ mod n? ─No→ [返回 False]
  ↓ Yes
[返回 True]
  ↓
結束
```

---

## 5. 簽署與驗證的數學關聯

### 5.1 完整數學證明

**定理：** 如果簽章 (r, s) 是由私鑰 d 對訊息 m 正確簽署的，那麼驗證過程將返回 True。

**證明：**

**簽署過程產生：**
```
1. z = Hash(m)
2. 選擇隨機數 k
3. (x₁, y₁) = k × G
4. r = x₁ mod n
5. s = k⁻¹(z + r·d) mod n
```

**從第 5 步：**
```
s = k⁻¹(z + r·d) mod n

兩邊乘以 k：
k·s ≡ z + r·d (mod n)

重排：
k ≡ s⁻¹·z + s⁻¹·r·d (mod n)
```

**驗證過程計算：**
```
w = s⁻¹ mod n
u₁ = z·w mod n = z·s⁻¹ mod n
u₂ = r·w mod n = r·s⁻¹ mod n
```

**計算驗證點：**
```
P = u₁×G + u₂×Q
  = (z·s⁻¹)×G + (r·s⁻¹)×Q
  = s⁻¹·z×G + s⁻¹·r×Q
  = s⁻¹·(z×G + r×Q)
```

**代入 Q = d×G：**
```
P = s⁻¹·(z×G + r·d×G)
  = s⁻¹·(z + r·d)×G
```

**從簽署過程我們知道 s = k⁻¹(z + r·d)：**
```
P = s⁻¹·(z + r·d)×G
  = s⁻¹·(s·k⁻¹⁻¹)×G    [因為 s = k⁻¹(z+r·d)]
  = s⁻¹·(s·k)×G
  = (s⁻¹·s)·k×G
  = k×G
```

**因為簽署時 (x₁, y₁) = k×G 且 r = x₁ mod n：**
```
P 的 x 座標 = x₁
x₁ mod n = r

驗證條件滿足！QED.
```

### 5.2 關鍵洞察

**1. 點乘法的可交換性（標量）**
```
(a + b) × G = a×G + b×G

這允許我們將：
k×G = (u₁ + u₂·d)×G = u₁×G + u₂·d×G = u₁×G + u₂×Q
```

**2. 模反元素的作用**
```
簽署：s = k⁻¹(z + r·d)
驗證：通過 s⁻¹ 來"解開"這個關係

s·s⁻¹ = 1 是連接簽署和驗證的橋樑
```

**3. 私鑰隱藏在簽章中**
```
簽章 (r, s) 包含：
- r：依賴於隨機數 k
- s：依賴於 k、z、r 和 d

但因為 k 是隨機的且保密的：
✓ 無法從 s 中提取 d
✓ s 看起來是隨機的
✓ 但驗證者可以用 Q = d×G 來驗證
```

**4. 雜湊的作用**
```
雜湊函數 Hash(m) = z 確保：
✓ 簽章與特定訊息綁定
✓ 訊息的任何修改都會改變 z
✓ 驗證時會檢測到訊息被篡改
```

---

## 6. 安全性考量和最佳實踐

### 6.1 常見安全隱患

#### 1. 隨機數 k 的問題

**問題類型：**
```
a) k 重複使用
   → 私鑰完全洩露

b) k 可預測
   → 私鑰可能被推斷

c) k 的部分位元洩露
   → 使用格攻擊恢復私鑰

d) k 生成時的偏差
   → 降低安全性
```

**防範措施：**
```python
# ✓ 好的做法
import secrets

def generate_k_secure(n):
    """使用密碼學安全的隨機數生成器"""
    return secrets.randbelow(n - 1) + 1

# 或使用 RFC 6979 確定性簽名
def generate_k_deterministic(message_hash, private_key, n):
    """RFC 6979 確定性 k 生成"""
    # 實現 HMAC-DRBG
    pass

# ✗ 錯誤做法
import random
k = random.randint(1, n-1)  # 不安全！
k = 12345  # 絕對不要使用固定值！
```

#### 2. 側信道攻擊

**威脅類型：**
```
a) 時間攻擊（Timing Attack）
   - 點乘法時間依賴於標量值
   - 模反元素計算時間洩露資訊

b) 功耗分析（Power Analysis）
   - 差分功耗分析（DPA）
   - 簡單功耗分析（SPA）

c) 電磁洩漏（EM Emission）
   - 電磁輻射洩露運算資訊

d) 錯誤注入攻擊（Fault Injection）
   - 故意引入錯誤來洩露秘密
```

**防範措施：**
```python
# 恆定時間實現
def scalar_multiply_constant_time(k, P, curve):
    """
    恆定時間的標量乘法
    
    使用 Montgomery Ladder 或其他恆定時間算法
    """
    # 實現細節...
    pass

# 掩碼技術
def sign_with_masking(message, private_key, curve):
    """
    使用掩碼技術保護簽署過程
    """
    # 生成隨機掩碼
    mask = secrets.randbelow(curve.n - 1) + 1
    
    # 掩蔽私鑰
    masked_key = (private_key + mask) % curve.n
    
    # 使用掩蔽金鑰簽署
    # ...
    
    # 移除掩碼影響
    # ...
    pass
```

#### 3. 無效曲線攻擊

**攻擊原理：**
```
攻擊者發送不在標準曲線上的公鑰
如果實現沒有驗證，可能洩露私鑰資訊
```

**防範措施：**
```python
def validate_public_key(Q, curve_params):
    """
    驗證公鑰的有效性
    """
    p, a, b, G, n = curve_params
    
    # 1. 檢查 Q 不是無窮遠點
    if Q == POINT_AT_INFINITY:
        return False
    
    # 2. 檢查座標在範圍內
    x, y = Q
    if not (0 <= x < p and 0 <= y < p):
        return False
    
    # 3. 檢查點在曲線上
    if (y**2) % p != (x**3 + a*x + b) % p:
        return False
    
    # 4. 檢查點的階數（可選，但推薦）
    # 驗證 n × Q = 𝒪
    if scalar_multiply(n, Q, (p, a, b)) != POINT_AT_INFINITY:
        return False
    
    return True

# 在驗證簽章前必須驗證公鑰
if not validate_public_key(Q, curve_params):
    raise ValueError("無效的公鑰")
```

#### 4. 簽章延展性（Signature Malleability）

**問題：**
```
對於有效的簽章 (r, s)，
簽章 (r, n-s) 也是有效的

這可能導致：
- 交易 ID 改變（Bitcoin）
- 重放攻擊
- 多重計數
```

**解決方案：**
```python
def normalize_signature(r, s, n):
    """
    規範化簽章以防止延展性
    
    Bitcoin BIP 62：要求 s ≤ n/2
    """
    if s > n // 2:
        s = n - s
    
    return r, s

# 在簽署和驗證時都應用規範化
signature = ecdsa_sign(message, private_key, curve)
signature = normalize_signature(*signature, curve.n)
```

### 6.2 實現檢查清單

#### 簽署實現

```
✓ 使用密碼學安全的隨機數生成器（或 RFC 6979）
✓ 每次簽名使用不同的 k
✓ 檢查 r ≠ 0 和 s ≠ 0
✓ 簽名後立即銷毀 k
✓ 使用恆定時間算法
✓ 規範化簽章（低 s 值）
✓ 保護私鑰（加密存儲，使用後清除）
✓ 實現適當的錯誤處理
✓ 添加簽名自我驗證（可選）
✓ 記錄審計日誌（不包含敏感資訊）
```

#### 驗證實現

```
✓ 驗證簽章格式（r, s 在有效範圍內）
✓ 驗證公鑰在曲線上
✓ 驗證公鑰不是無窮遠點
✓ 使用與簽署相同的雜湊函數
✓ 處理無窮遠點的情況
✓ 實現適當的錯誤處理
✓ 防範拒絕服務攻擊（限制輸入大小）
✓ 使用經過驗證的密碼學庫
✓ 定期更新庫以修復安全漏洞
```

### 6.3 測試和驗證

```python
def test_ecdsa_implementation():
    """
    測試 ECDSA 實現的正確性和安全性
    """
    
    # 1. 基本功能測試
    def test_basic_sign_verify():
        message = "Test message"
        private_key, public_key = generate_keypair()
        
        signature = ecdsa_sign(message, private_key, curve)
        assert ecdsa_verify(message, signature, public_key, curve)
        
        # 修改訊息應該失敗
        assert not ecdsa_verify("Different message", signature, public_key, curve)
    
    # 2. 邊界條件測試
    def test_edge_cases():
        # 測試 r=0, s=0 的處理（雖然極其罕見）
        # 測試大數值
        # 測試負數（應該拒絕）
        pass
    
    # 3. 互操作性測試
    def test_interoperability():
        # 使用標準測試向量
        # 與其他實現交叉驗證
        pass
    
    # 4. 安全性測試
    def test_security():
        # 檢查 k 的隨機性
        # 檢查恆定時間特性
        # 檢查公鑰驗證
        pass
    
    # 運行所有測試
    test_basic_sign_verify()
    test_edge_cases()
    test_interoperability()
    test_security()
    
    print("✓ 所有測試通過")
```

---

## 7. 實際應用範例

### 7.1 Bitcoin 交易簽名

```python
def sign_bitcoin_transaction(transaction, private_key, curve=secp256k1):
    """
    簽署 Bitcoin 交易
    
    Bitcoin 使用雙 SHA-256 雜湊
    """
    # 1. 序列化交易
    tx_serialized = serialize_transaction(transaction)
    
    # 2. 添加簽名類型（SIGHASH_ALL = 0x01）
    tx_for_signing = tx_serialized + b'\x01\x00\x00\x00'
    
    # 3. 雙 SHA-256 雜湊
    hash1 = hashlib.sha256(tx_for_signing).digest()
    hash2 = hashlib.sha256(hash1).digest()
    z = int.from_bytes(hash2, byteorder='big')
    
    # 4. ECDSA 簽署
    r, s = ecdsa_sign_with_hash(z, private_key, curve)
    
    # 5. 規範化簽章（BIP 62）
    if s > curve.n // 2:
        s = curve.n - s
    
    # 6. DER 編碼
    signature_der = der_encode_signature(r, s)
    
    # 7. 添加簽名類型字節
    signature_der += b'\x01'  # SIGHASH_ALL
    
    return signature_der

def verify_bitcoin_transaction(transaction, signature, public_key, curve=secp256k1):
    """
    驗證 Bitcoin 交易簽名
    """
    # 1. 解碼 DER 簽章
    r, s, sighash_type = der_decode_signature(signature)
    
    # 2. 序列化交易（使用相同的 SIGHASH 類型）
    tx_for_verification = serialize_transaction(transaction) + \
                          sighash_type.to_bytes(4, byteorder='little')
    
    # 3. 雙 SHA-256 雜湊
    hash1 = hashlib.sha256(tx_for_verification).digest()
    hash2 = hashlib.sha256(hash1).digest()
    z = int.from_bytes(hash2, byteorder='big')
    
    # 4. ECDSA 驗證
    return ecdsa_verify_with_hash(z, (r, s), public_key, curve)
```

### 7.2 Ethereum 交易簽名

```python
def sign_ethereum_transaction(transaction, private_key, curve=secp256k1):
    """
    簽署 Ethereum 交易
    
    Ethereum 使用 Keccak-256 雜湊和簽名恢復
    """
    from Crypto.Hash import keccak
    
    # 1. RLP 編碼交易
    rlp_encoded = rlp_encode(transaction)
    
    # 2. Keccak-256 雜湊
    k = keccak.new(digest_bits=256)
    k.update(rlp_encoded)
    tx_hash = k.digest()
    z = int.from_bytes(tx_hash, byteorder='big')
    
    # 3. ECDSA 簽署
    r, s = ecdsa_sign_with_hash(z, private_key, curve)
    
    # 4. 計算恢復 ID（v）
    # Ethereum 需要 v 來恢復公鑰
    v = calculate_recovery_id(r, s, z, private_key, curve)
    
    # 5. 添加 chain ID（EIP-155）
    chain_id = 1  # Mainnet
    v = v + 35 + 2 * chain_id
    
    return (v, r, s)

def calculate_recovery_id(r, s, z, private_key, curve):
    """
    計算簽名恢復 ID
    
    v ∈ {0, 1, 2, 3}，表示如何從簽章恢復公鑰
    """
    public_key = scalar_multiply(private_key, curve.G, curve)
    
    # 嘗試所有可能的恢復 ID
    for v in range(4):
        recovered_key = recover_public_key(r, s, z, v, curve)
        if recovered_key == public_key:
            return v
    
    raise ValueError("無法計算恢復 ID")
```

### 7.3 TLS 證書簽名

```python
def sign_certificate(certificate_data, ca_private_key, curve=P256):
    """
    簽署 TLS 證書
    
    證書頒發機構（CA）使用私鑰簽署證書
    """
    # 1. 提取待簽署的證書內容（TBSCertificate）
    tbs_certificate = extract_tbs_certificate(certificate_data)
    
    # 2. SHA-256 雜湊
    z = hashlib.sha256(tbs_certificate).digest()
    z = int.from_bytes(z, byteorder='big')
    
    # 3. ECDSA 簽署
    r, s = ecdsa_sign_with_hash(z, ca_private_key, curve)
    
    # 4. DER 編碼簽章
    signature = der_encode_signature(r, s)
    
    # 5. 將簽章添加到證書
    signed_certificate = create_signed_certificate(
        tbs_certificate,
        signature,
        algorithm='ecdsa-with-SHA256'
    )
    
    return signed_certificate

def verify_certificate(certificate, ca_public_key, curve=P256):
    """
    驗證 TLS 證書
    
    客戶端使用 CA 的公鑰驗證證書
    """
    # 1. 提取證書內容和簽章
    tbs_certificate = extract_tbs_certificate(certificate)
    signature = extract_signature(certificate)
    
    # 2. 解碼簽章
    r, s = der_decode_signature(signature)
    
    # 3. SHA-256 雜湊
    z = hashlib.sha256(tbs_certificate).digest()
    z = int.from_bytes(z, byteorder='big')
    
    # 4. ECDSA 驗證
    return ecdsa_verify_with_hash(z, (r, s), ca_public_key, curve)
```

---

## 8. 性能考量

### 8.1 操作複雜度

```
操作                    複雜度              說明
───────────────────────────────────────────────────
金鑰生成               O(log n)            一次標量乘法
簽署                   O(log n)            一次標量乘法 + 模運算
驗證                   O(log n)            兩次標量乘法 + 點加法
點加法                 O(1)                有限體運算
點乘法（Double-Add）   O(log k)            k 是標量大小
模反元素               O(log n)            擴展歐幾里得算法
```

### 8.2 優化技術

#### 1. 預計算表

```python
def create_precompute_table(P, curve, window_size=4):
    """
    創建預計算表以加速標量乘法
    
    預計算 1×P, 2×P, 3×P, ..., (2^window_size - 1)×P
    """
    table_size = 2 ** window_size
    table = [POINT_AT_INFINITY] * table_size
    
    table[1] = P
    for i in range(2, table_size):
        table[i] = point_add(table[i-1], P, curve)
    
    return table

def scalar_multiply_with_precompute(k, precompute_table, curve, window_size=4):
    """
    使用預計算表的標量乘法（更快）
    """
    result = POINT_AT_INFINITY
    
    # 將 k 分割成 window_size 位元的窗口
    for i in range((k.bit_length() + window_size - 1) // window_size):
        # 提取窗口
        window = (k >> (i * window_size)) & ((1 << window_size) - 1)
        
        # 查表
        if window != 0:
            point = precompute_table[window]
            # 移位並加法
            for _ in range(i * window_size):
                point = point_double(point, curve)
            result = point_add(result, point, curve)
    
    return result

# 對於基準點 G，可以預計算並存儲表
G_table = create_precompute_table(G, curve)
```

#### 2. 同時多標量乘法（Shamir's Trick）

```python
def simultaneous_multiply(k1, P1, k2, P2, curve):
    """
    同時計算 k1×P1 + k2×P2
    
    比分別計算再相加快約 25%
    """
    # 預計算組合點
    P1_plus_P2 = point_add(P1, P2, curve)
    
    # 找出最大位元長度
    max_bits = max(k1.bit_length(), k2.bit_length())
    
    result = POINT_AT_INFINITY
    
    # 從最高位開始
    for i in range(max_bits - 1, -1, -1):
        result = point_double(result, curve)
        
        bit1 = (k1 >> i) & 1
        bit2 = (k2 >> i) & 1
        
        if bit1 and bit2:
            result = point_add(result, P1_plus_P2, curve)
        elif bit1:
            result = point_add(result, P1, curve)
        elif bit2:
            result = point_add(result, P2, curve)
    
    return result

# 在驗證時使用
# 計算 u1×G + u2×Q 比分別計算更快
verification_point = simultaneous_multiply(u1, G, u2, Q, curve)
```

#### 3. 批次驗證

```python
def batch_verify(messages, signatures, public_keys, curve):
    """
    批次驗證多個簽章
    
    對於 n 個簽章，時間約為單個驗證的 1.5n 而非 2n
    """
    import secrets
    
    n = len(messages)
    
    # 1. 生成隨機係數
    coefficients = [secrets.randbelow(2**128) for _ in range(n)]
    
    # 2. 計算組合值
    combined_u1 = 0
    combined_u2_points = []
    
    for i in range(n):
        r, s = signatures[i]
        z = hash_message(messages[i])
        Q = public_keys[i]
        
        w = mod_inverse(s, curve.n)
        u1 = (z * w) % curve.n
        u2 = (r * w) % curve.n
        
        # 乘以隨機係數
        combined_u1 += coefficients[i] * u1
        combined_u2_points.append((coefficients[i] * u2, Q))
    
    # 3. 計算組合點
    left_side = scalar_multiply(combined_u1, curve.G, curve)
    
    right_side = POINT_AT_INFINITY
    for coef_u2, Q in combined_u2_points:
        term = scalar_multiply(coef_u2, Q, curve)
        right_side = point_add(right_side, term, curve)
    
    # 4. 檢查相等
    return left_side == right_side
```

### 8.3 性能基準

```
典型性能（secp256k1，標準PC）：
───────────────────────────────────
金鑰生成：    ~0.1 ms
簽署：        ~0.15 ms
驗證：        ~0.3 ms
批次驗證：    ~0.5 ms / 簽章（10個簽章）

硬體加速（AES-NI，AVX2）：
───────────────────────────────────
簽署：        ~0.05 ms
驗證：        ~0.1 ms
```

---

## 9. 總結與檢查清單

### 9.1 核心概念回顧

```
✓ ECDSA 簽署產生簽章 (r, s)
✓ 簽署需要私鑰 d 和隨機數 k
✓ 驗證只需要公鑰 Q 和簽章
✓ 驗證通過數學關係檢查簽章有效性
✓ 隨機數 k 的安全性至關重要
✓ 簽章與訊息雜湊緊密綁定
✓ 無法從簽章反推私鑰
```

### 9.2 關鍵步驟記憶

**簽署（7 步）：**
```
1. z = Hash(m)
2. 選擇 k ∈ [1, n-1]
3. (x₁, y₁) = k × G
4. r = x₁ mod n
5. s = k⁻¹(z + r·d) mod n
6. 檢查 r ≠ 0 且 s ≠ 0
7. 輸出 (r, s)
```

**驗證（7 步）：**
```
1. 檢查 r, s ∈ [1, n-1]
2. z = Hash(m)
3. w = s⁻¹ mod n
4. u₁ = z·w mod n
5. u₂ = r·w mod n
6. (x₁, y₁) = u₁×G + u₂×Q
7. 驗證 r ≡ x₁ mod n
```

### 9.3 學習檢查清單

#### 理解層面
- [ ] 理解簽署流程的每個步驟
- [ ] 理解驗證流程的每個步驟
- [ ] 理解簽署和驗證的數學關聯
- [ ] 理解為什麼驗證能檢測出偽造簽章
- [ ] 理解雜湊函數在流程中的作用

#### 計算能力
- [ ] 能夠手算小參數的簽署過程
- [ ] 能夠手算小參數的驗證過程
- [ ] 能夠計算模反元素
- [ ] 能夠追蹤完整的數學推導

#### 安全意識
- [ ] 理解隨機數 k 的重要性
- [ ] 知道 k 重複使用的後果
- [ ] 了解常見的攻擊向量
- [ ] 知道如何安全地實現 ECDSA

#### 實踐能力
- [ ] 能夠識別實現中的安全問題
- [ ] 能夠選擇合適的雜湊函數
- [ ] 了解不同應用場景的需求
- [ ] 能夠調試簽署/驗證問題

---

## 10. 延伸閱讀

### 技術規範
- [SEC 1: Elliptic Curve Cryptography - Section 4](http://www.secg.org/sec1-v2.pdf)
- [NIST FIPS 186-4: Digital Signature Standard](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf)
- [RFC 6979: Deterministic Usage of DSA and ECDSA](https://tools.ietf.org/html/rfc6979)
- [Bitcoin BIP 62: Dealing with malleability](https://github.com/bitcoin/bips/blob/master/bip-0062.mediawiki)

### 學術論文
- Johnson et al., "The Elliptic Curve Digital Signature Algorithm (ECDSA)", 2001
- Pornin, "Deterministic Usage of the Digital Signature Algorithm (DSA)", RFC 6979
- Nguyen & Shparlinski, "The Insecurity of the Digital Signature Algorithm with Partially Known Nonces"

### 實踐指南
- [libsecp256k1 實現分析](https://github.com/bitcoin-core/secp256k1)
- [OpenSSL ECDSA 文檔](https://www.openssl.org/docs/man1.1.1/man3/ECDSA_sign.html)
- [Ethereum 簽名與恢復](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sign)

### 安全研究
- "Mining Your Ps and Qs: Detection of Widespread Weak Keys in Network Devices"
- "Practical Fault Attack on ECDSA Signature Generation"
- "Side-Channel Analysis of Elliptic Curve Cryptography"

---

## 🎯 下一步

恭喜完成模組四！您現在已經完全理解了 ECDSA 的簽署和驗證流程。

**接下來：**
- **[模組五：手算演練](../module5-hands-on-calculation/)** - 通過實際手算深化理解
- 完成本模組的 **[隨堂測驗](./QUIZ.md)** - 檢驗您的掌握程度

**學習建議：**
1. 確保您能夠寫出完整的簽署流程
2. 理解每個步驟的數學意義
3. 特別注意隨機數 k 的處理
4. 理解簽署和驗證的數學關聯
5. 在進入下一模組前完成測驗

**實踐練習：**
- 用小參數手算一次完整的簽署和驗證
- 嘗試用 Python 實現簡單版本
- 分析 Bitcoin 或 Ethereum 的實際交易簽名

繼續加油！下一個模組將帶您進行實際的手算演練！🚀

