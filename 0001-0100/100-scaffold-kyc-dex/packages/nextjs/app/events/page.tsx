"use client";

import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useBlockNumber } from "wagmi";

const Events: NextPage = () => {
  // 獲取當前區塊號
  const { data: currentBlockNumber } = useBlockNumber({ watch: true });
  
  // 計算安全的起始和結束區塊（限制在最近400個區塊內以避免超過500區塊限制）
  const safeFromBlock = currentBlockNumber ?
    (currentBlockNumber > 400n ? currentBlockNumber - 400n : 0n) :
    undefined;
  
  const safeToBlock = currentBlockNumber;

  // 獲取UserVerified事件歷史
  const {
    data: userVerifiedEvents,
    isLoading: isLoadingVerified,
    error: errorVerified,
  } = useScaffoldEventHistory({
    contractName: "KYCRegistry",
    eventName: "UserVerified",
    fromBlock: safeFromBlock ?? 0n,
    toBlock: safeToBlock,
    watch: true,
    blockData: true,
  });

  // 獲取UserVerificationRemoved事件歷史
  const {
    data: userRemovedEvents,
    isLoading: isLoadingRemoved,
    error: errorRemoved,
  } = useScaffoldEventHistory({
    contractName: "KYCRegistry",
    eventName: "UserVerificationRemoved",
    fromBlock: safeFromBlock ?? 0n,
    toBlock: safeToBlock,
    watch: true,
    blockData: true,
  });

  // 合併所有事件並按時間排序
  const allEvents = [
    ...(userVerifiedEvents || [])
      .filter(event => {
        // 檢查事件是否有效
        if (!event) {
          console.warn('Invalid event (null/undefined)');
          return false;
        }
        if (!event.args) {
          console.warn('Event missing args:', event);
          return false;
        }
        if (!event.args.user) {
          console.warn('Event missing args.user:', event);
          return false;
        }
        return true;
      })
      .map(event => ({
        ...event,
        type: "verified" as const,
      })),
    ...(userRemovedEvents || [])
      .filter(event => {
        // 檢查事件是否有效
        if (!event) {
          console.warn('Invalid event (null/undefined)');
          return false;
        }
        if (!event.args) {
          console.warn('Event missing args:', event);
          return false;
        }
        if (!event.args.user) {
          console.warn('Event missing args.user:', event);
          return false;
        }
        return true;
      })
      .map(event => ({
        ...event,
        type: "removed" as const,
      })),
  ].sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

  const isLoading = isLoadingVerified || isLoadingRemoved;
  const hasError = errorVerified || errorRemoved;

  // 調試信息：打印原始事件數據結構
  if (userVerifiedEvents && userVerifiedEvents.length > 0) {
    console.log('UserVerified events sample:', userVerifiedEvents[0]);
    console.log('UserVerified events args:', userVerifiedEvents[0]?.args);
  }
  if (userRemovedEvents && userRemovedEvents.length > 0) {
    console.log('UserRemoved events sample:', userRemovedEvents[0]);
    console.log('UserRemoved events args:', userRemovedEvents[0]?.args);
  }

  // 檢查錯誤和事件數據
  if (errorVerified) {
    console.error('UserVerified events error:', errorVerified);
  }
  if (errorRemoved) {
    console.error('UserRemoved events error:', errorRemoved);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">KYC 註冊表事件歷史</h1>
          <p className="text-lg text-gray-600">
            監控KYC驗證狀態變更的即時事件記錄
          </p>
          <p className="text-sm text-gray-500 mt-2">
            顯示最近 400 個區塊的事件記錄（使用 toBlock 限制）
          </p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="bg-primary text-primary-content rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold">
              {userVerifiedEvents?.length || 0}
            </h3>
            <p className="text-sm opacity-80">用戶驗證事件</p>
          </div>
          <div className="bg-secondary text-secondary-content rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold">
              {userRemovedEvents?.length || 0}
            </h3>
            <p className="text-sm opacity-80">驗證移除事件</p>
          </div>
          <div className="bg-accent text-accent-content rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold">
              {allEvents.length}
            </h3>
            <p className="text-sm opacity-80">總事件數</p>
          </div>
        </div>

        {/* 區塊範圍資訊 */}
        {currentBlockNumber && safeFromBlock !== undefined && (
          <div className="alert alert-info max-w-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <div className="font-bold">查詢範圍 (使用 toBlock 限制)</div>
              <div className="text-xs">
                從區塊 #{safeFromBlock.toString()} 到 #{currentBlockNumber.toString()}
                (共 {(currentBlockNumber - safeFromBlock + 1n).toString()} 個區塊)
              </div>
              <div className="text-xs text-green-200 mt-1">
                ✅ 使用 toBlock 參數確保 eth_getLogs 請求不超過 500 個區塊
              </div>
            </div>
          </div>
        )}

        {/* 載入狀態 */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
            <span className="ml-2">載入事件資料中...</span>
          </div>
        )}

        {/* 錯誤狀態 */}
        {hasError && (
          <div className="alert alert-error max-w-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>載入事件時發生錯誤: {errorVerified?.message || errorRemoved?.message}</span>
          </div>
        )}

        {/* 事件列表 */}
        {!isLoading && !hasError && (
          <div className="w-full max-w-4xl">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-header px-6 py-4 border-b">
                <h2 className="text-2xl font-semibold">事件歷史記錄</h2>
              </div>
              <div className="card-body p-0">
                {allEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">暫無事件記錄</p>
                    <p className="text-gray-400 text-sm mt-2">
                      當有KYC驗證狀態變更時，事件將會在此顯示
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      (僅顯示最近 400 個區塊的事件，使用 toBlock 限制)
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>事件類型</th>
                          <th>用戶地址</th>
                          <th>區塊號</th>
                          <th>交易哈希</th>
                          <th>時間戳</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allEvents.map((event, index) => {
                          // 額外安全檢查
                          if (!event.args?.user) {
                            console.warn('Event missing args.user:', event);
                            return null;
                          }
                          
                          return (
                            <tr key={`${event.transactionHash}-${event.logIndex}`}>
                              <td>
                                <div className={`badge ${event.type === "verified"
                                    ? "badge-success"
                                    : "badge-warning"
                                }`}>
                                  {event.type === "verified" ? "✅ 驗證通過" : "❌ 移除驗證"}
                                </div>
                              </td>
                              <td>
                                <Address address={event.args.user} />
                              </td>
                              <td>
                                <span className="font-mono text-sm">
                                  {event.blockNumber?.toString()}
                                </span>
                              </td>
                              <td>
                                <div className="tooltip" data-tip={event.transactionHash}>
                                  <span className="font-mono text-sm text-blue-600 cursor-pointer">
                                    {event.transactionHash?.slice(0, 10)}...
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span className="text-sm text-gray-500">
                                  區塊 #{event.blockNumber?.toString()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 功能說明 */}
        <div className="alert alert-success max-w-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>✨ 現在使用增強版 useScaffoldEventHistory hook，支援 toBlock 參數來限制 eth_getLogs 請求範圍，避免超過節點服務的500區塊限制！</span>
        </div>
      </div>
    </div>
  );
};

export default Events;
