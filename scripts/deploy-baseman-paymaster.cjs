const hre = require("hardhat");

  const ENTRY_POINT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

  async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    const Paymaster = await hre.ethers.getContractFactory("BasePaymaster");
    const paymaster = await Paymaster.deploy(ENTRY_POINT);
    await paymaster.waitForDeployment();

    console.log("BasePaymaster deployed to:", await paymaster.getAddress());
  }

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });