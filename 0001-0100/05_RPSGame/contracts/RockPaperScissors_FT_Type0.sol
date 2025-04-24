// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RockPaperScissors {
    // 遊戲階段
    enum Stage { Created, Committed, Revealed, Finished }
    // 出拳選項
    enum Choice { None, Rock, Paper, Scissors }

    // 遊戲結構
    struct Game {
        address player1;       // 玩家 1
        address player2;       // 玩家 2
        bytes32 commitment1;   // 玩家 1 的承諾
        bytes32 commitment2;   // 玩家 2 的承諾
        Choice choice1;        // 玩家 1 的出拳
        Choice choice2;        // 玩家 2 的出拳
        uint256 betAmount;     // 賭注數量 (將保存在合約內)
        Stage stage;           // 當前階段
    }

    // 你的 ERC20 代幣合約
    IERC20 public token;
    // 存儲所有遊戲紀錄
    mapping(uint256 => Game) public games;
    // 下一個遊戲 ID
    uint256 public nextGameId;

    /* 也可以硬編碼你的代幣地址，使得這個合約由特定代幣所獨佔使用（請替換為實際地址）
    address public constant TOKEN_ADDRESS = 0x46b72d9eB59b075F91Fa159DaE5336447a1bd97E;
    constructor() {
        token = IERC20(TOKEN_ADDRESS);
    }*/

    // 構造函數，指定你的代幣地址
    constructor(address _token) {
        token = IERC20(_token);
    }

    // player1 提出創建遊戲
    function createGame(uint256 _betAmount) external {
        require(_betAmount > 0, "Bet amount must be greater than 0");
        require(token.transferFrom(msg.sender, address(this), _betAmount), "Transfer failed");
        games[nextGameId] = Game({
            player1: msg.sender,
            player2: address(0),
            commitment1: bytes32(0),
            commitment2: bytes32(0),
            choice1: Choice.None,
            choice2: Choice.None,
            betAmount: _betAmount,
            stage: Stage.Created
        });
        nextGameId++;
    }

    // player2 加入遊戲，必須輸入遊戲 ID，才能加入進行遊戲
    function joinGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        // 遊戲必須處於 Created 階段，且不能加入自己的遊戲，且必須轉移賭注成功，才能加入遊戲
        require(game.stage == Stage.Created, "Game not in Created stage");
        require(game.player1 != msg.sender, "Cannot join own game");
        require(token.transferFrom(msg.sender, address(this), game.betAmount), "Transfer failed");
        game.player2 = msg.sender;
        game.stage = Stage.Committed;
    }

    // 提交承諾
    function commit(uint256 _gameId, bytes32 _commitment) external {
        Game storage game = games[_gameId];
        require(game.stage == Stage.Committed, "Game not in Committed stage");
        if (msg.sender == game.player1) {
            require(game.commitment1 == bytes32(0), "Already committed");
            game.commitment1 = _commitment;
        } else if (msg.sender == game.player2) {
            require(game.commitment2 == bytes32(0), "Already committed");
            game.commitment2 = _commitment;
        } else {
            revert("Not a player");
        }
        // 雙方都提交後進入揭示階段
        if (game.commitment1 != bytes32(0) && game.commitment2 != bytes32(0)) {
            game.stage = Stage.Revealed;
        }
    }

    // 揭示出拳 (但是這個寫法目前是有問題的，因為這樣的寫法會讓玩家可以在鏈上看到對方的出拳，進而作弊)
    function reveal(uint256 _gameId, Choice _choice, bytes32 _salt) external {
        Game storage game = games[_gameId];
        require(game.stage == Stage.Revealed, "Game not in Revealed stage");
        require(_choice != Choice.None, "Invalid choice");
        bytes32 commitment = keccak256(abi.encodePacked(_choice, _salt));
        if (msg.sender == game.player1) {
            // 核對之前在鏈上保存的承諾是否正確
            require(commitment == game.commitment1, "Invalid reveal");
            game.choice1 = _choice;
        } else if (msg.sender == game.player2) {
            require(commitment == game.commitment2, "Invalid reveal");
            game.choice2 = _choice;
        } else {
            revert("Not a player");
        }
        // 雙方都揭示後才結算，否則僅保存某單一玩家的出拳選擇 (這就是為什麼這個寫法是有問題的)
        if (game.choice1 != Choice.None && game.choice2 != Choice.None) {
            resolveGame(_gameId);
        }
    }

    // 結算遊戲
    function resolveGame(uint256 _gameId) private {
        Game storage game = games[_gameId];
        require(game.choice1 != Choice.None && game.choice2 != Choice.None, "Not all choices revealed");

        address winner;
        if (game.choice1 == game.choice2) {
            // 平局，退還賭注
            token.transfer(game.player1, game.betAmount);
            token.transfer(game.player2, game.betAmount);
            // 輸贏邏輯
        } else if (
            (game.choice1 == Choice.Rock && game.choice2 == Choice.Scissors) ||
            (game.choice1 == Choice.Paper && game.choice2 == Choice.Rock) ||
            (game.choice1 == Choice.Scissors && game.choice2 == Choice.Paper)
        ) {
            winner = game.player1;
        } else {
            winner = game.player2;
        }
            // 獲勝者獲得雙方的賭注
        if (winner != address(0)) {
            token.transfer(winner, game.betAmount * 2);
        }
        game.stage = Stage.Finished;
    }
}