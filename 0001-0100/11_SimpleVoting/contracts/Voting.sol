// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // 儲存候選人得票數量，key 為候選人名稱
    mapping (string => uint256) public votesReceived;
    
    // 候選人列表
    string[] public candidateList;

    // 建構子：初始化候選人列表
    constructor(string[] memory candidateNames) {
        candidateList = candidateNames;
    }

    // 為指定候選人投票
    function voteForCandidate(string memory candidate) public {
        // 檢查候選人是否合法
        require(validCandidate(candidate), unicode"候選人不存在");
        votesReceived[candidate] += 1;
    }

    // 查詢指定候選人的總票數
    function totalVotesFor(string memory candidate) public view returns (uint256) {
        require(validCandidate(candidate), unicode"候選人不存在");
        return votesReceived[candidate];
    }

    // 驗證候選人是否存在於候選人列表中
    function validCandidate(string memory candidate) public view returns (bool) {
        for (uint i = 0; i < candidateList.length; i++) {
            if (keccak256(abi.encodePacked(candidateList[i])) == keccak256(abi.encodePacked(candidate))) {
                return true;
            }
        }
        return false;
    }
}
