// Optimism Sepolia 網路配置
const OPTIMISM_SEPOLIA_PARAMS = {
    chainId: '0xaa37dc',  // 11155420 in hex
    chainName: 'Optimism Sepolia',
    nativeCurrency: {
        name: 'Sepolia Ether',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://sepolia.optimism.io'],
    blockExplorerUrls: ['https://sepolia-optimism.etherscan.io']
};

// LPT Token 配置
const LPT_TOKEN = {
    address: '0x76Ee828a2a3D69BDE22076F6d1A81DD35F5116a7',
    symbol: 'LPT',
    decimals: 18,
    image: 'https://via.placeholder.com/128'  // 可以更換為實際的代幣圖標
};

// DOM元素
const connectBtn = document.getElementById('connectBtn');
const switchNetworkBtn = document.getElementById('switchNetworkBtn');
const checkEthBalanceBtn = document.getElementById('checkEthBalanceBtn');
const checkTokenBalanceBtn = document.getElementById('checkTokenBalanceBtn');
const walletInfo = document.getElementById('walletInfo');
const connectionStatus = document.getElementById('connectionStatus');
const accountAddress = document.getElementById('accountAddress');
const balanceInfo = document.getElementById('balanceInfo');

// 檢查是否安裝了MetaMask
async function checkIfMetaMaskInstalled() {
    if (window.ethereum) {
        try {
            // 請求用戶授權
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            return true;
        } catch (error) {
            console.error('用戶拒絕連接:', error);
            return false;
        }
    } else {
        alert('請安裝MetaMask錢包!');
        return false;
    }
}

// 連接MetaMask錢包
async function connectWallet() {
    try {
        const isMetaMaskInstalled = await checkIfMetaMaskInstalled();

        if (isMetaMaskInstalled) {
            // 使用ethers.js創建provider
            const provider = new ethers.BrowserProvider(window.ethereum);

            // 獲取連接的帳戶
            const accounts = await provider.listAccounts();
            const currentAccount = accounts[0];

            // 顯示用戶地址
            console.log('Connected account:', currentAccount.address);
            connectionStatus.textContent = '已連接';
            accountAddress.textContent = currentAccount.address;

            // 顯示錢包資訊區域和切換網路按鈕
            walletInfo.classList.remove('hidden');
            switchNetworkBtn.classList.remove('hidden');
            connectBtn.disabled = true;

            // 監聽帳戶變更
            window.ethereum.on('accountsChanged', function (accounts) {
                if (accounts.length === 0) {
                    // 用戶斷開了連接
                    resetUI();
                } else {
                    // 更新顯示的地址
                    accountAddress.textContent = accounts[0];
                    console.log('Account changed to:', accounts[0]);
                }
            });

            // 監聽網路變更
            window.ethereum.on('chainChanged', function (chainId) {
                console.log('Network changed to:', chainId);
                checkCurrentNetwork();
            });

            // 檢查當前網路
            checkCurrentNetwork();
        }
    } catch (error) {
        console.error('連接錢包時出錯:', error);
        alert('連接錢包失敗: ' + error.message);
    }
}

// 檢查當前網路
async function checkCurrentNetwork() {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const optimismSepoliaChainId = '0xaa37dc';  // Optimism Sepolia chainId in hex

        if (chainId === optimismSepoliaChainId) {
            // 已經在Optimism Sepolia網路
            connectionStatus.textContent = '已連接到Optimism Sepolia';
            switchNetworkBtn.textContent = '已在Optimism Sepolia網路';
            switchNetworkBtn.disabled = true;

            // 顯示查詢餘額按鈕
            checkEthBalanceBtn.classList.remove('hidden');
            checkTokenBalanceBtn.classList.remove('hidden');
        } else {
            // 不在Optimism Sepolia網路
            connectionStatus.textContent = '已連接，但不在Optimism Sepolia網路';
            switchNetworkBtn.textContent = '切換到Optimism Sepolia網路';
            switchNetworkBtn.disabled = false;

            // 隱藏查詢餘額按鈕
            checkEthBalanceBtn.classList.add('hidden');
            checkTokenBalanceBtn.classList.add('hidden');
            balanceInfo.classList.add('hidden');
        }
    } catch (error) {
        console.error('檢查網路時出錯:', error);
    }
}

// 切換到Optimism Sepolia網路
async function switchToOptimismSepolia() {
    try {
        // 嘗試直接切換網路
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa37dc' }],  // Optimism Sepolia chainId
        });

        console.log('成功切換到Optimism Sepolia');
    } catch (error) {
        // 如果網路不存在，添加網路
        if (error.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [OPTIMISM_SEPOLIA_PARAMS],
                });
                console.log('成功添加並切換到Optimism Sepolia');
            } catch (addError) {
                console.error('添加網路時出錯:', addError);
                alert('無法添加Optimism Sepolia網路: ' + addError.message);
            }
        } else {
            console.error('切換網路時出錯:', error);
            alert('無法切換到Optimism Sepolia網路: ' + error.message);
        }
    }
}

// 檢查ETH餘額
async function checkEthBalance() {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        const currentAccount = accounts[0];

        // 獲取ETH餘額
        const balance = await provider.getBalance(currentAccount.address);
        const ethBalance = ethers.formatEther(balance);

        console.log('ETH餘額:', ethBalance);
        balanceInfo.textContent = `ETH餘額: ${ethBalance} ETH`;
        balanceInfo.classList.remove('hidden');
    } catch (error) {
        console.error('獲取ETH餘額時出錯:', error);
        alert('無法獲取ETH餘額: ' + error.message);
    }
}

// 檢查LPT代幣餘額
async function checkTokenBalance() {
    try {
        // 首先嘗試添加代幣到MetaMask (可選)
        // await addTokenToWallet();

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        const currentAccount = accounts[0];

        // ERC20代幣ABI (只包含balanceOf和decimals函數)
        const tokenABI = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)"
        ];

        // 創建合約實例
        const tokenContract = new ethers.Contract(
            LPT_TOKEN.address,
            tokenABI,
            provider
        );

        // 獲取代幣餘額和小數位數
        const decimals = await tokenContract.decimals();
        const tokenBalance = await tokenContract.balanceOf(currentAccount.address);
        const formattedBalance = ethers.formatUnits(tokenBalance, decimals);
        const symbol = await tokenContract.symbol();

        console.log(`${symbol}代幣餘額:`, formattedBalance);
        balanceInfo.textContent = `${symbol}代幣餘額: ${formattedBalance} ${symbol}`;
        balanceInfo.classList.remove('hidden');
                
    } catch (error) {
        console.error('獲取代幣餘額時出錯:', error);
        alert('無法獲取代幣餘額: ' + error.message);
    }
}

// 添加LPT代幣到MetaMask
async function addTokenToWallet() {
    try {
        // 嘗試添加代幣到MetaMask
        await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: LPT_TOKEN.address,
                    symbol: LPT_TOKEN.symbol,
                    decimals: LPT_TOKEN.decimals,
                    image: LPT_TOKEN.image
                },
            },
        });
        console.log('成功添加LPT代幣到MetaMask');
    } catch (error) {
        console.error('添加代幣時出錯:', error);
        // 這裡我們不顯示錯誤，因為用戶可能已經有了這個代幣或拒絕添加
    }
}

// 重置UI
function resetUI() {
    connectionStatus.textContent = '未連接';
    accountAddress.textContent = '-';
    walletInfo.classList.add('hidden');
    switchNetworkBtn.classList.add('hidden');
    checkEthBalanceBtn.classList.add('hidden');
    checkTokenBalanceBtn.classList.add('hidden');
    balanceInfo.classList.add('hidden');
    connectBtn.disabled = false;
}

// 為按鈕添加事件監聽器
connectBtn.addEventListener('click', connectWallet);
switchNetworkBtn.addEventListener('click', switchToOptimismSepolia);
checkEthBalanceBtn.addEventListener('click', checkEthBalance);
checkTokenBalanceBtn.addEventListener('click', checkTokenBalance);