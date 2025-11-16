#!/usr/bin/env node

import { ethers } from "ethers";
import 'dotenv/config';

/**
 * Production Debug Script
 *
 * Bu script, production environment'taki konfigürasyonun doğru olup olmadığını kontrol eder.
 */

const PRODUCTION_URL = process.env.NEXT_PUBLIC_URL || "https://base-man.vercel.app";
const REGISTRY_ADDRESS = process.env.BASE_MAINNET_REGISTRY_ADDRESS || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;
const SCORE_SIGNER_PK = process.env.SCORE_SIGNER_PRIVATE_KEY || process.env.BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY;
const RPC_URL = process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org";

console.log("🔍 Production Debug Başlatılıyor...\n");

// 1. Backend Signer Address Kontrolü
console.log("1️⃣ Backend Signer Address:");
if (!SCORE_SIGNER_PK) {
  console.error("   ❌ HATA: SCORE_SIGNER_PRIVATE_KEY bulunamadı!");
  process.exit(1);
}
const wallet = new ethers.Wallet(SCORE_SIGNER_PK);
console.log(`   ✅ Backend Signer: ${wallet.address}\n`);

// 2. Contract Authorizer Kontrolü
console.log("2️⃣ Contract Authorizer Address:");
if (!REGISTRY_ADDRESS) {
  console.error("   ❌ HATA: REGISTRY_ADDRESS bulunamadı!");
  process.exit(1);
}
console.log(`   📄 Registry Contract: ${REGISTRY_ADDRESS}`);

const provider = new ethers.JsonRpcProvider(RPC_URL);
const abi = [
  "function authorizer() view returns (address)",
  "function paused() view returns (bool)",
  "function eip712Version() view returns (string)"
];
const contract = new ethers.Contract(REGISTRY_ADDRESS, abi, provider);

try {
  const authorizer = await contract.authorizer();
  console.log(`   ✅ Contract Authorizer: ${authorizer}`);

  if (authorizer.toLowerCase() === wallet.address.toLowerCase()) {
    console.log("   ✅ EŞLEŞME: Backend signer ve contract authorizer aynı!\n");
  } else {
    console.error("   ❌ UYUŞMAZLIK: Backend signer ve contract authorizer farklı!");
    console.error(`      Backend: ${wallet.address}`);
    console.error(`      Contract: ${authorizer}`);
    console.error("\n   🔧 ÇÖZÜM: Contract'taki authorizer'ı güncelleyin:");
    console.error(`      npx hardhat run scripts/set-authorizer.mjs --network base`);
    process.exit(1);
  }
} catch (error) {
  console.error(`   ❌ HATA: Contract okuma hatası: ${error.message}`);
  process.exit(1);
}

// 3. Contract Durumu Kontrolü
console.log("3️⃣ Contract Durumu:");
try {
  const paused = await contract.paused();
  if (paused) {
    console.error("   ❌ HATA: Contract DURDURULMUŞ (paused)!");
    console.error("   🔧 ÇÖZÜM: Contract'ı unpause edin (onlyOwner)");
    process.exit(1);
  } else {
    console.log("   ✅ Contract aktif (not paused)\n");
  }
} catch (error) {
  console.error(`   ⚠️  UYARI: Pause durumu kontrol edilemedi: ${error.message}\n`);
}

// 4. EIP-712 Version Kontrolü
console.log("4️⃣ EIP-712 Version:");
try {
  const version = await contract.eip712Version();
  console.log(`   ✅ Contract EIP-712 Version: ${version}`);

  const envVersion = process.env.REGISTRY_EIP712_VERSION || process.env.NEXT_PUBLIC_REGISTRY_EIP712_VERSION || "2";
  console.log(`   ✅ Environment EIP-712 Version: ${envVersion}`);

  if (version === envVersion) {
    console.log("   ✅ EŞLEŞME: Version'lar uyumlu!\n");
  } else {
    console.warn(`   ⚠️  UYARI: Version uyuşmazlığı (contract: ${version}, env: ${envVersion})\n`);
  }
} catch (error) {
  console.error(`   ⚠️  UYARI: EIP-712 version kontrol edilemedi: ${error.message}\n`);
}

// 5. API Endpoint Testi
console.log("5️⃣ Production API Test:");
console.log(`   📡 Test URL: ${PRODUCTION_URL}/api/score-sign`);

const testPayload = {
  playerAddress: wallet.address,
  score: "1000",
  durationMs: 60000,
  level: 1,
  chain: "base"
};

try {
  const response = await fetch(`${PRODUCTION_URL}/api/score-sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testPayload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`   ❌ HATA: API yanıt vermedi (${response.status})`);
    console.error(`      Yanıt: ${errorText}`);
    process.exit(1);
  }

  const data = await response.json();
  if (!data.signature) {
    console.error("   ❌ HATA: Signature döndürülmedi!");
    console.error(`      Yanıt: ${JSON.stringify(data)}`);
    process.exit(1);
  }

  console.log("   ✅ API başarıyla signature döndürdü");
  console.log(`   📝 Signature: ${data.signature.substring(0, 20)}...`);
  console.log(`   📝 Deadline: ${data.deadline}`);
  console.log(`   📝 Nonce: ${data.nonce || "N/A"}\n`);
} catch (error) {
  console.error(`   ❌ HATA: API isteği başarısız: ${error.message}`);
  process.exit(1);
}

// 6. Environment Variables Özeti
console.log("6️⃣ Environment Variables Özeti:");
console.log(`   REGISTRY_DEFAULT_TARGET: ${process.env.REGISTRY_DEFAULT_TARGET || "❌ YOK"}`);
console.log(`   BASE_MAINNET_REGISTRY_ADDRESS: ${process.env.BASE_MAINNET_REGISTRY_ADDRESS || "❌ YOK"}`);
console.log(`   NEXT_PUBLIC_REGISTRY_ADDRESS: ${process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "❌ YOK"}`);
console.log(`   REGISTRY_EIP712_VERSION: ${process.env.REGISTRY_EIP712_VERSION || "❌ YOK"}`);
console.log(`   NEXT_PUBLIC_REGISTRY_EIP712_VERSION: ${process.env.NEXT_PUBLIC_REGISTRY_EIP712_VERSION || "❌ YOK"}\n`);

console.log("✅ Tüm kontroller başarılı! Production environment doğru konfigüre edilmiş.\n");
console.log("📌 Sorun devam ediyorsa:");
console.log("   1. Vercel Dashboard'da Environment Variables'ları kontrol edin");
console.log("   2. Vercel Function Logs'unda hataları arayın");
console.log("   3. Diğer kullanıcıların browser console loglarını isteyin");
console.log("   4. BaseScan'de failed transaction'ları kontrol edin:");
console.log(`      https://basescan.org/address/${REGISTRY_ADDRESS}\n`);
