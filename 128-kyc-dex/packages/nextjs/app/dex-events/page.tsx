"use client";

import { useMemo, useState } from "react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useBlockNumber } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useBatchEventHistory } from "~~/hooks/scaffold-eth";

const DexEvents: NextPage = () => {
  const { data: currentBlockNumber } = useBlockNumber();

  // 狀態管理
  const [startBlock, setStartBlock] = useState<string>("");
  const [endBlock, setEndBlock] = useState<string>("");
  const [searchParams, setSearchParams] = useState<{
    fromBlock: bigint;
    toBlock: bigint;
  } | null>(null);

  // 搜索功能
  const handleSearch = () => {
    if (!startBlock || !endBlock) {
      alert("請輸入起始和結束區塊號");
      return;
    }

    const fromBlock = BigInt(startBlock);
    const toBlock = BigInt(endBlock);

    if (fromBlock >= toBlock) {
      alert("起始區塊號必須小於結束區塊號");
      return;
    }

    if (toBlock - fromBlock > 500n) {
      console.log(`搜索範圍超過 500 個區塊 (${toBlock - fromBlock} 個區塊)，將自動分批處理請求`);
    }

    setSearchParams({ fromBlock, toBlock });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams(null);
    setStartBlock("");
    setEndBlock("");
  };

  // 設置當前區塊作為結束區塊
  const setCurrentAsEndBlock = () => {
    if (currentBlockNumber) {
      setEndBlock(currentBlockNumber.toString());
    }
  };

  // 使用自定義的分批事件查詢
  const ethToTokenResult = useBatchEventHistory(
    "HEX",
    "EthToTokenSwap",
    searchParams?.fromBlock || 0n,
    searchParams?.toBlock || 0n,
    !!searchParams,
  );

  const tokenToEthResult = useBatchEventHistory(
    "HEX",
    "TokenToEthSwap",
    searchParams?.fromBlock || 0n,
    searchParams?.toBlock || 0n,
    !!searchParams,
  );

  const liquidityProvidedResult = useBatchEventHistory(
    "HEX",
    "LiquidityProvided",
    searchParams?.fromBlock || 0n,
    searchParams?.toBlock || 0n,
    !!searchParams,
  );

  const liquidityRemovedResult = useBatchEventHistory(
    "HEX",
    "LiquidityRemoved",
    searchParams?.fromBlock || 0n,
    searchParams?.toBlock || 0n,
    !!searchParams,
  );

  const settlementResult = useBatchEventHistory(
    "HEX",
    "SettlementExecuted",
    searchParams?.fromBlock || 0n,
    searchParams?.toBlock || 0n,
    !!searchParams,
  );

  const tradingBlockResult = useBatchEventHistory(
    "HEX",
    "TradingBlockStatusChanged",
    searchParams?.fromBlock || 0n,
    searchParams?.toBlock || 0n,
    !!searchParams,
  );

  // 統計數據
  const stats = useMemo(() => {
    return {
      ethToTokenCount: ethToTokenResult.data?.length || 0,
      tokenToEthCount: tokenToEthResult.data?.length || 0,
      liquidityProvidedCount: liquidityProvidedResult.data?.length || 0,
      liquidityRemovedCount: liquidityRemovedResult.data?.length || 0,
      settlementCount: settlementResult.data?.length || 0,
      tradingBlockCount: tradingBlockResult.data?.length || 0,
      totalCount:
        (ethToTokenResult.data?.length || 0) +
        (tokenToEthResult.data?.length || 0) +
        (liquidityProvidedResult.data?.length || 0) +
        (liquidityRemovedResult.data?.length || 0) +
        (settlementResult.data?.length || 0) +
        (tradingBlockResult.data?.length || 0),
    };
  }, [
    ethToTokenResult.data,
    tokenToEthResult.data,
    liquidityProvidedResult.data,
    liquidityRemovedResult.data,
    settlementResult.data,
    tradingBlockResult.data,
  ]);

  const isLoading =
    ethToTokenResult.isLoading ||
    tokenToEthResult.isLoading ||
    liquidityProvidedResult.isLoading ||
    liquidityRemovedResult.isLoading ||
    settlementResult.isLoading ||
    tradingBlockResult.isLoading;

  // 格式化時間
  const formatTime = (timestamp: bigint | undefined) => {
    if (!timestamp) return "未知";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // 事件表格組件
  const EventTable = ({
    events,
    title,
    columns,
    renderRow,
  }: {
    events: any[] | undefined;
    title: string;
    columns: string[];
    renderRow: (event: any, index: number) => React.ReactNode;
  }) => (
    <div className="card bg-base-100 shadow-xl mb-8">
      <div className="card-body">
        <h3 className="card-title text-xl mb-4">
          {title}
          <div className="badge badge-primary">{events?.length || 0}</div>
        </h3>
        {events && events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th key={index}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{events.map(renderRow)}</tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-base-content/70">此搜索範圍內沒有找到 {title} 事件</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* 頁面標題 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">HEX DEX 事件歷史</h1>
        <p className="text-lg text-base-content/70">監控 ETH/LPT 交易對的所有鏈上事件</p>
      </div>

      {/* 搜索控制面板 */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">事件搜索</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">起始區塊號</span>
              </label>
              <input
                type="number"
                placeholder="輸入起始區塊號"
                className="input input-bordered"
                value={startBlock}
                onChange={e => setStartBlock(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">結束區塊號</span>
              </label>
              <div className="join">
                <input
                  type="number"
                  placeholder="輸入結束區塊號"
                  className="input input-bordered join-item flex-1"
                  value={endBlock}
                  onChange={e => setEndBlock(e.target.value)}
                />
                <button className="btn btn-outline join-item" onClick={setCurrentAsEndBlock} title="使用當前區塊號">
                  最新
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">當前區塊號</span>
              </label>
              <div className="input input-bordered flex items-center">
                {currentBlockNumber?.toString() || "載入中..."}
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">搜索範圍</span>
              </label>
              <div className="input input-bordered flex items-center">
                {startBlock && endBlock ? `${BigInt(endBlock) - BigInt(startBlock)} 個區塊` : "未設定"}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              className={`btn btn-primary ${isLoading ? "loading" : ""}`}
              onClick={handleSearch}
              disabled={isLoading || !startBlock || !endBlock}
            >
              {isLoading ? "搜索中..." : "開始搜索"}
            </button>
            <button className="btn btn-outline" onClick={handleReset} disabled={isLoading}>
              重置
            </button>
          </div>

          {startBlock && endBlock && BigInt(endBlock) - BigInt(startBlock) > 500n && (
            <div className="alert alert-info mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>搜索範圍超過 500 個區塊，系統將自動分批處理請求以避免 Alchemy 限制。</span>
            </div>
          )}
        </div>
      </div>

      {/* 統計卡片 - 只有在搜索後才顯示 */}
      {searchParams && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <div className="card bg-blue-500 text-white shadow-xl">
            <div className="card-body text-center py-4">
              <h3 className="text-2xl font-bold">{stats.ethToTokenCount}</h3>
              <p className="text-sm">ETH→Token</p>
            </div>
          </div>
          <div className="card bg-green-500 text-white shadow-xl">
            <div className="card-body text-center py-4">
              <h3 className="text-2xl font-bold">{stats.tokenToEthCount}</h3>
              <p className="text-sm">Token→ETH</p>
            </div>
          </div>
          <div className="card bg-purple-500 text-white shadow-xl">
            <div className="card-body text-center py-4">
              <h3 className="text-2xl font-bold">{stats.liquidityProvidedCount}</h3>
              <p className="text-sm">提供流動性</p>
            </div>
          </div>
          <div className="card bg-orange-500 text-white shadow-xl">
            <div className="card-body text-center py-4">
              <h3 className="text-2xl font-bold">{stats.liquidityRemovedCount}</h3>
              <p className="text-sm">移除流動性</p>
            </div>
          </div>
          <div className="card bg-red-500 text-white shadow-xl">
            <div className="card-body text-center py-4">
              <h3 className="text-2xl font-bold">{stats.settlementCount}</h3>
              <p className="text-sm">結算執行</p>
            </div>
          </div>
          <div className="card bg-yellow-500 text-white shadow-xl">
            <div className="card-body text-center py-4">
              <h3 className="text-2xl font-bold">{stats.tradingBlockCount}</h3>
              <p className="text-sm">交易狀態</p>
            </div>
          </div>
          <div className="card bg-gray-600 text-white shadow-xl md:col-span-2">
            <div className="card-body text-center py-4">
              <h3 className="text-2xl font-bold">{stats.totalCount}</h3>
              <p className="text-sm">總事件數</p>
            </div>
          </div>
        </div>
      )}

      {/* 載入狀態 */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
          <span className="ml-4 text-lg">正在搜索事件...</span>
        </div>
      )}

      {/* 事件表格 - 只有在搜索後才顯示 */}
      {searchParams && !isLoading && (
        <>
          {/* ETH → Token 交換事件 */}
          <EventTable
            events={ethToTokenResult.data}
            title="ETH → Token 交換事件"
            columns={["交換者", "ETH 輸入", "Token 輸出", "區塊號", "交易哈希", "時間"]}
            renderRow={(event, index) => (
              <tr key={`eth-to-token-${event.transactionHash}-${index}`}>
                <td>
                  <Address address={event.args?.swapper} />
                </td>
                <td>{formatEther(event.args?.ethInput || 0n)} ETH</td>
                <td>{formatEther(event.args?.tokenOutput || 0n)} LPT</td>
                <td>
                  <span className="font-mono text-sm">{event.blockNumber?.toString()}</span>
                </td>
                <td>
                  <span className="font-mono text-sm">{event.transactionHash?.slice(0, 10)}...</span>
                </td>
                <td>{formatTime(event.blockData?.timestamp)}</td>
              </tr>
            )}
          />

          {/* Token → ETH 交換事件 */}
          <EventTable
            events={tokenToEthResult.data}
            title="Token → ETH 交換事件"
            columns={["交換者", "Token 輸入", "ETH 輸出", "區塊號", "交易哈希", "時間"]}
            renderRow={(event, index) => (
              <tr key={`token-to-eth-${event.transactionHash}-${index}`}>
                <td>
                  <Address address={event.args?.swapper} />
                </td>
                <td>{formatEther(event.args?.tokensInput || 0n)} LPT</td>
                <td>{formatEther(event.args?.ethOutput || 0n)} ETH</td>
                <td>
                  <span className="font-mono text-sm">{event.blockNumber?.toString()}</span>
                </td>
                <td>
                  <span className="font-mono text-sm">{event.transactionHash?.slice(0, 10)}...</span>
                </td>
                <td>{formatTime(event.blockData?.timestamp)}</td>
              </tr>
            )}
          />

          {/* 提供流動性事件 */}
          <EventTable
            events={liquidityProvidedResult.data}
            title="提供流動性事件"
            columns={["提供者", "鑄造流動性", "ETH 輸入", "Token 輸入", "區塊號", "交易哈希", "時間"]}
            renderRow={(event, index) => (
              <tr key={`liquidity-provided-${event.transactionHash}-${index}`}>
                <td>
                  <Address address={event.args?.provider} />
                </td>
                <td>{formatEther(event.args?.liquidityMinted || 0n)}</td>
                <td>{formatEther(event.args?.ethInput || 0n)} ETH</td>
                <td>{formatEther(event.args?.tokensInput || 0n)} LPT</td>
                <td>
                  <span className="font-mono text-sm">{event.blockNumber?.toString()}</span>
                </td>
                <td>
                  <span className="font-mono text-sm">{event.transactionHash?.slice(0, 10)}...</span>
                </td>
                <td>{formatTime(event.blockData?.timestamp)}</td>
              </tr>
            )}
          />

          {/* 移除流動性事件 */}
          <EventTable
            events={liquidityRemovedResult.data}
            title="移除流動性事件"
            columns={["移除者", "流動性提取", "Token 輸出", "ETH 輸出", "區塊號", "交易哈希", "時間"]}
            renderRow={(event, index) => (
              <tr key={`liquidity-removed-${event.transactionHash}-${index}`}>
                <td>
                  <Address address={event.args?.remover} />
                </td>
                <td>{formatEther(event.args?.liquidityWithdrawn || 0n)}</td>
                <td>{formatEther(event.args?.tokensOutput || 0n)} LPT</td>
                <td>{formatEther(event.args?.ethOutput || 0n)} ETH</td>
                <td>
                  <span className="font-mono text-sm">{event.blockNumber?.toString()}</span>
                </td>
                <td>
                  <span className="font-mono text-sm">{event.transactionHash?.slice(0, 10)}...</span>
                </td>
                <td>{formatTime(event.blockData?.timestamp)}</td>
              </tr>
            )}
          />

          {/* 結算執行事件 */}
          <EventTable
            events={settlementResult.data}
            title="結算執行事件"
            columns={["受益人", "ETH 提取", "Token 提取", "區塊號", "交易哈希", "時間"]}
            renderRow={(event, index) => (
              <tr key={`settlement-${event.transactionHash}-${index}`}>
                <td>
                  <Address address={event.args?.beneficiary} />
                </td>
                <td>{formatEther(event.args?.ethWithdrawn || 0n)} ETH</td>
                <td>{formatEther(event.args?.tokenWithdrawn || 0n)} LPT</td>
                <td>
                  <span className="font-mono text-sm">{event.blockNumber?.toString()}</span>
                </td>
                <td>
                  <span className="font-mono text-sm">{event.transactionHash?.slice(0, 10)}...</span>
                </td>
                <td>{formatTime(event.blockData?.timestamp)}</td>
              </tr>
            )}
          />

          {/* 交易狀態變更事件 */}
          <EventTable
            events={tradingBlockResult.data}
            title="交易狀態變更事件"
            columns={["擁有者", "狀態", "區塊號", "交易哈希", "時間"]}
            renderRow={(event, index) => (
              <tr key={`trading-block-${event.transactionHash}-${index}`}>
                <td>
                  <Address address={event.args?.owner} />
                </td>
                <td>
                  <div className={`badge ${event.args?.isBlocked ? "badge-error" : "badge-success"}`}>
                    {event.args?.isBlocked ? "已阻止" : "已解除"}
                  </div>
                </td>
                <td>
                  <span className="font-mono text-sm">{event.blockNumber?.toString()}</span>
                </td>
                <td>
                  <span className="font-mono text-sm">{event.transactionHash?.slice(0, 10)}...</span>
                </td>
                <td>{formatTime(event.blockData?.timestamp)}</td>
              </tr>
            )}
          />
        </>
      )}

      {/* 初始狀態提示 */}
      {!searchParams && !isLoading && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center py-12">
            <h3 className="text-2xl font-bold mb-4">準備搜索 HEX DEX 事件</h3>
            <p className="text-base-content/70 mb-6">
              請在上方輸入要搜索的區塊範圍，然後點擊&ldquo;開始搜索&rdquo;來查看事件歷史記錄。
            </p>
            <div className="text-sm text-base-content/50">
              <p>💡 提示：系統會自動處理超過 500 個區塊的搜索請求，將其分批處理以避免 Alchemy 限制。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DexEvents;
