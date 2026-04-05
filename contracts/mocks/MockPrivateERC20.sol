// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../utils/mpc/MpcCore.sol";

/**
 * @title MockPrivateERC20
 * @dev Mock for testing bridges with private tokens. Uses plain uint256 but implements required returns.
 */
contract MockPrivateERC20 is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(
        address to,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) returns (bool) {
        balances[to] += amount;
        return true;
    }

    function burn(uint256 amount) external returns (bool) {
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowances[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        return true;
    }

    // IPrivateERC20 version of transferFrom (Mocked)
    function transferFrom(
        address,
        address,
        itUint256 calldata
    ) external returns (gtBool) {
        return MpcCore.setPublic(true);
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}
