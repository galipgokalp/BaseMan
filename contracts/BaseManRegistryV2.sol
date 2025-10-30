// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IERC1271 {
    function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4 magicValue);
}

/**
 * @title BaseManRegistryV2
 * @notice EIP-712 V2 (nonce'lu) imza şeması ile skor ve görev kayıtları.
 *         Replay saldırılarını on-chain `usedRequests` ile engeller.
 */
contract BaseManRegistryV2 is EIP712, Ownable {
    using ECDSA for bytes32;

    struct Score { uint256 highScore; uint256 lastUpdatedAt; }
    struct Quest { bool active; string metadataURI; }

    mapping(address => Score) private _scores;
    mapping(uint256 => Quest) private _quests;
    mapping(address => mapping(uint256 => bool)) private _questCompleted;
    mapping(bytes32 => bool) public usedRequests;

    address public authorizer;
    // Expose the EIP-712 version for off-chain clients to auto-detect
    function eip712Version() external pure returns (string memory) { return "2"; }
    function contractName() external pure returns (string memory) { return "BaseManRegistry"; }

    bytes32 public constant SCORE_TYPEHASH =
        keccak256("Score(address player,uint256 score,uint256 deadline,uint256 nonce)");
    bytes32 public constant QUEST_TYPEHASH =
        keccak256("Quest(address player,uint256 questId,uint256 deadline,uint256 nonce)");

    event AuthorizerChanged(address indexed newAuthorizer);
    event ScoreSubmitted(address indexed player, uint256 score, uint256 timestamp);
    event QuestDefinitionUpdated(uint256 indexed questId, bool active, string metadataURI);
    event QuestCompleted(address indexed player, uint256 indexed questId, uint256 timestamp);

    error InvalidSignature();
    error ExpiredSignature();
    error QuestInactive(uint256 questId);
    error QuestAlreadyCompleted(address player, uint256 questId);
    error Replay();

    constructor(address initialAuthorizer)
        EIP712("BaseManRegistry", "2")
        Ownable(msg.sender)
    {
        authorizer = initialAuthorizer;
    }

    // --------- Public getters ----------
    function getScore(address player) external view returns (Score memory) { return _scores[player]; }
    function isQuestCompleted(address player, uint256 questId) external view returns (bool) { return _questCompleted[player][questId]; }
    function getQuest(uint256 questId) external view returns (Quest memory) { return _quests[questId]; }

    // --------- Owner functions ----------
    function setAuthorizer(address newAuthorizer) external onlyOwner {
      authorizer = newAuthorizer; emit AuthorizerChanged(newAuthorizer);
    }
    function setQuest(uint256 questId, bool active, string calldata metadataURI) external onlyOwner {
      _quests[questId] = Quest({active: active, metadataURI: metadataURI});
      emit QuestDefinitionUpdated(questId, active, metadataURI);
    }

    // --------- Internal helpers ----------
    bytes4 private constant _EIP1271_MAGICVALUE = 0x1626ba7e;

    function _verifyAuthorizer(bytes32 digest, bytes calldata signature) internal view returns (bool) {
        // Fast-path: ECDSA to EOA
        address recovered = ECDSA.recover(digest, signature);
        if (recovered == authorizer) {
            return true;
        }
        // Fallback: EIP-1271 for contract wallets / multisigs
        // Solidity-native contract detection
        if (authorizer.code.length > 0) {
            try IERC1271(authorizer).isValidSignature(digest, signature) returns (bytes4 magic) {
                return magic == _EIP1271_MAGICVALUE;
            } catch {
                return false;
            }
        }
        return false;
    }

    // Expose EIP-712 domain separator for clients that want to verify off-chain
    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    // --------- Player functions ----------
    function submitScore(
        address player,
        uint256 score,
        uint256 deadline,
        uint256 nonce,
        bytes calldata signature
    ) external {
        if (block.timestamp > deadline) revert ExpiredSignature();
        if (player != msg.sender) revert InvalidSignature();

        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(SCORE_TYPEHASH, player, score, deadline, nonce))
        );
        if (usedRequests[digest]) revert Replay();
        if (!_verifyAuthorizer(digest, signature)) revert InvalidSignature();
        usedRequests[digest] = true;

        Score storage current = _scores[player];
        if (score > current.highScore) {
            current.highScore = score;
            current.lastUpdatedAt = block.timestamp;
            emit ScoreSubmitted(player, score, block.timestamp);
        }
    }

    function completeQuest(
        address player,
        uint256 questId,
        uint256 deadline,
        uint256 nonce,
        bytes calldata signature
    ) external {
        if (block.timestamp > deadline) revert ExpiredSignature();
        if (player != msg.sender) revert InvalidSignature();

        Quest memory quest = _quests[questId];
        if (!quest.active) revert QuestInactive(questId);
        if (_questCompleted[player][questId]) revert QuestAlreadyCompleted(player, questId);

        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(QUEST_TYPEHASH, player, questId, deadline, nonce))
        );
        if (usedRequests[digest]) revert Replay();
        if (!_verifyAuthorizer(digest, signature)) revert InvalidSignature();
        usedRequests[digest] = true;

        _questCompleted[player][questId] = true;
        emit QuestCompleted(player, questId, block.timestamp);
    }
}
