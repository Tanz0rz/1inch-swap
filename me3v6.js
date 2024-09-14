const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");

// Wallet with large WETH balance
const wethHolder = '0x2E40DDCB231672285A5312ad230185ab2F14eD2B';

// 1inch v6 router contract
const oneinchV6Address = '0x111111125421ca6dc452d289314280a0f8842a65';

// ERC20 contract addresses
const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const erc20Abi = [
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint256 value) returns (bool)",
    "function approve(address spender, uint256 value) returns (bool)"
]

async function getETH() {

    const localWallet = (await ethers.provider.getSigner(0)).address;

    // Impersonate the signer
    const impersonatedSigner = await ethers.getImpersonatedSigner(wethHolder);

    // Check and print the balance of ETH for the impersonated signer
    const ethBalance = await ethers.provider.getBalance(impersonatedSigner.address);
    console.log(`ETH Balance of whale (${impersonatedSigner.address}): ${ethers.formatEther(ethBalance)} ETH`);

    // Connect to the WETH contract using the impersonated signer
    const WETH = await ethers.getContractAt(erc20Abi, wethAddress, impersonatedSigner);

    // Check and print the balance of WETH for the impersonated signer
    let wethBalance = await WETH.balanceOf(impersonatedSigner.address);
    console.log(`WETH Balance of whale (${impersonatedSigner.address}): ${ethers.formatEther(wethBalance)} WETH`);

    // Define the amount of WETH to send (1 WETH)
    const amount = ethers.parseEther("1");

    // Execute the transfer from the impersonated signer to your address
    const tx = await WETH.transfer(localWallet, amount);
    await tx.wait();

    console.log(`Successfully transferred 1 WETH to ${localWallet}`);
    // Check and print the balance of WETH for the impersonated signer
    wethBalance = await WETH.balanceOf(impersonatedSigner.address);
    console.log(`Remaining WETH Balance of whale (${impersonatedSigner.address}): ${ethers.formatEther(wethBalance)} WETH`);
}

async function approveWETH() {

    // Create a signer
    const signer = await ethers.provider.getSigner(0);

    // Create a signable instance of the weth contract for swap approval
    const wethContractSignable = new ethers.Contract(wethAddress, erc20Abi, signer);

    // Set the approval amount to 1000 WETH
    const amount = ethers.parseEther("1000");

    try {
        console.log(`Approving ${amount.toString()} WETH for contract ${oneinchV6Address}`);
        const tx = await wethContractSignable.approve(oneinchV6Address, amount);
        console.log("Approval transaction sent, waiting for confirmation...");

        // Wait for transaction confirmation
        await tx.wait();
        console.log(`Successfully approved 1000 WETH to ${oneinchV6Address}`);
    } catch (error) {
        console.error("Error during WETH approval:", error);
    }
}

async function sendRawBinaryData() {
    const signer = await ethers.provider.getSigner(0);

    const wethContract = new ethers.Contract(wethAddress, erc20Abi, ethers.provider);
    const initialWethBalance = await wethContract.balanceOf(signer.address);
    console.log("Initial WETH Balance:", ethers.formatUnits(initialWethBalance, 18));
    const usdcContract = new ethers.Contract(usdcAddress, erc20Abi, ethers.provider);
    const initialUsdcBalance = await usdcContract.balanceOf(signer.address);
    console.log("Initial USDC Balance:", ethers.formatUnits(initialUsdcBalance, 6));

    // Manually encode function call data (from 1inch router)
    const calldata = "0x83800a8e000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000016345785d8a00000000000000000000000000000000000000000000000000000000000007401353280000000000000000000000e0554a476a092703abdb3ef35c80e0d76d32939f1164d111"; // Your raw binary data

    // Create the transaction object
    const tx = {
        to: oneinchV6Address,
        data: calldata,
        value: ethers.parseEther("0") // Sending 1 ETH along with the transaction
    };

    // Send the transaction/
    try {
        // Query updated WETH and USDC balances
        const updatedWethBalance = await wethContract.balanceOf(signer.address);
        const updatedUsdcBalance = await usdcContract.balanceOf(signer.address);
        console.log("Updated WETH Balance:", ethers.formatUnits(updatedWethBalance, 18));
        console.log("Updated USDC Balance:", ethers.formatUnits(updatedUsdcBalance, 6));

    } catch (error) {
        console.error("Error sending transaction:", error);
    }
}

async function main() {
    try {
        console.log("Getting ETH...");

        await getETH();
        console.log("getETH completed successfully");

        await approveWETH();
        console.log("approveWETH completed successfully");

        await sendRawBinaryData()
        console.log("sendRawBinaryData completed successfully");

    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
}

main();


// getETH().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });
//
// approveWETH().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

// sendRawBinaryData().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });
