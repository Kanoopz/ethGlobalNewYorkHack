import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import BorderWrapper from 'react-border-wrapper';

import { ethers } from 'ethers';
import Safe, { EthersAdapter, SafeFactory, SafeAccountConfig } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';

//import Safe, { SafeFactory } from '@safe-global/protocol-kit'

function App() 
{
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //      "stateVariables"                                                      //////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////
  //  ethersJs                           /////
  ////////////////////////////////////////////
  const [userConnected, setUserConnected] = useState(false);
  const [address, setAddress] = useState("noAddress");
  //const [signer, setSigner] = useState<JsonRpcSigner | undefined>();

  ////////////////////////////////////////////
  //  safeAaSdk                          /////
  ////////////////////////////////////////////
  const [safeAddress, setSafeAddress] = useState("");

  ////////////////////////////////////////////
  //  safeAaSdk: safeAaConnection        /////
  ////////////////////////////////////////////
  const [safeAddressToConnectInput, setSafeAddressToConnectInput] = useState("");

  ////////////////////////////////////////////
  //  safeAaSdk: bytesDataPayload setUp  /////
  ////////////////////////////////////////////
  const [functionAbiArray, setFunctionAbiArray] = useState<string[]>([]);
  const [functionSigForDataPayload, setFunctionSigForDataPayload] = useState<string>("");
  //const [paramsForDataPayload, setParamsForDataPayload] = useState();
  const [paramsForDataPayloadArray, setParamsForDataPayloadArray] = useState<(string | number | boolean)[]>([]);

  const [inputFunctionAbiToAdd, setInputFunctionAbiToAdd] = useState("");

  const [generatedBytesDataPayload, setGeneratedBytesDataPayload] = useState<string>("");

  ////////////////////////////////////////////
  //  safeAaSdk: createTxParams          /////
  ////////////////////////////////////////////
  const [createTxParamTo, setCreateTxParamTo] = useState("");
  const [createTxParamData, setCreateTxParamData] = useState("");
  const [createTxParamValue, setCreateTxParamValue] = useState("");

  const [selectedTypeParam, setSelectedTypeParam] = useState("");
  const [inputParamToAdd, setInputParamToAdd] = useState("");

  ////////////////////////////////////////////
  //  safeAaSdk: modules                 /////
  ////////////////////////////////////////////
  const [moduleAddressToAddInput, setModuleAddressToAddInput] = useState("");
  const [moduleAddressToCheckInput, setModuleAddressToCheckInput] = useState("");

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //      "ethersJs setUp"                                                      //////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  let provider = new ethers.providers.Web3Provider(window.ethereum);
  let signer;

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //      "safeAaSdk setUp"                                                     //////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////
  //  safeAaSdk: ethersAdapter           /////
  ////////////////////////////////////////////
  //let provider = new ethers.providers.JsonRpcProvider();
  const safeOwner = provider.getSigner(0);

  const ethAdapter = new EthersAdapter
  (
    {
      ethers,
      signerOrProvider: safeOwner
    }
  );

  ////////////////////////////////////////////
  //  safeAaSdk: initializeSafeApiKit    /////
  ////////////////////////////////////////////
  const txServiceUrl = 'https://safe-transaction-mainnet.safe.global';
  const safeService = new SafeApiKit({ txServiceUrl, ethAdapter });

  ////////////////////////////////////////////
  //  safeAaSdk: initializeProtocolKit   /////
  ////////////////////////////////////////////
  /*
  const safeFactory = await SafeFactory.create({ ethAdapter })
  const safeSdk = await Safe.create({ ethAdapter, safeAddress })
  */
  let safeFactory;    //NEED TO BE INITIALIZED THROUGH initializeProtocolKitFunc() FUNCTION.
  let safeSdk;    //NEED TO BE INITIALIZED THROUGH initializeProtocolKitFunc() FUNCTION.

  ////////////////////////////////////////////
  //  safeAaSdk: initializeProtocolKit   /////
  ////////////////////////////////////////////
  let safeAaSdkInitializedInstance: Safe;

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //      "scInteractionAsyncFuncs"                                             //////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //      "blockchainInteractionJsFuncs"                                        //////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////
  //  ethersJs                           /////
  ////////////////////////////////////////////

  async function requestAccount()
  {
    //"CHECKS THERES A METAMASK INSTANCE"///
    if (window.ethereum)
    {
      //TRY TO MAKE A CONNECTION OF AN ACCOUNT///
      try
      {
        let accounts = await window.ethereum.request({ method: "eth_requestAccounts",});

        const _signer = provider.getSigner();
        const _address = accounts[0];

        setAddress(accounts[0]);
        //setSigner(_signer);
        signer = _signer;
        setUserConnected(true);
      }
      catch (error)
      {
        console.log("ERROR ACCOUNTS.");
        console.log(error);
      }
    }
    else
    {
      console.log("Metamask isnt installed.");
    }
  }

  ////////////////////////////////////////////
  //  safeAaSdk                          /////
  ////////////////////////////////////////////
  async function initializeProtocolKitFunc()
  {
    safeFactory = await SafeFactory.create({ ethAdapter });
    //safeSdk = await Safe.create({ ethAdapter, safeAddress });
  }

  async function deploySafeAa()
  {
    safeFactory = await SafeFactory.create({ ethAdapter });

    const safeAccountConfig: SafeAccountConfig = 
    {
      owners: [address],
      threshold: 1,
      // ... (optional params)
    }

    /*
    const safe = await safeFactory.deploySafe({ safeAccountConfig });
    safeAaSdkInitializedInstance = safe;
    */

    safeAaSdkInitializedInstance = await safeFactory.deploySafe({ safeAccountConfig });
    let sAddr = await safeAaSdkInitializedInstance.getAddress();

    console.log("safeAddress.");
    console.log(sAddr);
    setSafeAddress(sAddr);

    console.log("safeOwners.");
    console.log(await safeAaSdkInitializedInstance.getOwners());
    console.log("safeThreshold.");
    console.log(await safeAaSdkInitializedInstance.getThreshold());

    console.log("typeOfSafeFactory:");
    console.log(typeof(safeFactory));
    console.log(safeFactory);

    console.log("typeOfSafeSdk");
    console.log(typeof(safeAaSdkInitializedInstance));
    console.log(safeAaSdkInitializedInstance);
  }

  /*
    async function connectToSafe()
    {
      const mySafeAddress = safeAddressToConnectInput;

      const safeSdk = await Safe.create({ ethAdapter, mySafeAddress });

      setSafeAddressToConnectInput
    }
  */

  async function createSafeTx()
  {
    console.log("safeAddr:");
    console.log(safeAddress);

    const myEthAdapther = ethAdapter;
    const safeSdk: Safe = await Safe.create({ ethAdapter: myEthAdapther, safeAddress });

    console.log("safeSdkObject:");
    console.log(safeSdk);

    let to = createTxParamTo;
    let data = createTxParamData;
    let value = createTxParamValue.toString();

    const safeTransactionData: SafeTransactionDataPartial = 
    {
      to,
      data,
      value
    };

    //const safeSdk = safeAaSdkInitializedInstance;

    //safeTx 
    const safeTransaction= await safeSdk.createTransaction({ safeTransactionData });

    console.log("safeTx:");
    console.log(safeTransaction);

    const signedTransaction = await safeSdk.signTransaction(safeTransaction);

    console.log("signedTx");
    console.log(signedTransaction);

    const txResponse = await safeSdk.executeTransaction(signedTransaction);
    await txResponse.transactionResponse?.wait();

    console.log("TX RESULT:");
    console.log(txResponse);
  }

  async function enableModule()
  {
    console.log("safeAddr:");
    console.log(safeAddress);

    const myEthAdapther = ethAdapter;
    const safeSdk: Safe = await Safe.create({ ethAdapter: myEthAdapther, safeAddress });

    console.log("safeSdkObject:");
    console.log(safeSdk);

    /*
    //const safeSdk = safeAaSdkInitializedInstance;

    //safeTx 
    const safeTransaction= await safeSdk.createTransaction({ safeTransactionData });

    console.log("safeTx:");
    console.log(safeTransaction);

    const signedTransaction = await safeSdk.signTransaction(safeTransaction);

    console.log("signedTx");
    console.log(signedTransaction);

    const txResponse = await safeSdk.executeTransaction(signedTransaction);
    await txResponse.transactionResponse?.wait();

    console.log("TX RESULT:");
    console.log(txResponse);

    const safeTransaction = await safeAaSdkInitializedInstance.createEnableModuleTx(moduleAddressToAddInput);
    /*
    const txResponse = await safeAaSdkInitializedInstance.executeTransaction(safeTransaction);
    await txResponse.transactionResponse?.wait();
    */

    const safeTransaction = await safeSdk.createEnableModuleTx(moduleAddressToAddInput);
    console.log("createModule");
    console.log(safeTransaction);

    /*
    const signedTransaction = await safeSdk.signTransaction(safeTransaction);
    console.log("signedTx");
    console.log(signedTransaction);
    */

    const txResponse = await safeSdk.executeTransaction(safeTransaction);
    await txResponse.transactionResponse?.wait()
  }

  async function checkModuleIsEnabled()
  {
    console.log("safeAddr:");
    console.log(safeAddress);

    const myEthAdapther = ethAdapter;
    const mySafeSdk: Safe = await Safe.create({ ethAdapter: myEthAdapther, safeAddress });

    console.log("safeSdkObject:");
    console.log(mySafeSdk);

    console.log("moduleAddress");
    console.log(moduleAddressToCheckInput);

    const isEnabled = await mySafeSdk.isModuleEnabled(moduleAddressToCheckInput);
    console.log(isEnabled);
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //      "normalJsFuncs"                                                       //////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  function addParamToParamArray()
  {
    console.log("hello");
    console.log(selectedTypeParam);
    console.log("TYPE OF");
    console.log(typeof(selectedTypeParam));

    let type = selectedTypeParam;

    console.log("Type:");
    console.log(type);

    if(type == "uint256")
    {
      let numberParam = Number(inputParamToAdd);

      console.log("---------------------");

      console.log("preArray:");
      console.log(paramsForDataPayloadArray);

      console.log("//////////////////////");
      console.log("selectedTypeParam:");
      console.log(selectedTypeParam);

      console.log("typeOf selectedTypeParam:");
      console.log(typeof(selectedTypeParam));

      console.log("=====================");

      console.log("inputParamToAdd:");
      console.log(numberParam);

      console.log("typeOf inputParamToAdd:");
      console.log(typeof(numberParam));

      //paramsForDataPayloadArray.push(valueToAdd);
      setParamsForDataPayloadArray(prevValues => [...prevValues, numberParam]);

      console.log("=====================")

      console.log("postArray:");
      console.log(paramsForDataPayloadArray);

      console.log("//////////////////////");
    }
    else if(type == "bool")
    {
      if(inputParamToAdd == "true")
      {
        let booleanParam = true;

        console.log("---------------------");

        console.log("preArray:");
        console.log(paramsForDataPayloadArray);

        console.log("//////////////////////");
        console.log("selectedTypeParam:");
        console.log(selectedTypeParam);

        console.log("typeOf selectedTypeParam:");
        console.log(typeof(selectedTypeParam));

        console.log("=====================");

        console.log("inputParamToAdd:");
        console.log(booleanParam);

        console.log("typeOf inputParamToAdd:");
        console.log(typeof(booleanParam));

        //paramsForDataPayloadArray.push(valueToAdd);
        setParamsForDataPayloadArray(prevValues => [...prevValues, booleanParam]);

        console.log("=====================")

        console.log("postArray:");
        console.log(paramsForDataPayloadArray);

        console.log("//////////////////////");
      }
      else if(inputParamToAdd == "false")
      {
        let booleanParam = false;

        console.log("---------------------");

        console.log("preArray:");
        console.log(paramsForDataPayloadArray);

        console.log("//////////////////////");
        console.log("selectedTypeParam:");
        console.log(selectedTypeParam);

        console.log("typeOf selectedTypeParam:");
        console.log(typeof(selectedTypeParam));

        console.log("=====================");

        console.log("inputParamToAdd:");
        console.log(booleanParam);

        console.log("typeOf inputParamToAdd:");
        console.log(typeof(booleanParam));

        //paramsForDataPayloadArray.push(valueToAdd);
        setParamsForDataPayloadArray(prevValues => [...prevValues, booleanParam]);

        console.log("=====================")

        console.log("postArray:");
        console.log(paramsForDataPayloadArray);

        console.log("//////////////////////");
      }
      else
      {
        console.log("ERROR; BOOLEAN VALUE INCORRECT.");
      }
    }
    else if(type == "address" || type == "bytes" || type == "bytes32" || type == "string")
    {
      console.log("---------------------");

      console.log("preArray:");
      console.log(paramsForDataPayloadArray);

      console.log("//////////////////////");
      console.log("selectedTypeParam:");
      console.log(selectedTypeParam);

      console.log("typeOf selectedTypeParam:");
      console.log(typeof(selectedTypeParam));

      console.log("=====================");

      console.log("inputParamToAdd:");
      console.log(inputParamToAdd);

      console.log("typeOf inputParamToAdd:");
      console.log(typeof(inputParamToAdd));

      //paramsForDataPayloadArray.push(valueToAdd);
      setParamsForDataPayloadArray(prevValues => [...prevValues, inputParamToAdd]);

      console.log("=====================")

      console.log("postArray:");
      console.log(paramsForDataPayloadArray);

      console.log("//////////////////////");
    }
  }

  function getParamsArray()
  {
    console.log(paramsForDataPayloadArray);
  }

  function resetParamsArray()
  {
    setParamsForDataPayloadArray([]); 
  }

  function getFunctionsAbiArray()
  {
    console.log(functionAbiArray);
  }

  function getDataPayloadParams()
  {
    console.log(paramsForDataPayloadArray);
  }

  function getFunctionSigString()
  {
    console.log(functionSigForDataPayload);
  }

  function generateBytesDataPayload()
  {
    let ABI = functionAbiArray;
    let abiInterface = new ethers.utils.Interface(ABI);
    let bytesData = abiInterface.encodeFunctionData(functionSigForDataPayload, paramsForDataPayloadArray);

    console.log("bytesData");
    console.log(bytesData);

    //setTxBytesData(bytesData);
    setGeneratedBytesDataPayload(bytesData);
  }

  /*
  function addStringElementToDataPayloadArray(paramElement: Text)
  {
    let array = paramsForDataPayload;
    array.push(paramElement);
    setParamsForDataPayload(array);
  }

  function addNumberElementToDataPayloadArray(paramElement)
  {
    let array = paramsForDataPayload;
    array.push(paramElement);
    setParamsForDataPayload(array);
  }

  function addBoolElementToDataPayloadArray(paramElement)
  {
    let array = paramsForDataPayload;
    array.push(paramElement);
    setParamsForDataPayload(array);
  }
  */

  /*
  function addTxDataPayloadAddressParam(paramAddress)
  {
    let addressToAdd = paramAddress; //.METHODTOSTING
    //ADD TO ARRAY
  }

  function addTxDataPayloadUint256Param(paramUint256)
  {
    let uint256ToAdd = paramUint256;
  }

  function addTxDataPayloadBytesParam(paramBytes)
  {
    let bytesToAdd = paramBytes;
  }

  function addTxDataPayloadBytes32Param(paramBytes32)
  {
    let bytes32Todd = paramBytes32;
  }

  function addTxDataPayloadStringParam(paramString)
  {
    let stringToAdd = paramString;
  }

  function addTxDataPayloadBoolParam(paramBool)
  {
    let boolToAdd = paramBool;
  }
  */

  function getToValueFunc()
  {
    console.log(createTxParamTo);
  }

  function getDataValueFunc()
  {
    console.log(createTxParamData);
  }

  function getValueValueFunc()
  {
    console.log(createTxParamValue);
  }










  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '2.5rem'}}>
        <BorderWrapper>
          <h3>addressConnected: {address}</h3>
          <button onClick={requestAccount}>connectMetamask</button>
        </BorderWrapper>
      </div>



      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem'}}>
        <BorderWrapper>
          <h3>INITIALIZATION</h3>
          <button onClick={initializeProtocolKitFunc}>INITIALIZE</button>

          <h3 style={{paddingTop: '1rem'}}>connectToSafe</h3>
          <input type="text" placeholder="safeAddress" onChange={e => setModuleAddressToAddInput(e.target.value)}></input>
          <button onClick={deploySafeAa}>connectToAa</button>

          <h3 style={{paddingTop: '1rem'}}>deploySafe</h3>
          <button onClick={deploySafeAa}>deploy</button>
        </BorderWrapper>
      </div>



      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem'}}>
        <BorderWrapper>
          <h3>functionAbi for txDataPayload:</h3>
          <input type="text" placeholder="functionAbi" onChange={e => setInputFunctionAbiToAdd(e.target.value)}></input>
          <button onClick={() => setFunctionAbiArray(prevValues => [...prevValues, inputFunctionAbiToAdd])}>setFunctionAbi</button>

          <div style={{paddingTop: '1rem'}}><button onClick={getFunctionsAbiArray}>getFunctionAbiArray</button></div>
        </BorderWrapper>
      </div>

      <div style={{ paddingTop: '1rem' ,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <BorderWrapper>
          <h3>functionSignatureString for txDataPayload:</h3>
          <input type="text" placeholder="functionSigString" onChange={e => setFunctionSigForDataPayload(e.target.value)}></input>
        </BorderWrapper>
      </div>

      <div style={{ paddingTop: '1rem' ,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <BorderWrapper>
          <h3>Parameters for txDataPayload:</h3>
          <input type="text" placeholder="paramToAdd" onChange={e => setInputParamToAdd(e.target.value)}></input>
          <button onClick={addParamToParamArray}>addToParamArray</button>

          <div>
            <select onChange={event => setSelectedTypeParam(event.target.value)} defaultValue={selectedTypeParam}>
              <option value ="noValue">selectTypeOfValue</option>
              <option value="address">address</option>
              <option value="uint256">uint256</option>
              <option value="bytes">bytes</option>
              <option value="bytes32">bytes32</option>
              <option value="string">string</option>
              <option value="bool">bool</option>
            </select>
          </div>

          <div style={{paddingTop: '1rem'}}><button onClick={getParamsArray}>getArray</button></div>
        </BorderWrapper>
      </div>

      <div style={{ paddingTop: '1rem' ,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <BorderWrapper>
          <div>
            <button onClick={getFunctionsAbiArray}>getFunctionAbiArray</button>
            <button onClick={getDataPayloadParams}>getDataPayloadParams</button>
            <button onClick={getFunctionSigString}>getFunctionSigString</button>
          </div>
          <h2>Generate bytesDataPayload:</h2>
          <h3>genetatedBytesDataPayload: {generatedBytesDataPayload}</h3>
          <div onClick={generateBytesDataPayload} style={{ paddingTop: '0.5rem' ,display: 'flex', alignItems: 'center', justifyContent: 'center'}}><button>generate</button></div>
        </BorderWrapper>
      </div>



      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem'}}>
        <BorderWrapper>
          <div>
            <button onClick={getToValueFunc}>getToValue</button>
            <button onClick={getDataValueFunc}>getDataValue</button>
            <button onClick={getValueValueFunc}>getValueValue</button>   
          </div>
          
          <h3>createTx:</h3>
          
          <h3 style={{paddingTop: '1.5rem'}}>To:</h3>
          <input type="text" placeholder="paramToAdd" onChange={e => setCreateTxParamTo(e.target.value)}></input>

          <h3>Data:</h3>
          <input type="text" placeholder="paramToAdd" onChange={e => setCreateTxParamData(e.target.value)}></input>

          <h3>Value:</h3>
          <input type="number" placeholder="paramToAdd" onChange={e => setCreateTxParamValue(e.target.value)}></input>

          <div style={{paddingTop: '1rem'}}><button onClick={createSafeTx}>createTx</button></div>
        </BorderWrapper>
      </div>



      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem'}}>
        <BorderWrapper>
          <h3>enableModule:</h3>

          <input type="text" placeholder="moduleAddress" onChange={e => setModuleAddressToAddInput(e.target.value)}></input>
          <button onClick={enableModule}>enableModule</button>
        </BorderWrapper>
      </div>



      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem'}}>
        <BorderWrapper>
          <h3>checkModuleIsEnabled:</h3>

          <input type="text" placeholder="moduleAddress" onChange={e => setModuleAddressToCheckInput(e.target.value)}></input>
          <button onClick={checkModuleIsEnabled}>checkModule</button>
        </BorderWrapper>
      </div>
    </div>
  );
}

export default App; 
