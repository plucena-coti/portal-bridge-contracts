const ethers = require('ethers');
console.log('deposit(uint64):', ethers.keccak256(ethers.toUtf8Bytes('deposit(uint64)')).slice(0, 10));
console.log('deposit(uint256):', ethers.keccak256(ethers.toUtf8Bytes('deposit(uint256)')).slice(0, 10));
console.log('deposit(uint64,uint256):', ethers.keccak256(ethers.toUtf8Bytes('deposit(uint64,uint256)')).slice(0, 10)); // just guessing

