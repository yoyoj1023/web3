// packages/nextjs/hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { useScaffoldReadContract } from '~~/hooks/scaffold-eth';

export interface OnChainMessage {
    sender: string;
    timestamp: number;
    ipfsCid: string;
    messageId: number;
}

export interface MessageWithContent extends OnChainMessage {
    content?: {
        text: string;
        author?: string;
        title?: string;
        tags?: string[];
        createdAt: string;
        version: string;
    };
    isLoading?: boolean;
    hasError?: boolean;
    errorMessage?: string;
}

export const useMessages = () => {
    const [messages, setMessages] = useState<MessageWithContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 從智能合約讀取所有留言
    const {
        data: onChainMessages,
        isLoading: contractLoading,
        error: contractError,
        refetch: refetchMessages
    } = useScaffoldReadContract({
        contractName: 'MessageBoard',
        functionName: 'getAllMessages',
        watch: true, // 自動監聽合約變化
    });

    // 處理合約資料變化
    useEffect(() => {
        if (contractLoading) {
            setIsLoading(true);
            return;
        }

        if (contractError) {
            setError('讀取合約資料失敗: ' + contractError.message);
            setIsLoading(false);
            return;
        }

        if (onChainMessages) {
            console.log('📋 讀取到合約資料:', onChainMessages);

            // 轉換格式並設定初始狀態
            const formattedMessages: MessageWithContent[] = (onChainMessages as any[])
                .map((msg, index) => ({
                    sender: msg.sender,
                    timestamp: Number(msg.timestamp),
                    ipfsCid: msg.ipfsCid,
                    messageId: Number(msg.messageId || index),
                    isLoading: true, // 初始設為載入中
                    hasError: false,
                }))
                .reverse(); // 最新的在前面

            setMessages(formattedMessages);
            setError(null);
        }

        setIsLoading(false);
    }, [onChainMessages, contractLoading, contractError]);

    // 從 IPFS 載入留言內容
    const loadIPFSContent = useCallback(async (cid: string): Promise<any> => {
        try {
            const response = await fetch(`/api/get-from-ipfs?cid=${cid}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.success ? data.content : null;
        } catch (error) {
            console.error('載入 IPFS 內容失敗:', error);
            return null;
        }
    }, []);

    // 載入所有留言的 IPFS 內容
    useEffect(() => {
        const loadAllContents = async () => {
            if (!messages.length) return;

            // 檢查是否有需要載入內容的留言
            const needsLoading = messages.some(msg => msg.isLoading && !msg.content && !msg.hasError);
            if (!needsLoading) return;

            console.log('🔄 開始載入 IPFS 內容，共', messages.length, '則留言');

            const updatedMessages = await Promise.all(
                messages.map(async (message) => {
                    if (message.content || message.hasError || !message.isLoading) {
                        return message; // 已經載入過了或不需要載入
                    }

                    console.log('📥 載入 IPFS 內容:', message.ipfsCid);

                    try {
                        const content = await loadIPFSContent(message.ipfsCid);
                        console.log('✅ IPFS 內容載入成功:', message.ipfsCid, content);
                        return {
                            ...message,
                            content,
                            isLoading: false,
                            hasError: !content,
                            errorMessage: !content ? '無法載入 IPFS 內容' : undefined,
                        };
                    } catch (error: any) {
                        console.error('❌ IPFS 內容載入失敗:', message.ipfsCid, error);
                        return {
                            ...message,
                            isLoading: false,
                            hasError: true,
                            errorMessage: error.message || '載入 IPFS 內容時發生錯誤',
                        };
                    }
                })
            );

            setMessages(updatedMessages);
        };

        loadAllContents();
    }, [messages.length, loadIPFSContent]); // 只依賴長度變化，避免無限循環

    // 手動重新整理
    const refresh = useCallback(() => {
        refetchMessages();
    }, [refetchMessages]);

    return {
        messages,
        isLoading,
        error,
        refresh,
    };
};