# BaseMan Engineering Playbook

Date: 2026-04-02
Status: Official working model

This document defines how BaseMan engineering work is planned, implemented, reviewed, and prepared for release.

## 1. Source Order

Use these sources in this order:

1. `README.md` for the human-facing project contract
2. `AGENTS.md` for AI-agent behavior and repository safety constraints
3. `docs/operations/ENGINEERING_PLAYBOOK.md` for execution, review, and release workflow
4. active audit and backlog documents for current priorities

If these documents conflict:

- product/runtime facts default to `README.md`
- AI behavior defaults to `AGENTS.md`
- workflow and review discipline default to this playbook
- unresolved conflicts must be raised explicitly before implementation

## 2. Working Principles

- Prefer small, low-blast-radius changes.
- Do not combine dependency upgrades, behavior changes, and architecture extraction in one PR.
- Preserve contracts before refactoring internals.
- Make runtime truth, docs, and checks converge before feature expansion.
- Default to deterministic verification over intuition.
- Security-sensitive changes are never single-eye merges.

## 3. Default Operating Discipline

- Work in small, reviewable slices and separate runtime/security work from docs/process work.
- Treat production behavior, deployed commit state, endpoint responses, and live logs as first-class evidence.
- For "next step" decisions, prefer the highest-risk unresolved operational issue over new feature work unless the maintainer redirects.
- Use diagnosis-first incident handling:
  1. verify the live symptom
  2. collect direct evidence from logs, timings, and production responses
  3. isolate the root cause before widening the patch
  4. apply the smallest deterministic fix
- When a production-facing fix needs code, env, or deploy changes, treat all three as part of the implementation surface and verify each layer explicitly.
- For mobile MiniApp issues, verify on Farcaster first when it is the primary failing surface.
- For slow or flaky UX paths, prefer stale-first rendering, bounded latency budgets, graceful degradation, and explicit stage timing over clever but opaque behavior.

## 4. Roles

### Implementer

- owns the active change
- reduces ambiguity before editing
- keeps the diff narrow
- runs the required checks
- documents assumptions, risks, and rollback impact

### Reviewer

- validates correctness, regression risk, and contract compatibility
- reviews the claimed check evidence
- challenges missing edge cases and weak assumptions

### Security/Ops Reviewer

- required for sensitive changes
- focuses on auth, paymaster, env policy, endpoint exposure, wallet/provider flow, and release risk

### Maintainer

- decides merge timing
- blocks release-impacting changes without enough evidence
- resolves source-of-truth conflicts between docs and runtime

### AI Agent

- may explore, implement, and verify
- must not self-authorize risky assumptions
- must surface decisions, limits, and residual risks clearly

## 5. Change Classes

Every change must be classified before review.

### `R1` Routine

Examples:

- isolated docs fixes
- low-risk UI cleanup
- test-only improvements
- internal utility cleanup with no contract change

Minimum bar:

- 1 reviewer
- relevant local checks

### `R2` Runtime/Product Affecting

Examples:

- leaderboard behavior
- config resolution
- request/response shape changes
- wallet UX changes

Minimum bar:

- 1 reviewer
- local and relevant integration checks

### `R3` Security/Money Flow Affecting

Examples:

- auth
- paymaster
- EIP-712 request handling
- endpoint exposure policy
- env semantics
- sponsor/bundler behavior

Minimum bar:

- 2 reviewers
- one reviewer must read from security/ops perspective
- local and integration checks required
- rollout and rollback note required

### `R4` Release Blocker / Emergency

Examples:

- production outage fix
- live security response
- release rollback

Minimum bar:

- maintainer approval
- explicit rollback path
- post-change smoke verification

## 6. Default Sensitive Zones

Treat these as `R3` unless explicitly downgraded by a maintainer:

- `contracts/`
- `api/score-sign.js`
- `api/quest-sign.js`
- `api/paymaster-proxy.js`
- `api/_lib/registry.js`
- `api/_lib/miniapp-auth-verify.js`
- wallet/provider orchestration
- env variable meaning changes
- public/internal/dev endpoint exposure

Changes in `contracts/` are not normal PR work. They require explicit instruction, migration planning, and separate rollout handling.

## 7. Standard Delivery Flow

### Step 1: Ground Truth

- inspect the relevant code paths
- inspect existing docs, env references, and tests
- identify which contract is authoritative for the change
- do not ask avoidable questions before exploration

### Step 2: Lock the Decision

- define the goal
- define the success criteria
- define what will not change
- identify the risk class
- identify required reviewers

### Step 3: Implement Narrowly

- keep the write set small
- avoid hidden behavior changes
- preserve public contracts unless the PR explicitly changes them
- when behavior changes, update docs in the same PR

### Step 4: Verify

Run the minimum required checks for the risk class.

Default check set:

- `npm run check:local`
- `npm run check:integration` when runtime behavior or external integrations are touched
- `npm run check:external` when docs or operator references are changed materially

### Step 5: Prepare Review

The PR must state:

- what changed
- why it changed
- risk class
- affected surfaces
- checks run
- residual risks
- rollback note if `R3+`

### Step 6: Merge and Release Prep

- do not merge `R3+` without both required reviews
- re-check release-facing env assumptions before deployment
- if release-impacting, run targeted smoke checks after merge

## 8. Check Matrix

| Change Type | Required Checks |
|-------------|-----------------|
| Docs/index/env reference only | `check:local`, `check:external` |
| UI/internal logic only | `check:local` |
| Runtime API behavior | `check:local`, `check:integration` |
| Auth/paymaster/env policy | `check:local`, `check:integration` |
| Dependency upgrade wave | `check:local`, `check:integration`, `npm audit --omit=dev` |
| Release prep | target-specific smoke and operator sanity checks |

If a check is intentionally skipped, the PR must say why.

## 9. Branch and PR Discipline

- prefer one purpose per branch
- prefer one bounded outcome per PR
- do not hide cleanup inside security work
- do not hide refactor inside dependency work
- do not merge large “misc fixes” PRs

Recommended PR shapes:

- dependency wave
- auth hardening
- paymaster normalization
- docs alignment
- one modularization slice

## 9. Review Standard

Reviewers should check these in order:

1. contract correctness
2. regression risk
3. security/abuse exposure
4. test evidence
5. docs/runtime alignment

Review comments should be concrete:

- bug or risk
- why it matters
- what condition triggers it
- what proof is missing

## 10. AI Agent Discipline

- one main agent owns the critical path
- use at most 2 side agents for bounded, non-overlapping work
- do not let side agents make product or security decisions
- do not run parallel edits against the same file set
- use repo-local truth first; use plugins/connectors for coordination and external context

Allowed AI-heavy tasks:

- code exploration
- bounded refactor
- test gap mapping
- docs/code consistency checks

Human approval is mandatory before merge for:

- `R3` and `R4` work
- contract or env semantic changes
- release-impacting behavior changes

## 11. Release Readiness

Use this lightweight checklist before production-facing rollout:

- target chain and registry are correct
- required secrets exist for the target environment
- public/internal/dev endpoint exposure matches expectation
- auth/paymaster behavior is validated
- docs changed in the PR match shipped behavior

If any of these are uncertain, do not treat the branch as release-ready.

## 12. Current Operating Baseline

Current program direction is defined by:

- `docs/reports/AUDIT_2026-04-02.md`
- `docs/plans/EXECUTION_BACKLOG_90_DAYS.md`

Current priority order:

1. runtime and quality-gate trust
2. production risk burn-down
3. maintainability recovery
4. broader product work

This playbook operationalizes that order. It does not replace it.
