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
├── env.template                      # Environment variables template
└── README.md                         # This file
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the environment template and fill in your values:

```bash
cp env.template .env
```

Edit `.env` with your actual values:
- `PRIVATE_KEY`: Your wallet private key
- `BASE_RPC_URL`: Base mainnet RPC URL
- `BASE_SEPOLIA_RPC_URL`: Base Sepolia testnet RPC URL
- `BASESCAN_API_KEY`: Your BaseScan API key

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
npm test
```

### 5. Deploy to Base Sepolia (Testnet)

```bash
npm run deploy:base-sepolia
```

### 6. Deploy to Base Mainnet

```bash
npm run deploy:base
```

## Smart Contract Features

### GreetingCardNFT Contract

- **ERC-721 Standard**: Full NFT compatibility
- **ERC-2981 Royalties**: 5% creator royalties on secondary sales
- **Batch Minting**: Mint multiple cards in one transaction
- **Gas Optimized**: Efficient for Base network
- **Access Control**: Owner-only functions for withdrawals and settings

### Key Functions

- `mintGreetingCard(tokenURI, recipient)`: Mint a single greeting card
- `batchMintGreetingCards(tokenURIs, recipient)`: Mint multiple cards
- `withdraw()`: Withdraw contract balance (owner only)
- `setBaseURI(baseURI)`: Set base URI for metadata (owner only)

## Deployment

### Testnet Deployment

```bash
# Deploy to Base Sepolia
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### Mainnet Deployment

```bash
# Deploy to Base mainnet
npx hardhat run scripts/deploy.ts --network base
```

### Contract Verification

```bash
# Verify on BaseScan
npx hardhat run scripts/verify.ts --network base
```

## Minting

### Single NFT Mint

```bash
# Update the contract address in scripts/mint.ts
npx hardhat run scripts/mint.ts --network baseSepolia
```

### Batch Minting

The contract supports batch minting for multiple greeting cards in a single transaction, reducing gas costs.

## Integration with Frontend

### API Endpoint Example

```typescript
// app/api/mint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { ipfsHash, recipient } = await request.json();
    
    // Call your Hardhat service
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

### Frontend Integration

```typescript
const handleMintNFT = async (ipfsHash: string) => {
  try {
    const response = await fetch('/api/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ipfsHash, 
        recipient: userAddress 
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

## Configuration

### Hardhat Configuration

The project is configured for:
- **Base Mainnet** (Chain ID: 8453)
- **Base Sepolia Testnet** (Chain ID: 84532)
- **Contract Verification** on BaseScan
- **Gas Optimization** for Base network

### Environment Variables

Required environment variables:
- `PRIVATE_KEY`: Wallet private key for deployment
- `BASE_RPC_URL`: Base mainnet RPC endpoint
- `BASE_SEPOLIA_RPC_URL`: Base Sepolia RPC endpoint
- `BASESCAN_API_KEY`: BaseScan API key for verification

## Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- Contract deployment
- Single and batch minting
- Payment validation
- Access control
- Royalty functionality

## Gas Optimization

The contract is optimized for Base network with:
- Efficient storage patterns
- Batch operations
- Minimal external calls
- Optimized Solidity compiler settings

## Security Features

- **Access Control**: Owner-only functions
- **Payment Validation**: Proper payment checks
- **Supply Limits**: Maximum supply enforcement
- **Safe Transfers**: ERC-721 safe minting
- **Royalty Protection**: ERC-2981 standard

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open an issue on the project repository.
