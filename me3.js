const ethers = require("ethers");
const path = require("path");
const fs = require("fs");

// Connect to the local fork node
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

// Specify the contract address (1inch Router)
const contractAddress = '0x111111125421ca6dc452d289314280a0f8842a65';

// Create a signer (Make sure your local node has unlocked accounts)
const signer = provider.getSigner(0); // The wallet performing the swap
console.log('signer');
console.log(signer);

// Load the ABI from the file system
const abiPath = path.join(__dirname, "abi/1inchV6ABI.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

// USDC contract address (for Ethereum Mainnet)
const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // Change for testnets if necessary
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"; // WETH contract on Ethereum mainnet

const usdcAbiPath = path.join(__dirname, "abi/usdcABI.json");
const usdcAbi = JSON.parse(fs.readFileSync(usdcAbiPath, "utf8"));

// Connect to the contract (1inch router)
const contract = new ethers.Contract(contractAddress, abi, signer);

// Connect to USDC contract
const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);
const wethContract = new ethers.Contract(wethAddress, usdcAbi, provider);

async function approveWETH() {

    const wethContractSignable = new ethers.Contract(wethAddress, usdcAbi, signer);
    const walletAddress = await signer.getAddress();
    console.log('Wallet Address:', walletAddress);

    // Approve the 1inch router to spend 1000 WETH from this wallet
    const amount = ethers.utils.parseEther("1000"); // 1000 WETH

    try {
        console.log(`Approving ${amount.toString()} WETH for contract ${contractAddress}`);
        const tx = await wethContractSignable.approve(contractAddress, amount);
        console.log("Approval transaction sent, waiting for confirmation...");

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log(`Transaction confirmed! Block Number: ${receipt.blockNumber}`);
        console.log(`Successfully approved 1000 WETH to ${contractAddress}`);
    } catch (error) {
        console.error("Error during WETH approval:", error);
    }
}

async function sendRawBinaryData() {
    const walletAddress = await signer.getAddress();


    console.log('wallet address');
    console.log(walletAddress);

    // Check initial ETH and USDC balance
    const initialEthBalance = await provider.getBalance(walletAddress);
    const initialUsdcBalance = await usdcContract.balanceOf(walletAddress);
    const initialWethBalance = await wethContract.balanceOf(walletAddress);
    console.log("Initial ETH Balance:", ethers.utils.formatEther(initialEthBalance));
    console.log("Initial WETH Balance:", ethers.utils.formatUnits(initialWethBalance, 18)); // USDC has 6 decimals
    console.log("Initial USDC Balance:", ethers.utils.formatUnits(initialUsdcBalance, 6)); // USDC has 6 decimals

    // Manually encode function call data (from 1inch router)
    const calldata = "0x83800a8e000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000045cbe4b1280000000000000000000000e0554a476a092703abdb3ef35c80e0d76d32939f1164d111"; // Your raw binary data

    // Create the transaction object
    const tx = {
        to: contractAddress,
        data: calldata,
        value: ethers.utils.parseEther("0") // Sending 1 ETH along with the transaction
    };

    // Send the transaction/
    try {
        const txResponse = await signer.sendTransaction(tx);
        console.log("Transaction sent! Hash:", txResponse.hash);

        // Wait for transaction confirmation
        const receipt = await txResponse.wait();
        console.log("Transaction confirmed in block", receipt.blockNumber);

        // Query updated ETH and USDC balances
        const updatedEthBalance = await provider.getBalance(walletAddress);
        const updatedUsdcBalance = await usdcContract.balanceOf(walletAddress);
        console.log("Updated ETH Balance:", ethers.utils.formatEther(updatedEthBalance));
        console.log("Initial WETH Balance:", ethers.utils.formatUnits(initialWethBalance, 18)); // USDC has 6 decimals
        console.log("Updated USDC Balance:", ethers.utils.formatUnits(updatedUsdcBalance, 6));

    } catch (error) {
        console.error("Error sending transaction:", error);
    }
}

// approveWETH().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

sendRawBinaryData().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
