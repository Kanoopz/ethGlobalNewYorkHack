// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

// hyperlaneImports  //////////
import {IInterchainSecurityModule, ISpecifiesInterchainSecurityModule} from "./imports/IInterchainSecurityModule.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import { ByteHasher } from './imports/ByteHasher.sol';

// lenImports        //////////
import "./imports/lens/LensDataTypes.sol";


interface GnosisSafe
{
    enum Operation
    {
        Call,
        DelegateCall
    }       


    function execTransactionFromModule(address to, uint256 value, bytes memory data, Operation operation) external returns (bool success);
}

interface profileProxy
{
    function proxyCreateProfile(DataTypes.CreateProfileData memory vars) external;
}

////////////////////////////////////////////////////////////////////////////////////////
//      hyperlaneInterfaces                                                   //////////
////////////////////////////////////////////////////////////////////////////////////////

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


// hyperErc20          //////////
interface hyperErc20
{
    function transfer(address to, uint256 amount) external returns (bool);

    function hyperTransfer
    (
        uint32 paramDestinationChainDomain, 
        address paramDestinationChainAddressReceiver,
        address paramDestinationAddressToTransfer,
        uint256 paramQuantityToTransfer
    ) 
    external payable;
}







contract hyperSafeModule
{
    using ByteHasher for bytes;



    event receivedCcMessage(address to, uint256 value, bytes data);
    event ccAaOrderExecuted(address to, uint256 value, bytes data);


    address public myAaAddress;

    address public ccCallerAddres;

    ////////////////////////////////////////////////////////////////////////////////////////
    //      hyperlane                                                             //////////
    ////////////////////////////////////////////////////////////////////////////////////////

    // sendVariables       //////////
    uint256 gasAmount = 300000;
    address MAILBOX = 0xCC737a94FecaeC165AbCf12dED095BB13F037685; //SAME ON ALL CHAINS.///
    IInterchainGasPaymaster igp = IInterchainGasPaymaster(0x8f9C3888bFC8a5B25AED115A82eCbb788b196d2a); ////// iGasPaymaster on thisChain (default, same all chains) /////

    // receiveVariables    //////////
     IInterchainSecurityModule public interchainSecurityModule = IInterchainSecurityModule(address(0));

     ////////////////////////////////////////////////////////////////////////////////////////
    //      lens                                                                   //////////
    ////////////////////////////////////////////////////////////////////////////////////////
    profileProxy profileCreater = profileProxy(0x420f0257D43145bb002E69B14FF2Eb9630Fc4736);
    address profileProxyAddress = 0x420f0257D43145bb002E69B14FF2Eb9630Fc4736;









    constructor(address paramAaAddress)
    {
        myAaAddress = paramAaAddress;
    }

    function executeChainAbstractionOrder(address paramCrossChainTo, uint256 paramCrossChainValue, bytes memory paramCrossChainData) public
    {
        GnosisSafe(myAaAddress).execTransactionFromModule(paramCrossChainTo, paramCrossChainValue, paramCrossChainData, GnosisSafe.Operation.Call);
        
        
        emit ccAaOrderExecuted(paramCrossChainTo, paramCrossChainValue, paramCrossChainData);
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////
    //      hyperlane                                                             //////////
    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////
    
    /////////////////////////////
    // sendFuncs       //////////
    /////////////////////////////
    function addressToBytes32(address _addr) internal pure returns (bytes32) 
    {
        return bytes32(uint256(uint160(_addr)));
    }

    function makeCcCall
    (
        uint32 paramDestinationChainDomain, 
        address paramDestinationChainAddressReceiver,
        address paramCalldataTo,
        uint256 paramCalldataValue,
        bytes memory paramCalldataData
    ) 
    public payable
    {
        bytes memory encodedValue = abi.encode(paramCalldataTo, paramCalldataValue, paramCalldataData);

        bytes32 messageId = IMailbox(MAILBOX).dispatch(
            paramDestinationChainDomain,
            addressToBytes32(paramDestinationChainAddressReceiver),
            //abi.encode(paramCalldataTo, paramCalldataValue, paramCalldataData)
            encodedValue
        );

        igp.payForGas{ value: msg.value }(
            messageId, // The ID of the message that was just dispatched
            paramDestinationChainDomain, // The destination domain of the message
            1200000,
            address(tx.origin) // refunds are returned to transaction executer
        );
    }

    function makeLensProfileCcCall
    (
        uint32 paramDestinationChainDomain, 
        address paramDestinationChainAddressReceiver,
        address paramOtherChainAbstractedAccount,
        string calldata paramHandle
    ) 
    external payable
    {
        DataTypes.CreateProfileData memory structData = DataTypes.CreateProfileData(paramOtherChainAbstractedAccount, paramHandle, "nothing", address(0), bytes("nothing"), "nothing");

        bytes memory callData = abi.encodeCall(profileProxy.proxyCreateProfile, (structData));

        bytes memory encodedValue = abi.encode(profileProxyAddress, 0, callData);


        bytes32 messageId = IMailbox(MAILBOX).dispatch(
            paramDestinationChainDomain,
            addressToBytes32(paramDestinationChainAddressReceiver),
            //abi.encode(profileProxyAddress, 0, callData)
            encodedValue
        );

        igp.payForGas{ value: msg.value }(
            messageId, // The ID of the message that was just dispatched
            paramDestinationChainDomain, // The destination domain of the message
            12000000,
            address(tx.origin) // refunds are returned to transaction executer
        );
    }

    receive() external payable 
    {}

    function deposit() external payable 
    {}

    /////////////////////////////
    // receiveFuncs    //////////
    /////////////////////////////
    modifier onlyMailbox() 
    {
        require(msg.sender == MAILBOX);
        _;    
    }



    function bytes32ToAddress(bytes32 _buf) internal pure returns (address) 
    {
        return address(uint160(uint256(_buf)));
    }

    function handle(uint32 _origin, bytes32 _sender, bytes calldata _body) external onlyMailbox 
    {
        ccCallerAddres = bytes32ToAddress(_sender);

        address receivedCcTo;
        uint256 receivedCcValue;
        bytes memory receivedCcData;

        (receivedCcTo, receivedCcValue, receivedCcData) = abi.decode(_body, (address, uint256, bytes));
        

        emit receivedCcMessage(receivedCcTo, receivedCcValue, receivedCcData);
        
        executeChainAbstractionOrder(receivedCcTo, receivedCcValue, receivedCcData);
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////
    //      hyperlane                                                             //////////
    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////

    function chainAbstractionErc20Transfer 
    (
        address paramThisChainAddressHyperErc20,
        uint32 paramDestinationChainDomain, 
        address paramDestinationChainAddressHyperErc,
        address paramAddressToTransfer,
        uint256 paramQunatityToTransferFromThisChain,
        address otherChainAaModuleAddress,
        uint256 paramQunatityToTransferFromOtherChain
    )
    public
   {
        bytes memory hyperTransferCalldataData = abi.encodeWithSignature("hyperTransfer(uint32,address,address,uint256)", paramDestinationChainDomain, paramDestinationChainAddressHyperErc, paramAddressToTransfer, paramQunatityToTransferFromThisChain);

        executeChainAbstractionOrder(paramThisChainAddressHyperErc20, 0, hyperTransferCalldataData);



        bytes memory paramCalldataData = abi.encodeWithSignature("transfer(address,uint256)", paramAddressToTransfer, paramQunatityToTransferFromOtherChain);

        makeCcCall
        (
            paramDestinationChainDomain, 
            otherChainAaModuleAddress,
            paramDestinationChainAddressHyperErc,
            0,
            paramCalldataData
        );
   }
}
