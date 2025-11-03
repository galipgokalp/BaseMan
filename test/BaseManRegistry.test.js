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

  async function signScore(authorizer, contract, chainId, player, score, deadline, nonce) {
    const verifyingContract = await contract.getAddress();
    const domain = {
      name: "BaseManRegistry",
      version: "2",
      chainId,
      verifyingContract
    };

    const types = {
      Score: [
        { name: "player", type: "address" },
        { name: "score", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "nonce", type: "uint256" }
      ]
    };

    const value = {
      player: player.address,
      score,
      deadline,
      nonce
    };

    const signature = await authorizer.signTypedData(domain, types, value);
    const recovered = pkg.ethers.verifyTypedData(domain, types, value, signature);
    expect(recovered).to.equal(authorizer.address);
    return signature;
  }

  async function signQuest(authorizer, contract, chainId, player, questId, deadline, nonce) {
    const verifyingContract = await contract.getAddress();
    const domain = {
      name: "BaseManRegistry",
      version: "2",
      chainId,
      verifyingContract
    };

    const types = {
      Quest: [
        { name: "player", type: "address" },
        { name: "questId", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "nonce", type: "uint256" }
      ]
    };

    const value = {
      player: player.address,
      questId,
      deadline,
      nonce
    };

    const signature = await authorizer.signTypedData(domain, types, value);
    const recovered = pkg.ethers.verifyTypedData(domain, types, value, signature);
    expect(recovered).to.equal(authorizer.address);
    return signature;
  }

  it("stores a higher score when signature is valid", async function () {
    const { authorizer, player, contract, chainId } = await deployFixture();
    const deadline = getDeadline();
    const nonce = BigInt(Date.now());
    const signature = await signScore(authorizer, contract, chainId, player, 12345, deadline, nonce);
    await expect(
      contract.connect(player).submitScore(player.address, 12345, deadline, nonce, signature)
    ).to.emit(contract, "ScoreSubmitted");

    const score = await contract.getScore(player.address);
    expect(score.highScore).to.equal(12345);
  });

  it("accumulates totalScore and emits ScoreAdded with new total", async function () {
    const { authorizer, player, contract, chainId } = await deployFixture();
    const d1 = getDeadline();
    const n1 = BigInt(1001);
    const s1 = await signScore(authorizer, contract, chainId, player, 10, d1, n1);
    const tx1 = await contract.connect(player).submitScore(player.address, 10, d1, n1, s1);
    const r1 = await tx1.wait();
    const e1 = r1.logs.map((l) => l).find(() => true); // ensure mined
    const score1 = await contract.getScore(player.address);
    expect(score1.totalScore).to.equal(10);

    const d2 = getDeadline();
    const n2 = BigInt(1002);
    const s2 = await signScore(authorizer, contract, chainId, player, 7, d2, n2);
    await expect(
      contract.connect(player).submitScore(player.address, 7, d2, n2, s2)
    ).to.emit(contract, "ScoreAdded");

    const score2 = await contract.getScore(player.address);
    expect(score2.totalScore).to.equal(17);
  });

  it("supports pause/unpause guards for player actions", async function () {
    const { owner, authorizer, player, contract, chainId } = await deployFixture();
    await contract.connect(owner).pause();

    const deadline = getDeadline();
    const nonce = BigInt(55);
    const sig = await signScore(authorizer, contract, chainId, player, 5, deadline, nonce);
    await expect(
      contract.connect(player).submitScore(player.address, 5, deadline, nonce, sig)
    ).to.be.revertedWithCustomError(contract, "PausedError");

    await contract.connect(owner).unpause();
    await expect(
      contract.connect(player).submitScore(player.address, 5, deadline, nonce, sig)
    ).to.emit(contract, "ScoreAdded");
  });

  it("owner can seed totals and getters reflect state", async function () {
    const { owner, contract, player } = await deployFixture();
    const now = Math.floor(Date.now() / 1000);
    await expect(
      contract.connect(owner).seedTotals(
        [player.address],
        [100],
        [50],
        [now]
      )
    ).to.emit(contract, "ScoreSeeded").withArgs(player.address, 100, 50, now);

    const s = await contract.getScore(player.address);
    expect(s.totalScore).to.equal(100);
    expect(s.highScore).to.equal(50);
    expect(s.lastUpdatedAt).to.equal(now);

    expect(await contract.getTotalScore(player.address)).to.equal(100);
    expect(await contract.getHighScore(player.address)).to.equal(50);
    expect(await contract.getLastUpdated(player.address)).to.equal(now);
  });

  it("seedTotals validates inputs", async function () {
    const { owner, contract } = await deployFixture();
    const now = Math.floor(Date.now() / 1000);
    await expect(
      contract.connect(owner).seedTotals(
        [ethers.ZeroAddress],
        [1],
        [1],
        [now]
      )
    ).to.be.revertedWith("zero player");

    await expect(
      contract.connect(owner).seedTotals(
        [ethers.Wallet.createRandom().address, ethers.Wallet.createRandom().address],
        [1],
        [1],
        [now]
      )
    ).to.be.revertedWith("length mismatch");
  });

  it("rejects expired signatures", async function () {
    const { authorizer, player, contract, chainId } = await deployFixture();
    const deadline = Math.floor(Date.now() / 1000) - 1;
    const nonce = BigInt(1);
    const signature = await signScore(authorizer, contract, chainId, player, 1, deadline, nonce);

    await expect(
      contract.connect(player).submitScore(player.address, 1, deadline, nonce, signature)
    ).to.be.revertedWithCustomError(contract, "ExpiredSignature");
  });

  it("prevents quest completion without active quest", async function () {
    const { authorizer, player, contract, chainId } = await deployFixture();
    const deadline = getDeadline();
    const nonce = BigInt(2);
    const signature = await signQuest(authorizer, contract, chainId, player, 1, deadline, nonce);

    await expect(
      contract.connect(player).completeQuest(player.address, 1, deadline, nonce, signature)
    ).to.be.revertedWithCustomError(contract, "QuestInactive");
  });

  it("allows quest completion with valid signature", async function () {
    const { owner, authorizer, player, contract, chainId } = await deployFixture();
    await contract.connect(owner).setQuest(1, true, "ipfs://quest-1");

    const deadline = getDeadline();
    const nonce = BigInt(3);
    const signature = await signQuest(authorizer, contract, chainId, player, 1, deadline, nonce);
    await expect(
      contract.connect(player).completeQuest(player.address, 1, deadline, nonce, signature)
    ).to.emit(contract, "QuestCompleted");

    expect(await contract.isQuestCompleted(player.address, 1)).to.equal(true);
  });

  it("reports EIP-712 version as 2", async function () {
    const { contract } = await deployFixture();
    const v = await contract.eip712Version();
    expect(v).to.equal("2");
  });

  it("prevents replay with the same signed payload (usedRequests)", async function () {
    const { authorizer, player, contract, chainId } = await deployFixture();
    const deadline = getDeadline();
    const nonce = BigInt(42);
    const signature = await signScore(authorizer, contract, chainId, player, 777, deadline, nonce);

    await expect(
      contract.connect(player).submitScore(player.address, 777, deadline, nonce, signature)
    ).to.emit(contract, "ScoreSubmitted");

    await expect(
      contract.connect(player).submitScore(player.address, 777, deadline, nonce, signature)
    ).to.be.revertedWithCustomError(contract, "Replay");
  });
});
