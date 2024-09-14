const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
    const usdcAbiPath = path.join(__dirname, "abi/usdcABI.json");
    const usdcAbi = JSON.parse(fs.readFileSync(usdcAbiPath, "utf8"));

    // Define the WETH contract address and your recipient address
    const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"; // WETH contract on Ethereum mainnet
    const wallet = (await ethers.provider.getSigner(0)).address;

    // Impersonate the signer
    const impersonatedSigner = await ethers.getImpersonatedSigner("0x2E40DDCB231672285A5312ad230185ab2F14eD2B");

    // Check and print the balance of ETH for the impersonated signer
    const ethBalance = await ethers.provider.getBalance(impersonatedSigner.address);
    console.log(`ETH Balance of ${impersonatedSigner.address}: ${ethers.formatEther(ethBalance)} ETH`);

    // Connect to the WETH contract using the impersonated signer
    const WETH = await ethers.getContractAt(usdcAbi, WETH_ADDRESS, impersonatedSigner);

    // Check and print the balance of WETH for the impersonated signer
    let wethBalance = await WETH.balanceOf(impersonatedSigner.address);
    console.log(`WETH Balance of ${impersonatedSigner.address}: ${ethers.formatEther(wethBalance)} WETH`);

    // Define the amount of WETH to send (1 WETH)
    const amount = ethers.parseEther("1");

    // Execute the transfer from the impersonated signer to your address
    const tx = await WETH.transfer(wallet, amount);
    await tx.wait();

    console.log(`Successfully transferred 1 WETH to ${wallet}`);
    // Check and print the balance of WETH for the impersonated signer
    wethBalance = await WETH.balanceOf(impersonatedSigner.address);
    console.log(`WETH Balance of ${impersonatedSigner.address}: ${ethers.formatEther(wethBalance)} WETH`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
