const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
    const usdcAbiPath = path.join(__dirname, "abi/usdcABI.json");
    const usdcAbi = JSON.parse(fs.readFileSync(usdcAbiPath, "utf8"));

    // Define the WETH contract address and your recipient address
    const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"; // WETH contract on Ethereum mainnet
    const recipient = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Your address

    // Impersonate the signer
    const impersonatedSigner = await ethers.getImpersonatedSigner("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");

    // Check and print the balance of ETH for the impersonated signer
    const ethBalance = await ethers.provider.getBalance(impersonatedSigner.address);
    console.log(`ETH Balance of ${impersonatedSigner.address}: ${ethers.formatEther(ethBalance)} ETH`);

    // Connect to the WETH contract using the impersonated signer
    const WETH = await ethers.getContractAt(usdcAbi, WETH_ADDRESS, impersonatedSigner);

    // Check and print the balance of WETH for the impersonated signer
    const wethBalance = await WETH.balanceOf(impersonatedSigner.address);
    console.log(`WETH Balance of ${impersonatedSigner.address}: ${ethers.formatEther(wethBalance)} WETH`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
