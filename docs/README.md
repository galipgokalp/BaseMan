<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Documentation Index](#documentation-index)
  - [Reference Documentation](#reference-documentation)
  - [Guides](#guides)
  - [Reports](#reports)
  - [Plans](#plans)
  - [Archive](#archive)
  - [Common](#common)
  - [Other](#other)
  - [Quick Project Setup (Repo)](#quick-project-setup-repo)
  - [Docs Maintenance](#docs-maintenance)
  - [Notes](#notes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Documentation Index

This folder contains working copies of documentation for Base, Farcaster Mini Apps, and Coinbase Developer Platform (Paymaster). Use this index to navigate and keep content in sync.

## Reference Documentation

Reference documentation files (do not modify, these are external references):

- **Base Mini Apps**: `vendor/Base_MiniApps_Docs.md` — merged into a single lossless document.
- **Farcaster Mini Apps**: `vendor/Farcaster_MiniApps_Docs.md`
- **CDP Paymaster**: `vendor/CDP_Coinbase_Developer_Docs_MiniApp_Paymaster.md`

## Guides

Development and debugging guides:

- **AI Agent Mechanism**: `guides/AI_AGENT_MECHANISM.md` — AI agent webhook pipeline and analysis flow
- **AI Agent Setup**: `guides/AI_AGENT_SETUP.md` — Local setup and webhook configuration
- **Base App Wallet Connection Guide**: `guides/BASE_APP_WALLET_CONNECTION_GUIDE.md` — Base App wallet connection best practices
- **Contract Interaction Guide**: `guides/CONTRACT_INTERACTION_GUIDE.md` — Contract interaction mechanism integration
- **Debug Guide**: `guides/DEBUG_GUIDE.md` — Console logs access and UI debug procedures
- **Development Guide**: `guides/DEVELOPMENT_GUIDE.md` — Wallet integration, Wagmi config, troubleshooting, and best practices
- **Mobile Debug Logs Guide**: `guides/MOBILE_DEBUG_LOGS_GUIDE.md` — How to view debug logs in mobile mini-app environments (Farcaster/Base App)
- **Neynar API Key Guide**: `guides/NEYNAR_API_KEY_GUIDE.md` — API key setup steps
- **Neynar Free Alternatives**: `guides/NEYNAR_FREE_ALTERNATIVES.md` — Alternative providers overview
- **Paymaster System Analysis**: `guides/PAYMASTER_SYSTEM_ANALYSIS.md` — Gas fee payment system status and configuration guide
- **Score Submission Debug Guide**: `guides/SCORE_SUBMISSION_DEBUG_GUIDE.md` — Why scores don't appear in contract
- **Score Submission Flow**: `guides/SCORE_SUBMISSION_FLOW.md` — How scores are submitted to the contract
- **Sponsorless Mode Guide**: `guides/SPONSORLESS_MODE_GUIDE.md` — Users pay gas fee implementation guide
- **UI Design Guide**: `guides/UI_DESIGN_GUIDE.md` — Theme design and UI layout recommendations
- **Upstash Redis Env Vars**: `guides/UPSTASH_REDIS_ENV_VARS.md` — Redis env configuration
- **User Experience Flow**: `guides/USER_EXPERIENCE_FLOW.md` — Wallet-connected gameplay flow

## Reports

Analysis and status reports:

- **API Endpoints Analysis**: `reports/API_ENDPOINTS_ANALYSIS.md`
- **Code Review Report**: `reports/CODE_REVIEW_REPORT.md`
- **InnerHTML Safety Analysis**: `reports/INNERHTML_SAFETY_ANALYSIS.md`
- **Integration Analysis**: `reports/INTEGRATION_ANALYSIS.md`
- **Keyboard Focus Issue Analysis**: `reports/KEYBOARD_FOCUS_ISSUE_ANALYSIS.md`
- **Leaderboard Profile Fix**: `reports/LEADERBOARD_PROFILE_FIX.md`
- **Leaderboard Profile Test Report**: `reports/LEADERBOARD_PROFILE_TEST_REPORT.md`
- **Mini App Safety Analysis**: `reports/MINI_APP_SAFETY_ANALYSIS.md`
- **Passkey Prompt Fix**: `reports/PASSKEY_PROMPT_FIX.md`
- **Phase 2 Safety Analysis**: `reports/PHASE2_SAFETY_ANALYSIS.md`
- **Profile Mapping Serverless Issue**: `reports/PROFILE_MAPPING_SERVERLESS_ISSUE.md`
- **Unified Wallet Integration Model**: `reports/UNIFIED_WALLET_INTEGRATION_MODEL.md`
- **Wallet Connection Status Analysis**: `reports/WALLET_CONNECTION_STATUS_ANALYSIS.md`
- **Wallet Integration Compliance**: `reports/WALLET_INTEGRATION_COMPLIANCE.md`

## Plans

- **100 Percent Compliance Plan**: `plans/100_PERCENT_COMPLIANCE_PLAN.md`
- **Merge Duplicate Profiles Plan**: `plans/MERGE_DUPLICATE_PROFILES_PLAN.md`
- **Organization Plan**: `plans/ORGANIZATION_PLAN.md`
- **Persistent Profile Storage Plan**: `plans/PERSISTENT_PROFILE_STORAGE_PLAN.md`
- **Roadmap**: `plans/ROADMAP.md`

## Archive

Historical or superseded work artifacts:

- `archive/100_PERCENT_COMPLIANCE_ACHIEVED.md`
- `archive/API_KEY_UPDATE_STATUS.md`
- `archive/BULK_ENDPOINT_SOLUTION.md`
- `archive/FREE_AI_AGENT_SETUP.md`
- `archive/FREE_SOLUTION_IMPLEMENTATION.md`
- `archive/FREE_SOLUTION_PLAN.md`

## Common

Shared documentation:

- **Troubleshooting Index**: `common/troubleshooting.md`
- **Telemetry Index**: `common/telemetry.md`

## Other

Additional documentation:

- **Glossary**: `glossary.md` — Terminology and definitions
- **Environment Reference**: `env/ENV_REFERENCE.md` — Environment variables reference
- **Environment Example**: `../.env.example` — Environment variables template

## Quick Project Setup (Repo)

- Requirements: Node >= 20.17, npm
- Install: `npm install`
- Dev server: `npm run dev` (serves the app locally)
- Optional builds: `npm run ui:build`, `npm run game:build`, `npm run sdk:bundle`
- Contracts: `npm run contracts:compile`, deploy to Base Sepolia: `npm run contracts:deploy:sepolia`
- Manifest/config helpers: `npm run manifest:generate`, `npm run onchain:config`

## Docs Maintenance

- Update Table of Contents: `npm run docs:toc` (generates TOC for all files in `docs/`) or shallow: `npm run docs:toc:shallow`
- Merge H1 duplicates losslessly: `npm run docs:merge` (in-place merge, creates `.bak`)
- Lint/Links/Spell/Format: `npm run docs:verify` and `npm run docs:format`
- Ignore example links: edit `docs/link-ignore.json` to add patterns you want the link checker to skip (placeholders like `your-app.com`, `localhost`, `example.com` are preconfigured).

## Notes

- Base dokumani tek dosyada birlestirilmisti (`vendor/Base_MiniApps_Docs.md`).
- Documentation reorganization completed (2025-01-06):
  - 8 analysis files merged into `INTEGRATION_ANALYSIS.md`
  - 3 guide files merged into `DEVELOPMENT_GUIDE.md`
  - 2 debug files merged into `DEBUG_GUIDE.md`
  - 2 design files merged into `UI_DESIGN_GUIDE.md`
  - Old files removed (content preserved in merged files, git history available)
- Documentation reorganization completed (2025-12-20):
  - Guides moved under `docs/guides/`
  - Reports moved under `docs/reports/`
  - Plans moved under `docs/plans/`
  - Vendor references moved under `docs/vendor/`
  - Historical files archived under `docs/archive/`
- Başlıkları değiştirirseniz TOC'yi güncelleyin: `npm run docs:toc`.
- Glossary: `docs/glossary.md`; Environment ornegi: `.env.example`.
