import { useCallback, useEffect, useState } from "react";
import { AbiEvent } from "abitype";
import { usePublicClient } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { AllowedChainIds } from "~~/utils/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

export interface BatchEventHistoryResult {
  data: any[] | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * 自定義的分批事件查詢 hook
 * 專門用於處理超過 500 個區塊的大範圍事件查詢，自動分批處理以避免 Alchemy 限制
 *
 * @param contractName - 合約名稱
 * @param eventName - 事件名稱
 * @param fromBlock - 起始區塊號
 * @param toBlock - 結束區塊號
 * @param enabled - 是否啟用查詢
 * @param chainId - 可選的鏈 ID
 * @returns 包含事件數據、載入狀態、錯誤信息和重新查詢函數的對象
 */
export const useBatchEventHistory = (
  contractName: ContractName,
  eventName: string,
  fromBlock: bigint,
  toBlock: bigint,
  enabled: boolean,
  chainId?: AllowedChainIds,
): BatchEventHistoryResult => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { data: deployedContractData } = useDeployedContractInfo({
    contractName,
    chainId,
  });

  const fetchEvents = useCallback(async () => {
    if (!enabled || !deployedContractData || !publicClient || fromBlock > toBlock) return;

    setIsLoading(true);
    setError(null);
    setEvents([]);

    try {
      const event = deployedContractData.abi.find(
        (item: any) => item.type === "event" && item.name === eventName,
      ) as AbiEvent;

      if (!event) {
        throw new Error(`Event ${eventName} not found in contract ABI`);
      }

      const BATCH_SIZE = 500n;
      const allEvents: any[] = [];
      const blockRange = toBlock - fromBlock + 1n;

      console.log(`Starting batch event query for ${eventName}: ${blockRange} blocks (${fromBlock} to ${toBlock})`);

      let currentFrom = fromBlock;
      let batchCount = 0;

      while (currentFrom <= toBlock) {
        const currentTo = currentFrom + BATCH_SIZE - 1n > toBlock ? toBlock : currentFrom + BATCH_SIZE - 1n;
        batchCount++;

        console.log(`Batch ${batchCount}: Fetching ${eventName} events from block ${currentFrom} to ${currentTo}`);

        try {
          const logs = await publicClient.getLogs({
            address: deployedContractData.address,
            event,
            fromBlock: currentFrom,
            toBlock: currentTo,
          });

          if (logs && logs.length > 0) {
            console.log(`Batch ${batchCount}: Found ${logs.length} ${eventName} events`);

            // 獲取區塊和交易數據
            const eventsWithData = await Promise.all(
              logs.map(async log => {
                const [blockData, transactionData] = await Promise.all([
                  log.blockHash ? publicClient.getBlock({ blockHash: log.blockHash }) : null,
                  log.transactionHash ? publicClient.getTransaction({ hash: log.transactionHash }) : null,
                ]);

                return {
                  ...log,
                  blockData,
                  transactionData,
                };
              }),
            );

            allEvents.push(...eventsWithData);
          } else {
            console.log(`Batch ${batchCount}: No ${eventName} events found in this range`);
          }
        } catch (batchError) {
          console.error(`Error fetching batch ${batchCount} (${currentFrom}-${currentTo}):`, batchError);
          // 繼續處理下一批，不要因為單個批次失敗而停止
        }

        currentFrom = currentTo + 1n;

        // 小延遲避免過於頻繁的請求（避免 rate limiting）
        if (currentFrom <= toBlock) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Completed batch query for ${eventName}: ${allEvents.length} total events found`);

      // 按區塊號排序，最新的在前面
      const sortedEvents = allEvents.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));
      setEvents(sortedEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error(`Error fetching ${eventName} events:`, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, deployedContractData, publicClient, eventName, fromBlock, toBlock]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    data: events.length > 0 ? events : undefined,
    isLoading,
    error,
    refetch: fetchEvents,
  };
};
