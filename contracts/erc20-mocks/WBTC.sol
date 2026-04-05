// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WBTC Mock
 * @notice Mock Wrapped BTC token for testing purposes
 * @dev DO NOT USE IN PRODUCTION - This is a testing mock only
 */
contract WBTC is Ownable {
    string public name = "Wrapped BTC";
    string public symbol = "WBTC";
    uint8 public decimals = 8;

    uint256 private _totalSupply;

    event Approval(address indexed src, address indexed guy, uint256 wad);
    event Transfer(address indexed src, address indexed dst, uint256 wad);
    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() Ownable() {}

    /**
     * @notice Deposit network token to receive WBTC
     */
    receive() external payable {
        deposit();
    }

    /**
     * @notice Deposit network token to receive WBTC
     */
    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
        _totalSupply += msg.value;
        emit Deposit(msg.sender, msg.value);
        emit Transfer(address(0), msg.sender, msg.value);
    }

    /**
     * @notice Withdraw network token by burning WBTC
     * @param wad Amount to withdraw
     */
    function withdraw(uint256 wad) public {
        require(balanceOf[msg.sender] >= wad, "Insufficient balance");
        balanceOf[msg.sender] -= wad;
        _totalSupply -= wad;
        payable(msg.sender).transfer(wad);
        emit Withdrawal(msg.sender, wad);
        emit Transfer(msg.sender, address(0), wad);
    }

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
    function transferFrom(
        address src,
        address dst,
        uint256 wad
    ) public returns (bool) {
        require(balanceOf[src] >= wad, "Insufficient balance");

        if (
            src != msg.sender && allowance[src][msg.sender] != type(uint256).max
        ) {
            require(
                allowance[src][msg.sender] >= wad,
                "Insufficient allowance"
            );
            allowance[src][msg.sender] -= wad;
        }

        balanceOf[src] -= wad;
        balanceOf[dst] += wad;

        emit Transfer(src, dst, wad);

        return true;
    }
}
