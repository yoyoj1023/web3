// packages/nextjs/hooks/usePaginatedMessages.ts
import { useState, useCallback } from 'react';
import { useScaffoldReadContract } from '~~/hooks/scaffold-eth';

interface PaginationConfig {
    pageSize: number;
    initialPage: number;
}

export const usePaginatedMessages = (config: PaginationConfig = {
    pageSize: 10,
    initialPage: 0,
}) => {
    const [currentPage, setCurrentPage] = useState(config.initialPage);

    // 讀取留言總數
    const { data: totalMessages } = useScaffoldReadContract({
        contractName: 'MessageBoard',
        functionName: 'getTotalMessages',
        watch: true,
    });

    // 計算需要獲取的留言數量（包含所有前面的頁面）
    const requiredMessages = config.pageSize * (currentPage + 1);
    
    // 讀取足夠數量的最新留言
    const {
        data: latestMessages,
        isLoading,
        error,
        refetch
    } = useScaffoldReadContract({
        contractName: 'MessageBoard',
        functionName: 'getLatestMessages',
        args: [BigInt(requiredMessages)],
        watch: true,
    });

    const totalPages = totalMessages ?
        Math.ceil(Number(totalMessages) / config.pageSize) : 0;

    const nextPage = useCallback(() => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage, totalPages]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage]);

    const goToPage = useCallback((page: number) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    const reset = useCallback(() => {
        setCurrentPage(config.initialPage);
    }, [config.initialPage]);

    // 計算當前頁面的留言
    const currentPageMessages = latestMessages ?
        (latestMessages as any[]).slice(
            currentPage * config.pageSize,
            (currentPage + 1) * config.pageSize
        ) : [];

    // 檢查是否有下一頁和上一頁
    const hasNextPage = currentPage < totalPages - 1;
    const hasPrevPage = currentPage > 0;

    // 頁面資訊
    const pageInfo = {
        currentPage: currentPage + 1, // 從 1 開始顯示
        totalPages,
        pageSize: config.pageSize,
        totalItems: Number(totalMessages || 0),
        startIndex: currentPage * config.pageSize + 1,
        endIndex: Math.min((currentPage + 1) * config.pageSize, Number(totalMessages || 0)),
    };

    return {
        messages: currentPageMessages,
        isLoading,
        error,
        // 分頁控制
        currentPage,
        totalPages,
        nextPage,
        prevPage,
        goToPage,
        reset,
        hasNextPage,
        hasPrevPage,
        // 頁面資訊
        pageInfo,
        // 資料資訊
        totalMessages: Number(totalMessages || 0),
        // 操作
        refresh: refetch,
    };
};