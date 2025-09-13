// packages/nextjs/app/api/get-from-ipfs/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cid = searchParams.get('cid');

        if (!cid) {
            return NextResponse.json(
                { success: false, error: '缺少 CID 參數' },
                { status: 400 }
            );
        }

        console.log('🔍 從 IPFS 獲取內容:', cid);

        // 嘗試多個 IPFS 閘道
        const gateways = [
            `https://gateway.pinata.cloud/ipfs/${cid}`,
            `https://ipfs.io/ipfs/${cid}`,
            `https://cloudflare-ipfs.com/ipfs/${cid}`,
            `https://dweb.link/ipfs/${cid}`,
        ];

        let lastError: Error | null = null;

        for (const gateway of gateways) {
            try {
                console.log(`🌐 嘗試閘道: ${gateway}`);
                
                // 創建超時控制器
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超時
                
                const response = await fetch(gateway, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Cache-Control': 'no-cache',
                        'User-Agent': 'MessageBoard/1.0',
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const contentType = response.headers.get('content-type');
                let content;

                if (contentType && contentType.includes('application/json')) {
                    content = await response.json();
                } else {
                    const text = await response.text();
                    try {
                        content = JSON.parse(text);
                    } catch {
                        // 如果不是 JSON，就當作純文字處理
                        content = { text: text };
                    }
                }

                console.log('✅ 成功從 IPFS 獲取內容:', content);

                return NextResponse.json({
                    success: true,
                    content,
                    gateway: gateway,
                    cid,
                });

            } catch (error: any) {
                lastError = error;
                const errorMessage = error.name === 'AbortError' ? '請求超時' : error.message;
                console.warn(`❌ 閘道失敗 ${gateway}:`, errorMessage);
                continue; // 嘗試下一個閘道
            }
        }

        // 所有閘道都失敗了
        console.error('❌ 所有 IPFS 閘道都失敗了');
        return NextResponse.json(
            {
                success: false,
                error: '無法從任何 IPFS 閘道獲取內容',
                details: lastError?.message,
                cid,
            },
            { status: 502 }
        );

    } catch (error: any) {
        console.error('❌ 獲取 IPFS 內容時發生錯誤:', error);
        return NextResponse.json(
            {
                success: false,
                error: '伺服器內部錯誤',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
