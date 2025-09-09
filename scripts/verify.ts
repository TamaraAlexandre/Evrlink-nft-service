import { HardhatRuntimeEnvironment } from "hardhat/types";

async function main(hre: HardhatRuntimeEnvironment) {
  const { viem } = await hre.network.connect();
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("Please set CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }
  
  console.log("Verifying contract at address:", contractAddress);
  
  try {
    await viem.verifyContract({
      address: contractAddress,
      constructorArguments: [
        "Evrlink Greeting Cards",
        "EVRLINK",
        process.env.OWNER_ADDRESS || "0x0000000000000000000000000000000000000000"
      ],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Verification failed:", error);
  }
}

export default main;
