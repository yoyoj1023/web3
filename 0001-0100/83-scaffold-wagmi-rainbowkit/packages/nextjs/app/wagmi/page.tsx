"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { parseEther, formatEther } from "viem";
import { 
  useAccount, 
  useBalance, 
  useBlockNumber, 
  useChainId, 
  useConnect, 
  useDisconnect,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useReadContract,
  useWriteContract
} from "wagmi";
import { 
  useScaffoldReadContract, 
  useScaffoldWriteContract,
  useScaffoldContract
} from "~~/hooks/scaffold-eth";
import { Address, AddressInput, EtherInput } from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const WagmiLearning: NextPage = () => {
  const [sendToAddress, setSendToAddress] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");
  const [greetingMessage, setGreetingMessage] = useState<string>("");

  // 1. 基礎錢包連接功能
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // 2. 讀取區塊鏈基本信息
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber();
  const { data: balance } = useBalance({
    address: address,
  });

  // 3. 發送交易
  const { 
    data: sendTxHash, 
    sendTransaction, 
    isPending: isSendPending,
    error: sendError 
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: sendTxHash,
  });

  // 4. 使用 Scaffold-ETH 的智能合約 hooks
  const { data: contractGreeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
  });

  const { writeContractAsync: writeYourContract } = useScaffoldWriteContract("YourContract");

  // 處理發送 ETH
  const handleSendETH = async () => {
    if (!sendToAddress || !sendAmount) {
      notification.error("請填入地址和金額");
      return;
    }

    try {
      sendTransaction({
        to: sendToAddress as `0x${string}`,
        value: parseEther(sendAmount),
      });
    } catch (error) {
      console.error("發送交易失敗:", error);
      notification.error("發送交易失敗");
    }
  };

  // 處理智能合約寫入
  const handleSetGreeting = async () => {
    if (!greetingMessage) {
      notification.error("請輸入問候語");
      return;
    }

    try {
      await writeYourContract({
        functionName: "setGreeting",
        args: [greetingMessage],
      });
      notification.success("問候語更新成功！");
      setGreetingMessage("");
    } catch (error) {
      console.error("更新問候語失敗:", error);
      notification.error("更新問候語失敗");
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10 px-4">
      <div className="max-w-6xl w-full">
        <h1 className="text-center text-4xl font-bold mb-8">
          Wagmi 學習指南
        </h1>

        {/* 錢包連接狀態 */}
        <div className="bg-base-200 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">1. 錢包連接基礎</h2>
          
          {!isConnected ? (
            <div>
              <p className="mb-4">請先連接您的錢包：</p>
              <div className="flex flex-wrap gap-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    disabled={isPending}
                    className="btn btn-primary"
                  >
                    {connector.name}
                    {isPending && " (連接中...)"}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>連接狀態：</strong> ✅ 已連接</p>
              <p><strong>錢包地址：</strong> <Address address={address} /></p>
              <p><strong>網路 ID：</strong> {chainId}</p>
              <p><strong>當前區塊：</strong> {blockNumber?.toString()}</p>
              <p><strong>ETH 餘額：</strong> {balance ? `${formatEther(balance.value)} ETH` : "載入中..."}</p>
              <button onClick={() => disconnect()} className="btn btn-secondary mt-2">
                斷開連接
              </button>
            </div>
          )}
        </div>

        {isConnected && (
          <>
            {/* ETH 轉帳功能 */}
            <div className="bg-base-200 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">2. 發送 ETH 交易</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">接收地址：</label>
                  <AddressInput
                    placeholder="輸入接收地址"
                    value={sendToAddress}
                    onChange={setSendToAddress}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">金額 (ETH)：</label>
                  <EtherInput
                    placeholder="輸入金額"
                    value={sendAmount}
                    onChange={setSendAmount}
                  />
                </div>

                <button 
                  onClick={handleSendETH}
                  disabled={isSendPending || isConfirming}
                  className="btn btn-primary"
                >
                  {isSendPending ? "發送中..." : isConfirming ? "確認中..." : "發送 ETH"}
                </button>

                {sendTxHash && (
                  <div className="mt-4 p-4 bg-info/20 rounded-lg">
                    <p><strong>交易哈希：</strong> {sendTxHash}</p>
                    <p><strong>狀態：</strong> {isConfirming ? "確認中..." : isConfirmed ? "✅ 成功" : "處理中..."}</p>
                  </div>
                )}

                {sendError && (
                  <div className="mt-4 p-4 bg-error/20 rounded-lg">
                    <p><strong>錯誤：</strong> {sendError.message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 智能合約互動 */}
            <div className="bg-base-200 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">3. 智能合約互動</h2>
              
              <div className="space-y-4">
                <div className="bg-base-300 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">讀取合約數據</h3>
                  <p><strong>當前問候語：</strong> {contractGreeting || "載入中..."}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    使用 <code>useScaffoldReadContract</code> 讀取智能合約的狀態
                  </p>
                </div>

                <div className="bg-base-300 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">寫入合約數據</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="輸入新的問候語"
                      value={greetingMessage}
                      onChange={(e) => setGreetingMessage(e.target.value)}
                      className="input input-bordered w-full"
                    />
                    <button 
                      onClick={handleSetGreeting}
                      className="btn btn-primary"
                      disabled={!greetingMessage}
                    >
                      更新問候語
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    使用 <code>useScaffoldWriteContract</code> 寫入智能合約
                  </p>
                </div>
              </div>
            </div>

            {/* Wagmi Hooks 說明 */}
            <div className="bg-base-200 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Wagmi Hooks 介紹</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-base-300 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">基礎 Hooks</h3>
                  <ul className="text-sm space-y-1">
                    <li><code>useAccount()</code> - 獲取錢包連接狀態和地址</li>
                    <li><code>useBalance()</code> - 獲取地址餘額</li>
                    <li><code>useChainId()</code> - 獲取當前網路 ID</li>
                    <li><code>useBlockNumber()</code> - 獲取最新區塊號</li>
                  </ul>
                </div>

                <div className="bg-base-300 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">交易 Hooks</h3>
                  <ul className="text-sm space-y-1">
                    <li><code>useSendTransaction()</code> - 發送 ETH 交易</li>
                    <li><code>useWaitForTransactionReceipt()</code> - 等待交易確認</li>
                    <li><code>useReadContract()</code> - 讀取智能合約</li>
                    <li><code>useWriteContract()</code> - 寫入智能合約</li>
                  </ul>
                </div>

                <div className="bg-base-300 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Scaffold-ETH Hooks</h3>
                  <ul className="text-sm space-y-1">
                    <li><code>useScaffoldReadContract()</code> - 便捷讀取合約</li>
                    <li><code>useScaffoldWriteContract()</code> - 便捷寫入合約</li>
                    <li><code>useScaffoldContract()</code> - 獲取合約實例</li>
                    <li><code>useScaffoldWatchContractEvent()</code> - 監聽合約事件</li>
                  </ul>
                </div>

                <div className="bg-base-300 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">連接 Hooks</h3>
                  <ul className="text-sm space-y-1">
                    <li><code>useConnect()</code> - 連接錢包</li>
                    <li><code>useDisconnect()</code> - 斷開錢包連接</li>
                    <li><code>useConnectors()</code> - 獲取可用連接器</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 學習提示 */}
            <div className="bg-primary/10 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">💡 學習提示</h2>
              
              <div className="space-y-3 text-sm">
                <p><strong>1. 狀態管理：</strong> Wagmi 自動管理連接狀態、交易狀態等，無需手動處理</p>
                <p><strong>2. 類型安全：</strong> Wagmi 提供完整的 TypeScript 支持，減少開發錯誤</p>
                <p><strong>3. 緩存機制：</strong> Wagmi 內建智能緩存，避免重複的網路請求</p>
                <p><strong>4. 錯誤處理：</strong> 每個 hook 都提供 error 狀態，方便錯誤處理</p>
                <p><strong>5. Scaffold-ETH 整合：</strong> 使用 Scaffold hooks 可以更簡單地與部署的合約互動</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WagmiLearning;
