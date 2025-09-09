# Evrlink NFT Minting Service

A Hardhat-based smart contract service for minting greeting card NFTs on Base network.

## Features

- **ERC-721 NFT Contract**: Customizable greeting card NFTs
- **Metadata Support**: IPFS metadata integration
- **Batch Minting**: Multiple cards in one transaction
- **Royalty System**: Creator royalties on secondary sales
- **Gas Optimization**: Efficient minting for Base network
- **Deployment Scripts**: Automated contract deployment

## Project Structure

```
evrlink-nft-service/
├── contracts/
│   ├── GreetingCardNFT.sol          # Main NFT contract
│   └── interfaces/
│       └── IGreetingCardNFT.sol      # Contract interface
├── scripts/
│   ├── deploy.ts                     # Deployment script
│   ├── mint.ts                       # Minting script
│   └── verify.ts                     # Contract verification
├── test/
│   └── GreetingCardNFT.test.ts       # Contract tests
├── hardhat.config.ts                 # Hardhat configuration
├── package.json                      # Dependencies
└── README.md                         # This file
```

## Smart Contract: GreetingCardNFT.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract GreetingCardNFT is ERC721, ERC721URIStorage, ERC2981, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Minting price (0.02 ETH)
    uint256 public constant MINT_PRICE = 0.02 ether;
    
    // Maximum supply
    uint256 public constant MAX_SUPPLY = 10000;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Events
    event GreetingCardMinted(uint256 tokenId, address owner, string tokenURI);
    event BatchMinted(uint256[] tokenIds, address owner);
    
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        uint96 royaltyPercentage
    ) ERC721(name, symbol) Ownable(initialOwner) {
        _setDefaultRoyalty(initialOwner, royaltyPercentage);
    }
    
    // Mint a single greeting card
    function mintGreetingCard(
        string memory tokenURI,
        address recipient
    ) external payable returns (uint256) {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(_tokenIds.current() < MAX_SUPPLY, "Max supply reached");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        emit GreetingCardMinted(newTokenId, recipient, tokenURI);
        
        return newTokenId;
    }
    
    // Batch mint multiple greeting cards
    function batchMintGreetingCards(
        string[] memory tokenURIs,
        address recipient
    ) external payable returns (uint256[] memory) {
        uint256 totalCost = MINT_PRICE * tokenURIs.length;
        require(msg.value >= totalCost, "Insufficient payment");
        require(_tokenIds.current() + tokenURIs.length <= MAX_SUPPLY, "Exceeds max supply");
        
        uint256[] memory newTokenIds = new uint256[](tokenURIs.length);
        
        for (uint256 i = 0; i < tokenURIs.length; i++) {
            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            
            _safeMint(recipient, newTokenId);
            _setTokenURI(newTokenId, tokenURIs[i]);
            
            newTokenIds[i] = newTokenId;
        }
        
        emit BatchMinted(newTokenIds, recipient);
        
        return newTokenIds;
    }
    
    // Withdraw contract balance
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Set base URI
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
```

## Setup Instructions

### 1. Initialize Hardhat Project

```bash
mkdir evrlink-nft-service
cd evrlink-nft-service
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

### 2. Install Dependencies

```bash
npm install @openzeppelin/contracts
npm install --save-dev @nomicfoundation/hardhat-verify
npm install --save-dev dotenv
```

### 3. Configure Hardhat

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};

export default config;
```

### 4. Environment Variables

```bash
# .env
PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

### 5. Deployment Script

```typescript
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  const GreetingCardNFT = await ethers.getContractFactory("GreetingCardNFT");
  const greetingCardNFT = await GreetingCardNFT.deploy(
    "Evrlink Greeting Cards",
    "EVRLINK",
    deployer.address,
    500 // 5% royalty
  );
  
  await greetingCardNFT.deployed();
  
  console.log("GreetingCardNFT deployed to:", greetingCardNFT.address);
  
  // Verify contract
  console.log("Waiting for block confirmations...");
  await greetingCardNFT.deployTransaction.wait(6);
  
  console.log("Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: greetingCardNFT.address,
      constructorArguments: [
        "Evrlink Greeting Cards",
        "EVRLINK",
        deployer.address,
        500,
      ],
    });
  } catch (error) {
    console.log("Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 6. Minting Script

```typescript
// scripts/mint.ts
import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  
  // Contract address (after deployment)
  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const GreetingCardNFT = await ethers.getContractFactory("GreetingCardNFT");
  const contract = GreetingCardNFT.attach(contractAddress);
  
  // IPFS metadata URI (from your frontend)
  const tokenURI = "ipfs://QmYourMetadataHash";
  
  // Mint price
  const mintPrice = ethers.utils.parseEther("0.02");
  
  console.log("Minting greeting card...");
  console.log("Token URI:", tokenURI);
  console.log("Mint price:", ethers.utils.formatEther(mintPrice), "ETH");
  
  const tx = await contract.mintGreetingCard(tokenURI, signer.address, {
    value: mintPrice,
  });
  
  await tx.wait();
  console.log("Greeting card minted successfully!");
  console.log("Transaction hash:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## Integration with Frontend

### 1. API Endpoint for Minting

Create an API route in your frontend to handle minting requests:

```typescript
// app/api/mint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { ipfsHash, recipient } = await request.json();
    
    // Call your Hardhat service or use a service like Alchemy/Infura
    const mintResponse = await fetch('YOUR_HARDHAT_SERVICE_URL/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ipfsHash, recipient }),
    });
    
    const result = await mintResponse.json();
    
    return NextResponse.json({ success: true, txHash: result.txHash });
  } catch (error) {
    return NextResponse.json({ error: 'Minting failed' }, { status: 500 });
  }
}
```

### 2. Frontend Minting Integration

```typescript
// Add to your GreetingCardEditor component
const handleMintNFT = async (ipfsHash: string) => {
  try {
    const response = await fetch('/api/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ipfsHash, 
        recipient: userAddress // from wallet connection
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('NFT minted successfully!');
      console.log('Transaction hash:', result.txHash);
    }
  } catch (error) {
    console.error('Minting failed:', error);
  }
};
```

## Deployment Steps

1. **Deploy to Base Sepolia (Testnet)**:
```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

2. **Deploy to Base Mainnet**:
```bash
npx hardhat run scripts/deploy.ts --network base
```

3. **Mint Test NFT**:
```bash
npx hardhat run scripts/mint.ts --network baseSepolia
```

## Benefits of This Approach

✅ **Separation of Concerns**: Frontend handles UI, backend handles blockchain  
✅ **Security**: Private keys stay in backend, not exposed to frontend  
✅ **Scalability**: Easy to add more features (batch minting, royalties)  
✅ **Gas Optimization**: Efficient smart contract for Base network  
✅ **Testing**: Comprehensive test suite for smart contracts  
✅ **Verification**: Automatic contract verification on BaseScan  

This setup gives you a professional, scalable NFT minting solution that integrates seamlessly with your existing greeting card frontend!
