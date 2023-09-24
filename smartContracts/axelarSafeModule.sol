// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import { AxelarExecutable } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol';
import { IAxelarGateway } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol';
import { IAxelarGasService } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol';
import { IERC20 } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol';



interface GnosisSafe
{
    enum Operation
    {
        Call,
        DelegateCall
    }       


    function execTransactionFromModule(address to, uint256 value, bytes memory data, Operation operation) external returns (bool success);
}


contract axelarSafeModule is AxelarExecutable
{
    address public myAaAddress;
    IAxelarGasService public immutable gasService;



    constructor(address paramAaAddress, address gateway_, address gasReceiver_) AxelarExecutable(gateway_) 
    {
        myAaAddress = paramAaAddress;
        gasService = IAxelarGasService(gasReceiver_);
    }




    function makeCcAaOrder(string calldata destinationChain, string calldata destinationAddress, address to, bytes memory payload) external payable 
    {
        require(msg.value > 0, 'Gas payment is required');

        bytes memory data = abi.encode(to, payload);
        gasService.payNativeGasForContractCall{ value: msg.value }(address(this), destinationChain, destinationAddress, data, msg.sender);

        gateway.callContract(destinationChain, destinationAddress, data);
    }

    function _execute(string calldata sourceChain_, string calldata sourceAddress_, bytes calldata payload_) internal override 
    {
        address to;
        uint256 value;
        bytes memory data;

        (to, data) = abi.decode(payload_, (address, bytes));

        GnosisSafe(myAaAddress).execTransactionFromModule(to, 0, data, GnosisSafe.Operation.Call);
    }
}
