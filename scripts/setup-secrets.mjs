#!/usr/bin/env node
import fs from "fs";
import path from "path";
import url from "url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const secretsRoot = path.join(ROOT, ".secrets");
const webhooksDir = path.join(secretsRoot, "webhooks");
const sampleSource = path.join(ROOT, "docs", "webhooks", "subscription.sample.json");
const sampleTarget = path.join(webhooksDir, "latest-subscription.sample.json");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Oluşturuldu: ${path.relative(ROOT, dir)}`);
  }
}

function copySample() {
  if (!fs.existsSync(sampleSource)) {
    console.warn(
      "[setup-secrets] subscription.sample.json bulunamadı; docs/webhooks klasörünü kontrol edin."
    );
    return;
  }
  if (fs.existsSync(sampleTarget)) {
    console.log(
      `Atlandı: ${path.relative(ROOT, sampleTarget)} zaten mevcut. Gerçek secret dosyanızı (latest-subscription.json) buraya yerleştirin.`
    );
    return;
  }
  fs.copyFileSync(sampleSource, sampleTarget);
  console.log(
    `Örnek dosya kopyalandı: ${path.relative(
      ROOT,
      sampleSource
    )} -> ${path.relative(ROOT, sampleTarget)}`
  );
  console.log(
    "Gerçek subscription yanıtınızı latest-subscription.json adıyla aynı klasöre kaydedin ve .gitignore sayesinde versiyon kontrolüne girmeyecektir."
  );
}

function main() {
  ensureDir(secretsRoot);
  ensureDir(webhooksDir);
  copySample();
  console.log("Webhook secret klasörü hazır.");
}

main();
