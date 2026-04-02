import { expect } from "chai";

import {
  mapLeaderboardRow,
  parseLeaderboardChainId,
  sanitizeLimit,
  shapeLeaderboardEntry,
  toIsoTimestamp
} from "../api/_lib/leaderboard-shared.js";

describe("leaderboard shared helpers", () => {
  it("normalizes supported chain aliases", () => {
    expect(parseLeaderboardChainId("8453")).to.equal(8453);
    expect(parseLeaderboardChainId("base")).to.equal(8453);
    expect(parseLeaderboardChainId("base-mainnet")).to.equal(8453);
    expect(parseLeaderboardChainId("84532")).to.equal(84532);
    expect(parseLeaderboardChainId("base-sepolia")).to.equal(84532);
    expect(parseLeaderboardChainId("basesepolia")).to.equal(84532);
    expect(parseLeaderboardChainId("unknown")).to.equal(8453);
  });

  it("sanitizes limit with defaults and caps", () => {
    expect(sanitizeLimit(undefined)).to.equal(20);
    expect(sanitizeLimit("0")).to.equal(20);
    expect(sanitizeLimit("-5")).to.equal(20);
    expect(sanitizeLimit("7")).to.equal(7);
    expect(sanitizeLimit("999")).to.equal(100);
  });

  it("maps object and tuple-like rows into normalized leaderboard items", () => {
    const objectRow = mapLeaderboardRow({
      player_address: "0x0000000000000000000000000000000000000001",
      total_score: "1234",
      last_update: 1704067200
    });
    const tupleRow = mapLeaderboardRow([
      "0000000000000000000000000000000000000002",
      "4321",
      1704067300
    ]);

    expect(objectRow).to.deep.equal({
      player: "0x0000000000000000000000000000000000000001",
      totalScore: "1234",
      lastUpdate: 1704067200
    });
    expect(tupleRow).to.deep.equal({
      player: "0x0000000000000000000000000000000000000002",
      totalScore: "4321",
      lastUpdate: 1704067300
    });
  });

  it("shapes final entries with numeric score and ISO timestamp", () => {
    const entry = shapeLeaderboardEntry(
      {
        player: "0x0000000000000000000000000000000000000003",
        totalScore: "9999",
        lastUpdate: 1704067200
      },
      0,
      { fid: "123", username: "alice" }
    );

    expect(entry.rank).to.equal(1);
    expect(entry.playerAddress).to.equal("0x0000000000000000000000000000000000000003");
    expect(entry.totalScore).to.equal(9999);
    expect(entry.lastUpdatedAt).to.equal(toIsoTimestamp(1704067200));
    expect(entry.profile).to.deep.equal({ fid: "123", username: "alice" });
  });
});
