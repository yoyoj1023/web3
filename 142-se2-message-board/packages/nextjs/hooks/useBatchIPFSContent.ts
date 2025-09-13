// packages/nextjs/hooks/useBatchIPFSContent.ts
import { useState, useEffect, useCallback } from 'react';
import config from '~~/config/app';

interface BatchResult {
    [cid: string]: {
        content: any | null;
        isLoading: boolean;
        error: string | null;
    };
}

export const useBatchIPFSContent = (cids: string[]) => {
    const [results, setResults] = useState<BatchResult>({});

    const fetchContent = useCallback(async (cid: string) => {
        try {
            const gatewayUrl = `${config.pinata.gatewayUrl}/ipfs/${cid}`;
            const response = await fetch(gatewayUrl, {
                signal: AbortSignal.timeout(10000),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return { content: data, error: null };
        } catch (error: any) {
            return { content: null, error: error.message };
        }
    }, []);

    const fetchBatch = useCallback(async (cidList: string[]) => {
        // 設定初始載入狀態
        const initialState: BatchResult = {};
        cidList.forEach(cid => {
            initialState[cid] = {
                content: null,
                isLoading: true,
                error: null,
            };
        });
        setResults(initialState);

        // 並行獲取所有內容
        const promises = cidList.map(async (cid) => {
            const result = await fetchContent(cid);
            return { cid, ...result };
        });

        const batchResults = await Promise.all(promises);

        // 更新結果
        const finalResults: BatchResult = {};
        batchResults.forEach(({ cid, content, error }) => {
            finalResults[cid] = {
                content,
                isLoading: false,
                error,
            };
        });

        setResults(finalResults);
    }, [fetchContent]);

    useEffect(() => {
        if (cids.length > 0) {
            fetchBatch(cids);
        }
    }, [cids, fetchBatch]);

    return results;
};