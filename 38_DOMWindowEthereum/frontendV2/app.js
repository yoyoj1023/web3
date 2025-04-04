// npx http-server -c-1
// 定義 Optimism Sepolia 網路資訊
const optimismSepoliaChainId = "0xaa37dc";  // 11155420 十六進制
const optimismSepoliaChainParams = {
    chainId: optimismSepoliaChainId,
    chainName: "Optimism Sepolia",
    nativeCurrency: {
        name: "Sepolia Ether",
        symbol: "ETH",
        decimals: 18
    },
    rpcUrls: ["https://sepolia.optimism.io"],
    blockExplorerUrls: ["https://sepolia-optimism.etherscan.io"]
};

// DOM 元素
const connectButton = document.getElementById("connectButton");
const switchNetworkButton = document.getElementById("switchNetworkButton");
const getBalanceButton = document.getElementById("getBalanceButton");
const addressDisplay = document.getElementById("addressDisplay");
const addressElement = document.getElementById("address");
const statusMessage = document.getElementById("statusMessage");
const balanceDisplay = document.getElementById("balanceDisplay");
const balanceElement = document.getElementById("balance");

// 變數
let currentAccount = null;
let provider = null;

// 檢查 MetaMask 是否安裝
function checkIfMetaMaskInstalled() {
    const { ethereum } = window;
    if (!ethereum || !ethereum.isMetaMask) {
        alert("請安裝 MetaMask!");
        connectButton.disabled = true;
        return false;
    }
    return true;
}

// 連接到 MetaMask
async function connectToMetaMask() {
    try {
        // 檢查 MetaMask 是否已安裝
        if (!checkIfMetaMaskInstalled()) return;

        // 請求連接錢包
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        handleAccountsChanged(accounts);

        // 監聽帳戶變化
        window.ethereum.on("accountsChanged", handleAccountsChanged);
        
        // 初始化 ethers provider
        provider = new ethers.BrowserProvider(window.ethereum);
        
        // 顯示切換網路按鈕
        switchNetworkButton.style.display = "block";
        
        console.log("成功連接到 MetaMask!");
    } catch (error) {
        console.error("連接 MetaMask 時出錯:", error);
        statusMessage.textContent = "連接失敗: " + error.message;
        statusMessage.className = "status disconnected";
    }
}

// 處理帳戶變更
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // 用戶登出 MetaMask
        currentAccount = null;
        statusMessage.textContent = "未連接到 MetaMask";
        statusMessage.className = "status disconnected";
        addressDisplay.style.display = "none";
        switchNetworkButton.style.display = "none";
        getBalanceButton.style.display = "none";
        balanceDisplay.style.display = "none";
        connectButton.textContent = "連接 MetaMask";
    } else if (accounts[0] !== currentAccount) {
        // 設置當前帳戶
        currentAccount = accounts[0];
        statusMessage.textContent = "已連接到 MetaMask";
        statusMessage.className = "status connected";
        addressElement.textContent = currentAccount;
        addressDisplay.style.display = "block";
        connectButton.textContent = "已連接";
        
        console.log("當前帳戶地址:", currentAccount);
    }
}

// 切換到 Optimism Sepolia 網路
async function switchToOptimismSepolia() {
    try {
        // 嘗試切換到 Optimism Sepolia
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: optimismSepoliaChainId }]
        });
        
        console.log("成功切換到 Optimism Sepolia 網路");
        statusMessage.textContent = "已連接到 Optimism Sepolia 網路";
        getBalanceButton.style.display = "block";
        
    } catch (error) {
        // 如果網路不存在，嘗試添加該網路
        if (error.code === 4902) {
            try {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [optimismSepoliaChainParams]
                });
                console.log("成功添加並切換到 Optimism Sepolia 網路");
                statusMessage.textContent = "已連接到 Optimism Sepolia 網路";
                getBalanceButton.style.display = "block";
            } catch (addError) {
                console.error("添加 Optimism Sepolia 網路失敗:", addError);
                statusMessage.textContent = "添加網路失敗: " + addError.message;
            }
        } else {
            console.error("切換到 Optimism Sepolia 網路失敗:", error);
            statusMessage.textContent = "切換網路失敗: " + error.message;
        }
    }
}

// 獲取 OP Sepolia 以太幣餘額
async function getBalance() {
    try {
        if (!currentAccount || !provider) {
            alert("請先連接到 MetaMask!");
            return;
        }

        // 獲取當前連接的網絡
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        
        // 確保是 Optimism Sepolia 網路
        if (chainId.toString() !== "11155420") {
            alert("請先切換到 Optimism Sepolia 網路!");
            return;
        }

        // 獲取餘額
        const balance = await provider.getBalance(currentAccount);
        
        // 轉換為以太單位並顯示
        const etherBalance = ethers.formatEther(balance);
        balanceElement.textContent = parseFloat(etherBalance).toFixed(4);
        balanceDisplay.style.display = "block";
        
        console.log("OP Sepolia 以太幣餘額:", etherBalance);
    } catch (error) {
        console.error("獲取餘額時出錯:", error);
        alert("獲取餘額失敗: " + error.message);
    }
}

// 事件監聽器
connectButton.addEventListener("click", connectToMetaMask);
switchNetworkButton.addEventListener("click", switchToOptimismSepolia);
getBalanceButton.addEventListener("click", getBalance);

// 檢查頁面加載時是否已連接
window.addEventListener("load", async () => {
    checkIfMetaMaskInstalled();
    
    // 檢查是否已連接
    if (window.ethereum && window.ethereum.selectedAddress) {
        await connectToMetaMask();
    }
});