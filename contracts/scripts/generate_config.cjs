
const fs = require('fs');
const path = require('path');

const bridgePath = 'artifacts/contracts/privacyBridge/PrivacyBridgeCotiNative.sol/PrivacyBridgeCotiNative.json';
const bridgeErc20Path = 'artifacts/contracts/privacyBridge/PrivacyBridgeERC20.sol/PrivacyBridgeERC20.json';
const tokenPath = 'artifacts/contracts/token/PrivateERC20/tokens/PrivateCOTI.sol/PrivateCOTI.json';

try {
  const bridgeArtifact = JSON.parse(fs.readFileSync(bridgePath, 'utf8'));
  const bridgeErc20Artifact = JSON.parse(fs.readFileSync(bridgeErc20Path, 'utf8'));
  const tokenArtifact = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

  const content = `export const CONTRACT_ADDRESSES = {
  // COTI Testnet
  7082400: {
    // Native
    PrivateCoti: "0x03eeA59b1F0Dfeaece75531b27684DD882f79759",
    PrivacyBridgeCotiNative: "0xBBBd1550dC18F2094626049135D53E61665EdCBe",

    // Public Tokens
    WETH: "0x160Bc17BBba05CF3B85115F1022F33DEFA74bd62",
    WBTC: "0x3ca3c74698D4e1bD470ef4117EF31FFc8c6a4743",
    USDT: "0xa7481E71C539068B28F1989391050Ee7CFA8654b",
    USDC_E: "0xAdb1364c27bdc316Ae3Fb0aa45D04CB8fe51435C",
    WADA: "0x8BDaB7f6998306FF0F29d808b3963E7aEA0E3CBA",
    gCOTI: "0x9eabaef31f3f43aE2E786B8EfE22FeA1C0e429bb",

    // Private Tokens
    "p.WETH": "0x6f7E5eE3a913aa00c6eB9fEeCad57a7d02F7f45c",
    "p.WBTC": "0x362F5a50423163c0f8E1bC4C8867FdC22bd74Da1",
    "p.USDT": "0x4fF8F9d237DB919CF6F72621541BEFbE74Ced3d5",
    "p.USDC_E": "0xcA04109fE8CC1390666b78A82AeCa07de1C893C7",
    "p.WADA": "0x66c85092DaF2531E920B1f36560535E3D19985a0",
    "p.gCOTI": "0xd6F86A0F5B93C8F54403E5E4FCE6C85923bBCe09",

    // Bridges
    PrivacyBridgeWETH: "0x8DA53232f5d76316a2B5091415314C9Cb8E8F04c",
    PrivacyBridgeWBTC: "0x57Ba0Bb79A9FfDB6B0a414C05505916207794321",
    PrivacyBridgeUSDT: "0xD9f56D60341e736899b44e1F05D28a36E5Ad482a",
    PrivacyBridgeUSDCe: "0xE5aA795F0BEbA2F5113c7650682100a2Fc01851C",
    PrivacyBridgeWADA: "0x3432ae57e7D94f6D6E463E54e9a83886b0EC3a6A",
    PrivacyBridgegCOTI: "0xf21DB9aEC10B00C828a30768d04938466d98C64c"
  },
  // COTI Mainnet
  2632500: {
    PrivateCoti: "0x143705349957A236d74e0aDb5673F880fEDB101f",
    PrivacyBridgeCotiNative: "0x6056bFE6776df4bEa7235A19f6D672089b4cdBeB",

    // Public Tokens
    WETH: "0x639aCc80569c5FC83c6FBf2319A6Cc38bBfe26d1",
    WBTC: "0x8C39B1fD0e6260fdf20652Fc436d25026832bfEA",
    USDC_E: "0xf1Feebc4376c68B7003450ae66343Ae59AB37D3C",
    gCOTI: "0x7637C7838EC4Ec6b85080F28A678F8E234bB83D1",
    USDT: "0xfA6f73446b17A97a56e464256DA54AD43c2Cbc3E",
    WADA: "0xe757Ca19d2c237AA52eBb1d2E8E4368eeA3eb331"
  }
};

export const BRIDGE_ABI = ${JSON.stringify(bridgeArtifact.abi, null, 2)} as const;
export const BRIDGE_ERC20_ABI = ${JSON.stringify(bridgeErc20Artifact.abi, null, 2)} as const;

export const TOKEN_ABI = ${JSON.stringify(tokenArtifact.abi, null, 2)} as const;

export const MINIMUM_PORTAL_IN_AMOUNTS: Record<string, string> = {
  "WBTC": "0.0000145",
  "WETH": "0.000497",
  "WADA": "4",
  "COTI": "82",
  "gCOTI": "390",
  "USDT": "1",
  "USDC.e": "1"
};

export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_from",
        "type": "address"
      },
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      },
      {
        "name": "_spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
] as const;

export interface TokenConfig {
  symbol: string;
  name: string;
  icon: string;
  decimals: number;
  isPrivate: boolean;
  addressKey?: string; // Key in CONTRACT_ADDRESSES[chainId]
  bridgeAddressKey?: string; // Key in CONTRACT_ADDRESSES[chainId]
}

export const SUPPORTED_TOKENS: TokenConfig[] = [
  // Public Tokens
  { symbol: "COTI", name: "COTI", icon: "/icons/coti.svg", decimals: 18, isPrivate: false }, // Native, no address key needed
  { symbol: "WETH", name: "Wrapped Ether", icon: "/icons/wETH.svg", decimals: 18, isPrivate: false, addressKey: "WETH", bridgeAddressKey: "PrivacyBridgeWETH" },
  { symbol: "WBTC", name: "Wrapped BTC", icon: "/icons/wBTC.svg", decimals: 8, isPrivate: false, addressKey: "WBTC", bridgeAddressKey: "PrivacyBridgeWBTC" },
  { symbol: "USDT", name: "Tether USD", icon: "/icons/usdt.svg", decimals: 6, isPrivate: false, addressKey: "USDT", bridgeAddressKey: "PrivacyBridgeUSDT" },
  { symbol: "USDC.e", name: "Bridged USDC", icon: "/icons/USDC.svg", decimals: 6, isPrivate: false, addressKey: "USDC_E", bridgeAddressKey: "PrivacyBridgeUSDCe" },
  { symbol: "WADA", name: "Wrapped ADA", icon: "/icons/wADA.svg", decimals: 6, isPrivate: false, addressKey: "WADA", bridgeAddressKey: "PrivacyBridgeWADA" },
  { symbol: "gCOTI", name: "gCOTI", icon: "/icons/gcoti.svg", decimals: 18, isPrivate: false, addressKey: "gCOTI", bridgeAddressKey: "PrivacyBridgegCOTI" },

  // Private Tokens
  { symbol: "p.COTI", name: "p.COTI", icon: "/icons/coti.svg", decimals: 18, isPrivate: true, addressKey: "PrivateCoti", bridgeAddressKey: "PrivacyBridgeCotiNative" },
  { symbol: "p.WETH", name: "p.WETH", icon: "/icons/wETH.svg", decimals: 18, isPrivate: true, addressKey: "p.WETH", bridgeAddressKey: "PrivacyBridgeWETH" },
  { symbol: "p.WBTC", name: "p.WBTC", icon: "/icons/wBTC.svg", decimals: 8, isPrivate: true, addressKey: "p.WBTC", bridgeAddressKey: "PrivacyBridgeWBTC" },
  { symbol: "p.USDT", name: "p.USDT", icon: "/icons/usdt.svg", decimals: 6, isPrivate: true, addressKey: "p.USDT", bridgeAddressKey: "PrivacyBridgeUSDT" },
  { symbol: "p.USDC.e", name: "p.USDC.e", icon: "/icons/USDC.svg", decimals: 6, isPrivate: true, addressKey: "p.USDC_E", bridgeAddressKey: "PrivacyBridgeUSDCe" },
  { symbol: "p.WADA", name: "p.WADA", icon: "/icons/wADA.svg", decimals: 6, isPrivate: true, addressKey: "p.WADA", bridgeAddressKey: "PrivacyBridgeWADA" },
  { symbol: "p.gCOTI", name: "p.gCOTI", icon: "/icons/gcoti.svg", decimals: 18, isPrivate: true, addressKey: "p.gCOTI", bridgeAddressKey: "PrivacyBridgegCOTI" },
];
`;

  fs.writeFileSync('src/contracts/config.ts', content);
  console.log('src/contracts/config.ts generated successfully.');

} catch (err) {
  console.error('Error generating config:', err);
  process.exit(1);
}
