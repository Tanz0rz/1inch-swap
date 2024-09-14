const ethers = require("ethers");
const path = require("path");
const fs = require("fs");

// Connect to the local fork node
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

// Specify the contract address
const contractAddress = '0x2B64822cf4bbDd77d386F51AA2B40c5cdbeb80b5';

// Load the ABI from the file system
const abiPath = path.join(__dirname, "abi/LockABI.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

// Connect to the contract
const contract = new ethers.Contract(contractAddress, abi, provider);

// Interact with the contract
async function getUnlockTime() {
    const unlockTime = await contract.unlockTime();
    console.log("Unlock Time:", unlockTime.toString());
}

getUnlockTime();
