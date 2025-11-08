<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Documentation Index](#documentation-index)
  - [Reference Documentation](#reference-documentation)
  - [Analysis & Reports](#analysis--reports)
  - [Guides](#guides)
  - [Common](#common)
  - [Quick Project Setup (Repo)](#quick-project-setup-repo)
  - [Docs Maintenance](#docs-maintenance)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Documentation Index

This folder contains working copies of documentation for Base, Farcaster Mini Apps, and Coinbase Developer Platform (Paymaster). Use this index to navigate and keep content in sync.

## Reference Documentation

Reference documentation files (do not modify, these are external references):

- **Base Mini Apps**: `Base_MiniApps_Docs.md` — merged into a single lossless document.
- **Farcaster Mini Apps**: `Farcaster_MiniApps_Docs.md`
- **CDP Paymaster**: `CDP_Coinbase_Developer_Docs_MiniApp_Paymaster.md`

## Analysis & Reports

Analysis and status reports:

- **Unified Wallet Integration Model**: `UNIFIED_WALLET_INTEGRATION_MODEL.md` — Common wallet integration model for Farcaster and Base App
- **Wallet Integration Compliance**: `WALLET_INTEGRATION_COMPLIANCE.md` — BaseMan's compliance with unified wallet integration model
- **Integration Analysis**: `INTEGRATION_ANALYSIS.md` — Platform integrations, wallet integrations, paymaster, and status report
- **Base App Wallet Connection Guide**: `BASE_APP_WALLET_CONNECTION_GUIDE.md` — Base App wallet connection best practices
- **Passkey Prompt Fix**: `PASSKEY_PROMPT_FIX.md` — Fix for unnecessary passkey prompts in Base App
- **Wallet Connection Status Analysis**: `WALLET_CONNECTION_STATUS_ANALYSIS.md` — Analysis of wallet connection status in mini-apps
- **Code Review Report**: `CODE_REVIEW_REPORT.md` — Code base review with improvement suggestions
- **Mini App Safety Analysis**: `MINI_APP_SAFETY_ANALYSIS.md` — Safety analysis for mini-app improvements
- **InnerHTML Safety Analysis**: `INNERHTML_SAFETY_ANALYSIS.md` — Analysis of innerHTML security improvements

## Guides

Development and debugging guides:

- **User Experience Flow**: `USER_EXPERIENCE_FLOW.md` — Complete user experience flow for wallet-connected users playing the game
- **Score Submission Flow**: `SCORE_SUBMISSION_FLOW.md` — How scores are submitted to the contract
- **Score Submission Debug Guide**: `SCORE_SUBMISSION_DEBUG_GUIDE.md` — Debug guide for score submission issues (why scores don't appear in contract)
- **Mobile Debug Logs Guide**: `MOBILE_DEBUG_LOGS_GUIDE.md` — How to view debug logs in mobile mini-app environments (Farcaster/Base App)
- **Paymaster System Analysis**: `PAYMASTER_SYSTEM_ANALYSIS.md` — Gas fee payment system (paymaster) status and configuration guide
- **Sponsorless Mode Guide**: `SPONSORLESS_MODE_GUIDE.md` — Current sponsorless mode (users pay gas fee) implementation guide
- **Contract Interaction Guide**: `CONTRACT_INTERACTION_GUIDE.md` — **NEW** Contract interaction mechanism integration according to Farcaster and Base App documentation
- **Development Guide**: `DEVELOPMENT_GUIDE.md` — Wallet integration, Wagmi config, troubleshooting, and best practices
- **Debug Guide**: `DEBUG_GUIDE.md` — Console logs access and UI debug procedures
- **UI Design Guide**: `UI_DESIGN_GUIDE.md` — Modern theme design and UI layout recommendations

## Common

Shared documentation:

- **Troubleshooting Index**: `common/troubleshooting.md`
- **Telemetry Index**: `common/telemetry.md`

## Other

Additional documentation:

- **Roadmap**: `ROADMAP.md` — Project roadmap
- **Glossary**: `glossary.md` — Terminology and definitions
- **Environment Example**: `env.example` — Environment variables template

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

- Base dokümanı tek dosyada birleştirilmişti (`Base_MiniApps_Docs.md`).
- Documentation reorganization completed (2025-01-06):
  - 8 analysis files merged into `INTEGRATION_ANALYSIS.md`
  - 3 guide files merged into `DEVELOPMENT_GUIDE.md`
  - 2 debug files merged into `DEBUG_GUIDE.md`
  - 2 design files merged into `UI_DESIGN_GUIDE.md`
  - Old files removed (content preserved in merged files, git history available)
- Başlıkları değiştirirseniz TOC'yi güncelleyin: `npm run docs:toc`.
- Glossary: `docs/glossary.md`; Environment örneği: `docs/env.example`.
