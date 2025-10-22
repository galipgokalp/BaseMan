#!/usr/bin/env node
import { verifyScoreAction } from "./actions/baseman-score.mjs";
import prompts from "prompts";

async function main() {
  const { player, claimedScore, chain } = await prompts([
    {
      type: "text",
      name: "player",
      message: "Oyuncu adresi (0x...)"
    },
    {
      type: "number",
      name: "claimedScore",
      message: "Oyuncunun iddia ettiği skor",
      initial: 0
    },
    {
      type: "select",
      name: "chain",
      message: "Hangi zincir?",
      choices: [
        { title: "Base Sepolia (varsayılan)", value: "base-sepolia" },
        { title: "Base Mainnet", value: "base" },
        { title: "Appchain (beta)", value: "appchain" }
      ],
      initial: 0
    }
  ]);

  const result = await verifyScoreAction.handler({
    params: { player, claimedScore, chain }
  });

  console.log("Sonuç:", result);
}

main().catch((error) => {
  console.error("Hata:", error);
  process.exit(1);
});
