// packages/nextjs/components/MessageList.tsx
import React, { useState } from 'react';
import { MessageCard } from './MessageCard';
import { useMessages } from '~~/hooks/useMessages';

export const MessageList: React.FC = () => {
    const { messages, isLoading, error, refresh } = useMessages();
    const [autoRefresh, setAutoRefresh] = useState(true);

    // 自動重新整理 (每 30 秒)
    React.useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            refresh();
        }, 30000);

        return () => clearInterval(interval);
    }, [autoRefresh, refresh]);

    if (isLoading && messages.length === 0) {
        return (
            <div className="space-y-4">
                {/* 載入骨架 */}
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-red-800 mb-2">載入失敗</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={refresh}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                    重新載入
                </button>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">還沒有留言</h3>
                <p className="text-gray-500 mb-4">成為第一個在這個去中心化留言板上發言的人！</p>
                <button
                    onClick={refresh}
                    className="text-blue-600 hover:text-blue-800 underline"
                >
                    重新檢查
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 控制面板 */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                        共 {messages.length} 則留言
                    </span>
                    {isLoading && (
                        <span className="text-sm text-blue-600 flex items-center">
                            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                            更新中...
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    <label className="flex items-center text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="mr-2"
                        />
                        自動重新整理
                    </label>

                    <button
                        onClick={refresh}
                        className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                    >
                        🔄 手動重新整理
                    </button>
                </div>
            </div>

            {/* 留言列表 */}
            <div className="space-y-4">
                {messages.map((message) => (
                    <MessageCard key={message.messageId} message={message} />
                ))}
            </div>

            {/* 載入更多 (如果使用分頁) */}
            {messages.length > 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                        💡 提示：新留言會自動出現在頂部
                    </p>
                </div>
            )}
        </div>
    );
};