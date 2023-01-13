# Hackathon DSP - Pengekrukka

## Tests

1. `yarn`
2. Download files from Tornado instead of building locally. Run `yarn download`
3. Move `Verifier.sol` from `/build/contracts/` to `/contracts`
4. Run `yarn test`

The tests with this configuration makes "a copy" of the external blockchain from the RPC_URL provided. This lets you play with the current state in your tests. `./contracts` contains `CBContract.sol` `hich is the actual contract for NOK token.

## Expected Environment
Create a `.env.development` file from the `.env.example`, as specified in [the root README](../../README.md). 


