// npx http-server -c-1
// Optimism Sepolia 網路參數
const optimismSepolia = {
    chainId: '0xAA36A7', // chainId 11155420 的十六進制表示
    chainName: 'Optimism Sepolia',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://sepolia.optimism.io'],
    blockExplorerUrls: ['https://sepolia-optimism.etherscan.io']
};

let provider;
let signer;
let userAddress;

// 連結 MetaMask 的函數
async function connectWallet() {
    console.log("Hello Connect Wallet!");
    console.log('MetaMask 版本:', window.ethereum.version);
    console.log('Ethers.js 版本:', ethers.version);
    if (typeof window.ethereum !== 'undefined') {
        try {
            // 創建 provider 實例並請求連結
            provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            signer = await provider.getSigner();
            userAddress = await signer.getAddress();
            console.log('已連結帳戶:', userAddress);

            // 檢查當前網路
            const network = await provider.getNetwork();
            if (network.chainId !== BigInt(11155420)) {
                await addNetwork(); // 添加 Optimism Sepolia 網路
                await switchNetwork(); // 切換到 Optimism Sepolia 網路
            }

            // 啟用顯示餘額按鈕
            document.getElementById('showBalanceButton').disabled = false;
            alert('MetaMask 連結成功！');
        } catch (error) {
            console.error('連結失敗:', error);
            alert('連結失敗: ' + error.message);
        }
    } else {
        alert('請先安裝 MetaMask！');
    }
}

// 添加 Optimism Sepolia 網路
async function addNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [optimismSepolia]
        });
    } catch (error) {
        console.error('添加網路失敗:', error);
        throw error;
    }
}

// 切換到 Optimism Sepolia 網路
async function switchNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: optimismSepolia.chainId }]
        });
    } catch (error) {
        console.error('切換網路失敗:', error);
        throw error;
    }
}

// 獲取並顯示 Optimism Sepolia 測試以太幣餘額
async function getBalance() {
    try {
        const balance = await provider.getBalance(userAddress);
        const balanceInEth = ethers.formatEther(balance); // 將 wei 轉換為 ETH
        document.getElementById('balanceDisplay').innerText = `餘額: ${balanceInEth} ETH`;
    } catch (error) {
        console.error('獲取餘額失敗:', error);
        alert('獲取餘額失敗: ' + error.message);
    }
}

function handleEthereum() {
    console.log('Ethereum provider is available:', window.ethereum);
    // 在這裡可以開始與 MetaMask 互動，例如請求帳戶
    // requestAccounts(); // 下一步通常是請求連接
}

async function requestAccounts() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected accounts:', accounts);
    } catch (error) {
        console.error('Error requesting accounts:', error);
    }
}

// 綁定按鈕事件
document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('showBalanceButton').addEventListener('click', getBalance);

// 初始檢查 (可能為 undefined)
console.log('Initial check - window.ethereum:', window.ethereum);

// 方法三：(推薦) 監聽 MetaMask 的特定事件 (如果支援)
// EIP-6963 引入了更標準化的發現機制，但檢查 `ethereum#initialized` 也是一種方法
if (window.ethereum) {
    // 如果一開始就有，直接處理
    handleEthereum();
} else {
    // 監聽事件，等待注入
    window.addEventListener('ethereum#initialized', handleEthereum, { once: true });

    // 設定超時以防事件不觸發
    setTimeout(() => {
        if (!window.ethereum) {
            console.log('MetaMask provider not found after timeout.');
        }
    }, 3000); // 等待 3 秒
}
