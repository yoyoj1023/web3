// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// UUPS (Universal Upgradeable Proxy Standard) - ERC-1822
// 主要差異：升級邏輯在實現合約中，而不是在代理合約中

contract CounterV1 {
    uint256 public count;

    function inc() external {
        count += 1;
    }
}

contract CounterV2 {
    uint256 public count;

    function inc() external {
        count += 1;
    }

    function dec() external {
        count -= 1;
    }
}

// UUPS Proxy - 比 Transparent Proxy 更簡單，沒有管理員邏輯
contract UUPSProxy {
    // EIP-1822: Universal Upgradeable Proxy Standard
    // 存儲槽：keccak256("PROXIABLE")
    // 0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7
    bytes32 private constant PROXIABLE_SLOT =
        keccak256("PROXIABLE");

    constructor(address _implementation) {
        require(
            _implementation.code.length > 0,
            "implementation is not a contract"
        );
        StorageSlot.getAddressSlot(PROXIABLE_SLOT).value = _implementation;
    }

    function _getImplementation() private view returns (address) {
        return StorageSlot.getAddressSlot(PROXIABLE_SLOT).value;
    }

    function _delegate(address _implementation) internal virtual {
        assembly {
            // Copy msg.data
            calldatacopy(0, 0, calldatasize())

            // Call the implementation
            let result :=
                delegatecall(gas(), _implementation, 0, calldatasize(), 0, 0)

            // Copy the returned data
            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    function _fallback() private {
        _delegate(_getImplementation());
    }

    fallback() external payable {
        _fallback();
    }

    receive() external payable {
        _fallback();
    }
}

// UUPS 實現合約基類
// 所有可升級的實現合約都應該繼承這個合約
abstract contract Proxiable {
    // EIP-1822 UUID: 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
    bytes32 private constant PROXIABLE_UUID_HASH =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    // EIP-1822 存儲槽
    bytes32 private constant PROXIABLE_SLOT =
        keccak256("PROXIABLE");

    // 必須實現此函數以符合 EIP-1822
    function proxiableUUID() public pure virtual returns (bytes32) {
        return PROXIABLE_UUID_HASH;
    }

    // 更新實現地址
    // 注意：此函數必須在實現合約中實現，並包含適當的權限檢查
    function updateCodeAddress(address newAddress) internal {
        require(
            Proxiable(newAddress).proxiableUUID() == this.proxiableUUID(),
            "UUID mismatch"
        );
        require(
            newAddress.code.length > 0,
            "newAddress is not a contract"
        );
        StorageSlot.getAddressSlot(PROXIABLE_SLOT).value = newAddress;
        emit CodeUpdated(newAddress);
    }

    event CodeUpdated(address indexed newAddress);
}

// UUPS Counter V1 實現
contract CounterV1UUPS is Proxiable {
    uint256 public count;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function inc() external {
        count += 1;
    }

    // UUPS 升級函數 - 必須在實現合約中實現
    function upgradeTo(address newImplementation) external onlyOwner {
        updateCodeAddress(newImplementation);
    }
}

// UUPS Counter V2 實現
contract CounterV2UUPS is Proxiable {
    uint256 public count;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function inc() external {
        count += 1;
    }

    function dec() external {
        count -= 1;
    }

    // UUPS 升級函數 - 必須在實現合約中實現
    function upgradeTo(address newImplementation) external onlyOwner {
        updateCodeAddress(newImplementation);
    }
}

// 更完整的 UUPS 實現範例（包含初始化邏輯）
contract CounterV1UUPSInitializable is Proxiable {
    uint256 public count;
    address public owner;
    bool private _initialized;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyOnce() {
        require(!_initialized, "already initialized");
        _;
        _initialized = true;
    }

    // 初始化函數 - 在代理部署後調用
    function initialize(address _owner) external onlyOnce {
        owner = _owner;
    }

    function inc() external {
        count += 1;
    }

    function upgradeTo(address newImplementation) external onlyOwner {
        updateCodeAddress(newImplementation);
    }
}

contract CounterV2UUPSInitializable is Proxiable {
    uint256 public count;
    address public owner;
    bool private _initialized;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyOnce() {
        require(!_initialized, "already initialized");
        _;
        _initialized = true;
    }

    // 初始化函數 - 在代理部署後調用
    function initialize(address _owner) external onlyOnce {
        owner = _owner;
    }

    function inc() external {
        count += 1;
    }

    function dec() external {
        count -= 1;
    }

    function upgradeTo(address newImplementation) external onlyOwner {
        updateCodeAddress(newImplementation);
    }
}

library StorageSlot {
    struct AddressSlot {
        address value;
    }

    function getAddressSlot(bytes32 slot)
        internal
        pure
        returns (AddressSlot storage r)
    {
        assembly {
            r.slot := slot
        }
    }
}

// 測試和工具合約
contract UUPSHelper {
    // 獲取代理的實現地址
    function getImplementation(address proxy)
        external
        view
        returns (address)
    {
        bytes32 slot = keccak256("PROXIABLE");
        return StorageSlot.getAddressSlot(slot).value;
    }

    // 檢查合約是否符合 UUPS 標準
    function isProxiable(address implementation)
        external
        view
        returns (bool)
    {
        try Proxiable(implementation).proxiableUUID() returns (
            bytes32 uuid
        ) {
            return
                uuid ==
                0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
        } catch {
            return false;
        }
    }
}

