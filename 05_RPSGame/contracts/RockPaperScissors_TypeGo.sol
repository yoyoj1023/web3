// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RockPaperScissors {
    IERC20 public token; // 你的 ERC20 代幣合約
    uint256 public betAmount; // 每場遊戲的賭注數量

    enum Choice { None, Rock, Paper, Scissors }
    struct Game {
        address player1;
        address player2;
        bytes32 player1Commitment; // 玩家1的加密選擇
        bytes32 player2Commitment; // 玩家2的加密選擇
        Choice player1Choice;
        Choice player2Choice;
        bool isActive;
    }

    mapping(uint256 => Game) public games;
    uint256 public gameCount;

    event GameCreated(uint256 gameId, address player1, address player2, uint256 betAmount);
    event GameRevealed(uint256 gameId, address winner);

    constructor(address _tokenAddress, uint256 _betAmount) {
        token = IERC20(_tokenAddress);
        betAmount = _betAmount; // 設置固定的賭注數量，例如 100 代幣
    }

    // 玩家1創建遊戲並提交加密選擇
    function createGame(address player2, bytes32 player1Commitment) external {
        require(player2 != msg.sender, "Cannot play with yourself");
        require(token.transferFrom(msg.sender, address(this), betAmount), "Token transfer failed");

        gameCount++;
        games[gameCount] = Game({
            player1: msg.sender,
            player2: player2,
            player1Commitment: player1Commitment,
            player2Commitment: bytes32(0),
            player1Choice: Choice.None,
            player2Choice: Choice.None,
            isActive: true
        });

        emit GameCreated(gameCount, msg.sender, player2, betAmount);
    }

    // 玩家2加入遊戲並提交加密選擇
    function joinGame(uint256 gameId, bytes32 player2Commitment) external {
        Game storage game = games[gameId];
        require(game.isActive, "Game is not active");
        require(msg.sender == game.player2, "You are not player2");
        require(game.player2Commitment == bytes32(0), "Player2 has already committed");
        require(token.transferFrom(msg.sender, address(this), betAmount), "Token transfer failed");

        game.player2Commitment = player2Commitment;
    }

    // 玩家揭示選擇並計算結果
    function reveal(uint256 gameId, Choice choice, bytes32 secret) external {
        Game storage game = games[gameId];
        require(game.isActive, "Game is not active");
        require(choice != Choice.None, "Invalid choice");
        bytes32 commitment = keccak256(abi.encodePacked(choice, secret, msg.sender));

        if (msg.sender == game.player1) {
            require(game.player1Commitment == commitment, "Invalid commitment");
            game.player1Choice = choice;
        } else if (msg.sender == game.player2) {
            require(game.player2Commitment == commitment, "Invalid commitment");
            game.player2Choice = choice;
        } else {
            revert("You are not a player in this game");
        }

        // 如果兩人都揭示了選擇，計算結果
        if (game.player1Choice != Choice.None && game.player2Choice != Choice.None) {
            address winner = determineWinner(game);
            settleGame(gameId, winner);
        }
    }

    // 判斷勝負
    function determineWinner(Game storage game) internal view returns (address) {
        if (game.player1Choice == game.player2Choice) {
            return address(0); // 平局
        }
        if ((game.player1Choice == Choice.Rock && game.player2Choice == Choice.Scissors) ||
            (game.player1Choice == Choice.Paper && game.player2Choice == Choice.Rock) ||
            (game.player1Choice == Choice.Scissors && game.player2Choice == Choice.Paper)) {
            return game.player1;
        }
        return game.player2;
    }

    // 結算遊戲並轉移代幣
    function settleGame(uint256 gameId, address winner) internal {
        Game storage game = games[gameId];
        game.isActive = false;

        if (winner == address(0)) {
            // 平局，退還賭注
            require(token.transfer(game.player1, betAmount), "Refund to player1 failed");
            require(token.transfer(game.player2, betAmount), "Refund to player2 failed");
        } else {
            // 有贏家，轉移所有賭注
            uint256 totalAmount = betAmount * 2;
            require(token.transfer(winner, totalAmount), "Transfer to winner failed");
        }

        emit GameRevealed(gameId, winner);
    }
}