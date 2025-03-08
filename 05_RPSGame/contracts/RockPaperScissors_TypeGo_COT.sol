pragma solidity ^0.8.0;

// 定義 ERC20 合約接口
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract RockPaperScissors {
    IERC20 public token; // 你的 ERC20 代幣合約地址
    uint256 public betAmount; // 賭注金額
    address public player1; // 玩家1的地址
    address public player2; // 玩家2的地址
    bytes32 public player1Commitment; // 玩家1的承諾哈希
    bytes32 public player2Commitment; // 玩家2的承諾哈希
    uint8 public player1Move; // 玩家1的出拳（0=石頭, 1=剪刀, 2=布）
    uint8 public player2Move; // 玩家2的出拳
    bool public gameStarted; // 遊戲是否開始

    // 構造函數，初始化代幣合約地址
    constructor(address _token) {
        token = IERC20(_token);
    }

    // 開始遊戲
    function startGame(address _player1, address _player2, uint256 _betAmount) external {
        require(!gameStarted, "Game already started");
        require(_player1 != _player2, "Players must be different");
        player1 = _player1;
        player2 = _player2;
        betAmount = _betAmount;
        gameStarted = true;
    }

    // 提交出拳承諾
    function commitMove(bytes32 commitment) external {
        require(gameStarted, "Game not started");
        if (msg.sender == player1) {
            require(player1Commitment == 0, "Player1 already committed");
            player1Commitment = commitment;
        } else if (msg.sender == player2) {
            require(player2Commitment == 0, "Player2 already committed");
            player2Commitment = commitment;
        } else {
            revert("Not a player");
        }
    }

    // 揭示出拳
    function revealMove(uint8 move, bytes32 salt) external {
        require(gameStarted, "Game not started");
        require(move < 3, "Invalid move"); // 確保 move 是 0, 1 或 2
        if (msg.sender == player1) {
            require(player1Commitment != 0, "Player1 has not committed");
            require(keccak256(abi.encodePacked(move, salt)) == player1Commitment, "Invalid reveal");
            player1Move = move;
        } else if (msg.sender == player2) {
            require(player2Commitment != 0, "Player2 has not committed");
            require(keccak256(abi.encodePacked(move, salt)) == player2Commitment, "Invalid reveal");
            player2Move = move;
        } else {
            revert("Not a player");
        }
    }

    // 結算遊戲並轉移代幣
    function settleGame() external {
        require(gameStarted, "Game not started");
        require(player1Move < 3 && player2Move < 3, "Not all moves revealed");

        // 計算勝負：(3 + player1Move - player2Move) % 3
        // 0 = 平局, 1 = 玩家1贏, 2 = 玩家2贏
        uint8 result = (3 + player1Move - player2Move) % 3;

        if (result == 0) {
            // 平局，退還賭注（這裡假設合約持有代幣，實際需根據設計調整）
            token.transferFrom(address(this), player1, betAmount);
            token.transferFrom(address(this), player2, betAmount);
        } else if (result == 1) {
            // 玩家1贏，玩家2支付給玩家1
            token.transferFrom(player2, player1, betAmount);
        } else {
            // 玩家2贏，玩家1支付給玩家2
            token.transferFrom(player1, player2, betAmount);
        }

        // 重置遊戲狀態
        gameStarted = false;
        player1Commitment = 0;
        player2Commitment = 0;
        player1Move = 0;
        player2Move = 0;
    }
}