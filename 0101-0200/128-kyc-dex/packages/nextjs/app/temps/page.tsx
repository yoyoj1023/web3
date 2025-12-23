"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const BLOCK_RANGE_LIMIT = 500; // Alchemy 的單次查詢限制

const DEXEventsPage = () => {
  const [fromBlock, setFromBlock] = useState<string>("");
  const [toBlock, setToBlock] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState<{
    fromBlock: bigint;
    toBlock: bigint;
  } | null>(null);

  // 各事件的查詢 hooks
  const ethToTokenEvents = useScaffoldEventHistory({
    contractName: "HEX",
    eventName: "EthToTokenSwap",
    fromBlock: searchParams?.fromBlock || 0n,
    toBlock: searchParams?.toBlock,
    enabled: !!searchParams,
    blockData: true,
  });

  const tokenToEthEvents = useScaffoldEventHistory({
    contractName: "HEX",
    eventName: "TokenToEthSwap",
    fromBlock: searchParams?.fromBlock || 0n,
    toBlock: searchParams?.toBlock,
    enabled: !!searchParams,
    blockData: true,
  });

  const liquidityProvidedEvents = useScaffoldEventHistory({
    contractName: "HEX",
    eventName: "LiquidityProvided",
    fromBlock: searchParams?.fromBlock || 0n,
    toBlock: searchParams?.toBlock,
    enabled: !!searchParams,
    blockData: true,
  });

  const liquidityRemovedEvents = useScaffoldEventHistory({
    contractName: "HEX",
    eventName: "LiquidityRemoved",
    fromBlock: searchParams?.fromBlock || 0n,
    toBlock: searchParams?.toBlock,
    enabled: !!searchParams,
    blockData: true,
  });

  const settlementEvents = useScaffoldEventHistory({
    contractName: "HEX",
    eventName: "SettlementExecuted",
    fromBlock: searchParams?.fromBlock || 0n,
    toBlock: searchParams?.toBlock,
    enabled: !!searchParams,
    blockData: true,
  });

  const tradingBlockEvents = useScaffoldEventHistory({
    contractName: "HEX",
    eventName: "TradingBlockStatusChanged",
    fromBlock: searchParams?.fromBlock || 0n,
    toBlock: searchParams?.toBlock,
    enabled: !!searchParams,
    blockData: true,
  });

  const handleSearch = () => {
    if (!fromBlock || !toBlock) {
      alert("請輸入起始和結束區塊號");
      return;
    }

    const from = BigInt(fromBlock);
    const to = BigInt(toBlock);

    if (from >= to) {
      alert("起始區塊號必須小於結束區塊號");
      return;
    }

    if (to - from > BigInt(BLOCK_RANGE_LIMIT)) {
      alert(`區塊範圍不能超過 ${BLOCK_RANGE_LIMIT} 個區塊`);
      return;
    }

    setIsSearching(true);
    setSearchParams({ fromBlock: from, toBlock: to });
  };

  const resetSearch = () => {
    setSearchParams(null);
    setFromBlock("");
    setToBlock("");
    setIsSearching(false);
  };

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString("zh-TW");
  };

  const EventTable = ({
    title,
    events,
    isLoading,
    columns,
  }: {
    title: string;
    events: any[];
    isLoading: boolean;
    columns: { key: string; label: string; render?: (event: any) => React.ReactNode }[];
  }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-primary">{title}</h2>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>區塊號</th>
              <th>交易雜湊</th>
              <th>時間戳</th>
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3 + columns.length} className="text-center">
                  <span className="loading loading-spinner loading-md"></span>
                  載入中...
                </td>
              </tr>
            ) : events?.length === 0 ? (
              <tr>
                <td colSpan={3 + columns.length} className="text-center text-gray-500">
                  在此區塊範圍內未發現 {title} 事件
                </td>
              </tr>
            ) : (
              events?.map((event, index) => (
                <tr key={index}>
                  <td>{event.blockNumber?.toString()}</td>
                  <td>
                    <code className="text-xs">{event.transactionHash?.slice(0, 10)}...</code>
                  </td>
                  <td className="text-sm">
                    {event.blockData?.timestamp ? formatTimestamp(event.blockData.timestamp) : "N/A"}
                  </td>
                  {columns.map(col => (
                    <td key={col.key}>{col.render ? col.render(event) : event.args?.[col.key]?.toString()}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-center">🔍 HEX DEX 事件追蹤器</h1>

        {/* 搜尋控制區 */}
        <div className="card w-full max-w-md bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">設定搜尋範圍</h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text">起始區塊號</span>
              </label>
              <input
                type="number"
                placeholder="例如: 1000000"
                className="input input-bordered"
                value={fromBlock}
                onChange={e => setFromBlock(e.target.value)}
                disabled={isSearching}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">結束區塊號</span>
              </label>
              <input
                type="number"
                placeholder="例如: 1001000"
                className="input input-bordered"
                value={toBlock}
                onChange={e => setToBlock(e.target.value)}
                disabled={isSearching}
              />
            </div>

            <div className="alert alert-info">
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
              <div>
                <div className="text-xs">由於 Alchemy 限制，單次搜尋範圍不能超過 {BLOCK_RANGE_LIMIT} 個區塊</div>
              </div>
            </div>

            <div className="card-actions justify-end">
              {!searchParams ? (
                <button className="btn btn-primary" onClick={handleSearch} disabled={!fromBlock || !toBlock}>
                  開始搜尋
                </button>
              ) : (
                <button className="btn btn-ghost" onClick={resetSearch}>
                  重新搜尋
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 事件表格區 */}
        {searchParams && (
          <div className="w-full">
            <div className="alert alert-success mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                正在搜尋區塊 {searchParams.fromBlock.toString()} 到 {searchParams.toBlock.toString()} 的事件
              </span>
            </div>

            {/* ETH to Token 交換事件 */}
            <EventTable
              title="💱 ETH 兌換 LPT 事件"
              events={ethToTokenEvents.data || []}
              isLoading={ethToTokenEvents.isLoading}
              columns={[
                {
                  key: "swapper",
                  label: "交換者",
                  render: event => <Address address={event.args?.swapper} />,
                },
                {
                  key: "ethInput",
                  label: "ETH 輸入",
                  render: event => `${formatEther(event.args?.ethInput || 0n)} ETH`,
                },
                {
                  key: "tokenOutput",
                  label: "LPT 輸出",
                  render: event => `${formatEther(event.args?.tokenOutput || 0n)} LPT`,
                },
              ]}
            />

            {/* Token to ETH 交換事件 */}
            <EventTable
              title="💰 LPT 兌換 ETH 事件"
              events={tokenToEthEvents.data || []}
              isLoading={tokenToEthEvents.isLoading}
              columns={[
                {
                  key: "swapper",
                  label: "交換者",
                  render: event => <Address address={event.args?.swapper} />,
                },
                {
                  key: "tokensInput",
                  label: "LPT 輸入",
                  render: event => `${formatEther(event.args?.tokensInput || 0n)} LPT`,
                },
                {
                  key: "ethOutput",
                  label: "ETH 輸出",
                  render: event => `${formatEther(event.args?.ethOutput || 0n)} ETH`,
                },
              ]}
            />

            {/* 流動性提供事件 */}
            <EventTable
              title="➕ 流動性提供事件"
              events={liquidityProvidedEvents.data || []}
              isLoading={liquidityProvidedEvents.isLoading}
              columns={[
                {
                  key: "provider",
                  label: "提供者",
                  render: event => <Address address={event.args?.provider} />,
                },
                {
                  key: "ethInput",
                  label: "ETH 輸入",
                  render: event => `${formatEther(event.args?.ethInput || 0n)} ETH`,
                },
                {
                  key: "tokensInput",
                  label: "LPT 輸入",
                  render: event => `${formatEther(event.args?.tokensInput || 0n)} LPT`,
                },
                {
                  key: "liquidityMinted",
                  label: "鑄造流動性",
                  render: event => `${formatEther(event.args?.liquidityMinted || 0n)}`,
                },
              ]}
            />

            {/* 流動性移除事件 */}
            <EventTable
              title="➖ 流動性移除事件"
              events={liquidityRemovedEvents.data || []}
              isLoading={liquidityRemovedEvents.isLoading}
              columns={[
                {
                  key: "remover",
                  label: "移除者",
                  render: event => <Address address={event.args?.remover} />,
                },
                {
                  key: "liquidityWithdrawn",
                  label: "提取流動性",
                  render: event => `${formatEther(event.args?.liquidityWithdrawn || 0n)}`,
                },
                {
                  key: "ethOutput",
                  label: "ETH 輸出",
                  render: event => `${formatEther(event.args?.ethOutput || 0n)} ETH`,
                },
                {
                  key: "tokensOutput",
                  label: "LPT 輸出",
                  render: event => `${formatEther(event.args?.tokensOutput || 0n)} LPT`,
                },
              ]}
            />

            {/* 結算執行事件 */}
            <EventTable
              title="⚡ 結算執行事件"
              events={settlementEvents.data || []}
              isLoading={settlementEvents.isLoading}
              columns={[
                {
                  key: "beneficiary",
                  label: "受益人",
                  render: event => <Address address={event.args?.beneficiary} />,
                },
                {
                  key: "ethWithdrawn",
                  label: "提取 ETH",
                  render: event => `${formatEther(event.args?.ethWithdrawn || 0n)} ETH`,
                },
                {
                  key: "tokenWithdrawn",
                  label: "提取 LPT",
                  render: event => `${formatEther(event.args?.tokenWithdrawn || 0n)} LPT`,
                },
              ]}
            />

            {/* 交易阻止狀態變更事件 */}
            <EventTable
              title="🚫 交易狀態變更事件"
              events={tradingBlockEvents.data || []}
              isLoading={tradingBlockEvents.isLoading}
              columns={[
                {
                  key: "owner",
                  label: "操作者",
                  render: event => <Address address={event.args?.owner} />,
                },
                {
                  key: "isBlocked",
                  label: "交易狀態",
                  render: event => (
                    <span className={`badge ${event.args?.isBlocked ? "badge-error" : "badge-success"}`}>
                      {event.args?.isBlocked ? "已阻止" : "已允許"}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DEXEventsPage;
