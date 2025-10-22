#!/usr/bin/env node
import { verifyQuestAction } from "./actions/baseman-quest.mjs";
import prompts from "prompts";

async function main() {
  const { player, questId, chain } = await prompts([
    {
      type: "text",
      name: "player",
      message: "Oyuncu adresi (0x...)"
    },
    {
      type: "number",
      name: "questId",
      message: "Kontrol edilecek Quest ID",
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

  const result = await verifyQuestAction.handler({
    params: { player, questId, chain }
  });

  console.log("Sonuç:", result);
}

main().catch((error) => {
  console.error("Hata:", error);
  process.exit(1);
});
