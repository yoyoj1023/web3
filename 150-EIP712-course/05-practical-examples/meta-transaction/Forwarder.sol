// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title Forwarder
 * @notice 實現 ERC-2771 元交易轉發器
 * @dev 允許使用者透過簽名委託第三方執行交易（gasless）
 */
contract Forwarder is EIP712 {
    using ECDSA for bytes32;

    /**
     * @dev ForwardRequest 結構
     * @param from 原始發送者
     * @param to 目標合約
     * @param value 發送的 ETH 數量
     * @param gas Gas 限制
     * @param nonce 防重放 nonce
     * @param deadline 過期時間
     * @param data 調用數據
     */
    struct ForwardRequest {
        address from;
        address to;
        uint256 value;
        uint256 gas;
        uint256 nonce;
        uint256 deadline;
        bytes data;
    }

    // 類型哈希
    bytes32 private constant FORWARD_REQUEST_TYPEHASH =
        keccak256(
            "ForwardRequest(address from,address to,uint256 value,uint256 gas,uint256 nonce,uint256 deadline,bytes data)"
        );

    // 每個地址的 nonce
    mapping(address => uint256) public nonces;

    // 事件
    event ForwardExecuted(
        address indexed from,
        address indexed to,
        bool success,
        bytes returnData
    );

    /**
     * @notice 建構子
     */
    constructor() EIP712("Forwarder", "1") {}

    /**
     * @notice 獲取 ForwardRequest 的結構哈希
     * @param req ForwardRequest 結構
     * @return 結構哈希
     */
    function _hashForwardRequest(ForwardRequest calldata req)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    FORWARD_REQUEST_TYPEHASH,
                    req.from,
                    req.to,
                    req.value,
                    req.gas,
                    req.nonce,
                    req.deadline,
                    keccak256(req.data) // bytes 類型需要先哈希
                )
            );
    }

    /**
     * @notice 驗證 ForwardRequest 的簽名
     * @param req ForwardRequest 結構
     * @param signature 簽名
     * @return 簽名是否有效
     */
    function verify(ForwardRequest calldata req, bytes calldata signature)
        public
        view
        returns (bool)
    {
        address signer = _hashTypedDataV4(_hashForwardRequest(req))
            .recover(signature);
        return signer == req.from;
    }

    /**
     * @notice 執行元交易
     * @param req ForwardRequest 結構
     * @param signature 簽名
     * @return success 執行是否成功
     * @return returnData 返回數據
     */
    function execute(ForwardRequest calldata req, bytes calldata signature)
        public
        payable
        returns (bool success, bytes memory returnData)
    {
        // 1. 檢查 nonce
        require(nonces[req.from] == req.nonce, "Forwarder: invalid nonce");

        // 2. 檢查 deadline
        require(
            block.timestamp <= req.deadline,
            "Forwarder: request expired"
        );

        // 3. 驗證簽名
        require(verify(req, signature), "Forwarder: signature mismatch");

        // 4. 增加 nonce（防止重放）
        nonces[req.from]++;

        // 5. 執行調用
        // 注意：我們在 calldata 後面附加 req.from，這樣目標合約可以獲取原始發送者
        bytes memory data = abi.encodePacked(req.data, req.from);

        (success, returnData) = req.to.call{gas: req.gas, value: req.value}(
            data
        );

        // 6. 發出事件
        emit ForwardExecuted(req.from, req.to, success, returnData);

        // 7. 如果需要，可以要求調用必須成功
        // require(success, "Forwarder: call failed");
    }

    /**
     * @notice 批量執行元交易
     * @param reqs ForwardRequest 陣列
     * @param signatures 簽名陣列
     * @return successes 執行結果陣列
     */
    function executeBatch(
        ForwardRequest[] calldata reqs,
        bytes[] calldata signatures
    ) external payable returns (bool[] memory successes) {
        require(
            reqs.length == signatures.length,
            "Forwarder: length mismatch"
        );

        successes = new bool[](reqs.length);

        for (uint256 i = 0; i < reqs.length; i++) {
            (bool success, ) = execute(reqs[i], signatures[i]);
            successes[i] = success;
        }
    }

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
}

