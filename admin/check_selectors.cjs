const { ethers } = require("ethers");

const deposit = ethers.id("deposit()").slice(0, 10);
const withdraw = ethers.id("withdraw(uint256)").slice(0, 10);

console.log(`deposit():        ${deposit}`);
console.log(`withdraw(uint256): ${withdraw}`);
