// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title BaseManRegistry
 * @notice Base zincirinde BaseMan oyuncularının skor ve görev kayıtlarını tutar.
 *         Kontrat yalnızca backend imzalama servisi tarafından onaylanan skorları kabul eder;
 *         böylece istemciden gönderilen sahte veriler zincire yazılamaz.
 */
contract BaseManRegistry is EIP712, Ownable {
    using ECDSA for bytes32;

    struct Score {
        uint256 highScore;
        uint256 lastUpdatedAt;
    }

    struct Quest {
        bool active;
        string metadataURI;
    }

    // player => score info
    mapping(address => Score) private _scores;
    // questId => quest metadata
    mapping(uint256 => Quest) private _quests;
    // player => questId => completed?
    mapping(address => mapping(uint256 => bool)) private _questCompleted;

    address public authorizer;

    bytes32 public constant SCORE_TYPEHASH =
        keccak256("Score(address player,uint256 score,uint256 deadline)");
    bytes32 public constant QUEST_TYPEHASH =
        keccak256("Quest(address player,uint256 questId,uint256 deadline)");

    event AuthorizerChanged(address indexed newAuthorizer);
    event ScoreSubmitted(address indexed player, uint256 score, uint256 timestamp);
    event QuestDefinitionUpdated(uint256 indexed questId, bool active, string metadataURI);
    event QuestCompleted(address indexed player, uint256 indexed questId, uint256 timestamp);

    error InvalidSignature();
    error ExpiredSignature();
    error QuestInactive(uint256 questId);
    error QuestAlreadyCompleted(address player, uint256 questId);

    constructor(address initialAuthorizer)
        EIP712("BaseManRegistry", "1")
        Ownable(msg.sender)
    {
        authorizer = initialAuthorizer;
    }

    // --------- Public getters ----------

    function getScore(address player) external view returns (Score memory) {
        return _scores[player];
    }

    function isQuestCompleted(address player, uint256 questId) external view returns (bool) {
        return _questCompleted[player][questId];
    }

    function getQuest(uint256 questId) external view returns (Quest memory) {
        return _quests[questId];
    }

    // --------- Owner functions ----------

    function setAuthorizer(address newAuthorizer) external onlyOwner {
        authorizer = newAuthorizer;
        emit AuthorizerChanged(newAuthorizer);
    }

    function setQuest(
        uint256 questId,
        bool active,
        string calldata metadataURI
    ) external onlyOwner {
        _quests[questId] = Quest({active: active, metadataURI: metadataURI});
        emit QuestDefinitionUpdated(questId, active, metadataURI);
    }

    // --------- Player functions ----------

    /**
     * @dev Backend imzalama servisi tarafından üretilen imzayla skor gönderir.
     */
    function submitScore(
        address player,
        uint256 score,
        uint256 deadline,
        bytes calldata signature
    ) external {
        if (block.timestamp > deadline) revert ExpiredSignature();
        if (player != msg.sender) revert InvalidSignature();

        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(SCORE_TYPEHASH, player, score, deadline))
        );
        address recovered = digest.recover(signature);
        if (recovered != authorizer) revert InvalidSignature();

        Score storage current = _scores[player];
        if (score > current.highScore) {
            current.highScore = score;
            current.lastUpdatedAt = block.timestamp;
            emit ScoreSubmitted(player, score, block.timestamp);
        }
    }

    /**
     * @dev Backend imzalama servisi tarafından onaylanan görev tamamlanmasını zincire yazar.
     */
    function completeQuest(
        address player,
        uint256 questId,
        uint256 deadline,
        bytes calldata signature
    ) external {
        if (block.timestamp > deadline) revert ExpiredSignature();
        if (player != msg.sender) revert InvalidSignature();

        Quest memory quest = _quests[questId];
        if (!quest.active) revert QuestInactive(questId);
        if (_questCompleted[player][questId]) revert QuestAlreadyCompleted(player, questId);

        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(QUEST_TYPEHASH, player, questId, deadline))
        );
        address recovered = digest.recover(signature);
        if (recovered != authorizer) revert InvalidSignature();

        _questCompleted[player][questId] = true;
        emit QuestCompleted(player, questId, block.timestamp);
    }
}
