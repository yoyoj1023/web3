"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import {
    useChainId,
    useChains,
    useConnectors,
    useConfig
} from "wagmi";
import {
    RainbowKitCustomConnectButton,
    Address,
    Balance,
    BlockieAvatar
} from "~~/components/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const RainbowKitLearning: NextPage = () => {
    const [customTheme, setCustomTheme] = useState<"light" | "dark">("light");
    const [showAdvanced, setShowAdvanced] = useState(false);

    // RainbowKit 和 Wagmi 基礎 hooks
    const { address, isConnected, connector } = useAccount();
    const { disconnect } = useDisconnect();
    const { switchChain, chains } = useSwitchChain();
    const chainId = useChainId();
    const connectors = useConnectors();
    const config = useConfig();
    const availableChains = useChains();
    const targetNetworks = getTargetNetworks();

    // 模擬主題切換效果
    useEffect(() => {
        const root = document.documentElement;
        if (customTheme === "dark") {
            root.setAttribute("data-theme", "dark");
        } else {
            root.setAttribute("data-theme", "light");
        }
    }, [customTheme]);

    return (
        <div className="flex items-center flex-col grow pt-10 px-4">
            <div className="max-w-6xl w-full">
                <h1 className="text-center text-4xl font-bold mb-8">
                    RainbowKit 學習指南
                </h1>

                {/* 基礎連接按鈕 */}
                <div className="bg-base-200 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">1. 基礎連接按鈕</h2>

                    <div className="space-y-4">
                        <div className="bg-base-300 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">標準 RainbowKit ConnectButton</h3>
                            <div className="flex items-center gap-4 mb-3">
                                <ConnectButton />
                            </div>
                            <p className="text-sm text-gray-600">
                                這是最基本的 RainbowKit 連接按鈕，提供完整的錢包連接功能
                            </p>
                            <div className="mockup-code mt-2 text-xs">
                                <pre><code>{`import { ConnectButton } from "@rainbow-me/rainbowkit";

<ConnectButton />`}</code></pre>
                            </div>
                        </div>

                        <div className="bg-base-300 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">自定義 ConnectButton</h3>
                            <div className="flex items-center gap-4 mb-3">
                                <RainbowKitCustomConnectButton />
                            </div>
                            <p className="text-sm text-gray-600">
                                Scaffold-ETH 提供的自定義連接按鈕，包含餘額顯示和更多功能
                            </p>
                            <div className="mockup-code mt-2 text-xs">
                                <pre><code>{`import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

<RainbowKitCustomConnectButton />`}</code></pre>
                            </div>
                        </div>

                        {isConnected && (
                            <div className="bg-base-300 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">連接狀態信息</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>錢包地址：</strong> <Address address={address} /></p>
                                    <p><strong>連接器：</strong> {connector?.name}</p>
                                    <p><strong>當前網路：</strong> {chainId}</p>
                                    <p><strong>帳戶餘額：</strong> <Balance address={address} /></p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 錢包連接器 */}
                <div className="bg-base-200 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">2. 可用的錢包連接器</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        {connectors.map((connector) => (
                            <div key={connector.uid} className="bg-base-300 p-4 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="avatar">
                                        <div className="w-8 h-8 rounded-full">
                                            {connector.icon && (
                                                <img src={connector.icon} alt={connector.name} />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{connector.name}</h3>
                                        <p className="text-xs text-gray-600">
                                            {connector.uid}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm">
                                    狀態: {isConnected && connector?.uid === address ? "已連接" : "未連接"}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 mockup-code text-xs">
                        <pre><code>{`import { useConnectors } from "wagmi";

const connectors = useConnectors();
// 獲取所有可用的錢包連接器`}</code></pre>
                    </div>
                </div>

                {/* 網路切換 */}
                <div className="bg-base-200 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">3. 網路管理</h2>

                    <div className="space-y-4">
                        <div className="bg-base-300 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">可用網路</h3>
                            <div className="grid md:grid-cols-2 gap-2">
                                {targetNetworks.map((network) => (
                                    <div key={network.id} className="flex items-center justify-between p-2 bg-base-100 rounded">
                                        <span className="font-medium">{network.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-600">ID: {network.id}</span>
                                            {chainId === network.id && (
                                                <span className="badge badge-primary text-xs">當前</span>
                                            )}
                                            {chainId !== network.id && isConnected && (
                                                <button
                                                    onClick={() => switchChain({ chainId: network.id })}
                                                    className="btn btn-xs btn-outline"
                                                >
                                                    切換
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mockup-code text-xs">
                            <pre><code>{`import { useSwitchChain } from "wagmi";

const { switchChain } = useSwitchChain();

// 切換到指定網路
switchChain({ chainId: 1 }); // 切換到主網`}</code></pre>
                        </div>
                    </div>
                </div>

                {/* ConnectButton 自定義 */}
                <div className="bg-base-200 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">4. ConnectButton 自定義選項</h2>

                    <div className="space-y-4">
                        <div className="bg-base-300 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">不同的顯示模式</h3>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm mb-2"><strong>完整顯示模式：</strong></p>
                                    <ConnectButton />
                                </div>

                                <div>
                                    <p className="text-sm mb-2"><strong>僅顯示帳戶信息：</strong></p>
                                    <ConnectButton accountStatus="address" />
                                </div>

                                <div>
                                    <p className="text-sm mb-2"><strong>隱藏鏈信息：</strong></p>
                                    <ConnectButton chainStatus="none" />
                                </div>

                                <div>
                                    <p className="text-sm mb-2"><strong>僅顯示圖標：</strong></p>
                                    <ConnectButton accountStatus="avatar" chainStatus="icon" />
                                </div>
                            </div>

                            <div className="mockup-code mt-4 text-xs">
                                <pre><code>{`// 不同的顯示選項
<ConnectButton />
<ConnectButton accountStatus="address" />
<ConnectButton chainStatus="none" />
<ConnectButton accountStatus="avatar" chainStatus="icon" />`}</code></pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 進階自定義 */}
                <div className="bg-base-200 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">5. 進階自定義</h2>

                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="btn btn-outline mb-4"
                    >
                        {showAdvanced ? "隱藏" : "顯示"} 進階範例
                    </button>

                    {showAdvanced && (
                        <div className="space-y-4">
                            <div className="bg-base-300 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3">自定義 ConnectButton</h3>

                                <ConnectButton.Custom>
                                    {({
                                        account,
                                        chain,
                                        openAccountModal,
                                        openChainModal,
                                        openConnectModal,
                                        mounted,
                                    }) => {
                                        const ready = mounted;
                                        const connected = ready && account && chain;

                                        return (
                                            <div
                                                {...(!ready && {
                                                    'aria-hidden': true,
                                                    style: {
                                                        opacity: 0,
                                                        pointerEvents: 'none',
                                                        userSelect: 'none',
                                                    },
                                                })}
                                            >
                                                {(() => {
                                                    if (!connected) {
                                                        return (
                                                            <button
                                                                onClick={openConnectModal}
                                                                type="button"
                                                                className="btn btn-primary"
                                                            >
                                                                🌈 連接錢包
                                                            </button>
                                                        );
                                                    }

                                                    if (chain.unsupported) {
                                                        return (
                                                            <button
                                                                onClick={openChainModal}
                                                                type="button"
                                                                className="btn btn-error"
                                                            >
                                                                ❌ 錯誤網路
                                                            </button>
                                                        );
                                                    }

                                                    return (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={openChainModal}
                                                                className="btn btn-sm btn-outline"
                                                                type="button"
                                                            >
                                                                {chain.hasIcon && chain.iconUrl && (
                                                                    <img
                                                                        alt={chain.name ?? 'Chain icon'}
                                                                        src={chain.iconUrl}
                                                                        className="w-4 h-4"
                                                                    />
                                                                )}
                                                                {chain.name}
                                                            </button>

                                                            <button
                                                                onClick={openAccountModal}
                                                                type="button"
                                                                className="btn btn-sm btn-primary"
                                                            >
                                                                <BlockieAvatar address={account.address} size={20} />
                                                                {account.displayName}
                                                            </button>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        );
                                    }}
                                </ConnectButton.Custom>

                                <div className="mockup-code mt-4 text-xs">
                                    <pre><code>{`<ConnectButton.Custom>
  {({ account, chain, openConnectModal, mounted }) => {
    const connected = mounted && account && chain;
    
    return (
      <div>
        {!connected ? (
          <button onClick={openConnectModal}>
            連接錢包
          </button>
        ) : (
          <div>
            {/* 自定義已連接狀態的 UI */}
          </div>
        )}
      </div>
    );
  }}
</ConnectButton.Custom>`}</code></pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RainbowKit 配置說明 */}
                <div className="bg-base-200 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">6. RainbowKit 配置</h2>

                    <div className="space-y-4">
                        <div className="bg-base-300 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">基本配置結構</h3>
                            <div className="mockup-code text-xs">
                                <pre><code>{`// app/layout.tsx
import "@rainbow-me/rainbowkit/styles.css";

// 在 Provider 中配置
<RainbowKitProvider
  avatar={BlockieAvatar}
  theme={isDarkMode ? darkTheme() : lightTheme()}
>
  <App />
</RainbowKitProvider>`}</code></pre>
                            </div>
                        </div>

                        <div className="bg-base-300 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">錢包連接器配置</h3>
                            <div className="mockup-code text-xs">
                                <pre><code>{`// wagmiConnectors.tsx
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";

const connectors = connectorsForWallets([
  {
    groupName: "推薦",
    wallets: [metaMaskWallet, rainbowWallet],
  },
  {
    groupName: "其他",
    wallets: [walletConnectWallet, coinbaseWallet],
  },
]);`}</code></pre>
                            </div>
                        </div>

                        <div className="bg-base-300 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">主題定制</h3>
                            <div className="mockup-code text-xs">
                                <pre><code>{`import { darkTheme, lightTheme } from "@rainbow-me/rainbowkit";

// 自定義主題
const customTheme = darkTheme({
  accentColor: '#7b3fe4',
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
});

<RainbowKitProvider theme={customTheme}>
  <App />
</RainbowKitProvider>`}</code></pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 學習重點總結 */}
                <div className="bg-primary/10 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">💡 RainbowKit 學習重點</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h3 className="font-semibold">🎯 核心功能</h3>
                            <ul className="text-sm space-y-1">
                                <li>• 簡單的錢包連接界面</li>
                                <li>• 多種錢包支持（MetaMask、WalletConnect 等）</li>
                                <li>• 自動網路檢測和切換</li>
                                <li>• 美觀的預設 UI 組件</li>
                                <li>• 完整的 TypeScript 支持</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold">🛠 自定義選項</h3>
                            <ul className="text-sm space-y-1">
                                <li>• 自定義主題和顏色</li>
                                <li>• 自定義頭像組件</li>
                                <li>• 自定義連接按鈕 UI</li>
                                <li>• 靈活的錢包組合</li>
                                <li>• 響應式設計支持</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold">📚 最佳實踐</h3>
                            <ul className="text-sm space-y-1">
                                <li>• 使用 ConnectButton.Custom 進行深度定制</li>
                                <li>• 合理組織錢包連接器</li>
                                <li>• 考慮用戶體驗和可訪問性</li>
                                <li>• 處理網路切換的用戶反饋</li>
                                <li>• 適當的錯誤處理</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold">🔧 與 Scaffold-ETH 集成</h3>
                            <ul className="text-sm space-y-1">
                                <li>• 使用 Scaffold 的自定義組件</li>
                                <li>• 預配置的錢包連接器</li>
                                <li>• 集成的主題系統</li>
                                <li>• 與 Wagmi hooks 無縫配合</li>
                                <li>• 開發環境優化</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 下一步學習 */}
                <div className="bg-info/10 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">🚀 下一步學習</h2>

                    <div className="space-y-3 text-sm">
                        <p><strong>1. 深入了解 Wagmi：</strong> 學習更多 Wagmi hooks 來處理區塊鏈交互</p>
                        <p><strong>2. 自定義主題：</strong> 創建符合您品牌的自定義 RainbowKit 主題</p>
                        <p><strong>3. 錢包整合：</strong> 了解如何添加新的錢包連接器</p>
                        <p><strong>4. 進階配置：</strong> 學習 RainbowKit 的進階配置選項</p>
                        <p><strong>5. 生產部署：</strong> 了解在生產環境中的最佳實踐</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RainbowKitLearning;
