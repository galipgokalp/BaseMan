# Documentation Index

This folder contains working copies of documentation for Base, Farcaster Mini Apps, and Coinbase Developer Platform (Paymaster). Use this index to navigate and keep content in sync.

## Guides
- Base: Base_MiniApps_Docs.md — merged into a single lossless document.
- Farcaster Mini Apps: Farcaster_MiniApps_Docs.md
- CDP Paymaster: CDP_Coinbase_Developer_Docs_MiniApp_Paymaster.md

## Common
- Troubleshooting Index: common/troubleshooting.md
- Telemetry Index: common/telemetry.md

## Quick Project Setup (Repo)
- Requirements: Node >= 20.17, npm
- Install: `npm install`- Dev server:`npm run dev`(serves the app locally)
- Optional builds:`npm run ui:build`, `npm run game:build`, `npm run sdk:bundle`- Contracts:`npm run contracts:compile`, deploy to Base Sepolia: `npm run contracts:deploy:sepolia`- Manifest/config helpers:`npm run manifest:generate`, `npm run onchain:config`## Docs Maintenance
- Update Table of Contents:`npm run docs:toc`(generates TOC for all files in`docs/`) or shallow: `npm run docs:toc:shallow`- Merge H1 duplicates losslessly:`npm run docs:merge`(in-place merge, creates`.bak`)
- Lint/Links/Spell/Format: `npm run docs:verify`and`npm run docs:format`- Ignore example links: edit`docs/link-ignore.json`to add patterns you want the link checker to skip (placeholders like`your-app.com`, `localhost`, `example.com` are preconfigured).

Notes
- Base dokümanı tek dosyada birleştirilmiştir (`Base_MiniApps_Docs.md`).
- Başlıkları değiştirirseniz TOC’yi güncelleyin: `npm run docs:toc`.
- Glossary: `docs/glossary.md`; Environment örneği: `docs/env.example`.
