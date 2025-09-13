"use client";

import React, { useState } from 'react';
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MessageInput } from "~~/components/MessageInput";
import { MessageList } from "~~/components/MessageList";
import { ProgressIndicator } from "~~/components/ProgressIndicator";
import { ErrorBoundary } from "~~/components/ErrorBoundary";
import { Address } from "~~/components/scaffold-eth";

const MessagesPage: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 當新留言發布成功時觸發重新整理
  const handleMessagePosted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* 頁面標題區域 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🌐 去中心化留言板
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                基於以太坊區塊鏈和 IPFS 的永久留言板
              </p>
              
              {/* 連接狀態顯示 */}
              <div className="flex justify-center items-center space-x-4 text-sm">
                {isConnected ? (
                  <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700">已連接錢包:</span>
                    <Address address={connectedAddress} />
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                    <span className="text-yellow-700">
                      ⚠️ 請先連接錢包以發布留言
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 主要內容區域 */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            
            {/* 發布留言區域 */}
            {isConnected && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  ✏️ 發布新留言
                </h2>
                <MessageInput onMessagePosted={handleMessagePosted} />
              </section>
            )}

            {/* 留言列表區域 */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                💬 最新留言
              </h2>
              <MessageList key={refreshTrigger} />
            </section>

            {/* 功能說明區域 */}
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                🔍 關於此留言板
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-semibold mb-2">🔐 去中心化特色</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• 留言永久儲存在區塊鏈上</li>
                    <li>• 內容託管在 IPFS 分散式網路</li>
                    <li>• 無法被審查或刪除</li>
                    <li>• 完全透明和可驗證</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">💡 使用說明</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• 需要連接以太坊錢包</li>
                    <li>• 發布留言需要支付 Gas 費用</li>
                    <li>• 支援標題、作者和標籤</li>
                    <li>• 所有留言都是公開的</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 統計資訊區域 */}
            <section className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">⛓️</div>
                <div className="text-sm text-gray-600">區塊鏈儲存</div>
                <div className="text-xs text-gray-500 mt-1">永久且不可變</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">🌐</div>
                <div className="text-sm text-gray-600">IPFS 網路</div>
                <div className="text-xs text-gray-500 mt-1">分散式內容儲存</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">🔓</div>
                <div className="text-sm text-gray-600">開放原始碼</div>
                <div className="text-xs text-gray-500 mt-1">完全透明可驗證</div>
              </div>
            </section>

          </div>
        </div>

        {/* 頁腳 */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">
                🛠️ 使用 <span className="font-semibold">Scaffold-ETH 2</span> 建構
              </p>
              <p>
                基於 <span className="font-semibold">NextJS</span>、
                <span className="font-semibold">Hardhat</span> 和 
                <span className="font-semibold">IPFS</span> 技術
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default MessagesPage;
