// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.28;

  import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
  import "@account-abstraction/contracts/interfaces/IPaymaster.sol";

  contract BasePaymaster is IPaymaster {
      IEntryPoint public immutable entryPoint;
      address public owner;

      constructor(IEntryPoint _entryPoint) {
          require(address(_entryPoint) != address(0), "Invalid entry point");
          entryPoint = _entryPoint;
          owner = msg.sender;
      }

      modifier onlyOwner() {
          require(msg.sender == owner, "Not owner");
          _;
      }

      modifier onlyEntryPoint() {
          require(msg.sender == address(entryPoint), "Only EntryPoint");
          _;
      }

      function transferOwnership(address newOwner) external onlyOwner {
          require(newOwner != address(0), "Zero owner");
          owner = newOwner;
      }

      function validatePaymasterUserOp(
          PackedUserOperation calldata userOp,
          bytes32 /* userOpHash */,
          uint256 /* maxCost */
      ) external override onlyEntryPoint returns (bytes memory context, uint256 validationData) {
          require(userOp.sender != address(0), "Invalid sender");
          return (abi.encode(userOp.sender), 0);
      }

      function postOp(
          PostOpMode mode,
          bytes calldata context,
          uint256 /* actualGasCost */,
          uint256 /* actualUserOpFeePerGas */
      ) external override onlyEntryPoint {
          address sender = abi.decode(context, (address));
          (mode, sender); // silinmeyen değişken uyarısını bastırır
      }

      function addDeposit() external payable onlyOwner {
          entryPoint.depositTo{value: msg.value}(address(this));
      }

      function withdrawDeposit(address payable recipient, uint256 amount) external onlyOwner {
          entryPoint.withdrawTo(recipient, amount);
      }

      function fundPaymaster() external payable onlyOwner {}

      receive() external payable {}
  }