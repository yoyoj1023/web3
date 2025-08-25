# 第二課：【實作】建立訊息上傳至 Pinata 的 API Route

## 🎯 學習目標

完成本課後，您將能夠：
- 建立安全的 Next.js API Route 處理 IPFS 上傳
- 實作完整的 Pinata API 整合
- 理解前後端分離的安全架構
- 掌握錯誤處理和檔案驗證最佳實踐

## 📋 課程大綱

1. [Next.js API Routes 基礎](#nextjs-api-routes-基礎)
2. [Pinata API 整合實作](#pinata-api-整合實作)
3. [訊息格式設計](#訊息格式設計)
4. [錯誤處理與驗證](#錯誤處理與驗證)
5. [API 測試與除錯](#api-測試與除錯)

---

## Next.js API Routes 基礎

### 🛣️ **API Routes 架構概覽**

Next.js API Routes 讓我們可以在同一個專案中建立後端 API：

```
📁 pages/api/ (或 app/api/ 在 App Router 中)
├── 📄 upload-to-ipfs.ts     # 主要上傳 API
├── 📄 health-check.ts       # 健康檢查 API
└── 📁 ipfs/
    ├── 📄 upload.ts         # 檔案上傳
    └── 📄 pin-status.ts     # 釘選狀態查詢
```

### 🛣️ **為什麼需要 API Route？**

**安全考量：**
```typescript
// ❌ 錯誤做法：在前端直接呼叫 Pinata
const uploadToIPFS = async (data) => {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    headers: {
      'pinata_api_key': 'your-api-key',        // 🚨 暴露在前端！
      'pinata_secret_api_key': 'your-secret',  // 🚨 極度危險！
    },
    body: JSON.stringify(data),
  });
};

// ✅ 正確做法：透過自己的 API Route
const uploadToIPFS = async (data) => {
  const response = await fetch('/api/upload-to-ipfs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};
```

### 🛣️ **API Route 基本結構**

```typescript
// pages/api/upload-to-ipfs.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 處理上傳邏輯
    const result = await processUpload(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## Pinata API 整合實作

### 📤 **完整的上傳 API 實作**

建立 `packages/nextjs/pages/api/upload-to-ipfs.ts`：

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { z } from 'zod';

// ===========================================
// 型別定義
// ===========================================

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface APIResponse {
  success: boolean;
  cid?: string;
  error?: string;
  details?: any;
}

// ===========================================
// 輸入驗證 Schema
// ===========================================

const MessageSchema = z.object({
  text: z.string()
    .min(1, '留言內容不能為空')
    .max(5000, '留言內容不能超過 5000 字'),
  author: z.string()
    .max(100, '作者名稱不能超過 100 字')
    .optional(),
  title: z.string()
    .max(200, '標題不能超過 200 字')
    .optional(),
  tags: z.array(z.string().max(50))
    .max(10, '標籤數量不能超過 10 個')
    .optional(),
});

// ===========================================
// 環境變數驗證
// ===========================================

function validateEnvironment() {
  const apiKey = process.env.PINATA_API_KEY;
  const apiSecret = process.env.PINATA_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Pinata API 金鑰未正確設定');
  }

  return { apiKey, apiSecret };
}

// ===========================================
// Pinata API 互動函式
// ===========================================

async function uploadToPinata(
  data: any,
  apiKey: string,
  apiSecret: string
): Promise<PinataResponse> {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  
  const pinataMetadata = {
    name: `MessageBoard-${Date.now()}`,
    keyvalues: {
      app: 'MessageBoard',
      version: '1.0',
      timestamp: new Date().toISOString(),
    },
  };

  const requestBody = {
    pinataContent: data,
    pinataMetadata,
    pinataOptions: {
      cidVersion: 1, // 使用 CIDv1 格式
    },
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': apiSecret,
      },
      timeout: 30000, // 30 秒超時
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.message;
      
      switch (status) {
        case 401:
          throw new Error('Pinata API 認證失敗，請檢查 API 金鑰');
        case 402:
          throw new Error('Pinata 帳戶額度不足');
        case 413:
          throw new Error('上傳檔案過大');
        default:
          throw new Error(`Pinata API 錯誤：${message}`);
      }
    }
    
    throw error;
  }
}

// ===========================================
// 主要處理函式
// ===========================================

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  // 只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '只允許 POST 請求',
    });
  }

  try {
    // 1. 驗證環境變數
    const { apiKey, apiSecret } = validateEnvironment();

    // 2. 驗證請求資料
    const validationResult = MessageSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: '輸入資料格式不正確',
        details: validationResult.error.issues,
      });
    }

    // 3. 準備 IPFS 內容
    const messageContent = {
      ...validationResult.data,
      createdAt: new Date().toISOString(),
      version: '1.0',
    };

    // 4. 上傳到 Pinata
    console.log('正在上傳到 IPFS...', { 
      textLength: messageContent.text.length,
      hasAuthor: !!messageContent.author,
    });

    const pinataResponse = await uploadToPinata(
      messageContent,
      apiKey,
      apiSecret
    );

    // 5. 記錄成功上傳
    console.log('IPFS 上傳成功:', {
      cid: pinataResponse.IpfsHash,
      size: pinataResponse.PinSize,
    });

    // 6. 返回成功回應
    res.status(200).json({
      success: true,
      cid: pinataResponse.IpfsHash,
    });

  } catch (error) {
    // 錯誤處理
    console.error('IPFS 上傳失敗:', error);

    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: '伺服器內部錯誤',
    });
  }
}

// ===========================================
// API Route 配置
// ===========================================

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // 限制請求大小
    },
  },
};
```

### 📤 **輔助 API：健康檢查**

建立 `packages/nextjs/pages/api/health-check.ts`：

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  services: {
    pinata: 'connected' | 'disconnected' | 'error';
  };
  timestamp: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'unhealthy',
      services: { pinata: 'error' },
      timestamp: new Date().toISOString(),
      message: 'Method not allowed',
    });
  }

  let pinataStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';

  try {
    // 檢查環境變數
    const apiKey = process.env.PINATA_API_KEY;
    const apiSecret = process.env.PINATA_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('API 金鑰未設定');
    }

    // 測試 Pinata 連接
    const response = await axios.get(
      'https://api.pinata.cloud/data/testAuthentication',
      {
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': apiSecret,
        },
        timeout: 5000,
      }
    );

    if (response.status === 200) {
      pinataStatus = 'connected';
    }

  } catch (error) {
    console.error('Pinata 健康檢查失敗:', error);
    pinataStatus = 'error';
  }

  const isHealthy = pinataStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    services: { pinata: pinataStatus },
    timestamp: new Date().toISOString(),
  });
}
```

---

## 訊息格式設計

### 📝 **IPFS 儲存格式**

我們的訊息將以以下 JSON 格式儲存在 IPFS：

```typescript
interface IPFSMessageContent {
  // 主要內容
  text: string;              // 留言文字內容
  
  // 可選的元資料
  author?: string;           // 作者名稱
  title?: string;            // 留言標題
  tags?: string[];           // 標籤陣列
  
  // 系統資料
  createdAt: string;         // ISO 8601 格式的建立時間
  version: string;           // 格式版本號
}
```

### 📝 **範例資料格式**

```json
{
  "text": "這是我在去中心化留言板上的第一則留言！IPFS 和區塊鏈的結合真是太酷了。",
  "author": "區塊鏈愛好者",
  "title": "我的第一則 Web3 留言",
  "tags": ["Web3", "IPFS", "區塊鏈", "去中心化"],
  "createdAt": "2023-12-25T10:30:00.000Z",
  "version": "1.0"
}
```

### 📝 **資料驗證規則**

```typescript
const ValidationRules = {
  text: {
    required: true,
    minLength: 1,
    maxLength: 5000,
    allowEmpty: false,
  },
  author: {
    required: false,
    maxLength: 100,
    sanitize: true, // 移除特殊字元
  },
  title: {
    required: false,
    maxLength: 200,
    sanitize: true,
  },
  tags: {
    required: false,
    maxItems: 10,
    maxItemLength: 50,
    uniqueItems: true, // 去除重複
  },
};
```

---

## 錯誤處理與驗證

### 🛡️ **完整的錯誤處理系統**

建立 `packages/nextjs/utils/error-handling.ts`：

```typescript
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PINATA_AUTH_ERROR = 'PINATA_AUTH_ERROR',
  PINATA_QUOTA_ERROR = 'PINATA_QUOTA_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface APIError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: string;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: ErrorCode, message: string, statusCode = 500, details?: any) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }

  toJSON(): APIError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

// 錯誤處理中介軟體
export function handleAPIError(error: unknown): { status: number; body: APIError } {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: error.toJSON(),
    };
  }

  // 處理 Zod 驗證錯誤
  if (error && typeof error === 'object' && 'issues' in error) {
    return {
      status: 400,
      body: new AppError(
        ErrorCode.VALIDATION_ERROR,
        '輸入資料驗證失敗',
        400,
        error
      ).toJSON(),
    };
  }

  // 處理未知錯誤
  console.error('未預期的錯誤:', error);
  return {
    status: 500,
    body: new AppError(
      ErrorCode.INTERNAL_ERROR,
      '伺服器內部錯誤'
    ).toJSON(),
  };
}
```

### 🛡️ **輸入清理與驗證**

```typescript
// packages/nextjs/utils/input-sanitization.ts
export function sanitizeString(input: string, maxLength: number): string {
  return input
    .trim()                          // 移除前後空白
    .replace(/\s+/g, ' ')           // 合併多個空白為一個
    .slice(0, maxLength)            // 限制長度
    .replace(/[<>]/g, '');          // 移除潛在的 HTML 標籤
}

export function sanitizeTags(tags: string[]): string[] {
  return [...new Set(tags)]         // 去除重複
    .map(tag => sanitizeString(tag, 50))
    .filter(tag => tag.length > 0)  // 移除空標籤
    .slice(0, 10);                  // 限制數量
}

export function validateAndSanitizeMessage(input: any) {
  const sanitized = {
    text: sanitizeString(input.text || '', 5000),
    author: input.author ? sanitizeString(input.author, 100) : undefined,
    title: input.title ? sanitizeString(input.title, 200) : undefined,
    tags: input.tags ? sanitizeTags(input.tags) : undefined,
  };

  // 移除空的可選欄位
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined || sanitized[key] === '') {
      delete sanitized[key];
    }
  });

  return sanitized;
}
```

---

## API 測試與除錯

### 🧪 **建立測試腳本**

建立 `packages/nextjs/scripts/test-api.js`：

```javascript
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// 測試資料
const testMessages = [
  {
    text: '這是一則測試留言',
    author: '測試使用者',
    title: '測試標題',
    tags: ['測試', 'API'],
  },
  {
    text: '只有文字內容的簡單留言',
  },
  {
    text: '包含各種字元的留言 123 !@# 中文 English',
    author: 'Multi-Language User',
    tags: ['多語言', 'multilingual', 'test'],
  },
];

// 錯誤測試資料
const errorTestCases = [
  {
    name: '空內容測試',
    data: { text: '' },
    expectedError: 'VALIDATION_ERROR',
  },
  {
    name: '過長內容測試',
    data: { text: 'A'.repeat(6000) },
    expectedError: 'VALIDATION_ERROR',
  },
  {
    name: '過多標籤測試',
    data: { 
      text: '測試',
      tags: Array(15).fill('tag'),
    },
    expectedError: 'VALIDATION_ERROR',
  },
];

async function testHealthCheck() {
  console.log('🔍 測試健康檢查 API...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/health-check`);
    console.log('✅ 健康檢查通過:', response.data);
  } catch (error) {
    console.error('❌ 健康檢查失敗:', error.response?.data || error.message);
  }
}

async function testUploadMessage(message, index) {
  console.log(`\n🔍 測試上傳留言 ${index + 1}...`);
  console.log('資料:', JSON.stringify(message, null, 2));

  try {
    const response = await axios.post(`${API_BASE_URL}/upload-to-ipfs`, message, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    console.log('✅ 上傳成功:', response.data);
    
    // 驗證 CID 格式
    const cid = response.data.cid;
    if (cid && (cid.startsWith('Qm') || cid.startsWith('bafy'))) {
      console.log(`✅ CID 格式正確: ${cid}`);
    } else {
      console.warn(`⚠️ CID 格式可能有問題: ${cid}`);
    }

    return response.data;
  } catch (error) {
    console.error('❌ 上傳失敗:', error.response?.data || error.message);
    return null;
  }
}

async function testErrorHandling(testCase) {
  console.log(`\n🔍 測試錯誤處理: ${testCase.name}`);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/upload-to-ipfs`, testCase.data);
    console.warn('⚠️ 預期應該失敗，但成功了:', response.data);
  } catch (error) {
    const errorData = error.response?.data;
    if (errorData && errorData.error) {
      console.log('✅ 正確捕獲錯誤:', errorData.error);
    } else {
      console.error('❌ 未預期的錯誤格式:', errorData);
    }
  }
}

async function runAllTests() {
  console.log('🚀 開始 API 測試...\n');

  // 健康檢查
  await testHealthCheck();

  // 測試正常上傳
  console.log('\n📤 測試正常上傳功能...');
  const results = [];
  for (let i = 0; i < testMessages.length; i++) {
    const result = await testUploadMessage(testMessages[i], i);
    if (result) results.push(result);
  }

  // 測試錯誤處理
  console.log('\n🛡️ 測試錯誤處理...');
  for (const testCase of errorTestCases) {
    await testErrorHandling(testCase);
  }

  // 測試總結
  console.log('\n📊 測試總結:');
  console.log(`✅ 成功上傳: ${results.length} 則留言`);
  console.log(`🔗 生成的 CID 列表:`);
  results.forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.cid}`);
  });

  console.log('\n🎉 API 測試完成！');
}

// 執行測試
runAllTests().catch(console.error);
```

### 🧪 **執行測試**

```bash
# 確保前端伺服器正在運行
yarn start

# 在另一個終端視窗執行測試
cd packages/nextjs
node scripts/test-api.js
```

### 🧪 **手動測試工具**

也可以使用 curl 或 Postman 進行手動測試：

```bash
# 健康檢查
curl -X GET http://localhost:3000/api/health-check

# 上傳測試
curl -X POST http://localhost:3000/api/upload-to-ipfs \
  -H "Content-Type: application/json" \
  -d '{
    "text": "這是透過 curl 發送的測試留言",
    "author": "Terminal User",
    "tags": ["curl", "test"]
  }'
```

---

## 📝 本課總結

### **已完成的功能**

1. ✅ **安全的 API Route**：在伺服器端處理 Pinata API 呼叫
2. ✅ **完整的錯誤處理**：多層次的錯誤處理和使用者友好的訊息
3. ✅ **輸入驗證**：使用 Zod 進行嚴格的型別檢查
4. ✅ **資料清理**：防止 XSS 攻擊和確保資料品質
5. ✅ **測試工具**：完整的自動化測試腳本

### **關鍵學習點**

1. **安全性優先**：API 密鑰絕不暴露到前端
2. **錯誤處理**：提供清晰的錯誤訊息便於除錯
3. **資料驗證**：嚴格驗證輸入避免安全問題
4. **測試重要性**：自動化測試確保功能正確性

### **下一課預告**

在下一課中，我們將整合 Scaffold-eth-2 的 Hooks，建立完整的前端留言發布功能，將我們的 API Route 與智能合約連接起來！

---

## 🔗 延伸閱讀

- [Next.js API Routes 文件](https://nextjs.org/docs/api-routes/introduction)
- [Pinata API 參考](https://docs.pinata.cloud/reference/post_pinning_pinjsontoipfs)
- [Zod 驗證庫](https://zod.dev/)

**下一課：** [第三課：【實作】整合 Scaffold-eth-2 Hooks 發布留言](第三課-整合Scaffold-eth-2-Hooks發布留言.md)
