# ethGlobalNewYorkHack
"./axerLane crossChain accountAbstraction Unification", for short: "./chainAbstractionUnification".

****IMPORTANT TO NOTE THAT THIS PROJECT AND ITS IMPLEMENTATION WAS BUILD FROM SCRATCH, IT DIDNT USE ANYTHING FROM THE PAST ETH GLOBAL SUPERHACK "/chainAbstraction" PROJECT REPO.

productionFrontEnd:           https://65101d926686c853249ab8f9--comfy-kringle-88274e.netlify.app/


Deployed addresses on testnets:
    Goerli
    	0xB313398aDF4b4a350D1fD7863A6Fb5204631Cc29
    Mumbai
    	0x0479Cc6a6e655E8586AC8168023A8Bc2e36c308b
    Mantle
    	0xd9146d5b427194c35ddea2a00ec42c9270e13afb
    Arbitrum
    	0x93A8fE00B91829763A797E933686318e89401c46
    Celo
    	0xd727997CFA1be9434084B71cDA1D17DC1e10FB63
    Linea
    	0x2CB2dd20822828cA7D058Ab71D9F85Af5cB71938
    Base
    	0x5337De352A86c9FbA04af650f1B48e8B1Eb38E96


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





![Apunte sin nombre - 24 sept 2023 5 02 a  m  - Página 1](https://github.com/Kanoopz/ethGlobalNewYorkHack/assets/43384993/5e2bf4d8-66e8-4ead-8617-06aab9647867)



  
