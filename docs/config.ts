export const CONTRACT_ADDRESSES = {
    // COTI Testnet
    7082400: {
    // Native
    PrivateCoti: "0x6cE8907414986E73De9e7D28d62Ea2080F8E88E1",
    PrivacyBridgeCotiNative: "0x53D22f7352d2a5728Fe3BE87012B517DD73837Ab",

    // Public Tokens
    WETH: "0x8bca4e6bbE402DB4aD189A316137aD08206154FB",
    WBTC: "0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492",
    USDT: "0x9e961430053cd5AbB3b060544cEcCec848693Cf0",
    USDC_E: "0x63f3D2Cc8F5608F57ce6E5Aa3590A2Beb428D19C",
    WADA: "0xe3E2cd3Abf412c73a404b9b8227B71dE3CfE829D",
    gCOTI: "0x878a42D3cB737DEC9E6c7e7774d973F46fd8ed4C",

    // Private Tokens
    "p.WETH": "0xF009BADb181d471995a1CFF406C3Db7B180F64eA",
    "p.WBTC": "0xB50F1680a4C69145ABc09A2A71c8D5b8051578cF",
    "p.USDT": "0xcEF137E96eDF68EE99D4CdEa7085f154d74895cD",
    "p.USDC_E": "0x37f78dcCd15876F74391EF1F01b76557D9FF1dea",
    "p.WADA": "0x1245f50a3E9129A219b4bf66D10fEaEA47467B69",
    "p.gCOTI": "0x1503b02a4Aa27812306c65116FD23b733603F142",

    // Bridges
    PrivacyBridgeWETH: "0x200a10077fbA0eB6619910198642C629e96ea500",
    PrivacyBridgeWBTC: "0xDbC6138Bc2E735dE9778B52768Bbdcb25Fd2D6ee",
    PrivacyBridgeUSDT: "0x00387B7d4027a3b242f138527CA92c8410413A2b",
    PrivacyBridgeUSDCe: "0xa0Ce01ce48512769F45c7C52c65BC063A8e83dE4",
    PrivacyBridgeWADA: "0xD07218e5DcD2b057eb98aE7A87031fE763503ea6",
    PrivacyBridgegCOTI: "0x4229d44fc057a70CC46d709008A6938A6fd63a67"
  },
  
    // COTI Mainnet
    2632500: {
    // Native
    PrivateCoti: "0xE4D2D9379df49cc6628Ce27134b924D695E8adAe",
    PrivacyBridgeCotiNative: "0xE736Cf6123dFf5d064Bb575C676290a0133652d0",

    // Public Tokens
    WETH: "0x639aCc80569c5FC83c6FBf2319A6Cc38bBfe26d1",
    WBTC: "0x8C39B1fD0e6260fdf20652Fc436d25026832bfEA",
    USDT: "0xfA6f73446b17A97a56e464256DA54AD43c2Cbc3E",
    USDC_E: "0xf1Feebc4376c68B7003450ae66343Ae59AB37D3C",
    WADA: "0xe757Ca19d2c237AA52eBb1d2E8E4368eeA3eb331",
    gCOTI: "0x7637C7838EC4Ec6b85080F28A678F8E234bB83D1",

    // Private Tokens
    "p.WETH": "0x32a2DC0a159f1Da93a73A7E7e006Eea96Feb8668",
    "p.WBTC": "0x68Dd530D0D6E6f1d993F3F09BC5794FE22943e24",
    "p.USDT": "0xb87d31Bf3a654685e947f7F03bf9438605858eb2",
    "p.USDC_E": "0x784591bbc64fb624c24429F7dc9707a2ba2dfF15",
    "p.WADA": "0xdF522E96CD96189dFD419049C847101E2B56FbdC",
    "p.gCOTI": "0x7f1d93C3820325Eb182bCf3170B32d4d8Ca753b7",

    // Bridges
    PrivacyBridgeWETH: "0xc5D8a25fe5063C8D12cF07684994635294F40F5c",
    PrivacyBridgeWBTC: "0x65976d76bD765c70b92568a8436a76789A097bEe",
    PrivacyBridgeUSDT: "0xf1c0ec7faC14c99CFeb18713A671C4cA882C816F",
    PrivacyBridgeUSDCe: "0xf33DF5312DF736362395468a2D083d16Ded006d3",
    PrivacyBridgeWADA: "0xB495912771F6F4A77412Af32b9924D06b33890E4",
    PrivacyBridgegCOTI: "0x8d544420a28B6c847E7C8f2815a0a2d336960508"
  }
};

export const BRIDGE_ABI = [{"inputs":[{"internalType":"address","name":"_privateCoti","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AmountZero","type":"error"},{"inputs":[],"name":"BridgePaused","type":"error"},{"inputs":[],"name":"DepositBelowMinimum","type":"error"},{"inputs":[],"name":"DepositDisabled","type":"error"},{"inputs":[],"name":"DepositExceedsMaximum","type":"error"},{"inputs":[],"name":"EthTransferFailed","type":"error"},{"inputs":[],"name":"ExceedsRescueableAmount","type":"error"},{"inputs":[],"name":"FeeRecipientNotSet","type":"error"},{"inputs":[],"name":"InsufficientAccumulatedFees","type":"error"},{"inputs":[],"name":"InsufficientCotiFee","type":"error"},{"inputs":[],"name":"InsufficientEthBalance","type":"error"},{"inputs":[],"name":"InvalidAddress","type":"error"},{"inputs":[],"name":"InvalidFee","type":"error"},{"inputs":[],"name":"InvalidFeeConfiguration","type":"error"},{"inputs":[],"name":"InvalidLimitConfiguration","type":"error"},{"inputs":[],"name":"NativeCotiFeeNotApplicable","type":"error"},{"inputs":[{"internalType":"uint256","name":"expected","type":"uint256"},{"internalType":"uint256","name":"actual","type":"uint256"}],"name":"OracleTimestampMismatch","type":"error"},{"inputs":[],"name":"WithdrawBelowMinimum","type":"error"},{"inputs":[],"name":"WithdrawExceedsMaximum","type":"error"},{"inputs":[],"name":"WithdrawFeesMustBeOverridden","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"CotiFeesWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"grossAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"netAmount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"enabled","type":"bool"},{"indexed":true,"internalType":"address","name":"by","type":"address"}],"name":"DepositEnabledUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"feeType","type":"string"},{"indexed":false,"internalType":"uint256","name":"fixedFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"percentageBps","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxFee","type":"uint256"}],"name":"DynamicFeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldRecipient","type":"address"},{"indexed":true,"internalType":"address","name":"newRecipient","type":"address"}],"name":"FeeRecipientUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"feeType","type":"string"},{"indexed":false,"internalType":"uint256","name":"newFeeBasisPoints","type":"uint256"}],"name":"FeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FeesWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"minDeposit","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxDeposit","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"minWithdraw","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxWithdraw","type":"uint256"}],"name":"LimitsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"},{"indexed":true,"internalType":"address","name":"by","type":"address"}],"name":"NativeCotiFeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"NativeRescued","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"by","type":"address"}],"name":"OperatorAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"by","type":"address"}],"name":"OperatorRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOracle","type":"address"},{"indexed":true,"internalType":"address","name":"newOracle","type":"address"}],"name":"PriceOracleUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldRecipient","type":"address"},{"indexed":true,"internalType":"address","name":"newRecipient","type":"address"}],"name":"RescueRecipientUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"grossAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"netAmount","type":"uint256"}],"name":"Withdraw","type":"event"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEE_DIVISOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_FEE_UNITS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"OPERATOR_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"accumulatedCotiFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"accumulatedFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"addOperator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"cotiOracleTimestamp","type":"uint256"},{"internalType":"uint256","name":"tokenOracleTimestamp","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"depositFeeBasisPoints","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"depositFixedFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"depositMaxFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"depositPercentageBps","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"cotiAmount","type":"uint256"}],"name":"estimateDepositFee","outputs":[{"internalType":"uint256","name":"fee","type":"uint256"},{"internalType":"uint256","name":"cotiLastUpdated","type":"uint256"},{"internalType":"uint256","name":"blockTimestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"cotiAmount","type":"uint256"}],"name":"estimateWithdrawFee","outputs":[{"internalType":"uint256","name":"fee","type":"uint256"},{"internalType":"uint256","name":"cotiLastUpdated","type":"uint256"},{"internalType":"uint256","name":"blockTimestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeRecipient","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getBridgeBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isDepositEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isOperator","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxDepositAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxWithdrawAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minDepositAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minWithdrawAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nativeCotiFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"onTokenReceived","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"priceOracle","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"privateCoti","outputs":[{"internalType":"contract PrivateCOTI","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"removeOperator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueNative","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescueRecipient","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fixedFee","type":"uint256"},{"internalType":"uint256","name":"_percentageBps","type":"uint256"},{"internalType":"uint256","name":"_maxFee","type":"uint256"}],"name":"setDepositDynamicFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_feeBasisPoints","type":"uint256"}],"name":"setDepositFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"}],"name":"setFeeRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_enabled","type":"bool"}],"name":"setIsDepositEnabled","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minDeposit","type":"uint256"},{"internalType":"uint256","name":"_maxDeposit","type":"uint256"},{"internalType":"uint256","name":"_minWithdraw","type":"uint256"},{"internalType":"uint256","name":"_maxWithdraw","type":"uint256"}],"name":"setLimits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"setNativeCotiFee","outputs":[],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"_oracle","type":"address"}],"name":"setPriceOracle","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"}],"name":"setRescueRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fixedFee","type":"uint256"},{"internalType":"uint256","name":"_percentageBps","type":"uint256"},{"internalType":"uint256","name":"_maxFee","type":"uint256"}],"name":"setWithdrawDynamicFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_feeBasisPoints","type":"uint256"}],"name":"setWithdrawFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"cotiOracleTimestamp","type":"uint256"},{"internalType":"uint256","name":"tokenOracleTimestamp","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawCotiFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawFeeBasisPoints","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawFixedFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawMaxFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawPercentageBps","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}] as const;
export const BRIDGE_ERC20_ABI = [{"inputs":[],"name":"AmountTooLarge","type":"error"},{"inputs":[],"name":"AmountTooSmall","type":"error"},{"inputs":[],"name":"AmountZero","type":"error"},{"inputs":[],"name":"BridgePaused","type":"error"},{"inputs":[],"name":"CannotRescueBridgeToken","type":"error"},{"inputs":[],"name":"DecimalsMismatch","type":"error"},{"inputs":[],"name":"DepositBelowMinimum","type":"error"},{"inputs":[],"name":"DepositDisabled","type":"error"},{"inputs":[],"name":"DepositExceedsMaximum","type":"error"},{"inputs":[],"name":"EthTransferFailed","type":"error"},{"inputs":[],"name":"FeeRecipientNotSet","type":"error"},{"inputs":[],"name":"InsufficientAccumulatedFees","type":"error"},{"inputs":[],"name":"InsufficientBridgeLiquidity","type":"error"},{"inputs":[],"name":"InsufficientCotiFee","type":"error"},{"inputs":[],"name":"InsufficientEthBalance","type":"error"},{"inputs":[],"name":"InvalidAddress","type":"error"},{"inputs":[],"name":"InvalidFee","type":"error"},{"inputs":[],"name":"InvalidFeeConfiguration","type":"error"},{"inputs":[],"name":"InvalidLimitConfiguration","type":"error"},{"inputs":[],"name":"InvalidPrivateTokenAddress","type":"error"},{"inputs":[],"name":"InvalidScalingFactor","type":"error"},{"inputs":[],"name":"InvalidTokenAddress","type":"error"},{"inputs":[],"name":"InvalidTokenSender","type":"error"},{"inputs":[],"name":"NativeFeeRequiredForTransferAndCallWithdraw","type":"error"},{"inputs":[{"internalType":"uint256","name":"expected","type":"uint256"},{"internalType":"uint256","name":"actual","type":"uint256"}],"name":"OracleTimestampMismatch","type":"error"},{"inputs":[],"name":"TokenTransferFailed","type":"error"},{"inputs":[],"name":"WithdrawBelowMinimum","type":"error"},{"inputs":[],"name":"WithdrawExceedsMaximum","type":"error"},{"inputs":[],"name":"WithdrawFeesMustBeOverridden","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"CotiFeesWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"grossAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"netAmount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"enabled","type":"bool"},{"indexed":true,"internalType":"address","name":"by","type":"address"}],"name":"DepositEnabledUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"feeType","type":"string"},{"indexed":false,"internalType":"uint256","name":"fixedFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"percentageBps","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxFee","type":"uint256"}],"name":"DynamicFeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ERC20Rescued","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldRecipient","type":"address"},{"indexed":true,"internalType":"address","name":"newRecipient","type":"address"}],"name":"FeeRecipientUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"feeType","type":"string"},{"indexed":false,"internalType":"uint256","name":"newFeeBasisPoints","type":"uint256"}],"name":"FeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FeesWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"minDeposit","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxDeposit","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"minWithdraw","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxWithdraw","type":"uint256"}],"name":"LimitsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"},{"indexed":true,"internalType":"address","name":"by","type":"address"}],"name":"NativeCotiFeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"by","type":"address"}],"name":"OperatorAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"by","type":"address"}],"name":"OperatorRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOracle","type":"address"},{"indexed":true,"internalType":"address","name":"newOracle","type":"address"}],"name":"PriceOracleUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldRecipient","type":"address"},{"indexed":true,"internalType":"address","name":"newRecipient","type":"address"}],"name":"RescueRecipientUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"grossAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"netAmount","type":"uint256"}],"name":"Withdraw","type":"event"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEE_DIVISOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_FEE_UNITS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"OPERATOR_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"accumulatedCotiFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"accumulatedFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"addOperator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"cotiOracleTimestamp","type":"uint256"},{"internalType":"uint256","name":"tokenOracleTimestamp","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"depositFeeBasisPoints","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"depositFixedFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"depositMaxFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"depositPercentageBps","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenAmount","type":"uint256"}],"name":"estimateDepositFee","outputs":[{"internalType":"uint256","name":"fee","type":"uint256"},{"internalType":"uint256","name":"cotiLastUpdated","type":"uint256"},{"internalType":"uint256","name":"tokenLastUpdated","type":"uint256"},{"internalType":"uint256","name":"blockTimestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenAmount","type":"uint256"}],"name":"estimateWithdrawFee","outputs":[{"internalType":"uint256","name":"fee","type":"uint256"},{"internalType":"uint256","name":"cotiLastUpdated","type":"uint256"},{"internalType":"uint256","name":"tokenLastUpdated","type":"uint256"},{"internalType":"uint256","name":"blockTimestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeRecipient","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isDepositEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isOperator","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxDepositAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxWithdrawAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minDepositAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minWithdrawAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nativeCotiFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"priceOracle","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"privateToken","outputs":[{"internalType":"contract IPrivateERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"removeOperator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescueRecipient","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fixedFee","type":"uint256"},{"internalType":"uint256","name":"_percentageBps","type":"uint256"},{"internalType":"uint256","name":"_maxFee","type":"uint256"}],"name":"setDepositDynamicFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_feeBasisPoints","type":"uint256"}],"name":"setDepositFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"}],"name":"setFeeRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_enabled","type":"bool"}],"name":"setIsDepositEnabled","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minDeposit","type":"uint256"},{"internalType":"uint256","name":"_maxDeposit","type":"uint256"},{"internalType":"uint256","name":"_minWithdraw","type":"uint256"},{"internalType":"uint256","name":"_maxWithdraw","type":"uint256"}],"name":"setLimits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"setNativeCotiFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_oracle","type":"address"}],"name":"setPriceOracle","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"}],"name":"setRescueRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fixedFee","type":"uint256"},{"internalType":"uint256","name":"_percentageBps","type":"uint256"},{"internalType":"uint256","name":"_maxFee","type":"uint256"}],"name":"setWithdrawDynamicFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_feeBasisPoints","type":"uint256"}],"name":"setWithdrawFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenSymbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"cotiOracleTimestamp","type":"uint256"},{"internalType":"uint256","name":"tokenOracleTimestamp","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawCotiFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawFeeBasisPoints","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawFixedFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawMaxFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawPercentageBps","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}] as const;

export const TOKEN_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ERC20InvalidMetadata",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "ERC20SelfTransferNotAllowed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PublicAmountsDisabled",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "TransferAndCallRequiresContract",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newAddress",
        "type": "address"
      }
    ],
    "name": "AccountEncryptionAddressSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "ctUint128",
            "name": "ciphertextHigh",
            "type": "uint256"
          },
          {
            "internalType": "ctUint128",
            "name": "ciphertextLow",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct ctUint256",
        "name": "ownerValue",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "ctUint128",
            "name": "ciphertextHigh",
            "type": "uint256"
          },
          {
            "internalType": "ctUint128",
            "name": "ciphertextLow",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct ctUint256",
        "name": "spenderValue",
        "type": "tuple"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bool",
        "name": "enabled",
        "type": "bool"
      }
    ],
    "name": "PublicAmountsEnabledSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "ctUint128",
            "name": "ciphertextHigh",
            "type": "uint256"
          },
          {
            "internalType": "ctUint128",
            "name": "ciphertextLow",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct ctUint256",
        "name": "senderValue",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "ctUint128",
            "name": "ciphertextHigh",
            "type": "uint256"
          },
          {
            "internalType": "ctUint128",
            "name": "ciphertextLow",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct ctUint256",
        "name": "receiverValue",
        "type": "tuple"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MINTER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "accountEncryptionAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isSpender",
        "type": "bool"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "gtUint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "ctUint128",
                "name": "ciphertextHigh",
                "type": "uint256"
              },
              {
                "internalType": "ctUint128",
                "name": "ciphertextLow",
                "type": "uint256"
              }
            ],
            "internalType": "struct ctUint256",
            "name": "ciphertext",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "ctUint128",
                "name": "ciphertextHigh",
                "type": "uint256"
              },
              {
                "internalType": "ctUint128",
                "name": "ciphertextLow",
                "type": "uint256"
              }
            ],
            "internalType": "struct ctUint256",
            "name": "ownerCiphertext",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "ctUint128",
                "name": "ciphertextHigh",
                "type": "uint256"
              },
              {
                "internalType": "ctUint128",
                "name": "ciphertextLow",
                "type": "uint256"
              }
            ],
            "internalType": "struct ctUint256",
            "name": "spenderCiphertext",
            "type": "tuple"
          }
        ],
        "internalType": "struct IPrivateERC20.Allowance",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "components": [
          {
            "components": [
              {
                "internalType": "ctUint128",
                "name": "ciphertextHigh",
                "type": "uint256"
              },
              {
                "internalType": "ctUint128",
                "name": "ciphertextLow",
                "type": "uint256"
              }
            ],
            "internalType": "struct ctUint256",
            "name": "ciphertext",
            "type": "tuple"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          }
        ],
        "internalType": "struct itUint256",
        "name": "value",
        "type": "tuple"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "gtUint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approveGT",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "components": [
          {
            "internalType": "ctUint128",
            "name": "ciphertextHigh",
            "type": "uint256"
          },
          {
            "internalType": "ctUint128",
            "name": "ciphertextLow",
            "type": "uint256"
          }
        ],
        "internalType": "struct ctUint256",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "gtUint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "ctUint128",
                "name": "ciphertextHigh",
                "type": "uint256"
              },
              {
                "internalType": "ctUint128",
                "name": "ciphertextLow",
                "type": "uint256"
              }
            ],
            "internalType": "struct ctUint256",
            "name": "ciphertext",
            "type": "tuple"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          }
        ],
        "internalType": "struct itUint256",
        "name": "amount",
        "type": "tuple"
      }
    ],
    "name": "burn",
    "outputs": [
      {
        "internalType": "gtBool",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "gtUint256",
        "name": "gtAmount",
        "type": "uint256"
      }
    ],
    "name": "burnGt",
    "outputs": [
      {
        "internalType": "gtBool",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "components": [
          {
            "components": [
              {
                "internalType": "ctUint128",
                "name": "ciphertextHigh",
                "type": "uint256"
              },
              {
                "internalType": "ctUint128",
                "name": "ciphertextLow",
                "type": "uint256"
              }
            ],
            "internalType": "struct ctUint256",
            "name": "ciphertext",
            "type": "tuple"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          }
        ],
        "internalType": "struct itUint256",
        "name": "amount",
        "type": "tuple"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "gtBool",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "gtUint256",
        "name": "gtAmount",
        "type": "uint256"
      }
    ],
    "name": "mintGt",
    "outputs": [
      {
        "internalType": "gtBool",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "publicAmountsEnabled",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isSpender",
        "type": "bool"
      }
    ],
    "name": "reencryptAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "offBoardAddress",
        "type": "address"
      }
    ],
    "name": "setAccountEncryptionAddress",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "enabled",
        "type": "bool"
      }
    ],
    "name": "setPublicAmountsEnabled",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "components": [
          {
            "components": [
              {
                "internalType": "ctUint128",
                "name": "ciphertextHigh",
                "type": "uint256"
              },
              {
                "internalType": "ctUint128",
                "name": "ciphertextLow",
                "type": "uint256"
              }
            ],
            "internalType": "struct ctUint256",
            "name": "ciphertext",
            "type": "tuple"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          }
        ],
        "internalType": "struct itUint256",
        "name": "value",
        "type": "tuple"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "gtBool",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "components": [
          {
            "components": [
              {
                "internalType": "ctUint128",
                "name": "ciphertextHigh",
                "type": "uint256"
              },
              {
                "internalType": "ctUint128",
                "name": "ciphertextLow",
                "type": "uint256"
              }
            ],
            "internalType": "struct ctUint256",
            "name": "ciphertext",
            "type": "tuple"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          }
        ],
        "internalType": "struct itUint256",
        "name": "amount",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "transferAndCall",
    "outputs": [
      {
        "internalType": "gtBool",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "transferAndCall",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "components": [
          {
            "components": [
              {
                "internalType": "ctUint128",
                "name": "ciphertextHigh",
                "type": "uint256"
              },
              {
                "internalType": "ctUint128",
                "name": "ciphertextLow",
                "type": "uint256"
              }
            ],
            "internalType": "struct ctUint256",
            "name": "ciphertext",
            "type": "tuple"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          }
        ],
        "internalType": "struct itUint256",
        "name": "value",
        "type": "tuple"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "gtBool",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "gtUint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFromGT",
    "outputs": [
      {
        "internalType": "gtBool",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "gtUint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferGT",
    "outputs": [
      {
        "internalType": "gtBool",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

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
  { symbol: "COTI", name: "COTI", icon: "/icons/coti.svg", decimals: 18, isPrivate: false, bridgeAddressKey: "PrivacyBridgeCotiNative" }, // Native COTI, no address key needed
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

