from web3 import Web3
import asyncio
import json

async def main():
    # 連接到你的 RPC (例如 Alchemy, Infura, 或本地節點)
    # rpc_url = "https://eth-goerli.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY"  # 更換為你的 RPC
    # web3 = Web3(Web3.HTTPProvider(rpc_url))

    # 连接到以太坊网络（这里使用Web3而不是hardhat）
    # 你可能需要根据你的环境修改这个连接字符串
    w3 = Web3(Web3.HTTPProvider("http://localhost:8545"))
    assert w3.is_connected(), "無法連線到本地節點"
    
    # 替换为你的合约地址
    contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    contract_address_counter = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    
    print("合约地址:", contract_address)
    print("Counter 合约地址:", contract_address_counter)
    
    # 加载合约 ABI（需要你提供合约的 ABI）
    # 这里假设你已经有 HelloWorld.json 和 Counter.json 文件，包含了编译后的合约信息
    with open("artifacts/contracts/HelloWorld.sol/HelloWorld.json", "r") as f:
        hello_world_json = json.load(f)
    hello_world_abi = hello_world_json["abi"]
    
    with open("artifacts/contracts/Counter.sol/Counter.json", "r") as f:
        counter_json = json.load(f)
    counter_abi = counter_json["abi"]
    
    # 连接到已部署的合约
    hello = w3.eth.contract(address=contract_address, abi=hello_world_abi)
    counter = w3.eth.contract(address=contract_address_counter, abi=counter_abi)
    
    # 调用 getMessage 函数
    message = hello.functions.getMessage().call()
    print("Contract Message:", message)
    
    # 获取交易发送账户
    accounts = w3.eth.accounts
    from_account = accounts[0]
    
    # 调用计数器相关函数
    print("增加计数器: ")
    tx_hash = counter.functions.increment().transact({'from': from_account})
    # 等待交易被确认
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    count = counter.functions.getCount().call()
    print("目前计数器: ", count)
    
    print("增加计数器: ")
    tx_hash = counter.functions.increment().transact({'from': from_account})
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    count = counter.functions.getCount().call()
    print("目前计数器: ", count)
    
    print("减少计数器: ")
    tx_hash = counter.functions.decrement().transact({'from': from_account})
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    count = counter.functions.getCount().call()
    print("目前计数器: ", count)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as error:
        print(f"Error: {error}")
        exit(1)