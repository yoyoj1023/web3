// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PermitToken
 * @dev ERC20 代幣，支持 EIP-2612 Permit 功能
 * 
 * Permit 允許使用者通過簽名進行授權，而不需要發送交易。
 * 這實現了 gasless 授權，大大改善了使用者體驗。
 * 
 * 標準流程（需要2筆交易）:
 * 1. approve(spender, amount) - 使用者支付 gas
 * 2. transferFrom(from, to, amount) - spender 支付 gas
 * 
 * Permit 流程（只需1筆交易）:
 * 1. 使用者鏈下簽名
 * 2. permit(owner, spender, value, deadline, v, r, s) - 任何人支付 gas
 * 3. transferFrom(from, to, amount) - spender 支付 gas
 * 
 * 或者更進一步，結合 permit 和 transferFrom:
 * 1. 使用者鏈下簽名
 * 2. permitAndTransfer(...) - 接收者或中繼者支付 gas
 */
contract PermitToken {
    
    // ============================================
    // ERC20 基本狀態
    // ============================================
    
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // ============================================
    // EIP-2612 Permit 狀態
    // ============================================
    
    /// @notice 每個地址的 nonce，用於防止重放攻擊
    mapping(address => uint256) public nonces;
    
    /// @notice EIP712 Domain Separator
    bytes32 public immutable DOMAIN_SEPARATOR;
    
    /// @notice Permit 類型哈希
    bytes32 public constant PERMIT_TYPEHASH = keccak256(
        "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );
    
    // ============================================
    // 事件
    // ============================================
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // ============================================
    // 構造函數
    // ============================================
    
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        
        // 計算 Domain Separator
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(_name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
        
        // 鑄造初始供應量給部署者
        _mint(msg.sender, 1000000 * 10**18); // 1,000,000 tokens
    }
    
    // ============================================
    // ERC20 標準函數
    // ============================================
    
    function transfer(address to, uint256 value) public returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        allowance[from][msg.sender] -= value;
        _transfer(from, to, value);
        return true;
    }
    
    // ============================================
    // EIP-2612 Permit 功能
    // ============================================
    
    /**
     * @notice 通過簽名進行授權（EIP-2612）
     * @dev 這是 Permit 的核心功能
     * 
     * @param owner 代幣擁有者
     * @param spender 被授權者
     * @param value 授權金額
     * @param deadline 簽名過期時間
     * @param v 簽名的 v 值
     * @param r 簽名的 r 值
     * @param s 簽名的 s 值
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        // 檢查簽名是否過期
        require(block.timestamp <= deadline, "Permit: expired deadline");
        
        // 構建 struct hash
        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                owner,
                spender,
                value,
                nonces[owner]++,  // 使用當前 nonce 並遞增
                deadline
            )
        );
        
        // 構建 digest
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                structHash
            )
        );
        
        // 恢復簽名者地址
        address recoveredAddress = ecrecover(digest, v, r, s);
        
        // 驗證簽名
        require(
            recoveredAddress != address(0) && recoveredAddress == owner,
            "Permit: invalid signature"
        );
        
        // 設置授權
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }
    
    /**
     * @notice Permit 並轉帳（組合操作）
     * @dev 這是一個便捷函數，結合 permit 和 transferFrom
     * 
     * 使用場景：
     * - 支付場景：使用者簽名授權，商家收款
     * - DEX 交易：使用者簽名授權，DEX 執行交易
     * 
     * @param owner 代幣擁有者
     * @param to 接收者
     * @param value 轉帳金額
     * @param deadline 簽名過期時間
     * @param v 簽名的 v 值
     * @param r 簽名的 r 值
     * @param s 簽名的 s 值
     */
    function permitAndTransfer(
        address owner,
        address to,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public returns (bool) {
        // 先執行 permit（授權給 msg.sender）
        permit(owner, msg.sender, value, deadline, v, r, s);
        
        // 然後執行 transferFrom
        return transferFrom(owner, to, value);
    }
    
    // ============================================
    // 輔助函數
    // ============================================
    
    /**
     * @notice 獲取 permit 的 digest（用於前端簽名）
     * @dev 前端可以調用這個函數來獲取要簽名的數據
     */
    function getPermitDigest(
        address owner,
        address spender,
        uint256 value,
        uint256 nonce,
        uint256 deadline
    ) public view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                owner,
                spender,
                value,
                nonce,
                deadline
            )
        );
        
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                structHash
            )
        );
    }
    
    // ============================================
    // 內部函數
    // ============================================
    
    function _transfer(address from, address to, uint256 value) internal {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[from] >= value, "Insufficient balance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        
        emit Transfer(from, to, value);
    }
    
    function _mint(address to, uint256 value) internal {
        require(to != address(0), "Mint to zero address");
        
        totalSupply += value;
        balanceOf[to] += value;
        
        emit Transfer(address(0), to, value);
    }
    
    // ============================================
    // 查詢函數（調試用）
    // ============================================
    
    /**
     * @notice 獲取當前的鏈 ID
     */
    function getChainId() public view returns (uint256) {
        return block.chainid;
    }
    
    /**
     * @notice 檢查授權金額
     */
    function getAllowance(address owner, address spender) public view returns (uint256) {
        return allowance[owner][spender];
    }
}

