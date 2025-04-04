// 合約地址和 ABI（需替換為實際地址）
const tokenLockerAddress = "YOUR_TOKEN_LOCKER_CONTRACT_ADDRESS"; // 替換為你的 TokenLocker 合約地址
const erc20TokenAddress = "YOUR_ERC20_TOKEN_ADDRESS"; // 替換為你的 ERC20 代幣地址

const tokenLockerABI = [
    "function deposit(uint256 amount) external",
    "function withdraw() external",
    "function balances(address) view returns (uint256)",
    "function depositTimes(address) view returns (uint256)"
];

const erc20ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) view returns (uint256)"
];

let provider;
let signer;
let tokenLockerContract;
let erc20Contract;
let userAddress;

// 連接狐狸錢包
document.getElementById('connectWallet').addEventListener('click', async () => {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        document.getElementById('walletAddress').innerText = userAddress;
        document.getElementById('walletInfo').style.display = 'block';
        document.getElementById('connectWallet').style.display = 'none';
        tokenLockerContract = new ethers.Contract(tokenLockerAddress, tokenLockerABI, signer);
        erc20Contract = new ethers.Contract(erc20TokenAddress, erc20ABI, signer);
        updateBalances();
    } else {
        alert("請安裝 MetaMask！");
    }
});

// 更新餘額
async function updateBalances() {
    const tokenBalance = await erc20Contract.balanceOf(userAddress);
    const lockedBalance = await tokenLockerContract.balances(userAddress);
    document.getElementById('tokenBalance').innerText = ethers.utils.formatUnits(tokenBalance, 18);
    document.getElementById('lockedBalance').innerText = ethers.utils.formatUnits(lockedBalance, 18);
}

// 存款
document.getElementById('depositButton').addEventListener('click', async () => {
    const amount = document.getElementById('depositAmount').value;
    if (amount <= 0) {
        alert("請輸入有效的金額");
        return;
    }
    const amountWei = ethers.utils.parseUnits(amount, 18);
    
    // 先授權合約使用代幣
    const approveTx = await erc20Contract.approve(tokenLockerAddress, amountWei);
    await approveTx.wait();
    
    // 調用 deposit 函數
    const depositTx = await tokenLockerContract.deposit(amountWei);
    await depositTx.wait();
    
    updateBalances();
});

// 提款
document.getElementById('withdrawButton').addEventListener('click', async () => {
    try {
        const withdrawTx = await tokenLockerContract.withdraw();
        await withdrawTx.wait();
        updateBalances();
    } catch (error) {
        alert("提款失敗: " + error.message);
    }
});