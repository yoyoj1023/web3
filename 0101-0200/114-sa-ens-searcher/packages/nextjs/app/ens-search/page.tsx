"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { Address as AddressType, isAddress } from "viem";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { MagnifyingGlassIcon, UserIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput, Balance } from "~~/components/scaffold-alchemy";

const ENSSearch: NextPage = () => {
  const [ensInput, setEnsInput] = useState<string>("");
  const [searchedAddress, setSearchedAddress] = useState<AddressType | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // 解析ENS名稱為地址
  const { data: resolvedAddress, isLoading: isLoadingAddress } = useEnsAddress({
    name: ensInput,
    chainId: 1,
    query: {
      enabled: ensInput.includes(".eth") && ensInput.length > 0,
    },
  });

  // 從地址獲取ENS名稱
  const { data: ensName } = useEnsName({
    address: searchedAddress ?? undefined,
    chainId: 1,
    query: {
      enabled: !!searchedAddress,
    },
  });

  // 獲取ENS頭像
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: 1,
    query: {
      enabled: !!ensName,
    },
  });

  const handleSearch = () => {
    if (resolvedAddress) {
      setSearchedAddress(resolvedAddress);
      setShowDetails(true);
    } else if (isAddress(ensInput)) {
      setSearchedAddress(ensInput as AddressType);
      setShowDetails(true);
    }
  };

  const handleInputChange = (value: AddressType | string) => {
    setEnsInput(value as string);
    setShowDetails(false);
  };

  const resetSearch = () => {
    setEnsInput("");
    setSearchedAddress(null);
    setShowDetails(false);
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-primary">🔍 ENS 用戶搜尋器</h1>
          <p className="text-lg text-gray-600">輸入 ENS 名稱（例如：vitalik.eth）或以太坊地址來查找用戶資訊</p>
        </div>

        {/* 搜索區域 */}
        <div className="bg-base-100 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col gap-4">
            <label className="text-lg font-semibold flex items-center gap-2">
              <MagnifyingGlassIcon className="h-5 w-5" />
              搜索 ENS 名稱或地址
            </label>

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <AddressInput value={ensInput} onChange={handleInputChange} placeholder="例如：vitalik.eth 或 0x..." />
              </div>
              <button
                className={`btn btn-primary px-6 ${isLoadingAddress ? "loading" : ""}`}
                onClick={handleSearch}
                disabled={!ensInput || isLoadingAddress}
              >
                {isLoadingAddress ? "搜索中..." : "搜索"}
              </button>
            </div>

            {ensInput && resolvedAddress && (
              <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-success">
                  ✅ 找到 ENS 名稱：<strong>{ensInput}</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">解析地址：{resolvedAddress}</p>
              </div>
            )}
          </div>
        </div>

        {/* 搜索結果 */}
        {searchedAddress && (
          <div className="bg-base-100 rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                <UserIcon className="h-6 w-6" />
                用戶資訊
              </h2>

              {!showDetails ? (
                <button className="btn btn-secondary btn-lg" onClick={() => setShowDetails(true)}>
                  點擊查看詳細資料
                </button>
              ) : (
                <div className="space-y-6">
                  {/* ENS 頭像 */}
                  {ensAvatar && (
                    <div className="flex justify-center mb-4">
                      <img
                        src={ensAvatar}
                        alt="ENS Avatar"
                        className="w-20 h-20 rounded-full border-2 border-primary"
                      />
                    </div>
                  )}

                  {/* ENS 名稱 */}
                  <div className="bg-base-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">ENS 名稱</h3>
                    <p className="text-xl text-primary font-mono">{ensName || "此地址沒有 ENS 名稱"}</p>
                  </div>

                  {/* ETH 地址 */}
                  <div className="bg-base-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">以太坊地址</h3>
                    <Address address={searchedAddress} size="lg" />
                  </div>

                  {/* ETH 餘額 */}
                  <div className="bg-base-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">ETH 餘額</h3>
                    <div className="text-2xl font-mono">
                      <Balance address={searchedAddress} />
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex gap-4 justify-center mt-6">
                    <button className="btn btn-ghost" onClick={() => setShowDetails(false)}>
                      隱藏詳細資料
                    </button>
                    <button className="btn btn-primary" onClick={resetSearch}>
                      新的搜索
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 使用說明 */}
        <div className="mt-8 p-6 bg-info/10 rounded-lg border border-info/20">
          <h3 className="text-lg font-semibold mb-3 text-info">使用說明</h3>
          <ul className="space-y-2 text-sm">
            <li>• 您可以輸入 ENS 名稱（如 vitalik.eth）或以太坊地址</li>
            <li>• ENS 名稱會自動解析為對應的以太坊地址</li>
            <li>• 顯示的資訊包括 ENS 名稱、地址和 ETH 餘額</li>
            <li>• 所有數據來源於以太坊主網</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ENSSearch;
