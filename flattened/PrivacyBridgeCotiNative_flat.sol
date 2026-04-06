

// Sources flattened with hardhat v2.28.6 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.4) (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (access/Ownable.sol)


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/security/Pausable.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (security/Pausable.sol)


/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    bool private _paused;

    /**
     * @dev Initializes the contract in unpaused state.
     */
    constructor() {
        _paused = false;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        require(!paused(), "Pausable: paused");
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        require(paused(), "Pausable: not paused");
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}


// File @openzeppelin/contracts/security/ReentrancyGuard.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (security/ReentrancyGuard.sol)


/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}


// File @openzeppelin/contracts/utils/math/Math.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (utils/math/Math.sol)


/**
 * @dev Standard math utilities missing in the Solidity language.
 */
library Math {
    enum Rounding {
        Down, // Toward negative infinity
        Up, // Toward infinity
        Zero // Toward zero
    }

    /**
     * @dev Returns the largest of two numbers.
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @dev Returns the smallest of two numbers.
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two numbers. The result is rounded towards
     * zero.
     */
    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b) / 2 can overflow.
        return (a & b) + (a ^ b) / 2;
    }

    /**
     * @dev Returns the ceiling of the division of two numbers.
     *
     * This differs from standard division with `/` in that it rounds up instead
     * of rounding down.
     */
    function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b - 1) / b can overflow on addition, so we distribute.
        return a == 0 ? 0 : (a - 1) / b + 1;
    }

    /**
     * @notice Calculates floor(x * y / denominator) with full precision. Throws if result overflows a uint256 or denominator == 0
     * @dev Original credit to Remco Bloemen under MIT license (https://xn--2-umb.com/21/muldiv)
     * with further edits by Uniswap Labs also under MIT license.
     */
    function mulDiv(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256 result) {
        unchecked {
            // 512-bit multiply [prod1 prod0] = x * y. Compute the product mod 2^256 and mod 2^256 - 1, then use
            // use the Chinese Remainder Theorem to reconstruct the 512 bit result. The result is stored in two 256
            // variables such that product = prod1 * 2^256 + prod0.
            uint256 prod0; // Least significant 256 bits of the product
            uint256 prod1; // Most significant 256 bits of the product
            assembly {
                let mm := mulmod(x, y, not(0))
                prod0 := mul(x, y)
                prod1 := sub(sub(mm, prod0), lt(mm, prod0))
            }

            // Handle non-overflow cases, 256 by 256 division.
            if (prod1 == 0) {
                // Solidity will revert if denominator == 0, unlike the div opcode on its own.
                // The surrounding unchecked block does not change this fact.
                // See https://docs.soliditylang.org/en/latest/control-structures.html#checked-or-unchecked-arithmetic.
                return prod0 / denominator;
            }

            // Make sure the result is less than 2^256. Also prevents denominator == 0.
            require(denominator > prod1, "Math: mulDiv overflow");

            ///////////////////////////////////////////////
            // 512 by 256 division.
            ///////////////////////////////////////////////

            // Make division exact by subtracting the remainder from [prod1 prod0].
            uint256 remainder;
            assembly {
                // Compute remainder using mulmod.
                remainder := mulmod(x, y, denominator)

                // Subtract 256 bit number from 512 bit number.
                prod1 := sub(prod1, gt(remainder, prod0))
                prod0 := sub(prod0, remainder)
            }

            // Factor powers of two out of denominator and compute largest power of two divisor of denominator. Always >= 1.
            // See https://cs.stackexchange.com/q/138556/92363.

            // Does not overflow because the denominator cannot be zero at this stage in the function.
            uint256 twos = denominator & (~denominator + 1);
            assembly {
                // Divide denominator by twos.
                denominator := div(denominator, twos)

                // Divide [prod1 prod0] by twos.
                prod0 := div(prod0, twos)

                // Flip twos such that it is 2^256 / twos. If twos is zero, then it becomes one.
                twos := add(div(sub(0, twos), twos), 1)
            }

            // Shift in bits from prod1 into prod0.
            prod0 |= prod1 * twos;

            // Invert denominator mod 2^256. Now that denominator is an odd number, it has an inverse modulo 2^256 such
            // that denominator * inv = 1 mod 2^256. Compute the inverse by starting with a seed that is correct for
            // four bits. That is, denominator * inv = 1 mod 2^4.
            uint256 inverse = (3 * denominator) ^ 2;

            // Use the Newton-Raphson iteration to improve the precision. Thanks to Hensel's lifting lemma, this also works
            // in modular arithmetic, doubling the correct bits in each step.
            inverse *= 2 - denominator * inverse; // inverse mod 2^8
            inverse *= 2 - denominator * inverse; // inverse mod 2^16
            inverse *= 2 - denominator * inverse; // inverse mod 2^32
            inverse *= 2 - denominator * inverse; // inverse mod 2^64
            inverse *= 2 - denominator * inverse; // inverse mod 2^128
            inverse *= 2 - denominator * inverse; // inverse mod 2^256

            // Because the division is now exact we can divide by multiplying with the modular inverse of denominator.
            // This will give us the correct result modulo 2^256. Since the preconditions guarantee that the outcome is
            // less than 2^256, this is the final result. We don't need to compute the high bits of the result and prod1
            // is no longer required.
            result = prod0 * inverse;
            return result;
        }
    }

    /**
     * @notice Calculates x * y / denominator with full precision, following the selected rounding direction.
     */
    function mulDiv(uint256 x, uint256 y, uint256 denominator, Rounding rounding) internal pure returns (uint256) {
        uint256 result = mulDiv(x, y, denominator);
        if (rounding == Rounding.Up && mulmod(x, y, denominator) > 0) {
            result += 1;
        }
        return result;
    }

    /**
     * @dev Returns the square root of a number. If the number is not a perfect square, the value is rounded down.
     *
     * Inspired by Henry S. Warren, Jr.'s "Hacker's Delight" (Chapter 11).
     */
    function sqrt(uint256 a) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        // For our first guess, we get the biggest power of 2 which is smaller than the square root of the target.
        //
        // We know that the "msb" (most significant bit) of our target number `a` is a power of 2 such that we have
        // `msb(a) <= a < 2*msb(a)`. This value can be written `msb(a)=2**k` with `k=log2(a)`.
        //
        // This can be rewritten `2**log2(a) <= a < 2**(log2(a) + 1)`
        // → `sqrt(2**k) <= sqrt(a) < sqrt(2**(k+1))`
        // → `2**(k/2) <= sqrt(a) < 2**((k+1)/2) <= 2**(k/2 + 1)`
        //
        // Consequently, `2**(log2(a) / 2)` is a good first approximation of `sqrt(a)` with at least 1 correct bit.
        uint256 result = 1 << (log2(a) >> 1);

        // At this point `result` is an estimation with one bit of precision. We know the true value is a uint128,
        // since it is the square root of a uint256. Newton's method converges quadratically (precision doubles at
        // every iteration). We thus need at most 7 iteration to turn our partial result with one bit of precision
        // into the expected uint128 result.
        unchecked {
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            return min(result, a / result);
        }
    }

    /**
     * @notice Calculates sqrt(a), following the selected rounding direction.
     */
    function sqrt(uint256 a, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = sqrt(a);
            return result + (rounding == Rounding.Up && result * result < a ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 2, rounded down, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 128;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 64;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 32;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 16;
            }
            if (value >> 8 > 0) {
                value >>= 8;
                result += 8;
            }
            if (value >> 4 > 0) {
                value >>= 4;
                result += 4;
            }
            if (value >> 2 > 0) {
                value >>= 2;
                result += 2;
            }
            if (value >> 1 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 2, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log2(value);
            return result + (rounding == Rounding.Up && 1 << result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 10, rounded down, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >= 10 ** 64) {
                value /= 10 ** 64;
                result += 64;
            }
            if (value >= 10 ** 32) {
                value /= 10 ** 32;
                result += 32;
            }
            if (value >= 10 ** 16) {
                value /= 10 ** 16;
                result += 16;
            }
            if (value >= 10 ** 8) {
                value /= 10 ** 8;
                result += 8;
            }
            if (value >= 10 ** 4) {
                value /= 10 ** 4;
                result += 4;
            }
            if (value >= 10 ** 2) {
                value /= 10 ** 2;
                result += 2;
            }
            if (value >= 10 ** 1) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 10, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log10(value);
            return result + (rounding == Rounding.Up && 10 ** result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 256, rounded down, of a positive value.
     * Returns 0 if given 0.
     *
     * Adding one to the result gives the number of pairs of hex symbols needed to represent `value` as a hex string.
     */
    function log256(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 16;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 8;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 4;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 2;
            }
            if (value >> 8 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 256, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log256(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log256(value);
            return result + (rounding == Rounding.Up && 1 << (result << 3) < value ? 1 : 0);
        }
    }
}


// File contracts/privacyBridge/PrivacyBridge.sol

// Original license: SPDX_License_Identifier: MIT




/**
 * @title PrivacyBridge
 * @notice Base contract for Privacy Bridge contracts containing common logic
 * @dev Trust assumptions: 
 *      (1) MPC precompile at expected address is correct and non-malicious.
 *      (2) Private token implementation is trusted and only authorized minters can mint.
 *      (3) Owner operations (limits, fees, pause, withdraw fees, rescue) are centralized; consider timelock/multisig for sensitive actions.
 *      (4) Any new derived bridge must override withdrawFees to perform the actual transfer; base implementation reverts.
 */
abstract contract PrivacyBridge is ReentrancyGuard, Pausable, Ownable {
    /// @notice Maximum amount that can be deposited in a single transaction
    uint256 public maxDepositAmount;

    /// @notice Maximum amount that can be withdrawn in a single transaction
    uint256 public maxWithdrawAmount;

    /// @notice Minimum amount required for a deposit
    uint256 public minDepositAmount;

    /// @notice Minimum amount required for a withdrawal
    uint256 public minWithdrawAmount;

    /// @notice Deposit fee in basis points (1 bp = 0.0001%, 1,000,000 = 100%)
    uint256 public depositFeeBasisPoints;

    /// @notice Withdrawal fee in basis points (1 bp = 0.0001%, 1,000,000 = 100%)
    uint256 public withdrawFeeBasisPoints;

    /// @notice Accumulated fees collected by the bridge (in bridged asset units)
    uint256 public accumulatedFees;

    /// @notice Accumulated native COTI fees (used only by ERC20 bridges for per-operation native fee; not used by native bridge)
    uint256 public accumulatedCotiFees;

    /// @notice Fee divisor (1,000,000)
    uint256 public constant FEE_DIVISOR = 1000000;

    /// @notice Maximum fee allowed (100% = 100,000 units)
    uint256 public constant MAX_FEE_UNITS = 1000000;

    /// @notice Flag to enable/disable deposits
    bool public isDepositEnabled = true;

    /// @notice Fee in native COTI for bridge operations
    uint256 public nativeCotiFee;

    error AmountZero();
    error InsufficientEthBalance();
    error EthTransferFailed();
    error InvalidAddress();
    error DepositDisabled();
    error InsufficientCotiFee();

    // Limits errors
    error InvalidLimitConfiguration();
    error DepositBelowMinimum();
    error DepositExceedsMaximum();
    error WithdrawBelowMinimum();
    error WithdrawExceedsMaximum();
    error InvalidFee();
    error InsufficientAccumulatedFees();
    error WithdrawFeesMustBeOverridden();

    /// @notice Emitted when a user deposits tokens
    /// @param user        Address of the user
    /// @param grossAmount Total amount provided by the user before fees
    /// @param netAmount   Net amount credited to the user after fees
    event Deposit(address indexed user, uint256 grossAmount, uint256 netAmount);

    /// @notice Emitted when a user withdraws tokens
    /// @param user        Address of the user
    /// @param grossAmount Total amount of private tokens burned / requested
    /// @param netAmount   Net public/native amount sent to the user after fees
    event Withdraw(address indexed user, uint256 grossAmount, uint256 netAmount);

    /// @notice Emitted when deposit/withdrawal limits are updated
    event LimitsUpdated(
        uint256 minDeposit,
        uint256 maxDeposit,
        uint256 minWithdraw,
        uint256 maxWithdraw
    );

    /// @notice Emitted when fees are updated
    event FeeUpdated(string feeType, uint256 newFeeBasisPoints);

    /// @notice Emitted when accumulated fees are withdrawn
    event FeesWithdrawn(address indexed to, uint256 amount);

    constructor() Ownable() {
        maxDepositAmount = type(uint256).max;
        maxWithdrawAmount = type(uint256).max;
        minDepositAmount = 1;
        minWithdrawAmount = 1;
    }

    /**
     * @notice Update deposit and withdrawal limits
     * @dev Ensures min values are less than or equal to max values.
     *      Setting _maxDeposit or _maxWithdraw to 0 effectively disables deposits or withdrawals.
     * @param _minDeposit New minimum deposit amount
     * @param _maxDeposit New maximum deposit amount
     * @param _minWithdraw New minimum withdrawal amount
     * @param _maxWithdraw New maximum withdrawal amount
     */
    function setLimits(
        uint256 _minDeposit,
        uint256 _maxDeposit,
        uint256 _minWithdraw,
        uint256 _maxWithdraw
    ) external onlyOwner {
        if (_minDeposit > _maxDeposit) revert InvalidLimitConfiguration();
        if (_minWithdraw > _maxWithdraw) revert InvalidLimitConfiguration();
        minDepositAmount = _minDeposit;
        maxDepositAmount = _maxDeposit;
        minWithdrawAmount = _minWithdraw;
        maxWithdrawAmount = _maxWithdraw;

        emit LimitsUpdated(
            _minDeposit,
            _maxDeposit,
            _minWithdraw,
            _maxWithdraw
        );
    }

    /**
     * @notice Pause the bridge, preventing deposits and withdrawals
     * @dev Only the owner can call this function
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the bridge, allowing deposits and withdrawals again
     * @dev Only the owner can call this function
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Check if a deposit amount is within configured limits
     * @param amount The amount to check
     * @dev Reverts if amount is below minimum or above maximum
     */
    function _checkDepositLimits(uint256 amount) internal view {
        if (amount < minDepositAmount) revert DepositBelowMinimum();
        if (amount > maxDepositAmount) revert DepositExceedsMaximum();
    }

    /**
     * @notice Check if a withdrawal amount is within configured limits
     * @param amount The amount to check
     * @dev Reverts if amount is below minimum or exceeds maximum withdrawal limit
     */
    function _checkWithdrawLimits(uint256 amount) internal view {
        if (amount < minWithdrawAmount) revert WithdrawBelowMinimum();
        if (amount > maxWithdrawAmount) revert WithdrawExceedsMaximum();
    }

    /**
     * @notice Set the deposit fee
     * @param _feeBasisPoints New deposit fee in basis points (max 100,000 = 10%)
     * @dev Only the owner can call this function
     */
    function setDepositFee(uint256 _feeBasisPoints) external onlyOwner {
        if (_feeBasisPoints > MAX_FEE_UNITS) revert InvalidFee();
        depositFeeBasisPoints = _feeBasisPoints;
        emit FeeUpdated("deposit", _feeBasisPoints);
    }

    /**
     * @notice Set the withdrawal fee
     * @param _feeBasisPoints New withdrawal fee in basis points (max 10% = 100,000)
     * @dev Only the owner can call this function
     */
    function setWithdrawFee(uint256 _feeBasisPoints) external onlyOwner {
        if (_feeBasisPoints > MAX_FEE_UNITS) revert InvalidFee();
        withdrawFeeBasisPoints = _feeBasisPoints;
        emit FeeUpdated("withdraw", _feeBasisPoints);
    }

    /**
     * @notice Toggle deposit functionality
     * @param _enabled True to enable, false to disable
     */
    function setIsDepositEnabled(bool _enabled) external onlyOwner {
        isDepositEnabled = _enabled;
    }

    /**
     * @notice Set the native COTI fee
     * @param _fee Amount in native tokens (wei-equivalent)
     * @dev Used by ERC20 bridges: they require msg.value >= this value and refund excess to the caller (best-effort).
     */
    function setNativeCotiFee(uint256 _fee) external onlyOwner {
        nativeCotiFee = _fee;
    }

    /**
     * @notice Calculate fee amount based on the input amount and fee basis points
     * @param amount The amount to calculate fee for
     * @param feeBasisPoints Fee in basis points (100 bp = 1%)
     * @return The fee amount
     */
    function _calculateFeeAmount(
        uint256 amount,
        uint256 feeBasisPoints
    ) internal pure returns (uint256) {
        if (feeBasisPoints == 0) return 0;
        return Math.mulDiv(amount, feeBasisPoints, FEE_DIVISOR);
    }

    /**
     * @notice Withdraw accumulated fees
     * @param to Address to send the fees to
     * @param amount Amount of fees to withdraw
     * @dev Only the owner can call this function. Must be overridden in derived contracts
     *      to perform the actual token/native transfer; base implementation reverts.
     */
    function withdrawFees(
        address to,
        uint256 amount
    ) external virtual onlyOwner {
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert AmountZero();
        if (amount > accumulatedFees) revert InsufficientAccumulatedFees();
        revert WithdrawFeesMustBeOverridden();
    }

    /**
     * @notice Withdraw accumulated native COTI fees
     * @param to Address to send the native COTI fees to
     * @param amount Amount of native COTI fees to withdraw
     * @dev Only the owner can call this function. Derived ERC20 bridges use this inherited implementation to withdraw
     *      accumulated native COTI fees; native bridge does not use this (accumulatedCotiFees remains 0).
     */
    function withdrawCotiFees(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert AmountZero();
        if (amount > accumulatedCotiFees) revert InsufficientAccumulatedFees();
        if (amount > address(this).balance) revert InsufficientEthBalance();

        accumulatedCotiFees -= amount;

        (bool success, ) = to.call{value: amount}("");
        if (!success) revert EthTransferFailed();
    }
}


// File contracts/token/PrivateERC20/ITokenReceiver.sol

// Original license: SPDX_License_Identifier: MIT


/**
 * @dev Interface for receiving Private ERC-20 tokens.
 */
interface ITokenReceiver {
    function onTokenReceived(
        address from,
        uint256 amount,
        bytes calldata data
    ) external returns (bool);
}


// File contracts/utils/mpc/MpcInterface.sol

// Original license: SPDX_License_Identifier: MIT

interface ExtendedOperations {

    function OnBoard(bytes1 metaData, uint256 ct) external returns (uint256 result);
    function OnBoard(bytes1 metaData, uint256 ctHigh, uint256 ctLow) external returns (uint256 result);
    function OffBoard(bytes1 metaData, uint256 ct) external returns (uint256 result);
    function OffBoard256(bytes1 metaData, uint256 gt) external returns (uint256 ctHigh, uint256 ctLow);
    function OffBoardToUser(bytes1 metaData, uint256 ct, bytes calldata addr) external returns (uint256 result);
    function OffBoardToUser256(bytes1 metaData, uint256 ct, bytes calldata addr) external returns (uint256 ctHigh, uint256 ctLow);
    function SetPublic(bytes1 metaData, uint256 ct) external returns (uint256 result);
    function Rand(bytes1 metaData) external returns (uint256 result);
    function RandBoundedBits(bytes1 metaData, uint8 numBits) external returns (uint256 result);

    function Add(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function CheckedAdd(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 overflowBit, uint256 result);
    function Sub(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function CheckedSub(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 overflowBit, uint256 result);
    function Mul(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function CheckedMul(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 overflowBit, uint256 result);
    function Div(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Rem(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function And(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Or(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Xor(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Shl(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Shr(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Eq(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Ne(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Ge(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Gt(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Le(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Lt(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Min(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Max(bytes3 metaData, uint256 lhs, uint256 rhs) external returns (uint256 result);
    function Decrypt(bytes1 metaData, uint256 a) external returns (uint256 result);
    function Mux(bytes3 metaData, uint256 bit, uint256 a,uint256 b) external returns (uint256 result);
    function Not(bytes1 metaData, uint256 a) external returns (uint256 result);
    function Transfer(bytes4 metaData, uint256 a, uint256 b, uint256 amount) external returns (uint256 new_a, uint256 new_b, uint256 res);
    function TransferWithAllowance(bytes5 metaData, uint256 a, uint256 b, uint256 amount, uint256 allowance) external returns (uint256 new_a, uint256 new_b, uint256 res, uint256 new_allowance);
    function ValidateCiphertext(bytes1 metaData, uint256 ciphertext, bytes calldata signature) external returns (uint256 result);
    function ValidateCiphertext(bytes1 metaData, uint256 ciphertextHigh, uint256 ciphertextLow, bytes calldata signature) external returns (uint256 result);
    function GetUserKey(bytes calldata signedEK) external returns (bytes memory encryptedKey);
    function SHA256Fixed432BitInput(uint256 amount, uint256 seed1, uint256 seed2, uint256 padding1, uint256 padding2, bytes calldata addr) external returns (bytes memory result);
}

address constant MPC_PRECOMPILE = address(0x0000000000000000000000000000000000000064);


// File contracts/utils/mpc/MpcCore.sol

// Original license: SPDX_License_Identifier: MIT



type gtBool is uint256;
type gtUint8 is uint256;
type gtUint16 is uint256;
type gtUint32 is uint256;
type gtUint64 is uint256;

// we use a struct because user-defined value types can only be elementary value types
// 8 characters (in byte form) per cell and the final cell padded with zeroes if needed
struct gtString {
    gtUint64[] value;
}

type gtUint128 is uint256;
type gtUint256 is uint256;

type ctBool is uint256;
type ctUint8 is uint256;
type ctUint16 is uint256;
type ctUint32 is uint256;
type ctUint64 is uint256;

// we use a struct because user-defined value types can only be elementary value types
// 8 characters (in byte form) per cell and the final cell padded with zeroes if needed
struct ctString {
    ctUint64[] value;
}

type ctUint128 is uint256;
struct ctUint256 {
    ctUint128 ciphertextHigh;
    ctUint128 ciphertextLow;
}

struct itBool {
    ctBool ciphertext;
    bytes signature;
}
struct itUint8 {
    ctUint8 ciphertext;
    bytes signature;
}
struct itUint16 {
    ctUint16 ciphertext;
    bytes signature;
}
struct itUint32 {
    ctUint32 ciphertext;
    bytes signature;
}
struct itUint64 {
    ctUint64 ciphertext;
    bytes signature;
}
struct itString {
    ctString ciphertext;
    bytes[] signature;
}
struct itUint128 {
    ctUint128 ciphertext;
    bytes signature;
}
struct itUint256 {
    ctUint256 ciphertext;
    bytes signature;
}

struct utBool {
    ctBool ciphertext;
    ctBool userCiphertext;
}
struct utUint8 {
    ctUint8 ciphertext;
    ctUint8 userCiphertext;
}
struct utUint16 {
    ctUint16 ciphertext;
    ctUint16 userCiphertext;
}
struct utUint32 {
    ctUint32 ciphertext;
    ctUint32 userCiphertext;
}
struct utUint64 {
    ctUint64 ciphertext;
    ctUint64 userCiphertext;
}
struct utUint128 {
    ctUint128 ciphertext;
    ctUint128 userCiphertext;
}
struct utUint256 {
    ctUint256 ciphertext;
    ctUint256 userCiphertext;
}
struct utString {
    ctString ciphertext;
    ctString userCiphertext;
}

library MpcCore {

    enum MPC_TYPE {SBOOL_T , SUINT8_T , SUINT16_T, SUINT32_T ,SUINT64_T , SUINT128_T, SUINT256_T }
    enum ARGS {BOTH_SECRET , LHS_PUBLIC, RHS_PUBLIC  }
    uint public constant RSA_SIZE = 256; 

    function combineEnumsToBytes2(MPC_TYPE mpcType, ARGS argsType) internal pure returns (bytes2) {
        return bytes2(uint16(mpcType) << 8 | uint8(argsType));
    }

    function combineEnumsToBytes3(MPC_TYPE mpcType1, MPC_TYPE mpcType2, ARGS argsType) internal pure returns (bytes3) {
        return bytes3(uint24(mpcType1) << 16 | uint16(mpcType2) << 8 | uint8(argsType));
    }

    function combineEnumsToBytes4(MPC_TYPE mpcType1, MPC_TYPE mpcType2, MPC_TYPE mpcType3, ARGS argsType) internal pure returns (bytes4) {
        return bytes4(uint32(mpcType1) << 24 | uint24(mpcType2) << 16 | uint16(mpcType3) << 8 | uint8(argsType));
    }

    function combineEnumsToBytes5(MPC_TYPE mpcType1, MPC_TYPE mpcType2, MPC_TYPE mpcType3, MPC_TYPE mpcType4, ARGS argsType) internal pure returns (bytes5) {
        return bytes5(uint40(mpcType1) << 32 | uint32(mpcType2) << 24 | uint24(mpcType3) << 16 | uint16(mpcType4) << 8 | uint8(argsType));
    }

    function checkOverflow(gtBool bit) private {
        // To revert on overflow, the require statement must fail when the overflow bit is set.
        // Naturally, we would check that the overflow bit is 0.
        // However, directly requiring the bit to be 0 causes gas estimation to fail, as it always returns 1.
        // To handle this, we apply a NOT operation to the bit and require the result to be 1.
        //
        // Summary of all cases:
        //  1. **Overflow scenario**: The overflow bit is 1 → NOT operation returns 0 → require fails → transaction reverts.
        //  2. **No overflow**: The overflow bit is 0 → NOT operation returns 1 → require passes → transaction proceeds.
        //  3. **Gas estimation**: Decrypt always returns 1 during gas estimation → require passes → no impact on actual execution.
        gtBool notBit = not(bit);
        // revert on overflow
        require(decrypt(notBit) == true, "overflow error");
    }

    function checkRes8(gtBool bit, gtUint8 res) private returns (gtUint8) {
        // revert on overflow
        checkOverflow(bit);

        // return the output if there is no overflow
        return res;
    }

    function checkRes16(gtBool bit, gtUint16 res) private returns (gtUint16) {
        // revert on overflow
        checkOverflow(bit);

        // return the output if there is no overflow
        return res;
    }

    function checkRes32(gtBool bit, gtUint32 res) private returns (gtUint32) {
        // revert on overflow
        checkOverflow(bit);

        // return the output if there is no overflow
        return res;
    }

    function checkRes64(gtBool bit, gtUint64 res) private returns (gtUint64) {
        // revert on overflow
        checkOverflow(bit);

        // return the output if there is no overflow
        return res;
    }

    function checkRes128(gtBool bit, gtUint128 res) private returns (gtUint128) {
        // revert on overflow
        checkOverflow(bit);

        // return the output if there is no overflow
        return res;
    }

    function checkRes256(gtBool bit, gtUint256 res) private returns (gtUint256) {
        // revert on overflow
        checkOverflow(bit);

        // return the output if there is no overflow
        return res;
    }

    function getUserKey(bytes calldata signedEK, bytes calldata signature) internal returns (bytes memory keyShare0, bytes memory keyShare1) {
        bytes memory combined = new bytes(signature.length + signedEK.length);

        // Copy contents of signature into combined
        for (uint i = 0; i < signature.length; i++) {
            combined[i] = signature[i];
        }

        // Copy contents of _bytes2 into combined after _bytes1
        for (uint j = 0; j < signedEK.length; j++) {
            combined[signature.length + j] = signedEK[j];
        }
        bytes memory bothKeys = ExtendedOperations(address(MPC_PRECOMPILE)).GetUserKey(combined);
        bytes memory share0 = new bytes(RSA_SIZE);
        bytes memory share1 = new bytes(RSA_SIZE);

        // Copy the first key to the first share array
        for (uint i = 0; i < share0.length; i++) {
            share0[i] = bothKeys[i];
        }

        // Copy the second key to the second share array
        for (uint i = 0; i < share1.length; i++) {
            share1[i] = bothKeys[i + RSA_SIZE];
        }
        return (share0, share1);
    }

    function SHA256Fixed432BitInput(gtUint64 amount, gtUint64 seed1, gtUint64 seed2, address addr, uint64 padding1, uint16 padding2) internal returns (bytes memory result){
        return ExtendedOperations(address(MPC_PRECOMPILE)).SHA256Fixed432BitInput(gtUint64.unwrap(amount), gtUint64.unwrap(seed1), gtUint64.unwrap(seed2), uint256(padding1), uint256(padding2), abi.encodePacked(addr));
    }

// =========== 1 bit operations ==============

    function validateCiphertext(itBool memory input) internal returns (gtBool) {
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            ValidateCiphertext(bytes1(uint8(MPC_TYPE.SBOOL_T)), ctBool.unwrap(input.ciphertext), input.signature));
    }

    function onBoard(ctBool ct) internal returns (gtBool) {
         return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            OnBoard(bytes1(uint8(MPC_TYPE.SBOOL_T)), ctBool.unwrap(ct)));
    }

    function offBoard(gtBool pt) internal returns (ctBool) {
          return ctBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            OffBoard(bytes1(uint8(MPC_TYPE.SBOOL_T)), gtBool.unwrap(pt)));
    }

    function offBoardToUser(gtBool pt, address addr) internal returns (ctBool) {
          return ctBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            OffBoardToUser(bytes1(uint8(MPC_TYPE.SBOOL_T)), gtBool.unwrap(pt), abi.encodePacked(addr)));
    }

    function offBoardCombined(gtBool pt, address addr) internal returns (utBool memory ut) {
        ut.ciphertext = offBoard(pt);
        ut.userCiphertext = offBoardToUser(pt, addr);
    }

    function setPublic(bool pt) internal returns (gtBool) {
        uint256 temp;
        temp = pt ? 1 : 0; 
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            SetPublic(bytes1(uint8(MPC_TYPE.SBOOL_T)), temp));
    }

    function rand() internal returns (gtBool) {
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).Rand(bytes1(uint8(MPC_TYPE.SBOOL_T))));
    }

    function and(gtBool a, gtBool b) internal returns (gtBool) {
         return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            And(combineEnumsToBytes3(MPC_TYPE.SBOOL_T, MPC_TYPE.SBOOL_T, ARGS.BOTH_SECRET), gtBool.unwrap(a), gtBool.unwrap(b)));
    }

    function or(gtBool a, gtBool b) internal returns (gtBool) {
          return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Or(combineEnumsToBytes3(MPC_TYPE.SBOOL_T, MPC_TYPE.SBOOL_T, ARGS.BOTH_SECRET), gtBool.unwrap(a), gtBool.unwrap(b)));
    }

    function xor(gtBool a, gtBool b) internal returns (gtBool) {
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Xor(combineEnumsToBytes3(MPC_TYPE.SBOOL_T, MPC_TYPE.SBOOL_T, ARGS.BOTH_SECRET), gtBool.unwrap(a), gtBool.unwrap(b)));
    }
    
    function eq(gtBool a, gtBool b) internal returns (gtBool) {
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Eq(combineEnumsToBytes3(MPC_TYPE.SBOOL_T, MPC_TYPE.SBOOL_T, ARGS.BOTH_SECRET), gtBool.unwrap(a), gtBool.unwrap(b)));
    }

    function ne(gtBool a, gtBool b) internal returns (gtBool) {
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Ne(combineEnumsToBytes3(MPC_TYPE.SBOOL_T, MPC_TYPE.SBOOL_T, ARGS.BOTH_SECRET), gtBool.unwrap(a), gtBool.unwrap(b)));
    }

    function decrypt(gtBool ct) internal returns (bool){
        uint256 temp = ExtendedOperations(address(MPC_PRECOMPILE)).
            Decrypt(bytes1(uint8(MPC_TYPE.SBOOL_T)), gtBool.unwrap(ct));
        return temp != 0;
    }

    function mux(gtBool bit, gtBool a, gtBool b) internal returns (gtBool){
         return  gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Mux(combineEnumsToBytes3(MPC_TYPE.SBOOL_T, MPC_TYPE.SBOOL_T, ARGS.BOTH_SECRET), gtBool.unwrap(bit), gtBool.unwrap(a), gtBool.unwrap(b)));
    }

    function not(gtBool a) internal returns (gtBool){
         return  gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Not(bytes1(uint8(MPC_TYPE.SBOOL_T)), gtBool.unwrap(a)));
    }


 // =========== Operations with BOTH_SECRET parameter ===========
 // =========== 8 bit operations ==============

    function validateCiphertext(itUint8 memory input) internal returns (gtUint8) {
        return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            ValidateCiphertext(bytes1(uint8(MPC_TYPE.SUINT8_T)), ctUint8.unwrap(input.ciphertext), input.signature));
    }

    function onBoard(ctUint8 ct) internal returns (gtUint8) {
         return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            OnBoard(bytes1(uint8(MPC_TYPE.SUINT8_T)), ctUint8.unwrap(ct)));
    }

    function offBoard(gtUint8 pt) internal returns (ctUint8) {
          return ctUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            OffBoard(bytes1(uint8(MPC_TYPE.SUINT8_T)), gtUint8.unwrap(pt)));
    }

    function offBoardToUser(gtUint8 pt, address addr) internal returns (ctUint8) {
          return ctUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            OffBoardToUser(bytes1(uint8(MPC_TYPE.SUINT8_T)), gtUint8.unwrap(pt), abi.encodePacked(addr)));
    }

    function offBoardCombined(gtUint8 pt, address addr) internal returns (utUint8 memory ut) {
        ut.ciphertext = offBoard(pt);
        ut.userCiphertext = offBoardToUser(pt, addr);
    }

    function setPublic8(uint8 pt) internal returns (gtUint8) {
          return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            SetPublic(bytes1(uint8(MPC_TYPE.SUINT8_T)), uint256(pt)));
    }

    function rand8() internal returns (gtUint8) {
        return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).Rand(bytes1(uint8(MPC_TYPE.SUINT8_T))));
    }

    function randBoundedBits8(uint8 numBits) internal returns (gtUint8) {
        return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).RandBoundedBits(bytes1(uint8(MPC_TYPE.SUINT8_T)), numBits));
    }

    function add(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
        return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Add(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }
    
    function checkedAdd(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
        (uint256 bit, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            CheckedAdd(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b));

        return checkRes8(gtBool.wrap(bit), gtUint8.wrap(res));
    }
    
    function checkedAddWithOverflowBit(gtUint8 a, gtUint8 b) internal returns (gtBool, gtUint8) {
        (uint256 bit, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            CheckedAdd(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b));

        return (gtBool.wrap(bit), gtUint8.wrap(res));
    }

    function sub(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
         return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Sub(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function checkedSub(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
        (uint256 bit, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            CheckedSub(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b));

        return checkRes8(gtBool.wrap(bit), gtUint8.wrap(res));
    }
    
    function checkedSubWithOverflowBit(gtUint8 a, gtUint8 b) internal returns (gtBool, gtUint8) {
        (uint256 bit, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            CheckedSub(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b));

        return (gtBool.wrap(bit), gtUint8.wrap(res));
    }

    function mul(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
         return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Mul(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function checkedMul(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
        (uint256 bit, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            CheckedMul(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b));
        return checkRes8(gtBool.wrap(bit), gtUint8.wrap(res));
    }

    function checkedMulWithOverflowBit(gtUint8 a, gtUint8 b) internal returns (gtBool, gtUint8) {
        (uint256 bit, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            CheckedMul(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b));
        return (gtBool.wrap(bit), gtUint8.wrap(res));
    }

    function div(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
          return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Div(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function rem(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
         return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Rem(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function and(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
         return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            And(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function or(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
          return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Or(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function xor(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
        return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Xor(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function eq(gtUint8 a, gtUint8 b) internal returns (gtBool) {
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Eq(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function ne(gtUint8 a, gtUint8 b) internal returns (gtBool) {
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Ne(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function ge(gtUint8 a, gtUint8 b) internal returns (gtBool) {
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Ge(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function gt(gtUint8 a, gtUint8 b) internal returns (gtBool) {
         return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Gt(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function le(gtUint8 a, gtUint8 b) internal returns (gtBool) {
         return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Le(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function lt(gtUint8 a, gtUint8 b) internal returns (gtBool) {
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Lt(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function min(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
        return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Min(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function max(gtUint8 a, gtUint8 b) internal returns (gtUint8) {
        return gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Max(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function decrypt(gtUint8 ct) internal returns (uint8){
          return uint8(ExtendedOperations(address(MPC_PRECOMPILE)).
            Decrypt(bytes1(uint8(MPC_TYPE.SUINT8_T)), gtUint8.unwrap(ct)));
    }

    function mux(gtBool bit, gtUint8 a, gtUint8 b) internal returns (gtUint8){
         return  gtUint8.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Mux(combineEnumsToBytes3(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtBool.unwrap(bit), gtUint8.unwrap(a), gtUint8.unwrap(b)));
    }

    function transfer(gtUint8 a, gtUint8 b, gtUint8 amount) internal returns (gtUint8, gtUint8, gtBool){
        (uint256 new_a, uint256 new_b, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            Transfer(combineEnumsToBytes4(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b), gtUint8.unwrap(amount));
        return (gtUint8.wrap(new_a), gtUint8.wrap(new_b), gtBool.wrap(res));
    }

    function transferWithAllowance(gtUint8 a, gtUint8 b, gtUint8 amount, gtUint8 allowance) internal returns (gtUint8, gtUint8, gtBool, gtUint8){
        (uint256 new_a, uint256 new_b, uint256 res, uint256 new_allowance) = ExtendedOperations(address(MPC_PRECOMPILE)).
            TransferWithAllowance(combineEnumsToBytes5(MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, MPC_TYPE.SUINT8_T, ARGS.BOTH_SECRET), gtUint8.unwrap(a), gtUint8.unwrap(b), gtUint8.unwrap(amount), gtUint8.unwrap(allowance));
        return (gtUint8.wrap(new_a), gtUint8.wrap(new_b), gtBool.wrap(res), gtUint8.wrap(new_allowance));
    }


 // =========== 16 bit operations ==============

    function validateCiphertext(itUint16 memory input) internal returns (gtUint16) {
        return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            ValidateCiphertext(bytes1(uint8(MPC_TYPE.SUINT16_T)), ctUint16.unwrap(input.ciphertext), input.signature));
    }

    function onBoard(ctUint16 ct) internal returns (gtUint16) {
         return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            OnBoard(bytes1(uint8(MPC_TYPE.SUINT16_T)), ctUint16.unwrap(ct)));
    }

    function offBoard(gtUint16 pt) internal returns (ctUint16) {
          return ctUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            OffBoard(bytes1(uint8(MPC_TYPE.SUINT16_T)), gtUint16.unwrap(pt)));
    }

    function offBoardToUser(gtUint16 pt, address addr) internal returns (ctUint16) {
          return ctUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            OffBoardToUser(bytes1(uint8(MPC_TYPE.SUINT16_T)), gtUint16.unwrap(pt), abi.encodePacked(addr)));
    }

    function offBoardCombined(gtUint16 pt, address addr) internal returns (utUint16 memory ut) {
        ut.ciphertext = offBoard(pt);
        ut.userCiphertext = offBoardToUser(pt, addr);
    }

    function setPublic16(uint16 pt) internal returns (gtUint16) {
          return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            SetPublic(bytes1(uint8(MPC_TYPE.SUINT16_T)), uint256(pt)));
    }

    function rand16() internal returns (gtUint16) {
        return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).Rand(bytes1(uint8(MPC_TYPE.SUINT16_T))));
    }

    function randBoundedBits16(uint8 numBits) internal returns (gtUint16) {
        return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).RandBoundedBits(bytes1(uint8(MPC_TYPE.SUINT16_T)), numBits));
    }

    function add(gtUint16 a, gtUint16 b) internal returns (gtUint16) {
        return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Add(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b)));
    }

    function checkedAdd(gtUint16 a, gtUint16 b) internal returns (gtUint16) {
        (uint256 bit, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            CheckedAdd(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b));

        return checkRes16(gtBool.wrap(bit), gtUint16.wrap(res));
    }
    
    function checkedAddWithOverflowBit(gtUint16 a, gtUint16 b) internal returns (gtBool, gtUint16) {
        (uint256 bit, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            CheckedAdd(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b));

        return (gtBool.wrap(bit), gtUint16.wrap(res));
    }

    function sub(gtUint16 a, gtUint16 b) internal returns (gtUint16) {
         return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Sub(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b)));
    }

    function checkedSub(gtUint16 a, gtUint16 b) internal returns (gtUint16) {
        (uint256 bit, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            CheckedSub(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b));

        return checkRes16(gtBool.wrap(bit), gtUint16.wrap(res));
    }

    function checkedSubWithOverflowBit(gtUint16 a, gtUint16 b) internal returns (gtBool, gtUint16) {
        (uint256 bit, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            CheckedSub(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b));

        return (gtBool.wrap(bit), gtUint16.wrap(res));
    }

    function mul(gtUint16 a, gtUint16 b) internal returns (gtUint16) {
        return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Mul(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b)));
    }

    function checkedMul(gtUint16 a, gtUint16 b) internal returns (gtUint16) {
        (uint256 bit, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            CheckedMul(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b));

        return checkRes16(gtBool.wrap(bit), gtUint16.wrap(res));
    }

    function checkedMulWithOverflowBit(gtUint16 a, gtUint16 b) internal returns (gtBool, gtUint16) {
        (uint256 bit, uint256 res) = ExtendedOperations(address(MPC_PRECOMPILE)).
            CheckedMul(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b));

        return (gtBool.wrap(bit), gtUint16.wrap(res));
    }

    function div(gtUint16 a, gtUint16 b) internal returns (gtUint16) {
          return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Div(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b)));
    }

    function rem(gtUint16 a, gtUint16 b) internal returns (gtUint16) {
         return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Rem(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b)));
    }

    function and(gtUint16 a, gtUint16 b) internal returns (gtUint16) {
         return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            And(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b)));
    }

    function or(gtUint16 a, gtUint16 b) internal returns (gtUint16) {
          return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Or(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b)));
    }

    function xor(gtUint16 a, gtUint16 b) internal returns (gtUint16) {
        return gtUint16.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Xor(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b)));
    }

    function eq(gtUint16 a, gtUint16 b) internal returns (gtBool) {
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Eq(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b)));
    }

    function ne(gtUint16 a, gtUint16 b) internal returns (gtBool) {
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Ne(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b)));
    }

    function ge(gtUint16 a, gtUint16 b) internal returns (gtBool) {
        return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
            Ge(combineEnumsToBytes3(MPC_TYPE.SUINT16_T, MPC_TYPE.SUINT16_T, ARGS.BOTH_SECRET), gtUint16.unwrap(a), gtUint16.unwrap(b)));
    }

    function gt(gtUint16 a, gtUint16 b) internal returns (gtBool) {
         return gtBool.wrap(ExtendedOperations(address(MPC_PRECOMPILE)).
         