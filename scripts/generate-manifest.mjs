#!/usr/bin/env node
import fs from "fs";
import path from "path";
import url from "url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const WELL_KNOWN_DIR = path.join(ROOT, ".well-known");
const MANIFEST_OUTPUT = path.join(WELL_KNOWN_DIR, "farcaster.json");
const MANIFEST_SOURCE = path.join(ROOT, "config", "manifest.base.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Manifest kaynağı bulunamadı: ${path.relative(ROOT, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureBaseBuilder(manifest) {
  const envAllowed = process.env.BASE_BUILDER_ALLOWED_ADDRESSES;
  if (envAllowed) {
    const addresses = envAllowed
      .split(",")
      .map((addr) => addr.trim())
      .filter(Boolean);
    if (!addresses.length) {
      throw new Error("BASE_BUILDER_ALLOWED_ADDRESSES boş olamaz.");
    }
    manifest.baseBuilder = { allowedAddresses: addresses };
  }

  if (!manifest.baseBuilder?.allowedAddresses?.length) {
    throw new Error("Manifest içinde en az bir baseBuilder.allowedAddresses adresi olmalı.");
  }
}

function ensureAccountAssociation(manifest) {
  const { accountAssociation } = manifest;
  if (!accountAssociation?.header || !accountAssociation?.payload || !accountAssociation?.signature) {
    throw new Error("accountAssociation.header/payload/signature alanlarının tamamı doldurulmalı.");
  }
}

function ensureRequiredChains(manifest) {
  const raw = (process.env.MANIFEST_REQUIRED_CHAINS || "").trim();
  if (!raw) {
    // keep whatever exists in source manifest
    if (!manifest.miniapp || !Array.isArray(manifest.miniapp.requiredChains) || !manifest.miniapp.requiredChains.length) {
      throw new Error(
        "miniapp.requiredChains boş; ya kaynak manifestte tanımlayın ya da MANIFEST_REQUIRED_CHAINS ile belirtin."
      );
    }
    return;
  }
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.length) {
    throw new Error("MANIFEST_REQUIRED_CHAINS boş olamaz.");
  }
  const caip2 = /^eip155:\d+$/;
  for (const v of parts) {
    if (!caip2.test(v)) {
      throw new Error(`Geçersiz CAIP-2 chain tanımı: ${v} (örnek: eip155:84532,eip155:8453)`);
    }
  }
  manifest.miniapp = manifest.miniapp || {};
  manifest.miniapp.requiredChains = parts;
}

async function main() {
  const manifest = readJson(MANIFEST_SOURCE);

  ensureAccountAssociation(manifest);
  ensureBaseBuilder(manifest);
  ensureRequiredChains(manifest);

  fs.mkdirSync(WELL_KNOWN_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_OUTPUT, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  console.log(`Manifest oluşturuldu: ${path.relative(ROOT, MANIFEST_OUTPUT)}`);
}

main().catch((error) => {
  console.error("[MANIFEST] Hata:", error.message);
  process.exit(1);
});
