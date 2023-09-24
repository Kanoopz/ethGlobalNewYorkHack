# ethGlobalNewYorkHack
"./axerLane crossChain accountAbstraction Unification", for short: "./chainAbstractionUnification".

****IMPORTANT TO NOTE THAT THIS PROJECT AND ITS IMPLEMENTATION WAS BUILD FROM SCRATCH, IT DIDNT USE ANYTHING FROM THE PAST ETH GLOBAL SUPERHACK "/chainAbstraction" PROJECT REPO.

productionFrontEnd:           https://65101d926686c853249ab8f9--comfy-kringle-88274e.netlify.app/

chainAbstractionUnification project aims to; 
    
    
    1: Solve the erc4337 fragmentation problem due to the lack of an actual standard of abstractedAccounts/smartAccounts by linking the different abstractedAccounts (AA) through any     evmCompatible chains, causing that an actual "standard" is not needed anymore thanks to this unified infraestructure.
    
    
    2: Improve the UX of the average blockchain/cyrpto user by managing assets accross all evmChains in a single chain with an abstractedAccount, making possible that the user doesnt have to actually change networks when interacting with a different chain dApp or asset.
    
    
    3: Enable the payment of gas accross all evmChains by using a single evmChainNativeAsset for operations/orders/transactions all over the evmCompatibleChains ecosystem.
        Example: pay the gas of transactions on base, optimism, ethereumMainnet, linea, arbitrum, etc with matic, so the user only has the need to hold that nativeAsset(matic).

"Arquitecture"
The project is built using safeAbstractedAccount approach using modules to have customized lowLevelCalls operations.
The two built modules are: axelarSafeModule and hyperSafeModule, implementing axelar crossChainInfraestructure and hyperLane crossChainInfraestructure respectively.

There are 2 useCases implemented:
- General lowLevelCalls to give "orders" to other linkedAbstractedAccounts on differentChains than the one that emits the order.
- hybridTransfer of erc20Tokens by "bridging" a portion of tokens from the source AA and the rest from the otherChainAa through an order.

Specific useCase:
- Permitting users from others chains different from polygon to intercat with the lensProtocol.



  
