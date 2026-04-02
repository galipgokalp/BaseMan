# BaseMan 90-Day Execution Backlog

Date: 2026-04-02
Basis: [Audit 2026-04-02](/home/galip/BaseMan/docs/reports/AUDIT_2026-04-02.md)

## Goal

Bring BaseMan from "recoverable but maintenance-fragile" to "stable, supportable, and safe to iterate on".

This backlog is intentionally ordered by operational leverage:

1. restore trust in runtime and checks
2. reduce production risk
3. recover maintainability
4. only then resume broader product work

## Success Criteria After 90 Days

- There is a reliable, repeatable local and CI quality gate.
- Production dependency advisories are triaged and reduced to an accepted minimum.
- Multi-chain behavior is either explicitly supported or explicitly removed from the user-facing contract.
- API inventory, README, env docs, and operational docs match the code.
- `onchain-client` and `leaderboard` no longer act as monolithic change traps.

## Phase 1: Days 1-14

### Epic A: Runtime and Quality Gate Stabilization

#### A1. Pin runtime
- Add a single source of truth for Node version.
- Align local setup, CI, and contributor docs on Node `20.x`.
- Acceptance:
- `node -v` mismatch is caught early.
- Maintainers have one documented way to enter the correct runtime.

#### A2. Split quality gates
- Separate checks into:
- `check:local` for hermetic checks
- `check:integration` for local-server or env-backed flows
- `check:external` for live docs and third-party reachability
- Remove `docs:links` from the default hermetic gate.
- Acceptance:
- A maintainer can run one command that does not require a dev server or public internet.
- Integration failures are clearly distinguishable from local code regressions.

#### A3. Rebuild API inventory from code
- Document every top-level `api/*.js` file as one of:
- public runtime API
- internal ops API
- dev/test-only API
- Update README and env/docs references accordingly.
- Acceptance:
- README endpoint list matches actual code.
- Each endpoint has an owner category and expected deployment status.

### Epic B: Product Contract Clarification

#### B1. Decide leaderboard chain policy
- Choose one of:
- mainnet-only leaderboard
- environment-driven chain selection
- true multi-chain leaderboard support
- Reflect that decision in UI, docs, and tests.
- Acceptance:
- No user-facing doc claims behavior the UI does not implement.
- One configuration path defines leaderboard chain behavior.

## Phase 2: Days 15-35

### Epic C: Dependency and Security Burn-Down

#### C1. Patch/minor upgrade wave
- Upgrade direct runtime dependencies conservatively first:
- `@coinbase/cdp-sdk`
- `@farcaster/miniapp-sdk`
- `@farcaster/miniapp-wagmi-connector`
- `viem`
- `zod`
- `@upstash/redis`
- Acceptance:
- `npm audit --omit=dev` is re-run after each wave.
- Regressions are checked against score signing, leaderboard fetch, and wallet connection.

#### C2. Advisory reachability review
- Classify audit findings into:
- reachable in production
- only transitive / low exposure
- mitigated by deployment topology
- Acceptance:
- Each remaining advisory has a written disposition.
- No unresolved high advisory remains without an explicit rationale.

### Epic D: Auth and Paymaster Hardening

#### D1. Reduce Mini App auth failure-path noise
- Make detailed JWKS diagnostics opt-in or sampled.
- Remove extra verification-path network fetches from default failure handling.
- Acceptance:
- Failed auth requests do not trigger unnecessary secondary network probes by default.
- Error logs still preserve enough context for debugging.

#### D2. Normalize paymaster proxy request contract
- Align CORS, preflight, supported headers, and documentation.
- Confirm whether header override behavior is still a supported operational feature.
- Acceptance:
- Preflight behavior matches actual accepted request headers.
- Browser-based and scripted probes behave consistently.

## Phase 3: Days 36-65

### Epic E: Monolith Reduction Without Behavioral Change

#### E1. Split `src/onchain-client.js`
- Extract:
- runtime/platform detection
- wallet/provider orchestration
- score submission transport
- quest submission transport
- telemetry hooks
- Keep the public `window.BaseManOnchain` contract stable.
- Acceptance:
- No user-facing behavior regression in score submission flows.
- Main module becomes an orchestrator, not an implementation sink.

#### E2. Split `api/leaderboard.js`
- Extract:
- source selection
- SQL query execution
- RPC fallback
- profile enrichment
- caching and rate limiting
- Acceptance:
- Endpoint response shape remains stable.
- Fallback behavior is testable in isolation.

#### E3. Reduce panel/UI duplication
- Consolidate repeated panel mechanics and shared helpers.
- Avoid large visual rewrites in this phase.
- Acceptance:
- Shared panel behavior has one source of truth.
- No UX or accessibility regressions are introduced.

## Phase 4: Days 66-90

### Epic F: Documentation and Ops Recovery

#### F1. Rebuild docs automation
- Reclassify docs link checks into:
- dead
- moved
- temporarily unreachable
- intentionally ignored
- Add domain-aware exceptions for known anti-bot or unstable sources.
- Acceptance:
- `docs:links` output is actionable instead of noisy.
- CI can distinguish true docs rot from transient network noise.

#### F2. Refresh operator documentation
- Update:
- README
- env reference
- development guide
- debug guide
- mini app operational notes
- Remove or archive stale analysis docs that contradict current code.
- Acceptance:
- A new maintainer can boot, inspect, and debug the project using current docs only.

### Epic G: Regression Coverage Upgrade

#### G1. Add high-value integration tests
- Cover:
- score-sign happy path and validation failures
- miniapp-auth request contract
- paymaster-proxy allowlist behavior
- leaderboard response behavior for the chosen chain policy
- Acceptance:
- Core API risk areas have test coverage beyond the contract suite.
- At least one integration gate runs without manual inspection.

## Prioritized Task Order

If capacity is limited, do the work in this exact order:

1. Runtime pinning
2. Quality gate separation
3. API inventory and README correction
4. Leaderboard chain decision
5. Dependency patch/minor upgrades
6. Auth failure-path simplification
7. Paymaster proxy normalization
8. `onchain-client` decomposition
9. `leaderboard` decomposition
10. Docs automation cleanup

## Delivery Model

Use short, low-blast-radius PRs.

- PR 1: Node/runtime pinning + check split
- PR 2: README/API inventory alignment
- PR 3: leaderboard chain policy alignment
- PR 4-6: dependency upgrade waves
- PR 7: miniapp-auth hardening
- PR 8: paymaster-proxy normalization
- PR 9+: modularization slices

Avoid combining dependency upgrades, architecture extraction, and behavior changes in the same PR.

## Exit Criteria

This backlog is complete when:

- The default check is deterministic.
- Production risk items from the audit are either fixed or explicitly accepted.
- The project contract is coherent across code, docs, and runtime.
- New work can be planned without first re-auditing the repo.

