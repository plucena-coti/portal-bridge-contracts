// Sources flattened with hardhat v2.27.1 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/access/IAccessControl.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/IAccessControl.sol)

pragma solidity ^0.8.0;

/**
 * @dev External interface of AccessControl declared to support ERC165 detection.
 */
interface IAccessControl {
    /**
     * @dev Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole`
     *
     * `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
     * {RoleAdminChanged} not being emitted signaling this.
     *
     * _Available since v3.1._
     */
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);

    /**
     * @dev Emitted when `account` is granted `role`.
     *
     * `sender` is the account that originated the contract call, an admin role
     * bearer except when using {AccessControl-_setupRole}.
     */
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Emitted when `account` is revoked `role`.
     *
     * `sender` is the account that originated the contract call:
     *   - if using `revokeRole`, it is the admin role bearer
     *   - if using `renounceRole`, it is the role bearer (i.e. `account`)
     */
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) external view returns (bool);

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {AccessControl-_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) external view returns (bytes32);

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function grantRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function revokeRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been granted `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `account`.
     */
    function renounceRole(bytes32 role, address account) external;
}


// File @openzeppelin/contracts/utils/Context.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.4) (utils/Context.sol)


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


// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/introspection/IERC165.sol)


/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File @openzeppelin/contracts/utils/introspection/ERC165.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/introspection/ERC165.sol)


/**
 * @dev Implementation of the {IERC165} interface.
 *
 * Contracts that want to implement ERC165 should inherit from this contract and override {supportsInterface} to check
 * for the additional interface id that will be supported. For example:
 *
 * ```solidity
 * function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
 *     return interfaceId == type(MyInterface).interfaceId || super.supportsInterface(interfaceId);
 * }
 * ```
 *
 * Alternatively, {ERC165Storage} provides an easier to use but more expensive implementation.
 */
abstract contract ERC165 is IERC165 {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
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


// File @openzeppelin/contracts/utils/math/SignedMath.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.8.0) (utils/math/SignedMath.sol)


/**
 * @dev Standard signed math utilities missing in the Solidity language.
 */
library SignedMath {
    /**
     * @dev Returns the largest of two signed numbers.
     */
    function max(int256 a, int256 b) internal pure returns (int256) {
        return a > b ? a : b;
    }

    /**
     * @dev Returns the smallest of two signed numbers.
     */
    function min(int256 a, int256 b) internal pure returns (int256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two signed numbers without overflow.
     * The result is rounded towards zero.
     */
    function average(int256 a, int256 b) internal pure returns (int256) {
        // Formula from the book "Hacker's Delight"
        int256 x = (a & b) + ((a ^ b) >> 1);
        return x + (int256(uint256(x) >> 255) & (a ^ b));
    }

    /**
     * @dev Returns the absolute unsigned value of a signed value.
     */
    function abs(int256 n) internal pure returns (uint256) {
        unchecked {
            // must be unchecked in order to support `n = type(int256).min`
            return uint256(n >= 0 ? n : -n);
        }
    }
}


// File @openzeppelin/contracts/utils/Strings.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (utils/Strings.sol)



/**
 * @dev String operations.
 */
library Strings {
    bytes16 private constant _SYMBOLS = "0123456789abcdef";
    uint8 private constant _ADDRESS_LENGTH = 20;

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        unchecked {
            uint256 length = Math.log10(value) + 1;
            string memory buffer = new string(length);
            uint256 ptr;
            /// @solidity memory-safe-assembly
            assembly {
                ptr := add(buffer, add(32, length))
            }
            while (true) {
                ptr--;
                /// @solidity memory-safe-assembly
                assembly {
                    mstore8(ptr, byte(mod(value, 10), _SYMBOLS))
                }
                value /= 10;
                if (value == 0) break;
            }
            return buffer;
        }
    }

    /**
     * @dev Converts a `int256` to its ASCII `string` decimal representation.
     */
    function toString(int256 value) internal pure returns (string memory) {
        return string(abi.encodePacked(value < 0 ? "-" : "", toString(SignedMath.abs(value))));
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        unchecked {
            return toHexString(value, Math.log256(value) + 1);
        }
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }

    /**
     * @dev Converts an `address` with fixed length of 20 bytes to its not checksummed ASCII `string` hexadecimal representation.
     */
    function toHexString(address addr) internal pure returns (string memory) {
        return toHexString(uint256(uint160(addr)), _ADDRESS_LENGTH);
    }

    /**
     * @dev Returns true if the two strings are equal.
     */
    function equal(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}


// File @openzeppelin/contracts/access/AccessControl.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (access/AccessControl.sol)





/**
 * @dev Contract module that allows children to implement role-based access
 * control mechanisms. This is a lightweight version that doesn't allow enumerating role
 * members except through off-chain means by accessing the contract event logs. Some
 * applications may benefit from on-chain enumerability, for those cases see
 * {AccessControlEnumerable}.
 *
 * Roles are referred to by their `bytes32` identifier. These should be exposed
 * in the external API and be unique. The best way to achieve this is by
 * using `public constant` hash digests:
 *
 * ```solidity
 * bytes32 public constant MY_ROLE = keccak256("MY_ROLE");
 * ```
 *
 * Roles can be used to represent a set of permissions. To restrict access to a
 * function call, use {hasRole}:
 *
 * ```solidity
 * function foo() public {
 *     require(hasRole(MY_ROLE, msg.sender));
 *     ...
 * }
 * ```
 *
 * Roles can be granted and revoked dynamically via the {grantRole} and
 * {revokeRole} functions. Each role has an associated admin role, and only
 * accounts that have a role's admin role can call {grantRole} and {revokeRole}.
 *
 * By default, the admin role for all roles is `DEFAULT_ADMIN_ROLE`, which means
 * that only accounts with this role will be able to grant or revoke other
 * roles. More complex role relationships can be created by using
 * {_setRoleAdmin}.
 *
 * WARNING: The `DEFAULT_ADMIN_ROLE` is also its own admin: it has permission to
 * grant and revoke this role. Extra precautions should be taken to secure
 * accounts that have been granted it. We recommend using {AccessControlDefaultAdminRules}
 * to enforce additional security measures for this role.
 */
abstract contract AccessControl is Context, IAccessControl, ERC165 {
    struct RoleData {
        mapping(address => bool) members;
        bytes32 adminRole;
    }

    mapping(bytes32 => RoleData) private _roles;

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    /**
     * @dev Modifier that checks that an account has a specific role. Reverts
     * with a standardized message including the required role.
     *
     * The format of the revert reason is given by the following regular expression:
     *
     *  /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/
     *
     * _Available since v4.1._
     */
    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) public view virtual override returns (bool) {
        return _roles[role].members[account];
    }

    /**
     * @dev Revert with a standard message if `_msgSender()` is missing `role`.
     * Overriding this function changes the behavior of the {onlyRole} modifier.
     *
     * Format of the revert message is described in {_checkRole}.
     *
     * _Available since v4.6._
     */
    function _checkRole(bytes32 role) internal view virtual {
        _checkRole(role, _msgSender());
    }

    /**
     * @dev Revert with a standard message if `account` is missing `role`.
     *
     * The format of the revert reason is given by the following regular expression:
     *
     *  /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/
     */
    function _checkRole(bytes32 role, address account) internal view virtual {
        if (!hasRole(role, account)) {
            revert(
                string(
                    abi.encodePacked(
                        "AccessControl: account ",
                        Strings.toHexString(account),
                        " is missing role ",
                        Strings.toHexString(uint256(role), 32)
                    )
                )
            );
        }
    }

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) public view virtual override returns (bytes32) {
        return _roles[role].adminRole;
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     *
     * May emit a {RoleGranted} event.
     */
    function grantRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     *
     * May emit a {RoleRevoked} event.
     */
    function revokeRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
    }

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been revoked `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `account`.
     *
     * May emit a {RoleRevoked} event.
     */
    function renounceRole(bytes32 role, address account) public virtual override {
        require(account == _msgSender(), "AccessControl: can only renounce roles for self");

        _revokeRole(role, account);
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event. Note that unlike {grantRole}, this function doesn't perform any
     * checks on the calling account.
     *
     * May emit a {RoleGranted} event.
     *
     * [WARNING]
     * ====
     * This function should only be called from the constructor when setting
     * up the initial roles for the system.
     *
     * Using this function in any other way is effectively circumventing the admin
     * system imposed by {AccessControl}.
     * ====
     *
     * NOTE: This function is deprecated in favor of {_grantRole}.
     */
    function _setupRole(bytes32 role, address account) internal virtual {
        _grantRole(role, account);
    }

    /**
     * @dev Sets `adminRole` as ``role``'s admin role.
     *
     * Emits a {RoleAdminChanged} event.
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        bytes32 previousAdminRole = getRoleAdmin(role);
        _roles[role].adminRole = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * Internal function without access restriction.
     *
     * May emit a {RoleGranted} event.
     */
    function _grantRole(bytes32 role, address account) internal virtual {
        if (!hasRole(role, account)) {
            _roles[role].members[account] = true;
            emit RoleGranted(role, account, _msgSender());
        }
    }

    /**
     * @dev Revokes `role` from `account`.
     *
     * Internal function without access restriction.
     *
     * May emit a {RoleRevoked} event.
     */
    function _revokeRole(bytes32 role, address account) internal virtual {
        if (hasRole(role, account)) {
            _roles[role].members[account] = false;
            emit RoleRevoked(role, account, _msgSender());
        }
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


// File contracts/privacyBridge/PrivacyBridge.sol

// Original license: SPDX_License_Identifier: MIT





/**
 * @title ICotiPriceConsumer
 * @notice Minimal interface for the CotiPriceConsumer oracle used by the bridge
 */
interface ICotiPriceConsumer {
    /// @notice Returns the COTI/USD rate scaled by 1e18.
    function getCotiPrice() external view returns (uint256);

    /// @notice Returns the rate for an arbitrary base/USD pair scaled by 1e18.
    function getPrice(string calldata _base) external view returns (uint256);
}

/**
 * @title PrivacyBridge
 * @notice Base contract for Privacy Bridge contracts containing common logic
 * @dev Trust assumptions: (1) MPC precompile at expected address is correct and non-malicious.
 *      (2) Private token implementation is trusted and only authorized minters can mint.
 *      (3) Owner operations (limits, fees, pause, withdraw fees, rescue) are centralized; consider timelock/multisig for sensitive actions.
 *      (4) Any new derived bridge must override withdrawFees to perform the actual transfer; base implementation reverts.
 */
abstract contract PrivacyBridge is ReentrancyGuard, Pausable, Ownable, AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    event OperatorAdded(address indexed account, address indexed by);
    event OperatorRemoved(address indexed account, address indexed by);
    event DepositEnabledUpdated(bool enabled, address indexed by);
    event NativeCotiFeeUpdated(uint256 fee, address indexed by);
    event DynamicFeeUpdated(string feeType, uint256 fixedFee, uint256 percentageBps, uint256 maxFee);
    event PriceOracleUpdated(address indexed oldOracle, address indexed newOracle);

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

    /// @notice Maximum fee allowed (10% = 100,000 units)
    uint256 public constant MAX_FEE_UNITS = 100000;

    /// @notice Flag to enable/disable deposits
    bool public isDepositEnabled = true;

    /// @notice Fee in native COTI for bridge operations
    uint256 public nativeCotiFee;

    /// @notice Deposit fee floor in COTI wei
    uint256 public depositFixedFee = 10 ether;

    /// @notice Deposit percentage (500/1,000,000 = 0.05%)
    uint256 public depositPercentageBps = 500;

    /// @notice Deposit fee cap in COTI wei
    uint256 public depositMaxFee = 3000 ether;

    /// @notice Withdraw fee floor in COTI wei
    uint256 public withdrawFixedFee = 3 ether;

    /// @notice Withdraw percentage (250/1,000,000 = 0.025%)
    uint256 public withdrawPercentageBps = 250;

    /// @notice Withdraw fee cap in COTI wei
    uint256 public withdrawMaxFee = 1500 ether;

    /// @notice CotiPriceConsumer contract address
    address public priceOracle;

    error AmountZero();
    error InsufficientEthBalance();
    error EthTransferFailed();
    error InvalidAddress();
    error DepositDisabled();
    error InsufficientCotiFee();
    error BridgePaused();

    // Limits errors
    error InvalidLimitConfiguration();
    error DepositBelowMinimum();
    error DepositExceedsMaximum();
    error WithdrawBelowMinimum();
    error WithdrawExceedsMaximum();
    error InvalidFee();
    error InvalidFeeConfiguration();
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

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    modifier onlyOperator() {
        _checkRole(OPERATOR_ROLE, msg.sender);
        _;
    }

    function addOperator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (account == address(0)) revert InvalidAddress();
        _grantRole(OPERATOR_ROLE, account);
        emit OperatorAdded(account, msg.sender);
    }

    function removeOperator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (account == address(0)) revert InvalidAddress();
        _revokeRole(OPERATOR_ROLE, account);
        emit OperatorRemoved(account, msg.sender);
    }

    function isOperator(address account) external view returns (bool) {
        return hasRole(OPERATOR_ROLE, account);
    }

    /**
     * @dev Overrides Ownable's transferOwnership to automatically grant roles to new owner
     */
    function transferOwnership(address newOwner) public override onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        address oldOwner = owner();
        super.transferOwnership(newOwner);
        _grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        _grantRole(OPERATOR_ROLE, newOwner);
        _revokeRole(DEFAULT_ADMIN_ROLE, oldOwner);
        _revokeRole(OPERATOR_ROLE, oldOwner);
    }

    /**
     * @dev Disabled to prevent split-brain state between Ownable and AccessControl.
     *      Use transferOwnership instead.
     */
    function renounceOwnership() public override onlyOwner {
        revert("renounceOwnership disabled");
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
     * @param _feeBasisPoints New deposit fee in fee units (max 100,000 = 10%)
     * @dev Only the operator can call this function
     */
    function setDepositFee(uint256 _feeBasisPoints) external onlyOperator {
        if (_feeBasisPoints > MAX_FEE_UNITS) revert InvalidFee();
        depositFeeBasisPoints = _feeBasisPoints;
        emit FeeUpdated("deposit", _feeBasisPoints);
    }

    /**
     * @notice Set the withdrawal fee
     * @param _feeBasisPoints New withdrawal fee in fee units (max 100,000 = 10%)
     * @dev Only the operator can call this function
     */
    function setWithdrawFee(uint256 _feeBasisPoints) external onlyOperator {
        if (_feeBasisPoints > MAX_FEE_UNITS) revert InvalidFee();
        withdrawFeeBasisPoints = _feeBasisPoints;
        emit FeeUpdated("withdraw", _feeBasisPoints);
    }

    /**
     * @notice Toggle deposit functionality
     * @param _enabled True to enable, false to disable
     * @dev Only the operator can call this function
     */
    function setIsDepositEnabled(bool _enabled) external onlyOperator {
        isDepositEnabled = _enabled;
        emit DepositEnabledUpdated(_enabled, msg.sender);
    }

    /**
     * @notice Set the native COTI fee
     * @param _fee Amount in native tokens (wei-equivalent)
     * @dev Used by ERC20 bridges: they require msg.value >= this value and refund excess to the caller (best-effort). Only the operator can call this function.
     */
    function setNativeCotiFee(uint256 _fee) external virtual onlyOperator {
        nativeCotiFee = _fee;
        emit NativeCotiFeeUpdated(_fee, msg.sender);
    }

    /**
     * @notice Calculate the dynamic fee using the floor/cap formula
     * @param percentageFeeCoti The percentage-based fee component in COTI
     * @param fixedFee The minimum fee floor in COTI
     * @param maxFee The maximum fee cap in COTI
     * @return The computed fee: min(max(fixedFee, percentageFeeCoti), maxFee)
     */
    function _calculateDynamicFee(
        uint256 percentageFeeCoti,
        uint256 fixedFee,
        uint256 maxFee
    ) internal pure returns (uint256) {
        uint256 fee = percentageFeeCoti > fixedFee ? percentageFeeCoti : fixedFee;
        return fee > maxFee ? maxFee : fee;
    }

    /**
     * @notice Set the deposit dynamic fee parameters
     * @param _fixedFee New deposit fee floor in COTI wei
     * @param _percentageBps New deposit percentage (max MAX_FEE_UNITS = 10%)
     * @param _maxFee New deposit fee cap in COTI wei
     * @dev Only the operator can call this function
     */
    function setDepositDynamicFee(
        uint256 _fixedFee,
        uint256 _percentageBps,
        uint256 _maxFee
    ) external onlyOperator {
        if (_maxFee == 0) revert InvalidFeeConfiguration();
        if (_fixedFee > _maxFee) revert InvalidFeeConfiguration();
        if (_percentageBps > MAX_FEE_UNITS) revert InvalidFee();
        depositFixedFee = _fixedFee;
        depositPercentageBps = _percentageBps;
        depositMaxFee = _maxFee;
        emit DynamicFeeUpdated("deposit", _fixedFee, _percentageBps, _maxFee);
    }

    /**
     * @notice Set the withdraw dynamic fee parameters
     * @param _fixedFee New withdraw fee floor in COTI wei
     * @param _percentageBps New withdraw percentage (max MAX_FEE_UNITS = 10%)
     * @param _maxFee New withdraw fee cap in COTI wei
     * @dev Only the operator can call this function
     */
    function setWithdrawDynamicFee(
        uint256 _fixedFee,
        uint256 _percentageBps,
        uint256 _maxFee
    ) external onlyOperator {
        if (_maxFee == 0) revert InvalidFeeConfiguration();
        if (_fixedFee > _maxFee) revert InvalidFeeConfiguration();
        if (_percentageBps > MAX_FEE_UNITS) revert InvalidFee();
        withdrawFixedFee = _fixedFee;
        withdrawPercentageBps = _percentageBps;
        withdrawMaxFee = _maxFee;
        emit DynamicFeeUpdated("withdraw", _fixedFee, _percentageBps, _maxFee);
    }

    /**
     * @notice Set the price oracle address
     * @param _oracle Address of the CotiPriceConsumer contract
     * @dev Only the owner can call this function
     */
    function setPriceOracle(address _oracle) external onlyOwner {
        if (_oracle == address(0)) revert InvalidAddress();
        address oldOracle = priceOracle;
        priceOracle = _oracle;
        emit PriceOracleUpdated(oldOracle, _oracle);
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
     * @notice Deducts the bridged-asset fee from `grossAmount`, accumulates it, and returns the net amount.
     * @dev Reverts with {AmountZero} if the net amount after fee is zero.
     * @param grossAmount The gross token amount before fee deduction.
     * @param feeBasisPoints The fee rate to apply (deposit or withdraw basis points).
     * @return net The amount the user receives / the bridge releases after fee.
     */
    function _collectTokenFee(
        uint256 grossAmount,
        uint256 feeBasisPoints
    ) internal returns (uint256 net) {
        uint256 fee = _calculateFeeAmount(grossAmount, feeBasisPoints);
        net = grossAmount - fee;
        if (net == 0) revert AmountZero();
        accumulatedFees += fee;
    }

    /**
     * @notice Withdraw accumulated fees
     * @param to Address to send the fees to
     * @param amount Amount of fees to withdraw
     * @dev Only the operator can call this function. Must be overridden in derived contracts
     *      to perform the actual token/native transfer; base implementation reverts.
     */
    function withdrawFees(
        address to,
        uint256 amount
    ) external virtual onlyOperator {
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert AmountZero();
        if (amount > accumulatedFees) revert InsufficientAccumulatedFees();
        revert WithdrawFeesMustBeOverridden();
    }

    event CotiFeesWithdrawn(address indexed to, uint256 amount);

    /**
     * @notice Withdraw accumulated native COTI fees
     * @param to Address to send the native COTI fees to
     * @param amount Amount of native COTI fees to withdraw
     * @dev Only the operator can call this function. Derived ERC20 bridges use this inherited implementation to withdraw
     *      accumulated native COTI fees; native bridge does not use this (accumulatedCotiFees remains 0).
     */
    function withdrawCotiFees(address to, uint256 amount) external onlyOperator nonReentrant {
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert AmountZero();
        if (amount > accumulatedCotiFees) revert InsufficientAccumulatedFees();
        if (amount > address(this).balance) revert InsufficientEthBalance();

        accumulatedCotiFees -= amount;

        (bool success, ) = to.call{value: amount}("");
        if (!success) revert EthTransferFailed();

        emit CotiFeesWithdrawn(to, amount);
    }
}


// File contracts/token/PrivateERC20/ITokenReceiver.sol

// Original license: SPDX_License_Identifier: MIT


/**
 * @dev Interface for receiving Private ERC-20 tokens via `transferAndCall` with a **public** `uint256` amount.
 *
 * For `transferAndCall` with an **encrypted** `itUint256` amount, use {ITokenReceiverEncrypted} instead —
 * the amount must not be passed in plaintext in the callback.
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
        //  1. **Overflow scenario**: The overflow bit is 1 → NOT operation returns 0 → require fails → trans