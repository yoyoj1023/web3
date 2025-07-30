"use client";

import { useMemo, useState } from "react";
import type { NextPage } from "next";
import { useBlockNumber } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Events: NextPage = () => {
  const { data: currentBlockNumber } = useBlockNumber();
  const [blocksToShow, setBlocksToShow] = useState(400);

  // 計算 fromBlock，確保不會是負數
  const fromBlock = useMemo(() => {
    if (!currentBlockNumber) return 0n;
    const calculatedFromBlock = currentBlockNumber - BigInt(blocksToShow);
    return calculatedFromBlock < 0n ? 0n : calculatedFromBlock;
  }, [currentBlockNumber, blocksToShow]);

  // 獲取用戶驗證事件
  const {
    data: verifiedEvents,
    isLoading: isLoadingVerified,
    isFetchingNewEvent: isFetchingVerified,
  } = useScaffoldEventHistory({
    contractName: "KYCRegistry",
    eventName: "UserVerified",
    fromBlock,
    toBlock: currentBlockNumber,
    watch: true,
    blockData: true,
    transactionData: true,
  });

  // 獲取用戶移除驗證事件
  const {
    data: removedEvents,
    isLoading: isLoadingRemoved,
    isFetchingNewEvent: isFetchingRemoved,
  } = useScaffoldEventHistory({
    contractName: "KYCRegistry",
    eventName: "UserVerificationRemoved",
    fromBlock,
    toBlock: currentBlockNumber,
    watch: true,
    blockData: true,
    transactionData: true,
  });

  // 合併和排序所有事件
  const allEvents = useMemo(() => {
    const verified = (verifiedEvents || []).map(event => ({
      ...event,
      eventType: "verified" as const,
    }));
    const removed = (removedEvents || []).map(event => ({
      ...event,
      eventType: "removed" as const,
    }));

    return [...verified, ...removed].sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));
  }, [verifiedEvents, removedEvents]);

  // 統計數據
  const stats = useMemo(() => {
    const verifiedCount = verifiedEvents?.length || 0;
    const removedCount = removedEvents?.length || 0;
    const totalCount = verifiedCount + removedCount;

    return { verifiedCount, removedCount, totalCount };
  }, [verifiedEvents, removedEvents]);

  const handleLoadMore = () => {
    setBlocksToShow(prev => prev + 400);
  };

  const formatTime = (timestamp: bigint | undefined) => {
    if (!timestamp) return "未知";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("zh-TW");
  };

  const isLoading = isLoadingVerified || isLoadingRemoved;
  const isFetching = isFetchingVerified || isFetchingRemoved;

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">KYC 註冊表事件歷史</h1>
          <p className="text-lg text-base-content/70">監控 KYC 驗證狀態變更的即時事件記錄</p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 用戶驗證事件 */}
          <div className="card bg-blue-400 text-white shadow-xl">
            <div className="card-body text-center">
              <h2 className="text-6xl font-bold">{stats.verifiedCount}</h2>
              <p className="text-xl">用戶驗證事件</p>
            </div>
          </div>

          {/* 驗證移除事件 */}
          <div className="card bg-blue-300 text-white shadow-xl">
            <div className="card-body text-center">
              <h2 className="text-6xl font-bold">{stats.removedCount}</h2>
              <p className="text-xl">驗證移除事件</p>
            </div>
          </div>

          {/* 總事件數 */}
          <div className="card bg-blue-500 text-white shadow-xl">
            <div className="card-body text-center">
              <h2 className="text-6xl font-bold">{stats.totalCount}</h2>
              <p className="text-xl">總事件數</p>
            </div>
          </div>
        </div>

        {/* 事件歷史記錄 */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">事件歷史記錄</h2>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>事件類型</th>
                        <th>用戶地址</th>
                        <th>區塊號</th>
                        <th>交易哈希</th>
                        <th>時間</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allEvents.map((event, index) => (
                        <tr key={`${event.transactionHash}-${index}`}>
                          <td>
                            {event.eventType === "verified" ? (
                              <div className="badge badge-success gap-2">✓ 驗證通過</div>
                            ) : (
                              <div className="badge badge-error gap-2">✗ 移除驗證</div>
                            )}
                          </td>
                          <td>
                            <Address address={event.args?.user} />
                          </td>
                          <td>
                            <span className="font-mono text-sm">{event.blockNumber?.toString()}</span>
                          </td>
                          <td>
                            <span className="font-mono text-sm">{event.transactionHash?.slice(0, 10)}...</span>
                          </td>
                          <td>{formatTime((event as any).blockData?.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {allEvents.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <p className="text-lg text-base-content/70">尚無事件記錄</p>
                  </div>
                )}

                {/* 加載更多按鈕 */}
                {allEvents.length > 0 && (
                  <div className="text-center mt-6">
                    <button
                      className={`btn btn-primary ${isFetching ? "loading" : ""}`}
                      onClick={handleLoadMore}
                      disabled={isFetching}
                    >
                      {isFetching ? "載入中..." : "載入更多歷史記錄"}
                    </button>
                    <p className="text-sm text-base-content/70 mt-2">目前顯示最近 {blocksToShow} 個區塊的事件</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
