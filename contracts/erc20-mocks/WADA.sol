// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WADA Mock
 * @notice Mock Wrapped ADA token for testing purposes
 * @dev DO NOT USE IN PRODUCTION - This is a testing mock only
 */
contract WADA is Ownable {
    string public name = "Wrapped ADA";
    string public symbol = "WADA";
    uint8 public decimals = 6;

    uint256 private _totalSupply;

    event Approval(address indexed src, address indexed guy, uint256 wad);
    event Transfer(address indexed src, address indexed dst, uint256 wad);

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() Ownable() {}

    /**
     * @notice Mint tokens to an address (Owner only)
     * @param dst Destination address
     * @param wad Amount to mint
     */
    function mint(address dst, uint256 wad) public onlyOwner {
        balanceOf[dst] += wad;
        _totalSupply += wad;
        emit Transfer(address(0), dst, wad);
    }

    /**
     * @notice Get the total supply of tokens
     * @return Total supply
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @notice Approve spender to transfer tokens
     * @param guy Spender address
     * @param wad Amount to approve
     * @return Success
     */
    function approve(address guy, uint256 wad) public returns (bool) {
        allowance[msg.sender][guy] = wad;
        emit Approval(msg.sender, guy, wad);
        return true;
    }

    /**
     * @notice Transfer tokens to an address
     * @param dst Destination address
     * @param wad Amount to transfer
     * @return Success
     */
    function transfer(address dst, uint256 wad) public returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    /**
     * @notice Transfer tokens from one address to another
     * @param src Source address
     * @param dst Destination address
     * @param wad Amount to transfer
     * @return Success
     */
    function transferFrom(address src, address dst, uint256 wad) public returns (bool) {
        require(balanceOf[src] >= wad, "Insufficient balance");

        if (src != msg.sender && allowance[src][msg.sender] != type(uint256).max) {
            require(allowance[src][msg.sender] >= wad, "Insufficient allowance");
            allowance[src][msg.sender] -= wad;
        }

        balanceOf[src] -= wad;
        balanceOf[dst] += wad;

        emit Transfer(src, dst, wad);

        return true;
    }
}
