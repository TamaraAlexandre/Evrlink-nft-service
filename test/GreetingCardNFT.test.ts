import { expect } from "chai";
import { network } from "hardhat";
import { GreetingCardNFT } from "../typechain-types";

describe("GreetingCardNFT", function () {
  let greetingCardNFT: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    const { viem } = await network.connect();
    [owner, user1, user2] = await viem.getWallets();
    
    const GreetingCardNFT = await viem.getContractFactory("GreetingCardNFT");
    greetingCardNFT = await GreetingCardNFT.deploy({
      args: [
        "Evrlink Greeting Cards",
        "EVRLINK",
        owner.address
      ],
    });
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await greetingCardNFT.read.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await greetingCardNFT.read.name()).to.equal("Evrlink Greeting Cards");
      expect(await greetingCardNFT.read.symbol()).to.equal("EVRLINK");
    });

    it("Should set the correct mint price", async function () {
      expect(await greetingCardNFT.read.MINT_PRICE()).to.equal(viem.parseEther("0.02"));
    });

    it("Should set the correct max supply", async function () {
      expect(await greetingCardNFT.read.MAX_SUPPLY()).to.equal(10000n);
    });
  });

  describe("Minting", function () {
    it("Should mint a single greeting card", async function () {
      const tokenURI = "ipfs://QmTestHash";
      const mintPrice = viem.parseEther("0.02");
      
      await expect(greetingCardNFT.write.mintGreetingCard([tokenURI, user1.address], { value: mintPrice }))
        .to.emit(greetingCardNFT, "GreetingCardMinted")
        .withArgs(1n, user1.address, tokenURI);
      
      expect(await greetingCardNFT.read.ownerOf([1n])).to.equal(user1.address);
      expect(await greetingCardNFT.read.tokenURI([1n])).to.equal(tokenURI);
    });

    it("Should fail to mint with insufficient payment", async function () {
      const tokenURI = "ipfs://QmTestHash";
      const insufficientPrice = viem.parseEther("0.01");
      
      await expect(
        greetingCardNFT.write.mintGreetingCard([tokenURI, user1.address], { value: insufficientPrice })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should batch mint multiple greeting cards", async function () {
      const tokenURIs = ["ipfs://QmHash1", "ipfs://QmHash2", "ipfs://QmHash3"];
      const totalCost = viem.parseEther("0.06"); // 0.02 * 3
      
      await expect(greetingCardNFT.write.batchMintGreetingCards([tokenURIs, user1.address], { value: totalCost }))
        .to.emit(greetingCardNFT, "BatchMinted");
      
      expect(await greetingCardNFT.read.ownerOf([1n])).to.equal(user1.address);
      expect(await greetingCardNFT.read.ownerOf([2n])).to.equal(user1.address);
      expect(await greetingCardNFT.read.ownerOf([3n])).to.equal(user1.address);
      expect(await greetingCardNFT.read.tokenURI([1n])).to.equal(tokenURIs[0]);
      expect(await greetingCardNFT.read.tokenURI([2n])).to.equal(tokenURIs[1]);
      expect(await greetingCardNFT.read.tokenURI([3n])).to.equal(tokenURIs[2]);
    });
  });

  describe("Withdrawal", function () {
    it("Should allow owner to withdraw funds", async function () {
      const tokenURI = "ipfs://QmTestHash";
      const mintPrice = viem.parseEther("0.02");
      
      await greetingCardNFT.write.mintGreetingCard([tokenURI, user1.address], { value: mintPrice });
      
      const initialBalance = await viem.getBalance({ address: owner.address });
      await greetingCardNFT.write.withdraw();
      const finalBalance = await viem.getBalance({ address: owner.address });
      
      expect(finalBalance > initialBalance).to.be.true;
    });

    it("Should not allow non-owner to withdraw", async function () {
      await expect(greetingCardNFT.write.withdraw()).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
