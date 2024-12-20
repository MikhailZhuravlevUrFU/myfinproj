import { expect } from "chai";
import { ethers } from "hardhat";
import { VotingContract } from "../typechain-types";

describe("VotingContract", function () {
  let votingContract: VotingContract;
  let owner: any;
  let voter1: any;
  let voter2: any;

  before(async () => {
    // Получаем signers для теста
    [owner, voter1, voter2] = await ethers.getSigners();

    // Получаем фабрику контракта
    const votingContractFactory = await ethers.getContractFactory("VotingContract");

    // Деплоим контракт
    const deployedContract = await votingContractFactory.deploy(owner.address);

    // Ожидаем завершения транзакции развертывания
    await deployedContract.deploymentTransaction()?.wait();

    // Присваиваем экземпляр контракта
    votingContract = deployedContract as VotingContract;
  });

  describe("Deployment", function () {
    it("Should deploy with the correct owner", async function () {
      expect(await votingContract.owner()).to.equal(owner.address);
    });
  });

  describe("Voting Management", function () {
    it("Should allow the owner to start voting", async function () {
      await votingContract.startVoting();
      expect(await votingContract.votingActive()).to.equal(true);
    });

    it("Should not allow non-owners to start voting", async function () {
      await expect(
        votingContract.connect(voter1).startVoting()
      ).to.be.revertedWith("Not the Owner");
    });

    it("Should allow the owner to end voting", async function () {
      await votingContract.endVoting();
      expect(await votingContract.votingActive()).to.equal(false);
    });

    it("Should not allow non-owners to end voting", async function () {
      await expect(
        votingContract.connect(voter1).endVoting()
      ).to.be.revertedWith("Not the Owner");
    });
  });

  describe("Candidate Management", function () {
    it("Should allow the owner to add candidates", async function () {
      await votingContract.addCandidate("Candidate 1");
      const candidates = await votingContract.candidates(0);
      expect(candidates.name).to.equal("Candidate 1");
    });

    it("Should not allow non-owners to add candidates", async function () {
      await expect(
        votingContract.connect(voter1).addCandidate("Candidate 2")
      ).to.be.revertedWith("Not the Owner");
    });
  });

  describe("Voting", function () {
    beforeEach(async () => {
      // Проверка состояния голосования перед каждым тестом
      const isVotingActive = await votingContract.votingActive();
      if (!isVotingActive) {
        await votingContract.startVoting();
      }

      // Убедитесь, что пользователь не проголосовал ранее (сброс состояния голосования)
      const hasVoted = await votingContract.hasVoted(voter1.address);
      if (hasVoted) {
        await votingContract.resetVote(voter1.address);  // Теперь эта строка не вызовет ошибку
      }

      // Добавляем кандидата перед каждым тестом
      await votingContract.addCandidate("Candidate 1");
    });

    it("Should allow a user to vote for a candidate", async function () {
      await votingContract.connect(voter1).vote(0);
      const candidate = await votingContract.candidates(0);
      expect(candidate.voteCount).to.equal(1);
    });

    it("Should not allow a user to vote twice", async function () {
      await votingContract.connect(voter1).vote(0);
      await expect(
        votingContract.connect(voter1).vote(0)
      ).to.be.revertedWith("Already voted");
    });

    it("Should allow a user to delegate their vote", async function () {
      await votingContract.connect(voter1).delegateVote(voter2.address);
      const delegate = await votingContract.delegatedVotes(voter1.address);
      expect(delegate).to.equal(voter2.address);
    });

    it("Should not allow a user to delegate vote to themselves", async function () {
      await expect(
        votingContract.connect(voter1).delegateVote(voter1.address)
      ).to.be.revertedWith("Cannot delegate to yourself");
    });

    it("Should not allow a user to delegate vote to someone who has voted", async function () {
      // Проголосовавший делегирует свой голос
      await votingContract.connect(voter1).vote(0);
      await expect(
        votingContract.connect(voter2).delegateVote(voter1.address)
      ).to.be.revertedWith("Delegate already voted");
    });
  });
});
