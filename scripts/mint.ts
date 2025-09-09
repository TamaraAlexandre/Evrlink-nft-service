import { HardhatRuntimeEnvironment } from "hardhat/types";

async function main(hre: HardhatRuntimeEnvironment) {
  const { viem } = await hre.network.connect();
  
  // Contract address (after deployment)
  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const GreetingCardNFT = await viem.getContractFactory("GreetingCardNFT");
  const contract = GreetingCardNFT.attach(contractAddress);
  
  // IPFS metadata URI (from your frontend)
  const tokenURI = "ipfs://QmYourMetadataHash";
  
  // Mint price
  const mintPrice = viem.parseEther("0.02");
  
  console.log("Minting greeting card...");
  console.log("Token URI:", tokenURI);
  console.log("Mint price:", viem.formatEther(mintPrice), "ETH");
  
  const tx = await contract.write.mintGreetingCard([tokenURI, contractAddress], {
    value: mintPrice,
  });
  
  await tx.wait();
  console.log("Greeting card minted successfully!");
  console.log("Transaction hash:", tx.hash);
}

export default main;
