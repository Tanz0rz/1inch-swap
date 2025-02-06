# Testing 1inch swaps

This project demonstrates how to test 1inch swaps locally using ethers v6 in a basic Hardhat project.

## Overview

This project contains a single script that will do the following on a local fork of Mainnet:
- Move WETH from a large holder to a local wallet
- Approve the 1inch v6 router to spend the local wallet's WETH
- Swap WETH for USDC through the 1inch v6 router

## Setup

Install the project

```shell
npm install
```

Run a local fork of Mainnet from your terminal (if needed, pick a free RPC from [chainlist.org](https://chainlist.org/chain/1))
```shell
npx hardhat node --fork <mainnet_rpc_url>
```
With your local fork running, open up a second terminal and run the following from the root directory of the project:
```shell
npx hardhat run scripts/1inchSwap.js --network localhost
```
This second terminal will connect to your local hardhat fork of Mainnet and simulate the swap
