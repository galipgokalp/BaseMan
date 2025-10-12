import { expect } from "chai";
import pkg from "hardhat";

const { ethers } = pkg;

describe("BaseManRegistry", function () {
  async function deployFixture() {
    const [owner, authorizer, player] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("BaseManRegistry");
    const contract = await Factory.deploy(authorizer.address);
    const network = await ethers.provider.getNetwork();
    return { owner, authorizer, player, contract, chainId: BigInt(network.chainId) };
  }

  function getDeadline() {
    return Math.floor(Date.now() / 1000) + 60;
  }

  async function signScore(authorizer, contract, chainId, player, score, deadline) {
    const verifyingContract = await contract.getAddress();
    const domain = {
      name: "BaseManRegistry",
      version: "1",
      chainId,
      verifyingContract
    };

    const types = {
      Score: [
        { name: "player", type: "address" },
        { name: "score", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    };

    const value = {
      player: player.address,
      score,
      deadline
    };

    const signature = await authorizer.signTypedData(domain, types, value);
    const recovered = pkg.ethers.verifyTypedData(domain, types, value, signature);
    expect(recovered).to.equal(authorizer.address);
    return signature;
  }

  async function signQuest(authorizer, contract, chainId, player, questId, deadline) {
    const verifyingContract = await contract.getAddress();
    const domain = {
      name: "BaseManRegistry",
      version: "1",
      chainId,
      verifyingContract
    };

    const types = {
      Quest: [
        { name: "player", type: "address" },
        { name: "questId", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    };

    const value = {
      player: player.address,
      questId,
      deadline
    };

    const signature = await authorizer.signTypedData(domain, types, value);
    const recovered = pkg.ethers.verifyTypedData(domain, types, value, signature);
    expect(recovered).to.equal(authorizer.address);
    return signature;
  }

  it("stores a higher score when signature is valid", async function () {
    const { authorizer, player, contract, chainId } = await deployFixture();
    const deadline = getDeadline();
    const signature = await signScore(authorizer, contract, chainId, player, 12345, deadline);
    await expect(
      contract.connect(player).submitScore(player.address, 12345, deadline, signature)
    ).to.emit(contract, "ScoreSubmitted");

    const score = await contract.getScore(player.address);
    expect(score.highScore).to.equal(12345);
  });

  it("rejects expired signatures", async function () {
    const { authorizer, player, contract, chainId } = await deployFixture();
    const deadline = Math.floor(Date.now() / 1000) - 1;
    const signature = await signScore(authorizer, contract, chainId, player, 1, deadline);

    await expect(
      contract.connect(player).submitScore(player.address, 1, deadline, signature)
    ).to.be.revertedWithCustomError(contract, "ExpiredSignature");
  });

  it("prevents quest completion without active quest", async function () {
    const { authorizer, player, contract, chainId } = await deployFixture();
    const deadline = getDeadline();
    const signature = await signQuest(authorizer, contract, chainId, player, 1, deadline);

    await expect(
      contract.connect(player).completeQuest(player.address, 1, deadline, signature)
    ).to.be.revertedWithCustomError(contract, "QuestInactive");
  });

  it("allows quest completion with valid signature", async function () {
    const { owner, authorizer, player, contract, chainId } = await deployFixture();
    await contract.connect(owner).setQuest(1, true, "ipfs://quest-1");

    const deadline = getDeadline();
    const signature = await signQuest(authorizer, contract, chainId, player, 1, deadline);
    await expect(
      contract.connect(player).completeQuest(player.address, 1, deadline, signature)
    ).to.emit(contract, "QuestCompleted");

    expect(await contract.isQuestCompleted(player.address, 1)).to.equal(true);
  });
});
