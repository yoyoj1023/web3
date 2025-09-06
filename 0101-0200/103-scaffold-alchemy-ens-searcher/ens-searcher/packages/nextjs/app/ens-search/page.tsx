"use client";

import { useState } from "react";
import { NextPage } from "next";
import { Address, InputBase } from "~~/components/scaffold-alchemy";
import { MagnifyingGlassIcon, GlobeAltIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { formatEther } from "viem";
import { useNetworkSwitcher, SupportedNetwork } from "~~/hooks/scaffold-alchemy/useNetworkSwitcher";
import { useENSResolver } from "~~/hooks/scaffold-alchemy/useENSResolver";

const ENSSearch: NextPage = () => {
  const [ensName, setEnsName] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  
  const { 
    selectedNetwork, 
    alchemyClient, 
    switchNetwork, 
    getCurrentNetworkConfig, 
    networkConfigs 
  } = useNetworkSwitcher();

  const {
    resolveENS,
    loading,
    error,
    result: searchResult,
    setError
  } = useENSResolver();

  const checkApiKey = () => {
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!apiKey || apiKey === "") {
      return false;
    }
    return true;
  };

  const handleSearch = async () => {
    if (!ensName.trim()) {
      setError("請輸入 ENS 名稱");
      return;
    }

    setDebugInfo(`🔍 正在 ${getCurrentNetworkConfig().name} 上搜尋 "${ensName}"...`);
    
    const result = await resolveENS(ensName, selectedNetwork);
    
    if (result) {
      setDebugInfo(`✅ 搜尋完成！在 ${getCurrentNetworkConfig().name} 上找到 "${ensName}"`);
    } else if (!error) {
      setDebugInfo("💡 提示：ENS 主要在以太坊主網上註冊，如果在測試網搜尋失敗，請嘗試切換到主網");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const testAlchemyConnection = async () => {
    if (!alchemyClient) {
      setError("Alchemy 客戶端未初始化");
      return;
    }

    setDebugInfo("🧪 測試 Alchemy 連接...");
    try {
      const blockNumber = await alchemyClient.core.getBlockNumber();
      setDebugInfo(`✅ Alchemy 連接正常！當前區塊號: ${blockNumber}`);
      setError("");
    } catch (err: any) {
      setError(`❌ Alchemy 連接失敗: ${err.message}`);
      setDebugInfo("請檢查您的 API Key 設定");
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
          <h1 className="text-4xl font-bold text-center mb-8">ENS 搜尋器</h1>
        </div>

        {/* API Key 狀態檢查 */}
        {!checkApiKey() && (
          <div className="alert alert-warning mb-8">
            <ExclamationTriangleIcon className="h-6 w-6" />
            <div>
              <h3 className="font-bold">需要設置 Alchemy API Key！</h3>
              <div className="text-xs">
                請在專案根目錄創建 <code>.env.local</code> 檔案並添加：<br/>
                <code>NEXT_PUBLIC_ALCHEMY_API_KEY=your_api_key_here</code>
              </div>
            </div>
          </div>
        )}

        {/* 網路選擇 */}
        <div className="card w-full bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <GlobeAltIcon className="h-6 w-6" />
              選擇網路
            </h2>
            <div className="form-control w-full max-w-xs">
              <select 
                className="select select-bordered w-full max-w-xs"
                value={selectedNetwork}
                onChange={(e) => {
                  switchNetwork(e.target.value as SupportedNetwork);
                  setError("");
                  setDebugInfo("");
                }}
              >
                {Object.entries(networkConfigs).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.name}
                  </option>
                ))}
              </select>
              <div className="label">
                <span className="label-text-alt">
                  {selectedNetwork === "mainnet" ? "✅ 推薦：大多數 ENS 記錄在主網上" : "⚠️ 測試網上的 ENS 記錄較少"}
                </span>
              </div>
            </div>
            
            {/* 測試連接按鈕 */}
            <div className="mt-4">
              <button 
                className="btn btn-outline btn-sm"
                onClick={testAlchemyConnection}
                disabled={!alchemyClient}
              >
                🧪 測試 Alchemy 連接
              </button>
            </div>
          </div>
        </div>

        {/* 搜尋區域 */}
        <div className="card w-full bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <MagnifyingGlassIcon className="h-6 w-6" />
              ENS 搜尋
            </h2>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">輸入 ENS 名稱 (例如: vitalik.eth)</span>
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <InputBase
                    name="ensName"
                    value={ensName}
                    onChange={setEnsName}
                    placeholder="輸入 ENS 名稱..."
                  />
                </div>
                <button 
                  className={`btn btn-primary ${loading ? "loading" : ""}`}
                  onClick={handleSearch}
                  disabled={loading || !alchemyClient}
                >
                  {loading ? "搜尋中..." : "搜尋"}
                </button>
              </div>
              <div className="label">
                <span className="label-text-alt">💡 支援 .eth 域名搜尋</span>
              </div>
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <div className="alert alert-error mt-4">
                <span>{error}</span>
              </div>
            )}

            {/* 除錯資訊 */}
            {debugInfo && (
              <div className="alert alert-info mt-4">
                <span>{debugInfo}</span>
              </div>
            )}
          </div>
        </div>

        {/* 搜尋結果 */}
        {searchResult && (
          <div className="card w-full bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">🎉 搜尋結果</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-base-content/70">ENS 名稱</label>
                    <div className="text-lg font-mono bg-base-200 p-3 rounded-lg">
                      {searchResult.ensName}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-base-content/70">地址</label>
                    <div className="bg-base-200 p-3 rounded-lg">
                      <Address address={searchResult.address} format="long" />
                    </div>
                  </div>

                  {searchResult.reverseEns && (
                    <div>
                      <label className="text-sm font-semibold text-base-content/70">反向 ENS</label>
                      <div className="text-lg font-mono bg-base-200 p-3 rounded-lg">
                        {searchResult.reverseEns}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-base-content/70">ETH 餘額</label>
                    <div className="text-lg font-mono bg-base-200 p-3 rounded-lg">
                      {parseFloat(searchResult.balance).toFixed(6)} ETH
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-base-content/70">交易次數</label>
                    <div className="text-lg font-mono bg-base-200 p-3 rounded-lg">
                      {searchResult.transactionCount}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-base-content/70">查詢網路</label>
                    <div className="text-lg bg-base-200 p-3 rounded-lg">
                      {networkConfigs[searchResult.network as SupportedNetwork]?.name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="divider">額外功能</div>
              
              <div className="flex gap-4 flex-wrap">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const currentConfig = getCurrentNetworkConfig();
                    window.open(`${currentConfig.explorerUrl}/address/${searchResult.address}`, '_blank');
                  }}
                >
                  🔗 在區塊瀏覽器查看
                </button>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => navigator.clipboard.writeText(searchResult.address)}
                >
                  📋 複製地址
                </button>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => navigator.clipboard.writeText(searchResult.ensName)}
                >
                  📋 複製 ENS 名稱
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ENSSearch;
