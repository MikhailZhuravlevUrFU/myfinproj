import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("VotingContract", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  const VotingContract = await hre.ethers.getContract<Contract>("VotingContract", deployer);
  console.log("🎉 Contract deployed at:", VotingContract.address);
};

export default deployYourContract;

deployYourContract.tags = ["VotingContract"];
