const hre = require("hardhat");
require("dotenv").config();

function pickEnv(keys = []) {
  for (const k of keys) {
    const v = process.env[k];
    if (v && String(v).trim().length) return String(v).trim();
  }
  return undefined;
}

async function main() {
  const { ethers } = hre;

  // Determine target registry address (prefer explicit, then network-specific, then generic)
  const registryAddress =
    pickEnv(["REGISTRY_ADDRESS", "NEXT_PUBLIC_REGISTRY_ADDRESS", "BASE_SEPOLIA_REGISTRY_ADDRESS", "NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS"]) ||
    process.argv[2];

  if (!registryAddress) {
    throw new Error(
      "Missing registry address. Provide REGISTRY_ADDRESS (or NEXT_PUBLIC_REGISTRY_ADDRESS / BASE_SEPOLIA_REGISTRY_ADDRESS) or pass address as argv[2]."
    );
  }

  const newAuthorizer = pickEnv(["NEW_AUTHORIZER_ADDRESS", "TARGET_AUTHORIZER", "AUTHORIZE_TO", "INITIAL_AUTHORIZER"]) || process.argv[3];
  if (!newAuthorizer) {
    throw new Error(
      "Missing NEW_AUTHORIZER_ADDRESS (or TARGET_AUTHORIZER/AUTHORIZE_TO). You can also pass it as argv[3]."
    );
  }

  if (!ethers.isAddress(registryAddress)) {
    throw new Error(`Invalid registry address: ${registryAddress}`);
  }
  if (!ethers.isAddress(newAuthorizer)) {
    throw new Error(`Invalid new authorizer address: ${newAuthorizer}`);
  }

  const [signer] = await ethers.getSigners();
  const signerAddr = await signer.getAddress();
  console.log("Network:", hre.network.name);
  console.log("Signer:", signerAddr);
  console.log("Registry:", ethers.getAddress(registryAddress));
  console.log("New authorizer:", ethers.getAddress(newAuthorizer));

  // Use BaseManRegistry contract name for setAuthorizer
  const registry = await hre.ethers.getContractAt("BaseManRegistry", registryAddress);

  const owner = await registry.owner();
  if (owner.toLowerCase() !== signerAddr.toLowerCase()) {
    throw new Error(`Signer is not owner. Owner=${owner}, Signer=${signerAddr}`);
  }

  const current = await registry.authorizer();
  console.log("Current authorizer:", current);

  if (current.toLowerCase() === newAuthorizer.toLowerCase()) {
    console.log("Authorizer already set to the requested address. Nothing to do.");
    return;
  }

  console.log("Sending setAuthorizer tx...");
  const tx = await registry.connect(signer).setAuthorizer(newAuthorizer);
  const receipt = await tx.wait();
  console.log("setAuthorizer tx mined:", receipt?.hash || tx?.hash);

  const updated = await registry.authorizer();
  console.log("Updated authorizer:", updated);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[set-authorizer] Error:", err?.message || err);
    process.exit(1);
  });
