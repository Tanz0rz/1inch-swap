# Testing 1inch swaps

This project demonstrates how to test 1inch swaps using ethers v6 in a basic Hardhat project.

The main file, 1inchSwap.js, will do the following:
- Move WETH from a large holder to a local wallet
- Approve WETH for the 1inch v6 router
- Swap WETH for USDC through the 1inch v6 router

```shell
npm install
npx hardhat node --fork <mainnet_rpc_url>
npx hardhat run scripts/1inchSwap.js --network localhost
```
