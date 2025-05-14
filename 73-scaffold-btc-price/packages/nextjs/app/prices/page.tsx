"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useContractRead } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const PricesPage: NextPage = () => {
  const [btcPrice, setBtcPrice] = useState<string>("");
  const [ethPrice, setEthPrice] = useState<string>("");
  const [isLoadingBtc, setIsLoadingBtc] = useState(false);
  const [isLoadingEth, setIsLoadingEth] = useState(false);

  // 用於顯示最後更新時間的狀態
  // 使用 useState 來管理 BTC 和 ETH 的最後更新時間
  const [lastBtcUpdate, setLastBtcUpdate] = useState<string>("");
  const [lastEthUpdate, setLastEthUpdate] = useState<string>("");
  const [btcUpdateAnimation, setBtcUpdateAnimation] = useState(false);
  const [ethUpdateAnimation, setEthUpdateAnimation] = useState(false);

  const { data: deployedContractData } = useDeployedContractInfo("PriceFeed");

  // 格式化當前時間
  const formatCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  };

  // 獲取 BTC 價格
  const { refetch: getBtcPrice } = useContractRead({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "getBTCPrice",
  });

  // 獲取 BTC 價格小數位數
  const { refetch: getBtcDecimals } = useContractRead({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "getBTCDecimals",
  });

  // 獲取 ETH 價格
  const { refetch: getEthPrice } = useContractRead({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "getETHPrice",
  });

  // 獲取 ETH 價格小數位數
  const { refetch: getEthDecimals } = useContractRead({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "getETHDecimals",
  });

  // 播放更新動畫
  useEffect(() => {
    if (btcUpdateAnimation) {
      const timer = setTimeout(() => {
        setBtcUpdateAnimation(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [btcUpdateAnimation]);

  useEffect(() => {
    if (ethUpdateAnimation) {
      const timer = setTimeout(() => {
        setEthUpdateAnimation(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ethUpdateAnimation]);

  const handleGetBtcPrice = async () => {
    try {
      setIsLoadingBtc(true);
      const priceResult = await getBtcPrice();
      const decimalsResult = await getBtcDecimals();

      if (priceResult.data && decimalsResult.data) {
        const price = Number(priceResult.data) / Math.pow(10, Number(decimalsResult.data));
        setBtcPrice(price.toFixed(2));
        setLastBtcUpdate(formatCurrentTime());
        setBtcUpdateAnimation(true);
      }
    } catch (error) {
      console.error("獲取 BTC 價格失敗", error);
    } finally {
      setIsLoadingBtc(false);
    }
  };

  const handleGetEthPrice = async () => {
    try {
      setIsLoadingEth(true);
      const priceResult = await getEthPrice();
      const decimalsResult = await getEthDecimals();

      if (priceResult.data && decimalsResult.data) {
        const price = Number(priceResult.data) / Math.pow(10, Number(decimalsResult.data));
        setEthPrice(price.toFixed(2));
        setLastEthUpdate(formatCurrentTime());
        setEthUpdateAnimation(true);
      }
    } catch (error) {
      console.error("獲取 ETH 價格失敗", error);
    } finally {
      setIsLoadingEth(false);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">加密貨幣價格查詢</span>
        </h1>
      </div>

      <div className="flex flex-col items-center gap-12 px-5 py-10 w-full max-w-3xl">
        <div className="flex flex-col sm:flex-row gap-8 w-full justify-center">
          {/* BTC 價格卡片 */}
          <div className="flex-1 bg-base-100 rounded-3xl shadow-xl px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">比特幣 (BTC)</h2>
              <span className="text-2xl">₿</span>
            </div>

            <div
              className={`mb-6 text-center transition-all duration-300 ${btcUpdateAnimation ? "scale-110 text-success" : ""}`}
            >
              {btcPrice ? (
                <p className="text-3xl font-bold">${btcPrice}</p>
              ) : (
                <p className="text-gray-500">點擊下方按鈕獲取價格</p>
              )}
              {lastBtcUpdate && <p className="text-xs text-gray-500 mt-2">最後更新: {lastBtcUpdate}</p>}
            </div>

            <button
              className={`btn btn-primary w-full ${isLoadingBtc ? "loading" : ""}`}
              onClick={handleGetBtcPrice}
              disabled={isLoadingBtc}
            >
              獲取 BTC 價格
            </button>
          </div>

          {/* ETH 價格卡片 */}
          <div className="flex-1 bg-base-100 rounded-3xl shadow-xl px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">以太幣 (ETH)</h2>
              <BanknotesIcon className="h-8 w-8 text-blue-500" />
            </div>

            <div
              className={`mb-6 text-center transition-all duration-300 ${ethUpdateAnimation ? "scale-110 text-success" : ""}`}
            >
              {ethPrice ? (
                <p className="text-3xl font-bold">${ethPrice}</p>
              ) : (
                <p className="text-gray-500">點擊下方按鈕獲取價格</p>
              )}
              {lastEthUpdate && <p className="text-xs text-gray-500 mt-2">最後更新: {lastEthUpdate}</p>}
            </div>

            <button
              className={`btn btn-primary w-full ${isLoadingEth ? "loading" : ""}`}
              onClick={handleGetEthPrice}
              disabled={isLoadingEth}
            >
              獲取 ETH 價格
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 mb-2">價格數據由 Chainlink 預言機提供</p>
          <p>
            <Link href="/" className="link">
              返回首頁
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricesPage;
