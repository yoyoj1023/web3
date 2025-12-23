"use client";

import { useEffect, useMemo, useState } from "react";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { ArrowsUpDownIcon, CogIcon } from "@heroicons/react/24/solid";
import { EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type TradeMode = "buy" | "sell";
type EthUnit = "ether" | "wei";
type TokenUnit = "token" | "wei";

export default function TradePage() {
  const { address: connectedAddress } = useAccount();

  // 交易狀態
  const [tradeMode, setTradeMode] = useState<TradeMode>("buy");
  const [ethAmount, setEthAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);

  // 單位轉換狀態
  const [ethUnit, setEthUnit] = useState<EthUnit>("ether");
  const [tokenUnit, setTokenUnit] = useState<TokenUnit>("token");

  // 讀取交易所儲備
  const { data: ethReserve } = useScaffoldReadContract({
    contractName: "HEX",
    functionName: "getETHBalance",
  });

  const { data: tokenReserve } = useScaffoldReadContract({
    contractName: "HEX",
    functionName: "getTokenBalance",
  });

  // 讀取用戶 LPT 餘額
  const { data: userTokenBalance } = useScaffoldReadContract({
    contractName: "LepusToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // 寫入合約函數
  const { writeContractAsync: writeHexContract } = useScaffoldWriteContract({
    contractName: "HEX",
  });

  const { writeContractAsync: writeLptContract } = useScaffoldWriteContract({
    contractName: "LepusToken",
  });

  // 計算輸出金額
  const calculateOutputAmount = useMemo(() => {
    if (!ethReserve || !tokenReserve || (!ethAmount && !tokenAmount)) return "0";

    try {
      if (tradeMode === "buy" && ethAmount) {
        const ethIn = parseEther(ethAmount);
        const ethReserveBN = ethReserve;
        const tokenReserveBN = tokenReserve;

        // 使用 AMM 公式計算輸出 (含0.3%手續費)：
        // tokenOut = (tokenReserve * ethIn * 997) / (ethReserve * 1000 + ethIn * 997)
        const numerator = tokenReserveBN * ethIn * BigInt(997);
        const denominator = ethReserveBN * BigInt(1000) + ethIn * BigInt(997);
        const tokenOut = numerator / denominator;
        return formatUnits(tokenOut, 18);
      } else if (tradeMode === "sell" && tokenAmount) {
        const tokensIn = parseUnits(tokenAmount, 18);
        const ethReserveBN = ethReserve;
        const tokenReserveBN = tokenReserve;

        // 使用 AMM 公式計算輸出 (含0.3%手續費)：
        // ethOut = (ethReserve * tokensIn * 997) / (tokenReserve * 1000 + tokensIn * 997)
        const numerator = ethReserveBN * tokensIn * BigInt(997);
        const denominator = tokenReserveBN * BigInt(1000) + tokensIn * BigInt(997);
        const ethOut = numerator / denominator;
        return formatEther(ethOut);
      }
    } catch (error) {
      console.error("計算輸出金額錯誤:", error);
    }

    return "0";
  }, [ethAmount, tokenAmount, tradeMode, ethReserve, tokenReserve]);

  // 計算滑點保護值
  const calculateMinOutput = useMemo(() => {
    const output = parseFloat(calculateOutputAmount);
    const slippage = parseFloat(slippageTolerance) / 100;
    const minOutput = output * (1 - slippage);
    return minOutput.toString();
  }, [calculateOutputAmount, slippageTolerance]);

  // 當模式切換時清空輸入
  useEffect(() => {
    setEthAmount("");
    setTokenAmount("");
  }, [tradeMode]);

  // 當輸入變化時計算另一邊的值
  useEffect(() => {
    if (tradeMode === "buy" && ethAmount) {
      setTokenAmount(calculateOutputAmount);
    } else if (tradeMode === "sell" && tokenAmount) {
      setEthAmount(calculateOutputAmount);
    }
  }, [ethAmount, tokenAmount, calculateOutputAmount, tradeMode]);

  // 執行交易
  const handleTrade = async () => {
    if (!connectedAddress) {
      notification.error("請先連接錢包");
      return;
    }

    try {
      if (tradeMode === "buy") {
        // 購買代幣 (ETH -> LPT)
        const minTokensOut = parseUnits(calculateMinOutput, 18);

        await writeHexContract({
          functionName: "ethToToken",
          args: [minTokensOut],
          value: parseEther(ethAmount),
        });

        notification.success("購買交易已提交！");
      } else {
        // 賣出代幣 (LPT -> ETH)
        const tokensIn = parseUnits(tokenAmount, 18);
        const minEthOut = parseEther(calculateMinOutput);

        // 首先檢查並授權代幣
        const hexAddress = "0xa51C90027B4D2bE4a4df0c3135dC1dC59F04B7AD"; // HEX 合約地址

        await writeLptContract({
          functionName: "approve",
          args: [hexAddress, tokensIn],
        });

        // 等待授權確認後執行交易
        setTimeout(async () => {
          await writeHexContract({
            functionName: "tokenToEth",
            args: [tokensIn, minEthOut],
          });

          notification.success("賣出交易已提交！");
        }, 2000);
      }
    } catch (error) {
      console.error("交易失敗:", error);
      notification.error("交易失敗");
    }
  };

  // 單位轉換函數
  const convertEthUnit = (value: string, fromUnit: EthUnit, toUnit: EthUnit): string => {
    if (!value || fromUnit === toUnit) return value;

    try {
      if (fromUnit === "ether" && toUnit === "wei") {
        return parseEther(value).toString();
      } else if (fromUnit === "wei" && toUnit === "ether") {
        return formatEther(BigInt(value));
      }
    } catch (error) {
      console.error("單位轉換錯誤:", error);
    }

    return value;
  };

  const convertTokenUnit = (value: string, fromUnit: TokenUnit, toUnit: TokenUnit): string => {
    if (!value || fromUnit === toUnit) return value;

    try {
      if (fromUnit === "token" && toUnit === "wei") {
        return parseUnits(value, 18).toString();
      } else if (fromUnit === "wei" && toUnit === "token") {
        return formatUnits(BigInt(value), 18);
      }
    } catch (error) {
      console.error("單位轉換錯誤:", error);
    }

    return value;
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">DEX 交易所</span>
          <span className="block text-2xl mb-2">ETH / LPT 交易對</span>
        </h1>

        {/* 儲備顯示 */}
        <div className="bg-base-300 rounded-2xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-center">流動性池儲備</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-base-100 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">ETH 儲備</div>
              <div className="text-lg font-bold text-blue-600">{ethReserve ? formatEther(ethReserve) : "0"} ETH</div>
              <div className="text-xs text-gray-400">{ethReserve ? ethReserve.toString() : "0"} wei</div>
            </div>
            <div className="bg-base-100 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">LPT 儲備</div>
              <div className="text-lg font-bold text-green-600">
                {tokenReserve ? formatUnits(tokenReserve, 18) : "0"} LPT
              </div>
              <div className="text-xs text-gray-400">{tokenReserve ? tokenReserve.toString() : "0"} wei</div>
            </div>
          </div>

          {/* 當前價格 */}
          {ethReserve && tokenReserve && (
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-500">當前價格</div>
              <div className="text-lg">
                1 ETH = {formatUnits((tokenReserve * BigInt(10 ** 18)) / ethReserve, 18)} LPT
              </div>
              <div className="text-sm">1 LPT = {formatEther((ethReserve * BigInt(10 ** 18)) / tokenReserve)} ETH</div>
            </div>
          )}
        </div>

        {/* 交易界面 */}
        <div className="bg-base-300 rounded-2xl p-6 w-full max-w-md mx-auto shadow-lg">
          {/* 設置按鈕 */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">交易</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(!showSettings)}>
              <CogIcon className="h-5 w-5" />
            </button>
          </div>

          {/* 滑點設置 */}
          {showSettings && (
            <div className="bg-base-100 rounded-xl p-4 mb-4">
              <div className="text-sm font-semibold mb-2">滑點容忍度</div>
              <div className="flex gap-2">
                {["0.1", "0.5", "1.0"].map(value => (
                  <button
                    key={value}
                    className={`btn btn-sm ${slippageTolerance === value ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setSlippageTolerance(value)}
                  >
                    {value}%
                  </button>
                ))}
                <input
                  type="number"
                  step="0.1"
                  className="input input-bordered input-sm w-20"
                  value={slippageTolerance}
                  onChange={e => setSlippageTolerance(e.target.value)}
                  placeholder="自定義"
                />
              </div>
            </div>
          )}

          {/* 交易模式切換 */}
          <div className="flex bg-base-100 rounded-xl p-1 mb-4">
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                tradeMode === "buy" ? "bg-green-500 text-white" : "hover:bg-base-200"
              }`}
              onClick={() => setTradeMode("buy")}
            >
              賣出 ETH
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                tradeMode === "sell" ? "bg-red-500 text-white" : "hover:bg-base-200"
              }`}
              onClick={() => setTradeMode("sell")}
            >
              購買 ETH
            </button>
          </div>

          {/* 輸入區域 */}
          <div className="space-y-4">
            {/* ETH 輸入 */}
            <div className="bg-base-100 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">{tradeMode === "buy" ? "支付" : "獲得"}</span>
                <div className="flex gap-1">
                  <button
                    className={`btn btn-xs ${ethUnit === "ether" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => {
                      const converted = convertEthUnit(ethAmount, ethUnit, "ether");
                      setEthAmount(converted);
                      setEthUnit("ether");
                    }}
                  >
                    ETH
                  </button>
                  <button
                    className={`btn btn-xs ${ethUnit === "wei" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => {
                      const converted = convertEthUnit(ethAmount, ethUnit, "wei");
                      setEthAmount(converted);
                      setEthUnit("wei");
                    }}
                  >
                    Wei
                  </button>
                </div>
              </div>
              <EtherInput value={ethAmount} onChange={setEthAmount} placeholder="0.0" disabled={tradeMode === "sell"} />
              <div className="text-xs text-gray-400 mt-1">{ethUnit === "ether" ? "以太幣" : "Wei"}</div>
            </div>

            {/* 交換圖標 */}
            <div className="flex justify-center">
              <ArrowsUpDownIcon className="h-6 w-6 text-gray-400" />
            </div>

            {/* LPT 輸入 */}
            <div className="bg-base-100 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">{tradeMode === "buy" ? "獲得" : "支付"}</span>
                <div className="flex gap-1">
                  <button
                    className={`btn btn-xs ${tokenUnit === "token" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => {
                      const converted = convertTokenUnit(tokenAmount, tokenUnit, "token");
                      setTokenAmount(converted);
                      setTokenUnit("token");
                    }}
                  >
                    LPT
                  </button>
                  <button
                    className={`btn btn-xs ${tokenUnit === "wei" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => {
                      const converted = convertTokenUnit(tokenAmount, tokenUnit, "wei");
                      setTokenAmount(converted);
                      setTokenUnit("wei");
                    }}
                  >
                    Wei
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="any"
                className="input input-bordered w-full text-right text-lg"
                value={tokenAmount}
                onChange={e => setTokenAmount(e.target.value)}
                placeholder="0.0"
                disabled={tradeMode === "buy"}
              />
              <div className="text-xs text-gray-400 mt-1">{tokenUnit === "token" ? "LPT 代幣" : "Wei"}</div>
              {connectedAddress && (
                <div className="text-xs text-gray-400 mt-1">
                  餘額: {userTokenBalance ? formatUnits(userTokenBalance, 18) : "0"} LPT
                </div>
              )}
            </div>
          </div>

          {/* 交易信息 */}
          {calculateOutputAmount !== "0" && (
            <div className="bg-base-100 rounded-xl p-4 mt-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>預期輸出</span>
                  <span>
                    {calculateOutputAmount} {tradeMode === "buy" ? "LPT" : "ETH"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>最小輸出 (滑點 {slippageTolerance}%)</span>
                  <span className="text-red-500">
                    {calculateMinOutput} {tradeMode === "buy" ? "LPT" : "ETH"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 交易按鈕 */}
          <button
            className={`btn w-full mt-6 ${tradeMode === "buy" ? "btn-success" : "btn-error"}`}
            onClick={handleTrade}
            disabled={!connectedAddress || !ethAmount || !tokenAmount}
          >
            {!connectedAddress ? "請連接錢包" : tradeMode === "buy" ? "賣出 ETH" : "買進 ETH"}
          </button>
        </div>
      </div>
    </div>
  );
}
