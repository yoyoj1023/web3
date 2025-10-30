// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleFinder
 * @notice 簡化版的 Finder 合約，用於學習服務定位器模式
 * @dev 這是一個教學用的簡化實現，真實的 UMA Finder 位於 protocol/packages/core/contracts/data-verification-mechanism/implementation/Finder.sol
 */
contract SimpleFinder is Ownable {
    // ========== 狀態變數 ==========
    
    /// @notice 介面名稱到實現地址的映射
    /// @dev 使用 bytes32 而非 string 以節省 gas
    mapping(bytes32 => address) public interfacesImplemented;

    // ========== 事件 ==========
    
    /// @notice 當介面實現地址改變時觸發
    /// @param interfaceName 介面名稱
    /// @param newImplementationAddress 新的實現地址
    event InterfaceImplementationChanged(
        bytes32 indexed interfaceName, 
        address indexed newImplementationAddress
    );

    // ========== 外部函數 ==========

    /**
     * @notice 更新或註冊介面的實現地址
     * @dev 只有 Owner（通常是治理合約）可以調用
     * @param interfaceName 介面名稱（例如 "Store", "OptimisticOracleV3"）
     * @param implementationAddress 實現合約的地址
     */
    function changeImplementationAddress(
        bytes32 interfaceName, 
        address implementationAddress
    )
        external
        onlyOwner
    {
        require(implementationAddress != address(0), "Cannot set to zero address");
        
        interfacesImplemented[interfaceName] = implementationAddress;
        
        emit InterfaceImplementationChanged(interfaceName, implementationAddress);
    }

    /**
     * @notice 批量更新多個介面的實現地址
     * @dev Gas 優化：一次交易更新多個介面
     * @param interfaceNames 介面名稱數組
     * @param implementationAddresses 實現地址數組
     */
    function batchChangeImplementationAddresses(
        bytes32[] calldata interfaceNames,
        address[] calldata implementationAddresses
    )
        external
        onlyOwner
    {
        require(
            interfaceNames.length == implementationAddresses.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < interfaceNames.length; i++) {
            require(implementationAddresses[i] != address(0), "Cannot set to zero address");
            
            interfacesImplemented[interfaceNames[i]] = implementationAddresses[i];
            
            emit InterfaceImplementationChanged(
                interfaceNames[i], 
                implementationAddresses[i]
            );
        }
    }

    /**
     * @notice 獲取介面的實現地址
     * @param interfaceName 查詢的介面名稱
     * @return 實現合約的地址
     */
    function getImplementationAddress(bytes32 interfaceName) 
        external 
        view 
        returns (address) 
    {
        address implementationAddress = interfacesImplemented[interfaceName];
        require(implementationAddress != address(0), "Implementation not found");
        return implementationAddress;
    }

    /**
     * @notice 檢查介面是否已註冊
     * @param interfaceName 查詢的介面名稱
     * @return 如果已註冊返回 true
     */
    function isInterfaceRegistered(bytes32 interfaceName) 
        external 
        view 
        returns (bool) 
    {
        return interfacesImplemented[interfaceName] != address(0);
    }
}

/**
 * 使用範例：
 * 
 * // 1. 部署 Finder
 * SimpleFinder finder = new SimpleFinder();
 * 
 * // 2. 註冊 Store 地址
 * bytes32 storeInterface = bytes32("Store");
 * finder.changeImplementationAddress(storeInterface, storeAddress);
 * 
 * // 3. 查詢 Store 地址
 * address retrievedStore = finder.getImplementationAddress(storeInterface);
 * 
 * // 4. 在應用合約中使用
 * contract MyApp {
 *     SimpleFinder public finder;
 *     
 *     constructor(address _finder) {
 *         finder = SimpleFinder(_finder);
 *     }
 *     
 *     function getStore() public view returns (address) {
 *         return finder.getImplementationAddress("Store");
 *     }
 * }
 */

