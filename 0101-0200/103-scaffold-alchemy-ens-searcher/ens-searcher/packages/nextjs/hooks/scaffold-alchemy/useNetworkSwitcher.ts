import { useState, useEffect } from "react";
import { Alchemy, Network } from "alchemy-sdk";

export type SupportedNetwork = "mainnet" | "sepolia";

export const useNetworkSwitcher = (initialNetwork: SupportedNetwork = "mainnet") => {
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedNetwork>(initialNetwork);
  const [alchemyClient, setAlchemyClient] = useState<Alchemy | null>(null);

  const networkConfigs = {
    mainnet: {
      name: "以太坊主網",
      chainId: 1,
      network: Network.ETH_MAINNET,
      explorerUrl: "https://etherscan.io"
    },
    sepolia: {
      name: "以太坊 Sepolia",
      chainId: 11155111,
      network: Network.ETH_SEPOLIA,
      explorerUrl: "https://sepolia.etherscan.io"
    }
  };

  useEffect(() => {
    const initAlchemy = () => {
      const config = networkConfigs[selectedNetwork];
      
      const alchemy = new Alchemy({
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "",
        network: config.network,
      });
      
      setAlchemyClient(alchemy);
    };

    initAlchemy();
  }, [selectedNetwork]);

  const switchNetwork = (network: SupportedNetwork) => {
    setSelectedNetwork(network);
  };

  const getCurrentNetworkConfig = () => networkConfigs[selectedNetwork];

  return {
    selectedNetwork,
    alchemyClient,
    switchNetwork,
    getCurrentNetworkConfig,
    networkConfigs
  };
}; 