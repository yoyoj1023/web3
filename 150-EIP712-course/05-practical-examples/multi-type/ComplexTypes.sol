// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title ComplexTypes
 * @notice 示範如何處理 EIP-712 中的複雜類型和嵌套結構
 * @dev 包含陣列、嵌套結構、動態類型等範例
 */
contract ComplexTypes is EIP712 {
    using ECDSA for bytes32;

    // ========== 基本結構 ==========

    /**
     * @dev 簡單的 Person 結構
     */
    struct Person {
        string name;
        address wallet;
    }

    /**
     * @dev Item 結構（用於訂單）
     */
    struct Item {
        string name;
        uint256 price;
        uint256 quantity;
    }

    /**
     * @dev 訂單結構（包含嵌套和陣列）
     */
    struct Order {
        address buyer;
        address seller;
        Item[] items;
        uint256 deadline;
        uint256 nonce;
    }

    /**
     * @dev NFT 屬性結構（嵌套結構）
     */
    struct NFTAttributes {
        string name;
        string description;
        Person creator;
        string[] tags;
        uint256 timestamp;
    }

    // ========== 類型哈希 ==========

    bytes32 private constant PERSON_TYPEHASH =
        keccak256("Person(string name,address wallet)");

    bytes32 private constant ITEM_TYPEHASH =
        keccak256("Item(string name,uint256 price,uint256 quantity)");

    bytes32 private constant ORDER_TYPEHASH =
        keccak256(
            "Order(address buyer,address seller,Item[] items,uint256 deadline,uint256 nonce)Item(string name,uint256 price,uint256 quantity)"
        );

    bytes32 private constant NFT_ATTRIBUTES_TYPEHASH =
        keccak256(
            "NFTAttributes(string name,string description,Person creator,string[] tags,uint256 timestamp)Person(string name,address wallet)"
        );

    // ========== 狀態變數 ==========

    mapping(address => uint256) public nonces;
    mapping(bytes32 => bool) public processedOrders;

    // ========== 事件 ==========

    event OrderProcessed(bytes32 indexed orderHash, address indexed buyer);
    event NFTAttributesVerified(bytes32 indexed attrHash, address indexed signer);

    constructor() EIP712("ComplexTypes", "1") {}

    // ========== Person 相關 ==========

    /**
     * @notice 計算 Person 結構的哈希
     * @param person Person 結構
     * @return Person 結構的哈希值
     */
    function _hashPerson(Person memory person) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    PERSON_TYPEHASH,
                    keccak256(bytes(person.name)), // string 需要先哈希
                    person.wallet
                )
            );
    }

    // ========== Item 相關 ==========

    /**
     * @notice 計算 Item 結構的哈希
     * @param item Item 結構
     * @return Item 結構的哈希值
     */
    function _hashItem(Item memory item) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    ITEM_TYPEHASH,
                    keccak256(bytes(item.name)), // string 需要先哈希
                    item.price,
                    item.quantity
                )
            );
    }

    /**
     * @notice 計算 Item 陣列的哈希
     * @param items Item 陣列
     * @return Item 陣列的哈希值
     */
    function _hashItems(Item[] memory items) internal pure returns (bytes32) {
        bytes32[] memory itemHashes = new bytes32[](items.length);
        for (uint256 i = 0; i < items.length; i++) {
            itemHashes[i] = _hashItem(items[i]);
        }
        return keccak256(abi.encodePacked(itemHashes));
    }

    // ========== Order 相關 ==========

    /**
     * @notice 計算 Order 結構的哈希
     * @param order Order 結構
     * @return Order 結構的哈希值
     */
    function _hashOrder(Order memory order) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    ORDER_TYPEHASH,
                    order.buyer,
                    order.seller,
                    _hashItems(order.items), // 陣列需要先計算哈希
                    order.deadline,
                    order.nonce
                )
            );
    }

    /**
     * @notice 驗證訂單簽名
     * @param order Order 結構
     * @param signature 簽名
     * @return 簽名者地址
     */
    function verifyOrder(Order memory order, bytes memory signature)
        public
        view
        returns (address)
    {
        bytes32 digest = _hashTypedDataV4(_hashOrder(order));
        return digest.recover(signature);
    }

    /**
     * @notice 處理訂單
     * @param order Order 結構
     * @param signature 簽名
     */
    function processOrder(Order memory order, bytes memory signature) external {
        // 1. 驗證簽名
        address signer = verifyOrder(order, signature);
        require(signer == order.buyer, "Invalid buyer signature");

        // 2. 檢查 nonce
        require(nonces[order.buyer] == order.nonce, "Invalid nonce");
        nonces[order.buyer]++;

        // 3. 檢查 deadline
        require(block.timestamp <= order.deadline, "Order expired");

        // 4. 檢查是否已處理
        bytes32 orderHash = _hashOrder(order);
        require(!processedOrders[orderHash], "Order already processed");
        processedOrders[orderHash] = true;

        // 5. 發出事件
        emit OrderProcessed(orderHash, order.buyer);

        // 實際應用中，這裡會處理支付和轉移商品
    }

    // ========== NFTAttributes 相關 ==========

    /**
     * @notice 計算 string 陣列的哈希
     * @param tags string 陣列
     * @return string 陣列的哈希值
     */
    function _hashTags(string[] memory tags) internal pure returns (bytes32) {
        bytes32[] memory tagHashes = new bytes32[](tags.length);
        for (uint256 i = 0; i < tags.length; i++) {
            tagHashes[i] = keccak256(bytes(tags[i]));
        }
        return keccak256(abi.encodePacked(tagHashes));
    }

    /**
     * @notice 計算 NFTAttributes 結構的哈希
     * @param attrs NFTAttributes 結構
     * @return NFTAttributes 結構的哈希值
     */
    function _hashNFTAttributes(NFTAttributes memory attrs)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    NFT_ATTRIBUTES_TYPEHASH,
                    keccak256(bytes(attrs.name)), // string 需要先哈希
                    keccak256(bytes(attrs.description)), // string 需要先哈希
                    _hashPerson(attrs.creator), // 嵌套結構需要先計算哈希
                    _hashTags(attrs.tags), // string[] 需要特殊處理
                    attrs.timestamp
                )
            );
    }

    /**
     * @notice 驗證 NFT 屬性簽名
     * @param attrs NFTAttributes 結構
     * @param signature 簽名
     * @return 簽名者地址
     */
    function verifyNFTAttributes(NFTAttributes memory attrs, bytes memory signature)
        public
        view
        returns (address)
    {
        bytes32 digest = _hashTypedDataV4(_hashNFTAttributes(attrs));
        return digest.recover(signature);
    }

    /**
     * @notice 驗證並記錄 NFT 屬性
     * @param attrs NFTAttributes 結構
     * @param signature 簽名
     */
    function verifyAndRecordNFTAttributes(
        NFTAttributes memory attrs,
        bytes memory signature
    ) external {
        // 1. 驗證簽名
        address signer = verifyNFTAttributes(attrs, signature);
        require(
            signer == attrs.creator.wallet,
            "Signer must be the creator"
        );

        // 2. 發出事件
        bytes32 attrHash = _hashNFTAttributes(attrs);
        emit NFTAttributesVerified(attrHash, signer);

        // 實際應用中，這裡會鑄造 NFT 或記錄屬性
    }

    // ========== 工具函數 ==========

    /**
     * @notice 獲取使用者當前的 nonce
     * @param user 使用者地址
     * @return 當前 nonce
     */
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }

    /**
     * @notice 獲取 DOMAIN_SEPARATOR
     * @return EIP-712 domain separator
     */
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @notice 檢查訂單是否已處理
     * @param orderHash 訂單哈希
     * @return 是否已處理
     */
    function isOrderProcessed(bytes32 orderHash) external view returns (bool) {
        return processedOrders[orderHash];
    }
}

