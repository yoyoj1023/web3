// packages/nextjs/components/MessageCard.tsx
import React from 'react';
import { MessageWithContent } from '~~/hooks/useMessages';

interface MessageCardProps {
    message: MessageWithContent;
}

export const MessageCard: React.FC<MessageCardProps> = ({ message }) => {
    // 使用 message 中已經載入的內容，而不是重新載入
    const content = message.content;
    const isLoading = message.isLoading || false;
    const error = message.hasError ? message.errorMessage : null;
    
    // 重試函數
    const retry = () => {
        window.location.reload(); // 簡單的重試方式
    };

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4 transition-all hover:shadow-lg">
            {/* 標題區域 */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    {content?.title && (
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {content.title}
                        </h3>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                            👤 {content?.author || formatAddress(message.sender)}
                        </span>
                        <span className="flex items-center">
                            🕒 {formatTimestamp(message.timestamp)}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            #{message.messageId}
                        </span>
                    </div>
                </div>

                {/* CID 顯示 */}
                <div className="text-xs text-gray-400">
                    <span className="font-mono bg-gray-50 px-2 py-1 rounded">
                        {message.ipfsCid.substring(0, 10)}...
                    </span>
                </div>
            </div>

            {/* 內容區域 */}
            <div className="mb-4">
                {isLoading ? (
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-700 text-sm">⚠️ 載入內容失敗</p>
                                <p className="text-red-600 text-xs mt-1">{error}</p>
                            </div>
                            <button
                                onClick={retry}
                                className="text-red-600 hover:text-red-800 text-sm underline"
                            >
                                重試
                            </button>
                        </div>
                    </div>
                ) : content ? (
                    <div>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {content.text}
                        </p>
                    </div>
                ) : null}
            </div>

            {/* 標籤區域 */}
            {content?.tags && content.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {content.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* 底部資訊 */}
            <div className="border-t pt-3 flex justify-between items-center text-xs text-gray-400">
                <div className="flex space-x-4">
                    <span>發送者: {formatAddress(message.sender)}</span>
                    {content?.createdAt && (
                        <span>建立: {new Date(content.createdAt).toLocaleDateString('zh-TW')}</span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <span>🔗 IPFS</span>
                    <a
                        href={`https://gateway.pinata.cloud/ipfs/${message.ipfsCid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 underline"
                    >
                        查看原始內容
                    </a>
                </div>
            </div>
        </div>
    );
};