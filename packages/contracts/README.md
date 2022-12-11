# Norges Bank - Hardhat Boilerplate

The tests with this configuration makes "a copy" of the external blockchain from the RPC_URL provided. This lets you play with the current state in your tests.

Create a `.env.local` file from the `.env.example`. This is done at the root level of the project. You need these to run the tests 
- `RPC_URL`: _unquoted_ URL to the RPC with basic authentication
- `NOK_ADDRESS`: address to the NOK(CBToken) contract 
- `ME_ADDRESS`: Your address or anyone else. (user to fetch balanceOf of the address)
- `WHALE_ADDRESS`: Address of someone you categorize as a "Whale" in the NOK contract. Used to transfer NOK to you if you want more 💰

`./contracts` contains `CBContract.sol` which is the actual contract for NOK token.

Run the test for NOK (which is deployed already) and TokenLock which we deploy automatically before tests are run

```
yarn test
```

### Impersonate accounts
This is a useful tool if you want to impersonate another address on the network. We do this `CBToken.test.ts` and `TokenLock.test.ts` Let's say you want to transfer tokens from someone or call functions on contracts that are only callable by certain addresses

For deploying contracts, building typescript interfaces to the network please read more in the [Hardhat documentation](https://hardhat.org/docs)