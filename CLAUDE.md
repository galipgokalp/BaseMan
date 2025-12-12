# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For complete AI agent instructions, architecture documentation, and safety guidelines, see **[AGENTS.md](./AGENTS.md)**.

## Quick Reference

### Key Commands

```bash
npm run dev                    # Start local dev server (port 5173)
npm run game:build             # Build pacman.js from src/*.js files
npm run contracts:test         # Run Hardhat tests
npm run self:check             # Run self-diagnostic checks
npm run healthcheck            # Verify API endpoints and environment
```

### Critical Files (Do Not Modify Without Explicit Instruction)

- `contracts/BaseManRegistry.sol` — On-chain registry (EIP-712 V2)
- `api/score-sign.js` — Signature generation
- `api/_lib/registry.js` — EIP-712 domain configuration

### Project Overview

BaseMan is a Pac-Man arcade game with Base blockchain integration. Key features:

- Classic JavaScript game engine (`pacman.js`)
- EIP-712 V2 signed score submissions
- Farcaster/Base App MiniApp integration
- Coinbase Paymaster for gasless transactions

For detailed documentation, refer to [AGENTS.md](./AGENTS.md).
