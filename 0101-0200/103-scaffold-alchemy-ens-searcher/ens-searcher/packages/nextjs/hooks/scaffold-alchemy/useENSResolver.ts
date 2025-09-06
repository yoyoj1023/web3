import { useState } from "react";
import { createPublicClient, http, formatEther } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { Alchemy, Network } from "alchemy-sdk";

export type ENSResult = {
  ensName: string;
  address: string;
  balance: string;
  transactionCount: number;
  reverseEns?: string | null;
  network: string;
};

export const useENSResolver = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ENSResult | null>(null);

  const resolveWithViem = async (ensName: string, networkType: "mainnet" | "sepolia") => {
    const chain = networkType === "mainnet" ? mainnet : sepolia;
    const publicClient = createPublicClient({
      chain,
      transport: http()
    });

    const address = await publicClient.getEnsAddress({ name: ensName });
    if (!address) return null;

    const [balance, txCount] = await Promise.all([
      publicClient.getBalance({ address }),
      publicClient.getTransactionCount({ address })
    ]);

    let reverseEns = null;
    try {
      reverseEns = await publicClient.getEnsName({ address });
    } catch (e) {
      console.log("無法獲取反向 ENS:", e);
    }

    return {
      ensName,
      address,
      balance: formatEther(balance),
      transactionCount: txCount,
      reverseEns,
      network: networkType
    };
  };

  const resolveWithAlchemy = async (ensName: string, networkType: "mainnet" | "sepolia") => {
    const network = networkType === "mainnet" ? Network.ETH_MAINNET : Network.ETH_SEPOLIA;
    
    const alchemy = new Alchemy({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "",
      network: network,
    });

    const address = await alchemy.core.resolveName(ensName);
    if (!address) return null;

    const [balance, txCount] = await Promise.all([
      alchemy.core.getBalance(address),
      alchemy.core.getTransactionCount(address)
    ]);

    let reverseEns = null;
    try {
      reverseEns = await alchemy.core.lookupAddress(address);
    } catch (e) {
      console.log("無法獲取反向 ENS:", e);
    }

    return {
      ensName,
      address,
      balance: formatEther(BigInt(balance.toString())),
      transactionCount: txCount,
      reverseEns,
      network: networkType
    };
  };

  const resolveENS = async (ensName: string, networkType: "mainnet" | "sepolia" = "mainnet") => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      console.log(`🔍 開始解析 ENS: ${ensName} (網路: ${networkType})`);
      
      let result = null;
      
      // 方法 1: 嘗試使用 Alchemy
      try {
        console.log("📡 嘗試使用 Alchemy API...");
        result = await resolveWithAlchemy(ensName, networkType);
        if (result) {
          console.log("✅ Alchemy 解析成功");
          setResult(result);
          return result;
        }
      } catch (alchemyError: any) {
        console.warn("⚠️ Alchemy 解析失敗:", alchemyError.message);
      }

      // 方法 2: 如果 Alchemy 失敗，使用 Viem
      if (networkType === "mainnet") {
        try {
          console.log("📡 嘗試使用 Viem 公共 RPC...");
          result = await resolveWithViem(ensName, networkType);
          if (result) {
            console.log("✅ Viem 解析成功");
            setResult(result);
            return result;
          }
        } catch (viemError: any) {
          console.warn("⚠️ Viem 解析失敗:", viemError.message);
        }
      }

      // 如果所有方法都失敗
      setError(`❌ 在 ${networkType === "mainnet" ? "以太坊主網" : "Sepolia"} 上未找到 "${ensName}" 的 ENS 記錄`);
      return null;

    } catch (error: any) {
      console.error("❌ ENS 解析錯誤:", error);
      setError(`解析錯誤: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    resolveENS,
    loading,
    error,
    result,
    setError,
    setResult
  };
}; 