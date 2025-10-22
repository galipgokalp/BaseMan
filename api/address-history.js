import { ethers } from "ethers";
import { z } from "zod";
import { getRegistryContext } from "./_lib/registry.js";
import { assertNetwork } from "./_lib/cdp.js";

const ScoreEvent = "event ScoreSubmitted(address indexed player,uint256 score,uint256 timestamp)";
const QuestEvent = "event QuestCompleted(address indexed player,uint256 indexed questId,uint256 timestamp)";
const iface = new ethers.Interface([ScoreEvent, QuestEvent]);

const ADDRESS_HISTORY_API_KEY = process.env.CDP_ADDRESS_HISTORY_API_KEY?.trim();
const ADDRESS_HISTORY_BASE_URL = (process.env.CDP_ADDRESS_HISTORY_BASE_URL || "https://api.cdp.coinbase.com").replace(
  /\/$/,
  ""
);
const ADDRESS_HISTORY_CACHE_TTL_MS = Number.parseInt(
  process.env.ADDRESS_HISTORY_CACHE_TTL_MS || String(5 * 60 * 1000),
  10
);
const ADDRESS_HISTORY_CACHE_MAX = 128;
const addressHistoryCache = new Map();

const QuerySchema = z.object({
  player: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || ethers.isAddress(value), {
      message: "player must be a valid EVM address"
    })
    .transform((value) => (value ? ethers.getAddress(value) : undefined)),
  network: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value.toLowerCase() : value)),
  fromBlock: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseInt(value, 10) : undefined)),
  toBlock: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseInt(value, 10) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseInt(value, 10) : undefined))
});

function isAddressHistoryApiConfigured(player) {
  return Boolean(player && ADDRESS_HISTORY_API_KEY);
}

function normalizeLimit(limit) {
  if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
    return Math.min(limit, 500);
  }
  return 100;
}

function getCacheKey(network, player, fromBlock, toBlock, limit) {
  return JSON.stringify([network, player || "*", fromBlock ?? null, toBlock ?? null, limit]);
}

function readCache(key) {
  if (!ADDRESS_HISTORY_CACHE_TTL_MS) return null;
  const snapshot = addressHistoryCache.get(key);
  if (!snapshot) return null;
  if (snapshot.expiresAt < Date.now()) {
    addressHistoryCache.delete(key);
    return null;
  }
  return snapshot.value;
}

function writeCache(key, value) {
  if (!ADDRESS_HISTORY_CACHE_TTL_MS) return;
  addressHistoryCache.set(key, {
    value,
    expiresAt: Date.now() + ADDRESS_HISTORY_CACHE_TTL_MS
  });
  if (addressHistoryCache.size > ADDRESS_HISTORY_CACHE_MAX) {
    const iterator = addressHistoryCache.keys();
    const oldestKey = iterator.next().value;
    if (oldestKey) {
      addressHistoryCache.delete(oldestKey);
    }
  }
}

function getProvider(network) {
  const rpcEnv = network === "base" ? process.env.BASE_MAINNET_RPC_URL : process.env.BASE_SEPOLIA_RPC_URL;
  const fallback = process.env.ADDRESS_HISTORY_RPC_URL || process.env.RPC_URL;
  const rpcUrl = rpcEnv || fallback;
  if (!rpcUrl) {
    throw new Error("ADDRESS_HISTORY_RPC_URL or network specific RPC url is required");
  }
  return new ethers.JsonRpcProvider(rpcUrl);
}

async function fetchLogs(provider, registryAddress, topics, fromBlock, toBlock) {
  return provider.getLogs({
    address: registryAddress,
    topics,
    fromBlock,
    toBlock
  });
}

function mapLogEvent(log, event) {
  const base = {
    type: event.name === "ScoreSubmitted" ? "score" : "quest",
    player: event.args.player,
    emittedAt: Number(event.args.timestamp),
    blockNumber: log.blockNumber,
    txHash: log.transactionHash,
    logIndex: log.logIndex
  };

  if (event.name === "ScoreSubmitted") {
    return {
      ...base,
      score: event.args.score.toString()
    };
  }

  return {
    ...base,
    questId: event.args.questId.toString()
  };
}

async function enrichWithBlockTimestamps(provider, items) {
  const blocksToFetch = [...new Set(items.map((item) => item.blockNumber).filter((value) => Number.isInteger(value)))];
  if (!blocksToFetch.length) {
    return items;
  }

  const cache = new Map();

  await Promise.all(
    blocksToFetch.map(async (blockNumber) => {
      const block = await provider.getBlock(blockNumber);
      cache.set(blockNumber, block?.timestamp ? Number(block.timestamp) : null);
    })
  );

  return items.map((item) => ({
    ...item,
    blockTimestamp:
      item.blockTimestamp ??
      (Number.isInteger(item.blockNumber)
        ? cache.get(item.blockNumber) ?? item.blockTimestamp ?? null
        : item.blockTimestamp ?? null)
  }));
}

function filterByPlayer(items, player) {
  if (!player) return items;
  return items.filter((item) => item.player?.toLowerCase() === player.toLowerCase());
}

function sortEventsDescending(items) {
  return [...items].sort((a, b) => {
    const blockA = Number.isFinite(a.blockNumber) ? a.blockNumber : null;
    const blockB = Number.isFinite(b.blockNumber) ? b.blockNumber : null;
    if (blockA !== null && blockB !== null && blockA !== blockB) {
      return blockB - blockA;
    }
    if (blockA !== null && blockB !== null && blockA === blockB) {
      const indexA = Number.isFinite(a.logIndex) ? a.logIndex : 0;
      const indexB = Number.isFinite(b.logIndex) ? b.logIndex : 0;
      return indexB - indexA;
    }
    const emittedA = Number.isFinite(a.emittedAt) ? a.emittedAt : null;
    const emittedB = Number.isFinite(b.emittedAt) ? b.emittedAt : null;
    if (emittedA !== null && emittedB !== null && emittedA !== emittedB) {
      return emittedB - emittedA;
    }
    return 0;
  });
}

function coerceBigIntToString(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  try {
    return BigInt(value).toString();
  } catch {
    return String(value);
  }
}

function mapAddressHistoryApiPayload(payload, registryAddress) {
  const normalizedRegistry = registryAddress?.toLowerCase();
  const rawEvents = Array.isArray(payload?.events)
    ? payload.events
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.items)
    ? payload.items
    : [];

  const items = [];

  for (const entry of rawEvents) {
    const contractAddress =
      entry?.contractAddress ??
      entry?.contract_address ??
      entry?.contract?.address ??
      entry?.details?.contractAddress ??
      entry?.details?.contract_address ??
      "";
    if (normalizedRegistry && contractAddress && contractAddress.toLowerCase() !== normalizedRegistry) {
      continue;
    }

    const eventNameRaw =
      entry?.eventName ??
      entry?.event_name ??
      entry?.eventType ??
      entry?.type ??
      entry?.details?.eventName ??
      entry?.details?.event_name ??
      "";

    const eventName = typeof eventNameRaw === "string" ? eventNameRaw.toLowerCase() : "";

    let type;
    if (eventName.includes("score")) {
      type = "score";
    } else if (eventName.includes("quest")) {
      type = "quest";
    } else {
      continue;
    }

    const args =
      entry?.args ??
      entry?.arguments ??
      entry?.event?.args ??
      entry?.event?.arguments ??
      entry?.attributes ??
      entry?.details?.args ??
      {};

    const playerCandidate =
      args?.player ??
      args?.Player ??
      args?.owner ??
      args?.account ??
      entry?.player ??
      entry?.address ??
      entry?.walletAddress ??
      entry?.subjectAddress;

    if (!playerCandidate || typeof playerCandidate !== "string" || !ethers.isAddress(playerCandidate)) {
      continue;
    }

    const emittedAtCandidate =
      args?.timestamp ??
      args?.time ??
      entry?.timestamp ??
      entry?.time ??
      entry?.blockTimestamp ??
      entry?.block_timestamp ??
      (entry?.occurredAt ? Math.floor(Date.parse(entry.occurredAt) / 1000) : null);
    const emittedAt = Number.isFinite(Number(emittedAtCandidate)) ? Number(emittedAtCandidate) : null;

    const blockNumberCandidate =
      entry?.blockNumber ??
      entry?.block_number ??
      entry?.blockHeight ??
      args?.blockNumber ??
      args?.block_number ??
      null;
    const blockNumber = Number.isFinite(Number(blockNumberCandidate)) ? Number(blockNumberCandidate) : null;

    const logIndexCandidate = entry?.logIndex ?? entry?.log_index ?? args?.logIndex ?? args?.log_index ?? 0;
    const logIndex = Number.isFinite(Number(logIndexCandidate)) ? Number(logIndexCandidate) : 0;

    const txHash = entry?.transactionHash ?? entry?.txHash ?? entry?.transaction_hash ?? null;

    const mapped = {
      type,
      player: ethers.getAddress(playerCandidate),
      emittedAt,
      blockNumber,
      logIndex,
      txHash,
      blockTimestamp: emittedAt
    };

    if (type === "score") {
      mapped.score =
        coerceBigIntToString(args?.score ?? args?.amount ?? args?.value ?? entry?.score ?? entry?.value ?? null) ??
        undefined;
    } else if (type === "quest") {
      mapped.questId =
        coerceBigIntToString(
          args?.questId ?? args?.quest_id ?? args?.questID ?? entry?.questId ?? entry?.quest_id ?? null
        ) ?? undefined;
    }

    items.push(mapped);
  }

  return items;
}

async function fetchFromAddressHistoryApi({
  player,
  networkId,
  limit,
  registryAddress,
  fromBlock,
  toBlock
}) {
  if (!isAddressHistoryApiConfigured(player)) {
    return null;
  }

  const cacheKey = getCacheKey(networkId, player, fromBlock, toBlock, limit);
  const cached = readCache(cacheKey);
  if (cached) {
    return { ...cached, source: "address-history-api", cached: true };
  }

  const url = new URL(`/address-history/v1/wallets/${player}`, ADDRESS_HISTORY_BASE_URL);
  url.searchParams.set("network_id", networkId);
  url.searchParams.set("page_size", String(Math.min(limit, 500)));
  if (registryAddress) {
    url.searchParams.set("contract_address", registryAddress);
    url.searchParams.set("contract_addresses", registryAddress);
  }
  if (Number.isFinite(fromBlock)) {
    url.searchParams.set("start_block", String(fromBlock));
    url.searchParams.set("startBlock", String(fromBlock));
  }
  if (Number.isFinite(toBlock)) {
    url.searchParams.set("end_block", String(toBlock));
    url.searchParams.set("endBlock", String(toBlock));
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ADDRESS_HISTORY_API_KEY}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Address History API responded with ${response.status}`);
  }

  const payload = await response.json();
  const events = mapAddressHistoryApiPayload(payload, registryAddress);
  const result = {
    events,
    nextPageToken:
      payload?.nextPageToken ?? payload?.next_page_token ?? payload?.pagination?.nextPageToken ?? null,
    source: "address-history-api"
  };
  writeCache(cacheKey, result);
  return result;
}

async function fetchFromLogs({
  provider,
  registryAddress,
  fromBlock,
  toBlock
}) {
  const scoreTopic = iface.getEvent("ScoreSubmitted").topicHash;
  const questTopic = iface.getEvent("QuestCompleted").topicHash;

  const [scoreLogs, questLogs] = await Promise.all([
    fetchLogs(provider, registryAddress, [scoreTopic], fromBlock, toBlock),
    fetchLogs(provider, registryAddress, [questTopic], fromBlock, toBlock)
  ]);

  const events = [...scoreLogs, ...questLogs]
    .map((log) => {
      try {
        const parsedLog = iface.parseLog({ topics: log.topics, data: log.data });
        return mapLogEvent(log, parsedLog);
      } catch (error) {
        console.warn("[address-history] Failed to parse log", error);
        return null;
      }
    })
    .filter(Boolean);

  return {
    events,
    source: "registry-logs"
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = QuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() });
  }

  try {
    const { player, network, fromBlock, toBlock, limit } = parsed.data;
    const networkId = assertNetwork(network);
    const registry = getRegistryContext(networkId);
    const limitValue = normalizeLimit(limit);

    const defaultWindow = 20_000;
    const resolvedToBlock = Number.isFinite(toBlock) ? toBlock : null;
    const resolvedFromBlock = Number.isFinite(fromBlock)
      ? fromBlock
      : resolvedToBlock !== null
      ? Math.max(0, resolvedToBlock - defaultWindow)
      : null;

    let timeline = null;
    let provider = null;

    if (isAddressHistoryApiConfigured(player)) {
      try {
        timeline = await fetchFromAddressHistoryApi({
          player,
          networkId,
          limit: limitValue,
          registryAddress: registry.address,
          fromBlock: resolvedFromBlock ?? undefined,
          toBlock: resolvedToBlock ?? undefined
        });
      } catch (error) {
        console.warn("[address-history] Address History API failed, falling back to registry logs:", error);
      }
    }

    if (!timeline) {
      provider = getProvider(networkId);
      timeline = await fetchFromLogs({
        provider,
        registryAddress: registry.address,
        fromBlock: resolvedFromBlock ?? undefined,
        toBlock: resolvedToBlock ?? undefined
      });
    }

    if (!timeline) {
      throw new Error("Unable to build address history timeline");
    }

    const filtered = filterByPlayer(timeline.events, player);
    const sorted = sortEventsDescending(filtered);
    const limited = sorted.slice(0, limitValue);

    if (
      limited.length &&
      limited.some((item) => item.blockTimestamp == null && Number.isInteger(item.blockNumber))
    ) {
      provider = provider || getProvider(networkId);
      const enriched = await enrichWithBlockTimestamps(provider, limited);
      for (let i = 0; i < limited.length; i += 1) {
        limited[i] = enriched[i];
      }
    }

    return res.status(200).json({
      registry: registry.address,
      network: networkId,
      source: timeline.source,
      range: {
        fromBlock: resolvedFromBlock ?? null,
        toBlock: resolvedToBlock ?? null
      },
      totalEvents: filtered.length,
      nextPageToken: timeline.nextPageToken ?? null,
      items: limited
    });
  } catch (error) {
    console.error("[address-history] error", error);
    return res.status(500).json({
      error: "Failed to fetch address history",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
