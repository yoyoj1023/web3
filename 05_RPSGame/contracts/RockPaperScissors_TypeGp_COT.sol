// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RockPaperScissors {
    IERC20 public token;
    uint public gameCount;

    // 定義可用手勢（0代表尚未選擇）
    enum Move { None, Rock, Paper, Scissors }

    struct Game {
        address player1;
        address player2;
        uint betAmount;
        bytes32 commit1;
        bytes32 commit2;
        Move move1;
        Move move2;
        bool revealed1;
        bool revealed2;
        uint startTime; // 可用來設定 reveal 的截止時間
    }

    mapping(uint => Game) public games;

    // 事件
    event GameCreated(uint gameId, address indexed player1, uint betAmount);
    event GameJoined(uint gameId, address indexed player2);
    event MoveCommitted(uint gameId, address indexed player);
    event MoveRevealed(uint gameId, address indexed player, Move move);

    constructor(address _token) {
        token = IERC20(_token);
    }

    // 玩家發起遊戲，提交 hash(手勢 + 隨機數) 與賭注
    function createGame(bytes32 _commit, uint _betAmount) external returns(uint) {
        require(token.transferFrom(msg.sender, address(this), _betAmount), "Bet transfer failed");
        gameCount++;
        games[gameCount] = Game({
            player1: msg.sender,
            player2: address(0),
            betAmount: _betAmount,
            commit1: _commit,
            commit2: 0,
            move1: Move.None,
            move2: Move.None,
            revealed1: false,
            revealed2: false,
            startTime: block.timestamp
        });
        emit GameCreated(gameCount, msg.sender, _betAmount);
        return gameCount;
    }

    // 其他玩家加入遊戲
    function joinGame(uint _gameId, bytes32 _commit) external {
        Game storage game = games[_gameId];
        require(game.player2 == address(0), "Game already joined");
        require(msg.sender != game.player1, "Cannot join your own game");
        require(token.transferFrom(msg.sender, address(this), game.betAmount), "Bet transfer failed");
        game.player2 = msg.sender;
        game.commit2 = _commit;
        emit GameJoined(_gameId, msg.sender);
    }

    // 玩家揭露自己的手勢，傳入明文手勢與當初用來混淆的隨機數
    function revealMove(uint _gameId, Move _move, string calldata _nonce) external {
        Game storage game = games[_gameId];
        bytes32 hashValue = keccak256(abi.encodePacked(_move, _nonce));

        if (msg.sender == game.player1) {
            require(!game.revealed1, "Already revealed");
            require(hashValue == game.commit1, "Invalid reveal");
            game.move1 = _move;
            game.revealed1 = true;
            emit MoveRevealed(_gameId, msg.sender, _move);
        } else if (msg.sender == game.player2) {
            require(!game.revealed2, "Already revealed");
            require(hashValue == game.commit2, "Invalid reveal");
            game.move2 = _move;
            game.revealed2 = true;
            emit MoveRevealed(_gameId, msg.sender, _move);
        } else {
            revert("Not a game participant");
        }

        // 當雙方都揭露後，決定勝負並結算賭注
        if (game.revealed1 && game.revealed2) {
            _determineWinner(_gameId);
        }
    }

    // 判定勝負，並發放賭注
    function _determineWinner(uint _gameId) internal {
        Game storage game = games[_gameId];
        address winner;

        // 如果平手，雙方退回賭注
        if (game.move1 == game.move2) {
            token.transfer(game.player1, game.betAmount);
            token.transfer(game.player2, game.betAmount);
            return;
        }

        // 剪刀石頭布的規則
        if (
            (game.move1 == Move.Rock && game.move2 == Move.Scissors) ||
            (game.move1 == Move.Paper && game.move2 == Move.Rock) ||
            (game.move1 == Move.Scissors && game.move2 == Move.Paper)
        ) {
            winner = game.player1;
        } else {
            winner = game.player2;
        }

        // 獲勝者獲得雙方的賭注
        token.transfer(winner, game.betAmount * 2);
    }
}
