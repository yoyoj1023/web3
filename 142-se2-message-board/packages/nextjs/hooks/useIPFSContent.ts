// packages/nextjs/hooks/useIPFSContent.ts
import { useState, useEffect, useCallback } from 'react';
import config from '~~/config/app';

interface IPFSContent {
    text: string;
    author?: string;
    title?: string;
    tags?: string[];
    createdAt: string;
    version: string;
}

interface UseIPFSContentResult {
    content: IPFSContent | null;
    isLoading: boolean;
    error: string | null;
    retry: () => void;
}

export const useIPFSContent = (cid: string): UseIPFSContentResult => {
    const [content, setContent] = useState<IPFSContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchContent = useCallback(async () => {
        if (!cid) return;

        setIsLoading(true);
        setError(null);

        try {
            // 構建 IPFS Gateway URL
            const gatewayUrl = `${config.pinata.gatewayUrl}/ipfs/${cid}`;

            console.log(`📥 從 IPFS 獲取內容: ${cid}`);

            const response = await fetch(gatewayUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                // 5 秒超時
                signal: AbortSignal.timeout(5000),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: 無法獲取 IPFS 內容`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType?.includes('application/json')) {
                throw new Error('IPFS 內容不是有效的 JSON 格式');
            }

            const data = await response.json();

            // 驗證資料格式
            if (!data.text) {
                throw new Error('IPFS 內容缺少必要的 text 欄位');
            }

            console.log(`✅ 成功獲取 IPFS 內容: ${cid.substring(0, 10)}...`);
            setContent(data);

        } catch (err: any) {
            console.error(`❌ 獲取 IPFS 內容失敗 (${cid}):`, err);

            if (err.name === 'AbortError') {
                setError('請求超時，請檢查網路連線');
            } else if (err.message.includes('HTTP 404')) {
                setError('內容未找到，可能已被移除');
            } else {
                setError(err.message || 'IPFS 內容獲取失敗');
            }
        } finally {
            setIsLoading(false);
        }
    }, [cid]);

    const retry = useCallback(() => {
        fetchContent();
    }, [fetchContent]);

    useEffect(() => {
        if (cid) {
            fetchContent();
        }
    }, [fetchContent, cid]);

    return {
        content,
        isLoading,
        error,
        retry,
    };
};