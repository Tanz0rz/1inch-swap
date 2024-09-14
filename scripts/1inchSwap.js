const { ethers } = require("hardhat");

// Addresses
const WETH_HOLDER = '0x2E40DDCB231672285A5312ad230185ab2F14eD2B';
const ONEINCH_V6_ADDRESS = '0x111111125421ca6dc452d289314280a0f8842a65';
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

// Method signature representation of ABI for ERC20 contracts - https://docs.ethers.org/v6/getting-started/#starting-contracts
const erc20Abi = [
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint256 value) returns (bool)",
    "function approve(address spender, uint256 value) returns (bool)"
]

async function getEthFromWhale() {

    // Get the address of the local hardhat fork wallet at index 0
    const localWallet = (await ethers.provider.getSigner(0)).address;

    // Impersonate the WETH whale
    const impersonatedSigner = await ethers.getImpersonatedSigner(WETH_HOLDER);

    // Check and print the balance of ETH for the WETH whale
    const ethBalance = await ethers.provider.getBalance(impersonatedSigner.address);
    console.log(`ETH Balance of whale (${impersonatedSigner.address}): ${ethers.formatEther(ethBalance)} ETH`);

    // Get an instance of the WETH contract as the WETH whale
    const WETH = await ethers.getContractAt(erc20Abi, WETH_ADDRESS, impersonatedSigner);

    // Check and print the balance of WETH for the WETH whale
    let wethBalance = await WETH.balanceOf(impersonatedSigner.address);
    console.log(`WETH Balance of whale (${impersonatedSigner.address}): ${ethers.formatEther(wethBalance)} WETH`);

    // Define the amount of WETH to send ("1" equates to 1 WETH)
    const amount = ethers.parseEther("1");
    console.log(`Transferring ${ethers.formatUnits(amount)} WETH to local wallet (${localWallet})`);

    try {
        // Execute the transfer from the WETH whale to local wallet
        const tx = await WETH.transfer(localWallet, amount);
        console.log("Transaction sent, waiting for confirmation...");
        // Wait for the transaction to complete
        await tx.wait();
        console.log(`Successfully transferred ${ethers.formatUnits(amount)} WETH to ${localWallet}`);

        // Check and print the balance of WETH whale
        wethBalance = await WETH.balanceOf(impersonatedSigner.address);
        console.log(`Remaining WETH Balance of whale (${impersonatedSigner.address}): ${ethers.formatEther(wethBalance)} WETH`);
    } catch (error) {
        console.error("Error during WETH transfer:", error);
    }
}

async function approveWethFor1inchRouter() {

    // Create a signer for the local wallet
    const localWalletSigner = await ethers.provider.getSigner(0);

    // Get an instance of the WETH contract as the local wallet
    const wethContractSignable = new ethers.Contract(WETH_ADDRESS, erc20Abi, localWalletSigner);

    // Define the amount of WETH to approve ("1000" equates to 1000 WETH)
    const amount = ethers.parseEther("1000");

    try {
        console.log(`Approving ${ethers.formatUnits(amount)} WETH for contract ${ONEINCH_V6_ADDRESS}`);
        // Execute the approval for the 1inch router
        const tx = await wethContractSignable.approve(ONEINCH_V6_ADDRESS, amount);
        console.log("Transaction sent, waiting for confirmation...");
        // Wait for the transaction to complete
        await tx.wait();
        console.log(`Successfully approved ${ethers.formatUnits(amount)} WETH to ${ONEINCH_V6_ADDRESS}`);
    } catch (error) {
        console.error("Error during WETH approval:", error);
    }
}

async function swapWethForUsdc() {
    // Create a signer for the local wallet
    const localWalletSigner = await ethers.provider.getSigner(0);

    // Get an instance of the WETH contract
    const wethContract = new ethers.Contract(WETH_ADDRESS, erc20Abi, ethers.provider);

    // Query the initial WETH balance
    const initialWethBalance = await wethContract.balanceOf(localWalletSigner.address);
    console.log("Initial WETH Balance:", ethers.formatUnits(initialWethBalance, 18));

    // Get an instance of the USDC contract
    const usdcContract = new ethers.Contract(USDC_ADDRESS, erc20Abi, ethers.provider);

    // Query the initial USDC balance
    const initialUsdcBalance = await usdcContract.balanceOf(localWalletSigner.address);
    console.log("Initial USDC Balance:", ethers.formatUnits(initialUsdcBalance, 6));

    // Store the "data" field from the 1inch swap API as a static string
    const calldata = "0x83800a8e000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000016345785d8a00000000000000000000000000000000000000000000000000000000000007401353280000000000000000000000e0554a476a092703abdb3ef35c80e0d76d32939f1164d111"; // Your raw binary data

    // Create the transaction object so we can pass the raw calldata directly to the 1inch router
    const txData = {
        to: ONEINCH_V6_ADDRESS,
        data: calldata,
    };

    // Send the transaction
    try {
        // Execute the swap on the 1inch router
        const tx = await localWalletSigner.sendTransaction(txData);
        console.log("Transaction sent, waiting for confirmation...");
        // Wait for the transaction to complete
        await tx.wait();

        // Query the updated WETH balance
        const updatedWethBalance = await wethContract.balanceOf(localWalletSigner.address);
        console.log("Updated WETH Balance:", ethers.formatUnits(updatedWethBalance, 18));
        // Query the updated USDC balance
        const updatedUsdcBalance = await usdcContract.balanceOf(localWalletSigner.address);
        console.log("Updated USDC Balance:", ethers.formatUnits(updatedUsdcBalance, 6));
    } catch (error) {
        console.error("Error during 1inch swap:", error);
    }
}

async function main() {
    try {
        console.log("-------------------------");
        console.log("Getting WETH from whale");
        console.log("-------------------------");
        await getEthFromWhale();

        console.log("-------------------------");
        console.log("Approving WETH on 1inch router");
        console.log("-------------------------");
        await approveWethFor1inchRouter();

        console.log("-------------------------");
        console.log("Swapping WETH for USDC");
        console.log("-------------------------");
        await swapWethForUsdc()

    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
}

main();