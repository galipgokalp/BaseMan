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

async function main() {
  const manifest = readJson(MANIFEST_SOURCE);

  ensureAccountAssociation(manifest);
  ensureBaseBuilder(manifest);

  fs.mkdirSync(WELL_KNOWN_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_OUTPUT, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  console.log(`Manifest oluşturuldu: ${path.relative(ROOT, MANIFEST_OUTPUT)}`);
}

main().catch((error) => {
  console.error("[MANIFEST] Hata:", error.message);
  process.exit(1);
});
