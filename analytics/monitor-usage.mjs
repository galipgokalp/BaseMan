#!/usr/bin/env node
import "dotenv/config";
import fs from "fs";
import path from "path";
import { CdpClient } from "@coinbase/cdp-sdk";
import { ethers } from "ethers";

const TRACE_ENABLED = (process.env.BASEMAN_ANALYTICS_TRACE_ENABLED ?? "true").toLowerCase() !== "false";
const TRACE_NETWORK = (process.env.BASEMAN_ANALYTICS_TRACE_NETWORK || "base-sepolia").toLowerCase();
const TRACE_WINDOW_BLOCKS = Number.parseInt(
  process.env.BASEMAN_ANALYTICS_TRACE_WINDOW_BLOCKS || "50000",
  10
);
const TRACE_OUTPUT_DIR = process.env.BASEMAN_ANALYTICS_TRACE_OUTPUT_DIR || "artifacts/trace-reports";

function parseArgs(argv) {
  const args = {
    input: process.env.BASEMAN_USEROPS_PATH || "",
    budget: process.env.BASEMAN_MONTHLY_BUDGET_USD
      ? Number(process.env.BASEMAN_MONTHLY_BUDGET_USD)
      : undefined,
    windowDays: Number(process.env.BASEMAN_ANALYTICS_WINDOW_DAYS || 30)
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--input" || token === "-i") {
      args.input = argv[i + 1];
      i += 1;
    } else if (token.startsWith("--input=")) {
      args.input = token.split("=")[1];
    } else if (token === "--budget") {
      args.budget = Number(argv[i + 1]);
      i += 1;
    } else if (token.startsWith("--budget=")) {
      args.budget = Number(token.split("=")[1]);
    } else if (token === "--window-days") {
      args.windowDays = Number(argv[i + 1]);
      i += 1;
    } else if (token.startsWith("--window-days=")) {
      args.windowDays = Number(token.split("=")[1]);
    } else if (token === "--help" || token === "-h") {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`BaseMan Usage Monitor

Kullanım:
  node analytics/monitor-usage.mjs --input <dosya> [--budget <usd>] [--window-days <gün>]

Argümanlar:
  --input, -i         JSON / NDJSON formatında veri dosyası (zorunlu).
  --budget            Aylık paymaster bütçesi (USD).
  --window-days       Analiz penceresi (varsayılan 30).

Çıktı:
  Son ${process.env.BASEMAN_ANALYTICS_WINDOW_DAYS || 30} gün içinde sponsorlu UserOperation sayısı
  ve paymaster maliyet oranı eşik değerleriyle karşılaştırılır.
`);
}

function loadRecords(filePath) {
  const absolute = path.resolve(process.cwd(), filePath);
  const raw = fs.readFileSync(absolute, "utf8").trim();
  if (!raw) {
    return [];
  }

  if (raw.startsWith("[")) {
    return JSON.parse(raw);
  }

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Satır ${index + 1} JSON parse edilemedi: ${error.message}`);
      }
    });
}

function toDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Geçersiz tarih değeri: ${value}`);
  }
  return date;
}

function aggregate(records, windowDays, now = new Date()) {
  const msWindow = windowDays * 24 * 60 * 60 * 1000;
  const windowStart = new Date(now.getTime() - msWindow);

  const filtered = records
    .map((record) => {
      const sponsoredRaw =
        record.sponsoredUserOps ?? record.userOpsSponsored ?? record.sponsored ?? 0;
      const totalRaw = record.totalUserOps ?? record.userOperations ?? record.total ?? sponsoredRaw;
      const paymasterRaw = record.paymasterCostUsd ?? record.costUsd ?? record.cost ?? 0;

      return {
        timestamp: toDate(record.timestamp || record.date || record.time),
        sponsoredUserOps: Number(sponsoredRaw) || 0,
        totalUserOps: Number(totalRaw) || 0,
        paymasterCostUsd: Number(paymasterRaw) || 0
      };
    })
    .filter((record) => record.timestamp >= windowStart && record.timestamp <= now)
    .sort((a, b) => a.timestamp - b.timestamp);

  const totals = filtered.reduce(
    (acc, record) => {
      acc.sponsored += record.sponsoredUserOps;
      acc.total += record.totalUserOps || record.sponsoredUserOps;
      acc.paymaster += record.paymasterCostUsd;
      acc.first = acc.first || record.timestamp;
      acc.last = record.timestamp;
      return acc;
    },
    { sponsored: 0, total: 0, paymaster: 0, first: null, last: null }
  );

  return { filtered, totals, windowStart, windowEnd: now };
}

const TRACE_WINDOW_BLOCKS_SAFE = Number.isFinite(TRACE_WINDOW_BLOCKS) && TRACE_WINDOW_BLOCKS > 0 ? TRACE_WINDOW_BLOCKS : 50000;
let cachedTraceClient;

function normalizeOptionalAddress(value) {
  if (!value || typeof value !== "string") {
    return null;
  }
  try {
    return ethers.isAddress(value) ? ethers.getAddress(value) : null;
  } catch {
    return null;
  }
}

function resolveRegistryAddress(networkId) {
  const normalized = (networkId || "").toLowerCase();
  if (normalized === "base-sepolia") {
    return (
      normalizeOptionalAddress(process.env.BASE_SEPOLIA_REGISTRY_ADDRESS) ||
      normalizeOptionalAddress(process.env.NEXT_PUBLIC_REGISTRY_ADDRESS)
    );
  }
  if (normalized === "base") {
    return normalizeOptionalAddress(process.env.NEXT_PUBLIC_REGISTRY_ADDRESS);
  }
  return normalizeOptionalAddress(process.env.NEXT_PUBLIC_REGISTRY_ADDRESS);
}

function getTraceClient() {
  if (cachedTraceClient) {
    return cachedTraceClient;
  }
  const apiKeyName = process.env.CDP_API_KEY_ID;
  const privateKey = process.env.CDP_API_KEY_SECRET;
  if (!apiKeyName || !privateKey) {
    return null;
  }
  cachedTraceClient = new CdpClient({
    apiKeyName,
    privateKey
  });
  return cachedTraceClient;
}

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function toHex(value) {
  return `0x${value.toString(16)}`;
}

async function exportTraceReport(client, { networkId, registryAddress, windowBlocks }) {
  const rpc = client.rpc({ networkId });
  const latestHex = await rpc.request("eth_blockNumber", []);
  const latest = Number.parseInt(latestHex, 16);
  if (!Number.isFinite(latest)) {
    throw new Error("Unable to resolve latest block number");
  }

  const effectiveWindow = windowBlocks > 0 ? windowBlocks : TRACE_WINDOW_BLOCKS_SAFE;
  const fromBlock = Math.max(0, latest - effectiveWindow);
  const filter = {
    fromBlock: toHex(fromBlock),
    toBlock: toHex(latest),
    toAddress: [ethers.getAddress(registryAddress)]
  };

  const traces = await rpc.request("trace_filter", [filter]);

  const outputDir = path.resolve(process.cwd(), TRACE_OUTPUT_DIR);
  ensureDirectory(outputDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `trace-${networkId}-${timestamp}.json`;
  const outputPath = path.join(outputDir, fileName);

  const metadata = {
    generatedAt: new Date().toISOString(),
    networkId,
    registryAddress: ethers.getAddress(registryAddress),
    fromBlock,
    toBlock: latest,
    windowBlocks: effectiveWindow,
    traceCount: Array.isArray(traces) ? traces.length : 0
  };

  fs.writeFileSync(outputPath, JSON.stringify({ metadata, traces }, null, 2), "utf8");
  return { outputPath, metadata };
}

async function maybeRunTraceAudit({ userOpMet, paymasterMet }) {
  if (!TRACE_ENABLED) {
    return null;
  }
  if (!userOpMet && !paymasterMet) {
    return null;
  }

  const client = getTraceClient();
  if (!client) {
    return {
      skipped: true,
      reason: "missing-cdp-credentials"
    };
  }

  const registryAddress = resolveRegistryAddress(TRACE_NETWORK);
  if (!registryAddress) {
    return {
      skipped: true,
      reason: "missing-registry-address"
    };
  }

  try {
    const { outputPath, metadata } = await exportTraceReport(client, {
      networkId: TRACE_NETWORK,
      registryAddress,
      windowBlocks: TRACE_WINDOW_BLOCKS_SAFE
    });
    return {
      outputPath,
      ...metadata
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.input) {
    printHelp();
    return;
  }

  const now = process.env.BASEMAN_ANALYTICS_NOW
    ? new Date(process.env.BASEMAN_ANALYTICS_NOW)
    : new Date();

  const records = loadRecords(args.input);
  const { filtered, totals, windowStart, windowEnd } = aggregate(records, args.windowDays, now);

  const userOpThreshold = 120000;
  const paymasterThresholdPercent = 35;
  const userOpMet = totals.sponsored >= userOpThreshold;

  let budgetRatio = null;
  let paymasterMet = false;

  if (Number.isFinite(args.budget) && args.budget > 0) {
    budgetRatio = (totals.paymaster / args.budget) * 100;
    paymasterMet = budgetRatio >= paymasterThresholdPercent;
  }

  const summary = {
    windowDays: args.windowDays,
    window: {
      start: windowStart.toISOString(),
      end: windowEnd.toISOString()
    },
    records: filtered.length,
    totals: {
      sponsoredUserOps: totals.sponsored,
      totalUserOps: totals.total,
      paymasterCostUsd: Number(totals.paymaster.toFixed(2)),
      firstRecord: totals.first ? totals.first.toISOString() : null,
      lastRecord: totals.last ? totals.last.toISOString() : null
    },
    thresholds: {
      userOperations: {
        target: userOpThreshold,
        met: userOpMet
      },
      paymasterShare: Number.isFinite(budgetRatio)
        ? {
            budgetUsd: args.budget,
            ratioPercent: Number(budgetRatio.toFixed(2)),
            targetPercent: paymasterThresholdPercent,
            met: paymasterMet
          }
        : null
    }
  };

  const traceAudit = await maybeRunTraceAudit({ userOpMet, paymasterMet });
  if (traceAudit) {
    summary.traceAudit = traceAudit;
    if (traceAudit.outputPath) {
      const traceCount = Number.isFinite(traceAudit.traceCount) ? traceAudit.traceCount : 0;
      console.log(
        `Trace denetimi tetiklendi: ${traceAudit.outputPath} dosyasına ${traceCount.toLocaleString()} kayıt yazıldı.`
      );
    } else if (traceAudit.skipped) {
      console.log(`Trace denetimi atlandı (${traceAudit.reason}).`);
    } else if (traceAudit.error) {
      console.log(`Trace denetimi başarısız: ${traceAudit.error}`);
    }
  }

  console.log("=== BaseMan Appchain Ölçek İzleme ===");
  console.log(
    `Pencere: ${summary.window.start} → ${summary.window.end} (${summary.windowDays} gün, ${summary.records} kayıt)`
  );
  console.log(
    `Sponsorluklu UserOperation: ${summary.totals.sponsoredUserOps.toLocaleString()} / ${userOpThreshold.toLocaleString()} hedef`
  );
  console.log(
    userOpMet
      ? "→ Kullanıcı operasyon eşiği karşılandı; Appchain değerlendirmesi tetiklenmeli."
      : "→ Kullanıcı operasyon eşiği henüz karşılanmadı."
  );

  if (summary.thresholds.paymasterShare) {
    console.log(
      `Paymaster maliyeti: $${summary.totals.paymasterCostUsd.toFixed(
        2
      )} / $${summary.thresholds.paymasterShare.budgetUsd.toFixed(2)} bütçe`
    );
    console.log(
      summary.thresholds.paymasterShare.met
        ? "→ Paymaster bütçe oranı %35 eşiğini aştı; Appchain geçişi gözden geçirilmeli."
        : `→ Paymaster bütçe oranı %${summary.thresholds.paymasterShare.ratioPercent.toFixed(
            2
          )} ile eşiğin altında.`
    );
  } else {
    console.log("Paymaster bütçe bilgisi sağlanmadı; maliyet oranı hesaplanmadı.");
  }

  console.log("\nJSON özeti:");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error("[monitor-usage] Hata:", error.message);
  process.exit(1);
});
