// npx http-server -c-1
// 等待 DOM 完全載入
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 元素 ---
    const connectButton = document.getElementById('connectButton');
    const getBalanceButton = document.getElementById('getBalanceButton');
    const statusDiv = document.getElementById('status');
    const balanceDiv = document.getElementById('balance');
    const errorDiv = document.getElementById('error');

    // --- Ethers.js 相關變數 ---
    let provider = null;
    let signer = null;
    let currentAccount = null;

    // --- Optimism Sepolia 網路資訊 ---
    const OPTIMISM_SEPOLIA_CHAIN_ID = 11155420; // 十進位
    const OPTIMISM_SEPOLIA_CHAIN_ID_HEX = '0xaa37dc'; // 十六進位

    // --- 更新 UI 狀態 ---
    function updateStatus(message, isError = false) {
        statusDiv.textContent = `狀態：${message}`;
        if (isError) {
            errorDiv.textContent = message;
            balanceDiv.textContent = ''; // 清除餘額顯示
            getBalanceButton.disabled = true; // 發生錯誤時禁用餘額按鈕
        } else {
            errorDiv.textContent = ''; // 清除非錯誤訊息
        }
        console.log(`Status Update: ${message}`);
    }

    // --- 連結錢包並嘗試切換網路 ---
    async function connectWallet() {
        updateStatus('正在嘗試連結錢包...');
        balanceDiv.textContent = ''; // 清除舊餘額
        getBalanceButton.disabled = true; // 預設禁用

        // 檢查 MetaMask 是否安裝
        if (typeof window.ethereum === 'undefined') {
            updateStatus('請先安裝 MetaMask 錢包！', true);
            return;
        }

        try {
            // 1. 建立 Provider (使用 MetaMask 提供的 provider)
            // Ethers v6: 使用 BrowserProvider
            provider = new ethers.BrowserProvider(window.ethereum);

            // 2. 請求使用者授權連結帳戶
            //    provider.send 會觸發 MetaMask 彈窗
            const accounts = await provider.send('eth_requestAccounts', []);
            if (!accounts || accounts.length === 0) {
                updateStatus('未授權連結任何帳戶', true);
                return;
            }
            currentAccount = accounts[0];

            // 3. 取得 Signer 物件，用於後續簽署交易或查詢地址相關資訊
            signer = await provider.getSigner();
            const address = await signer.getAddress();

            // 在 console 顯示帳戶地址
            console.log("連結成功！目前帳戶地址:", address);
            updateStatus(`已連結帳戶: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`);

            // 4. 檢查目前網路是否為 Optimism Sepolia
            await switchToOptimismSepolia();

        } catch (error) {
            console.error("連接錢包或切換網路時發生錯誤:", error);
            let errorMessage = '連接錢包失敗';
            if (error.code === 4001) { // EIP-1193 user rejected request error
               errorMessage = '使用者拒絕了連結請求';
            } else if (error.message) {
               errorMessage = `錯誤: ${error.message}`;
            }
            updateStatus(errorMessage, true);
        }
    }

    // --- 切換到 Optimism Sepolia 網路 ---
    async function switchToOptimismSepolia() {
        if (!provider) {
             updateStatus('Provider 尚未初始化', true);
             return;
        }
        updateStatus('正在檢查網路...');
        try {
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId); // v6 回傳 bigint, 轉 number

            console.log("目前網路 Chain ID:", chainId);

            if (chainId !== OPTIMISM_SEPOLIA_CHAIN_ID) {
                updateStatus(`目前不在 Optimism Sepolia (ChainID: ${OPTIMISM_SEPOLIA_CHAIN_ID})，嘗試切換...`);
                try {
                    // 發送切換網路請求
                    await provider.send('wallet_switchEthereumChain', [
                        { chainId: OPTIMISM_SEPOLIA_CHAIN_ID_HEX },
                    ]);
                    // 切換成功後，需要重新獲取 provider/signer 以確保它們與新網路同步
                    // 通常 MetaMask 會刷新頁面或觸發 chainChanged 事件，但為了確保，可以重新初始化
                    provider = new ethers.BrowserProvider(window.ethereum);
                    signer = await provider.getSigner();
                    updateStatus(`已成功切換至 Optimism Sepolia`);
                    getBalanceButton.disabled = false; // 啟用餘額按鈕

                } catch (switchError) {
                    // 常見錯誤：使用者拒絕或網路尚未加入 MetaMask
                    if (switchError.code === 4902) {
                        updateStatus('Optimism Sepolia 網路尚未加入您的 MetaMask，請手動新增。', true);
                        // 可選：在這裡加入 addChain 的邏輯
                    } else if (switchError.code === 4001) {
                         updateStatus('使用者拒絕切換網路', true);
                    } else {
                        updateStatus(`切換網路失敗: ${switchError.message}`, true);
                    }
                    console.error("切換網路失敗:", switchError);
                    return; // 切換失敗，停止後續操作
                }
            } else {
                updateStatus(`已連接到 Optimism Sepolia`);
                getBalanceButton.disabled = false; // 已在正確網路，啟用餘額按鈕
            }

            // 監聽帳號或網路變更
            listenToWalletChanges();

        } catch (error) {
             console.error("檢查網路時發生錯誤:", error);
             updateStatus(`檢查網路時發生錯誤: ${error.message}`, true);
        }
    }

    // --- 查詢餘額 ---
    async function fetchBalance() {
        if (!provider || !signer) {
            updateStatus('請先連接錢包並切換到 Optimism Sepolia 網路', true);
            return;
        }
        updateStatus('正在查詢餘額...');
        balanceDiv.textContent = '查詢中...';

        try {
            // 確保仍在 Optimism Sepolia
            const network = await provider.getNetwork();
            if (Number(network.chainId) !== OPTIMISM_SEPOLIA_CHAIN_ID) {
                 updateStatus(`請確保您仍在 Optimism Sepolia 網路上 (目前是 ChainID: ${network.chainId})`, true);
                 getBalanceButton.disabled = true;
                 return;
            }

            const address = await signer.getAddress();
            const balanceWei = await provider.getBalance(address);

            // 將 Wei 轉換為 Ether 格式
            // Ethers v6: 使用 formatEther
            const balanceEther = ethers.formatEther(balanceWei);

            console.log("OP Sepolia ETH 餘額 (Wei):", balanceWei.toString());
            console.log("OP Sepolia ETH 餘額 (Ether):", balanceEther);

            balanceDiv.textContent = `您的 OP Sepolia ETH 餘額: ${parseFloat(balanceEther).toFixed(6)} ETH`; // 顯示到小數點後6位
            updateStatus(`已連接到 Optimism Sepolia (${address.substring(0, 6)}...${address.substring(address.length - 4)})`); // 更新狀態但不顯示錯誤

        } catch (error) {
            console.error("查詢餘額失敗:", error);
            updateStatus(`查詢餘額失敗: ${error.message}`, true);
            balanceDiv.textContent = ''; // 清除餘額顯示
        }
    }

    // --- 監聽錢包事件 ---
    function listenToWalletChanges() {
        if (window.ethereum) {
            // 監聽帳號變更
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('偵測到帳號變更:', accounts);
                if (accounts.length === 0) {
                    // 使用者斷開連結
                    updateStatus('錢包已斷開連結', true);
                    currentAccount = null;
                    signer = null;
                    provider = null; // 清除 provider
                    getBalanceButton.disabled = true;
                    balanceDiv.textContent = '';
                    connectButton.textContent = '連結錢包 & 切換至 OP Sepolia'; // 重設按鈕文字
                } else {
                    // 切換到新帳號，重新執行連結流程的部分邏輯
                    updateStatus('偵測到帳號變更，重新整理狀態...');
                    connectWallet(); // 重新執行連接，會更新帳號並檢查網路
                }
            });

            // 監聽網路變更
            window.ethereum.on('chainChanged', (chainIdHex) => {
                const chainIdDecimal = parseInt(chainIdHex, 16);
                console.log('偵測到網路變更:', chainIdHex, `(十進位: ${chainIdDecimal})`);
                updateStatus(`網路已變更為 ChainID: ${chainIdDecimal}，重新檢查網路...`);
                // 重新檢查網路狀態，決定是否啟用餘額按鈕
                // 注意：直接呼叫 switchToOptimismSepolia 可能會再次觸發切換請求，
                // 更好的做法是僅更新狀態和按鈕可用性
                if (chainIdDecimal === OPTIMISM_SEPOLIA_CHAIN_ID) {
                    getBalanceButton.disabled = false;
                    updateStatus(`已連接到 Optimism Sepolia`);
                    // 可以選擇自動查詢餘額
                    // fetchBalance();
                } else {
                    getBalanceButton.disabled = true;
                    balanceDiv.textContent = ''; // 清除非目標網路的餘額顯示
                    updateStatus(`已切換到非 Optimism Sepolia 網路 (ChainID: ${chainIdDecimal})`);
                }
                // 可能需要重新創建 provider 和 signer 以適應新網路
                 provider = new ethers.BrowserProvider(window.ethereum);
                 provider.getSigner().then(newSigner => {
                    signer = newSigner;
                 }).catch(err => {
                    console.error("獲取新網路的Signer失敗:", err);
                    updateStatus('獲取新網路的Signer失敗', true);
                 });
            });
        }
    }


    // --- 事件監聽器綁定 ---
    connectButton.addEventListener('click', connectWallet);
    getBalanceButton.addEventListener('click', fetchBalance);

    // --- 頁面載入時嘗試自動連接 (如果之前已授權) ---
    // 注意：這可能會在每次頁面刷新時都彈出 MetaMask，除非使用者已授權
    // provider = new ethers.BrowserProvider(window.ethereum);
    // provider.listAccounts().then(accounts => {
    //     if (accounts.length > 0) {
    //         console.log("檢測到已授權的帳戶，嘗試自動連接...");
    //         connectWallet();
    //     } else {
    //         console.log("未檢測到先前授權的帳戶。");
    //     }
    // }).catch(err => {
    //     console.log("檢查先前授權時出錯或未安裝MetaMask:", err.message);
    // });


}); // End of DOMContentLoaded