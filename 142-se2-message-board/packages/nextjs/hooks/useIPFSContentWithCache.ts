// packages/nextjs/hooks/useIPFSContentWithCache.ts
import { useState, useEffect, useCallback } from 'react';
import { ipfsCache } from '~~/utils/cache';
import config from '~~/config/app';

export const useIPFSContentWithCache = (cid: string) => {
    const [content, setContent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchContent = useCallback(async () => {
        if (!cid) return;

        // 檢查快取
        const cached = ipfsCache.get(cid);
        if (cached) {
            console.log(`💾 從快取獲取內容: ${cid}`);
            setContent(cached);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const gatewayUrl = `${config.pinata.gatewayUrl}/ipfs/${cid}`;

            const response = await fetch(gatewayUrl, {
                signal: AbortSignal.timeout(10000),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: 無法獲取 IPFS 內容`);
            }

            const data = await response.json();

            // 儲存到快取
            ipfsCache.set(cid, data);

            console.log(`✅ 成功獲取並快取 IPFS 內容: ${cid}`);
            setContent(data);

        } catch (err: any) {
            console.error(`❌ 獲取 IPFS 內容失敗 (${cid}):`, err);
            setError(err.message || 'IPFS 內容獲取失敗');
        } finally {
            setIsLoading(false);
        }
    }, [cid]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    return {
        content,
        isLoading,
        error,
        retry: fetchContent,
    };
};