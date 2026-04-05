// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../token/PrivateERC20/ITokenReceiver.sol";
import "../utils/mpc/MpcCore.sol";

contract MockTokenReceiver is ITokenReceiver {
    address public lastSender;
    uint256 public lastAmount;
    bytes public lastData;

    event Received(address indexed sender, uint256 amount, bytes data);
    event ReceivedEncrypted(address indexed sender, bytes data);

    function onTokenReceived(
        address sender,
        uint256 amount,
        bytes calldata data
    ) external override returns (bool) {
        lastSender = sender;
        lastAmount = amount;
        lastData = data;

        emit Received(sender, amount, data);
        return true;
    }

    function onTokenReceived(
        address sender,
        itUint256 calldata amount,
        bytes calldata data
    ) external returns (bool) {
        lastSender = sender;

        // In a real encrypted receiver, we'd handle the cipher text.
        // For the mock, we just record the sender and data to prove it was called.
        // We can't meaningfully store `itUint256` easily without tracking it properly.
        lastData = data;

        emit ReceivedEncrypted(sender, data);
        return true;
    }
}
