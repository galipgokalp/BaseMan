const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const authorizer = process.env.INITIAL_AUTHORIZER || deployer.address;
  console.log("Authorizer:", authorizer);

  const Factory = await hre.ethers.getContractFactory("BaseManRegistry");
  const contract = await Factory.deploy(authorizer);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("BaseManRegistry deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

