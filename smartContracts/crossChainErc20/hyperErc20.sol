// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;

import "./imports/contracts/token/ERC20/IERC20.sol";
import "./imports/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {IInterchainSecurityModule, ISpecifiesInterchainSecurityModule} from "./imports/IInterchainSecurityModule.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import { ByteHasher } from './imports/ByteHasher.sol';


// sendInterfaces      //////////
interface IMailbox 
{
    function dispatch(
        uint32 _destination,
        bytes32 _recipient,
        bytes calldata _body
    ) external returns (bytes32);
}

interface IInterchainGasPaymaster 
{
    /**
     * @notice Deposits msg.value as a payment for the relaying of a message
     * to its destination chain.
     * @dev Overpayment will result in a refund of native tokens to the _refundAddress.
     * Callers should be aware that this may present reentrancy issues.
     * @param _messageId The ID of the message to pay for.
     * @param _destinationDomain The domain of the message's destination chain.
     * @param _gasAmount The amount of destination gas to pay for.
     * @param _refundAddress The address to refund any overpayment to.
     */
    function payForGas(
        bytes32 _messageId,
        uint32 _destinationDomain,
        uint256 _gasAmount,
        address _refundAddress
    ) external payable;

    /**
     * @notice Quotes the amount of native tokens to pay for interchain gas.
     * @param _destinationDomain The domain of the message's destination chain.
     * @param _gasAmount The amount of destination gas to pay for.
     * @return The amount of native tokens required to pay for interchain gas.
     */
    function quoteGasPayment(uint32 _destinationDomain, uint256 _gasAmount)
        external
        view
        returns (uint256);
}

// receiveInterfaces   //////////
interface IMessageRecipient 
{
    function handle(
        uint32 _origin, //Domain id of the sender chain
        bytes32 _sender,
        bytes calldata _body
    ) external;
}

interface Messenger 
{
    function sendMessage(
        address _target,
        bytes memory _message,
        uint32 _gasLimit
    ) external;
}

contract hyperErc20 is IERC20, IERC20Metadata 
{
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;


    address MAILBOX = 0xCC737a94FecaeC165AbCf12dED095BB13F037685; //SAME ON ALL CHAINS.///
    IInterchainGasPaymaster igp = IInterchainGasPaymaster(0x8f9C3888bFC8a5B25AED115A82eCbb788b196d2a); ////// iGasPaymaster on thisChain (default, same all chains) /////



    
    constructor()
    {
        _name = "hyperUsdToken";
        _symbol = "hyperUsdT";
    }



    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

     function mint(address account, uint256 amount) public
     {
        _mint(account, amount);
     }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = msg.sender;

        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = msg.sender;
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
            // decrementing then incrementing.
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        unchecked {
            // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
            _balances[account] += amount;
        }
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
            // Overflow not possible: amount <= accountBalance <= totalSupply.
            _totalSupply -= amount;
        }

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}



    ///////////////////////////////////////////////////////////////////////////////////
    ////////////// hyperlaneIntegration                                  //////////////
    ///////////////////////////////////////////////////////////////////////////////////

    modifier onlyMailbox() 
    {
        require(msg.sender == MAILBOX);
        _;    
    }


    function addressToBytes32(address _addr) internal pure returns (bytes32) 
    {
        return bytes32(uint256(uint160(_addr)));
    }

    function bytes32ToAddress(bytes32 _buf) internal pure returns (address) 
    {
        return address(uint160(uint256(_buf)));
    }



    function handle(uint32 _origin, bytes32 _sender, bytes calldata _body) external onlyMailbox 
    {
        address ccCallerAddres = bytes32ToAddress(_sender);

        address receivedCcTo;
        uint256 receivedCcQuantity;

        (receivedCcTo, receivedCcQuantity) = abi.decode(_body, (address, uint256));
        
        uint256 actualAddressBalance = _balances[receivedCcTo];
        uint256 newAddressBalance = actualAddressBalance + receivedCcQuantity;
        _balances[receivedCcTo] = newAddressBalance;
    }

    function hyperTransfer
    (
        uint32 paramDestinationChainDomain, 
        address paramDestinationChainAddressReceiver,
        address paramDestinationAddressToTransfer,
        uint256 paramQuantityToTransfer
    ) 
    external payable
    {
        uint256 userBalance = _balances[msg.sender];
        require(userBalance >= paramQuantityToTransfer, "Not enough funds.");

        uint256 newUserBalance = userBalance - paramQuantityToTransfer;

        _balances[msg.sender] = newUserBalance;

        bytes memory constructedPayload = abi.encode(paramDestinationAddressToTransfer, paramQuantityToTransfer);



        bytes32 messageId = IMailbox(MAILBOX).dispatch(
            paramDestinationChainDomain,
            addressToBytes32(paramDestinationChainAddressReceiver),
            constructedPayload
        );

        igp.payForGas{ value: msg.value }(
            messageId, // The ID of the message that was just dispatched
            paramDestinationChainDomain, // The destination domain of the message
            1200000,
            address(tx.origin) // refunds are returned to transaction executer
        );
    }
}
