import { HardhatRuntimeEnvironment } from "hardhat/types";

async function main(hre: HardhatRuntimeEnvironment) {
  console.log("Starting deployment...");
  
  const { viem } = await hre.network.connect();
  console.log("Connected to network");
  
  console.log("Deploying GreetingCardNFT contract...");
  
  const greetingCardNFT = await viem.deployContract("GreetingCardNFT", {
    args: [
      "Evrlink Greeting Cards",
      "EVRLINK",
      "0x0000000000000000000000000000000000000000" // Owner address
    ],
  });
  
  console.log("GreetingCardNFT deployed to:", greetingCardNFT.address);
  console.log("Contract deployment successful!");
}

export default main;
