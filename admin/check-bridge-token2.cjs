const hre = require("hardhat");

async function main() {
    const bridge = "0xfF5242274eAB28379C8ae194baFDc64E55e339e0";
    const abi = [
        "function token() view returns (address)", 
        "function privateToken() view returns (address)"
    ];
    const contract = new hre.ethers.Contract(bridge, abi, hre.ethers.provider);
    
    try {
        const token = await contract.token();
        console.log("token():", token);
    } catch(e) {
        console.log("No token() method");
    }

    try {
        const privateToken = await contract.privateToken();
        console.log("privateToken():", privateToken);
    } catch(e) {
        console.log("No privateToken() method");
    }
}
main().catch(console.error);