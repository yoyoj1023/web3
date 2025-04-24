from web3 import Web3
import json

# 初始化 Web3
infura_url = 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'
web3 = Web3(Web3.HTTPProvider(infura_url))

# 檢查連接狀態
if not web3.isConnected():
    raise Exception("Failed to connect to the Ethereum network")

# 讀取合約 ABI
with open('../build/contracts/FirstToken.json', 'r') as file:
    contract_json = json.load(file)
    contract_abi = contract_json['abi']

# 合約地址
contract_address = 'YOUR_CONTRACT_ADDRESS'

# 初始化合約實例
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

# 你的帳戶地址
account = 'YOUR_ACCOUNT_ADDRESS'

# 轉帳功能
def transfer(to, value):
    nonce = web3.eth.getTransactionCount(account)
    tx = contract.functions.transfer(to, value).buildTransaction({
        'chainId': 1,
        'gas': 2000000,
        'gasPrice': web3.toWei('50', 'gwei'),
        'nonce': nonce
    })

    # 簽署交易
    signed_tx = web3.eth.account.signTransaction(tx, private_key='YOUR_PRIVATE_KEY')

    # 發送交易
    tx_hash = web3.eth.sendRawTransaction(signed_tx.rawTransaction)
    print(f'Transaction hash: {tx_hash.hex()}')

    # 等待交易完成
    tx_receipt = web3.eth.waitForTransactionReceipt(tx_hash)
    print(f'Transaction receipt: {tx_receipt}')

# 調用轉帳功能
transfer('RECIPIENT_ADDRESS', web3.toWei(1, 'ether'))