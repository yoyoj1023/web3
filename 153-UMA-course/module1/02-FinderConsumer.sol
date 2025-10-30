// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FinderConsumer
 * @notice 示範如何在應用合約中使用 Finder 來動態查找其他合約
 * @dev 這是一個教學範例，展示了服務定位器模式的實際應用
 */

/// @notice Finder 介面
interface IFinder {
    function getImplementationAddress(bytes32 interfaceName) external view returns (address);
}

/// @notice 簡化的 Store 介面
interface IStore {
    function computeFinalFee(address currency) external view returns (uint256);
}

/// @notice 簡化的 OptimisticOracleV3 介面
interface IOptimisticOracleV3 {
    function assertTruthWithDefaults(bytes calldata claim, address asserter) external returns (bytes32);
    function getAssertion(bytes32 assertionId) external view returns (bool);
}

contract FinderConsumer {
    // ========== 常量 ==========
    
    /// @notice 常用的介面名稱
    bytes32 public constant STORE = "Store";
    bytes32 public constant OO_V3 = "OptimisticOracleV3";
    bytes32 public constant ORACLE = "Oracle";
    
    // ========== 狀態變數 ==========
    
    /// @notice Finder 合約的地址（不可變，部署後無法修改）
    /// @dev 使用 immutable 而非 constant，因為需要在構造函數中設定
    IFinder public immutable finder;
    
    // ========== 事件 ==========
    
    event ContractLookedUp(string contractName, address contractAddress);
    
    // ========== 構造函數 ==========
    
    /**
     * @notice 構造函數
     * @param _finderAddress Finder 合約的地址
     */
    constructor(address _finderAddress) {
        require(_finderAddress != address(0), "Finder address cannot be zero");
        finder = IFinder(_finderAddress);
    }
    
    // ========== 查找函數 ==========
    
    /**
     * @notice 獲取 Store 合約地址
     * @return Store 合約的地址
     */
    function getStoreAddress() public returns (address) {
        address storeAddress = finder.getImplementationAddress(STORE);
        emit ContractLookedUp("Store", storeAddress);
        return storeAddress;
    }
    
    /**
     * @notice 獲取 OptimisticOracleV3 合約地址
     * @return OptimisticOracleV3 合約的地址
     */
    function getOOv3Address() public returns (address) {
        address oov3Address = finder.getImplementationAddress(OO_V3);
        emit ContractLookedUp("OptimisticOracleV3", oov3Address);
        return oov3Address;
    }
    
    /**
     * @notice 獲取 Oracle (VotingV2) 合約地址
     * @return Oracle 合約的地址
     */
    function getOracleAddress() public returns (address) {
        address oracleAddress = finder.getImplementationAddress(ORACLE);
        emit ContractLookedUp("Oracle", oracleAddress);
        return oracleAddress;
    }
    
    // ========== 與其他合約交互 ==========
    
    /**
     * @notice 查詢指定貨幣的 final fee
     * @param currency ERC20 代幣地址
     * @return Final fee 金額
     */
    function queryFinalFee(address currency) external returns (uint256) {
        // 動態查找 Store 地址
        IStore store = IStore(finder.getImplementationAddress(STORE));
        
        // 調用 Store 的方法
        return store.computeFinalFee(currency);
    }
    
    /**
     * @notice 通過 OptimisticOracleV3 提出斷言
     * @param claim 斷言內容
     * @return assertionId 斷言的唯一標識符
     */
    function makeAssertion(bytes calldata claim) external returns (bytes32) {
        // 動態查找 OptimisticOracleV3 地址
        IOptimisticOracleV3 oo = IOptimisticOracleV3(
            finder.getImplementationAddress(OO_V3)
        );
        
        // 提出斷言
        return oo.assertTruthWithDefaults(claim, msg.sender);
    }
    
    /**
     * @notice 檢查斷言狀態
     * @param assertionId 斷言 ID
     * @return 斷言是否已解決
     */
    function checkAssertion(bytes32 assertionId) external view returns (bool) {
        IOptimisticOracleV3 oo = IOptimisticOracleV3(
            finder.getImplementationAddress(OO_V3)
        );
        
        return oo.getAssertion(assertionId);
    }
    
    // ========== 輔助函數 ==========
    
    /**
     * @notice 將字符串轉換為 bytes32
     * @dev 用於構造介面名稱
     * @param source 源字符串
     * @return result bytes32 結果
     */
    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        
        assembly {
            result := mload(add(source, 32))
        }
    }
    
    /**
     * @notice 查找自定義介面的地址
     * @param interfaceName 介面名稱（字符串格式）
     * @return 實現地址
     */
    function lookupCustomInterface(string memory interfaceName) 
        external 
        view 
        returns (address) 
    {
        bytes32 interfaceBytes = stringToBytes32(interfaceName);
        return finder.getImplementationAddress(interfaceBytes);
    }
}

/**
 * 測試腳本範例（使用 Hardhat/Foundry）:
 * 
 * // 部署 Finder
 * const Finder = await ethers.getContractFactory("SimpleFinder");
 * const finder = await Finder.deploy();
 * 
 * // 註冊 Store
 * await finder.changeImplementationAddress(
 *     ethers.utils.formatBytes32String("Store"),
 *     storeAddress
 * );
 * 
 * // 部署 FinderConsumer
 * const Consumer = await ethers.getContractFactory("FinderConsumer");
 * const consumer = await Consumer.deploy(finder.address);
 * 
 * // 查找 Store 地址
 * const storeAddr = await consumer.getStoreAddress();
 * console.log("Store address:", storeAddr);
 * 
 * // 查詢 final fee
 * const finalFee = await consumer.queryFinalFee(usdcAddress);
 * console.log("Final fee:", ethers.utils.formatUnits(finalFee, 6), "USDC");
 */

