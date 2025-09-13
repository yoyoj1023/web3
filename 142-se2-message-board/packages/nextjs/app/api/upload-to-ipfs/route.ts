import axios from 'axios';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

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

    return { 
        apiKey, 
        apiSecret, 
        hasPinataCredentials: !!(apiKey && apiSecret) 
    };
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

export async function POST(req: NextRequest) {
    try {
        // 1. 驗證環境變數
        const { apiKey, apiSecret, hasPinataCredentials } = validateEnvironment();
        
        if (!hasPinataCredentials || !apiKey || !apiSecret) {
            return NextResponse.json({
                success: false,
                error: 'Pinata API 金鑰未正確設定',
            }, { status: 500 });
        }

        // 2. 解析請求體
        const body = await req.json();

        // 3. 驗證請求資料
        const validationResult = MessageSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({
                success: false,
                error: '輸入資料格式不正確',
                details: validationResult.error.issues,
            }, { status: 400 });
        }

        // 4. 準備 IPFS 內容
        const messageContent = {
            ...validationResult.data,
            createdAt: new Date().toISOString(),
            version: '1.0',
        };

        // 5. 上傳到 Pinata
        console.log('正在上傳到 IPFS...', {
            textLength: messageContent.text.length,
            hasAuthor: !!messageContent.author,
        });

        const pinataResponse = await uploadToPinata(
            messageContent,
            apiKey,
            apiSecret
        );

        // 6. 記錄成功上傳
        console.log('IPFS 上傳成功:', {
            cid: pinataResponse.IpfsHash,
            size: pinataResponse.PinSize,
        });

        // 7. 返回成功回應
        return NextResponse.json({
            success: true,
            cid: pinataResponse.IpfsHash,
        });

    } catch (error) {
        // 錯誤處理
        console.error('IPFS 上傳失敗:', error);

        if (error instanceof Error) {
            return NextResponse.json({
                success: false,
                error: error.message,
            }, { status: 500 });
        }

        return NextResponse.json({
            success: false,
            error: '伺服器內部錯誤',
        }, { status: 500 });
    }
}
