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
  const address = pickEnv(["REGISTRY_ADDRESS", "NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS"]) || process.argv[2];
  const initialAuthorizer = pickEnv(["INITIAL_AUTHORIZER"]) || process.argv[3];

  if (!address) throw new Error("Missing registry address (REGISTRY_ADDRESS or argv[2])");
  if (!initialAuthorizer) throw new Error("Missing INITIAL_AUTHORIZER (env or argv[3])");

  console.log("Network:", hre.network.name);
  console.log("Address:", address);
  console.log("Constructor arg (initialAuthorizer):", initialAuthorizer);

  await hre.run("verify:verify", {
    address,
    constructorArguments: [initialAuthorizer]
  });
  console.log("Verification submitted to explorer.");
}

main().catch((err) => {
  console.error("[verify] Error:", err?.message || err);
  process.exit(1);
});

