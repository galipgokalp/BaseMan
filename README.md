# BaseMan

**BaseMan** is a production-ready, on-chain Pac-Man style arcade game integrated with the **Base** blockchain and **Farcaster MiniApps**. Players compete globally, submit scores on-chain, and interact seamlessly through Base App and Farcaster mobile applications.

## Onboarding Router

- README.md is the human-facing constitution and project overview.
- AGENTS.md is the AI-agent constitution: [AGENTS.md](./AGENTS.md)
- Engineering workflow and review model: [docs/operations/ENGINEERING_PLAYBOOK.md](./docs/operations/ENGINEERING_PLAYBOOK.md)
- Dev setup: [docs/guides/DEVELOPMENT_GUIDE.md](./docs/guides/DEVELOPMENT_GUIDE.md)
- Debug: [docs/guides/DEBUG_GUIDE.md](./docs/guides/DEBUG_GUIDE.md)
- Env reference: [docs/env/ENV_REFERENCE.md](./docs/env/ENV_REFERENCE.md)
- Docs index: [docs/README.md](./docs/README.md)

---

## Table of Contents

- [Introduction](#introduction--what-is-baseman)
- [Key Features](#key-features)
- [MiniApp Overview](#miniapp-overview-base-app--farcaster-integration)
- [Architecture Overview](#architecture-overview)
- [Quickstart](#quickstart-local-development)
- [Environment Variables](#environment-variables)
- [Smart Contract Details](#smart-contract-details)
- [Score Submission Flow](#score-submission-flow)
- [Leaderboard System](#leaderboard-system)
- [MiniApp Authentication](#miniapp-authentication)
- [Paymaster Integration](#paymaster-integration)
- [Development Scripts](#development-scripts)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)
- [Appendix: Full Game Engine Module Reference](#appendix-full-game-engine-module-reference)
- [License](#license)

---

## Introduction — What is BaseMan?

BaseMan is a fully functional Pac-Man arcade game that combines classic gameplay with modern blockchain technology. Built specifically for the Base ecosystem, it enables players to:

- **Play authentic Pac-Man gameplay** with accurate physics, ghost AI, and arcade mechanics
- **Submit scores on-chain** to Base Mainnet (8453) or Base Sepolia (84532)
- **Compete on a global leaderboard** with real-time rankings and profile enrichment
- **Authenticate seamlessly** via Farcaster Quick Auth or Base App wallet integration
- **Experience gasless transactions** through CDP Paymaster integration (configurable)

The game runs as a **MiniApp** within Farcaster and Base App mobile applications, providing a native mobile gaming experience with automatic wallet connection and zero-friction onboarding.

---

## Key Features

### 🎮 Game Features

- **Multiple Game Modes**: Pac-Man, Ms. Pac-Man, Cookie-Man, and Crazy Otto
- **Turbo Mode**: High-speed gameplay variant
- **Practice Mode**: Slow-motion, rewind, and invincibility options
- **Learn Mode**: Visualize ghost AI behavior patterns
- **Resolution-Independent**: Scales perfectly to any screen size
- **Touch Controls**: Full mobile swipe support

### ⛓️ Blockchain Features

- **On-Chain Score Storage**: All scores permanently recorded on Base blockchain
- **EIP-712 v2 Signing**: Secure, replay-protected score submissions
- **Gasless Transactions**: Optional Paymaster integration for sponsored transactions
- **Smart Contract Registry**: `BaseManRegistry.sol` manages scores and quests
- **Multi-Chain Support**: Base Mainnet and Base Sepolia

### 📊 Leaderboard Features

- **Global Rankings**: Real-time leaderboard with total score aggregation
- **Profile Enrichment**: Farcaster profile integration (avatar, username, display name)
- **Redis Caching**: Persistent profile storage for fast lookups
- **CDP SQL API**: Primary data source with RPC fallback
- **Search Functionality**: Find players by username, display name, or address

### 🔐 Security Features

- **Replay Protection**: Nonce-based request deduplication
- **Signature Verification**: EIP-712 v2 typed data signing
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive score and quest validation
- **Authorizer Pattern**: Backend-controlled score signing authority

---

## MiniApp Overview (Base App + Farcaster Integration)

BaseMan is designed as a **MiniApp** that runs natively within:

- **Farcaster Mobile App**: Full integration with Farcaster SDK
- **Base App**: Native Base ecosystem MiniApp support

### MiniApp Capabilities

- **Automatic Wallet Connection**: Uses existing accounts when the host provides them; transactions may still require user approval
- **Seamless Authentication**: Quick Auth integration for instant access
- **Native UI Integration**: Bottom navigation, panels, and modals
- **Webhook Support**: Real-time event handling via `/api/miniapp-webhook`
- **Manifest-Driven**: Configuration via `config/manifest.base.json`

### Manifest Configuration

The MiniApp manifest is generated from `config/manifest.base.json` and includes:

- **Account Association**: Farcaster domain verification
- **Base Builder**: Analytics and allowed addresses
- **Content Security Policy**: Strict resource loading rules
- **Required Chains**: Base Mainnet (8453) and Base Sepolia (84532)
- **Required Capabilities**: `actions.ready`, `wallet.getEthereumProvider`

Generate the manifest:

```bash
npm run manifest:generate
```

This creates `.well-known/farcaster.json` used by Farcaster and Base App platforms.

---

## Architecture Overview

BaseMan follows a modular architecture with clear separation between game logic, blockchain integration, and API services.

### Game Engine Layer

**Location**: `src/` directory, bundled into `pacman.js`

**Key Modules**:
- `src/game.js` - Core game loop and state management
- `src/Actor.js` - Base class for game entities
- `src/Ghost.js` - Ghost AI implementation
- `src/Player.js` - Player control and movement
- `src/Map.js` - Maze generation and collision detection
- `src/executive.js` - Game state orchestration
- `src/hud.js` - Heads-up display and UI overlays

**Build Process**:
```bash
npm run game:build  # Bundles src/*.js → pacman.js
```

### UI Layer

**Components**:
- `src/leaderboard-panel.js` - Leaderboard display and search
- `src/profile-panel.js` - User profile and on-chain stats
- `src/wallet-panel.js` - Wallet connection status
- `src/bottom-nav.js` - Mobile navigation bar
- `src/ui/connect-menu-v2.jsx` - React-based connection UI

**Styling**:
- `styles/main.css` - Core game styles
- `styles/modern-theme.css` - Modern UI theme
- `styles/panels.css` - Panel-specific styles

### API Layer

**Location**: `api/` directory (Vercel Serverless Functions)

**Public Runtime APIs**:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/leaderboard` | GET | Global leaderboard with profile enrichment |
| `/api/score-sign` | POST | EIP-712 v2 score signature generation |
| `/api/quest-sign` | POST | Quest completion signature generation |
| `/api/miniapp-auth` | POST | MiniApp authentication token verification |
| `/api/paymaster-proxy` | POST | Paymaster transaction sponsorship |
| `/api/address-history` | GET | On-chain transaction history |
| `/api/token-balances` | GET | ERC-20 token balance queries |
| `/api/app-log` | POST | Client error logging and telemetry ingestion |

**Internal / Ops / Dev Endpoints**:

| Endpoint | Method | Visibility | Purpose |
|----------|--------|------------|---------|
| `/api/miniapp-webhook` | POST | Internal/Ops | Farcaster webhook handler; production requires server-side secret configuration |
| `/api/ai-agent-webhook` | POST | Internal/Ops | AI agent automation webhook; production requires shared-secret protection |
| `/api/env` | GET | Internal/Ops | Runtime environment inspection |
| `/api/test-redis` | GET | Dev/Test | Redis connectivity diagnostics; production default-deny |

**Supporting Libraries**:
- `api/_lib/registry.js` - Smart contract interaction utilities
- `api/_lib/farcaster-profiles.js` - Neynar API integration
- `api/_lib/redis-profiles.js` - Redis profile caching
- `api/_lib/miniapp-auth-verify.js` - Quick Auth verification
- `api/_lib/cdp.js` - CDP SDK integration

### On-chain Layer (Contract Design)

**Smart Contract**: `contracts/BaseManRegistry.sol`

**Key Properties**:

```solidity
struct Score {
    uint256 highScore;      // Best single-run score
    uint256 totalScore;     // Cumulative score across all runs
    uint256 lastUpdatedAt;  // Timestamp of last update
}

mapping(address => Score) private _scores;
mapping(bytes32 => bool) public usedRequests;  // Replay protection
address public authorizer;  // Backend signer address
bool public paused;  // Emergency pause mechanism
```

**Functions**:
- `submitScore()` - Submit a new score with EIP-712 v2 signature
- `completeQuest()` - Mark a quest as completed
- `getScore(address)` - Query player's score data
- `setAuthorizer(address)` - Update backend signer (owner only)
- `pause() / unpause()` - Emergency controls (owner only)

**Events**:
- `ScoreSubmitted` - Emitted when high score is broken
- `ScoreAdded` - Emitted on every score submission
- `QuestCompleted` - Emitted when quest is completed

### Data Flow Diagram

```
┌─────────────────┐
│  Mobile App     │
│  (Farcaster/    │
│   Base App)     │
└────────┬─────────┘
         │
         │ SDK Context
         ▼
┌─────────────────┐
│  Frontend       │
│  (index.html)   │
│  - Game Engine  │
│  - UI Panels    │
└────────┬─────────┘
         │
         │ HTTP/JSON
         ▼
┌─────────────────┐      ┌──────────────────┐
│  API Layer      │◄─────►│  External APIs   │
│  (Vercel)       │      │  - Neynar API    │
│  - score-sign   │      │  - CDP SQL API   │
│  - leaderboard  │      │  - Redis Cache   │
│  - paymaster    │      └──────────────────┘
└────────┬─────────┘
         │
         │ EIP-712 v2
         │ Signature
         ▼
┌─────────────────┐
│  Smart Contract │
│  BaseManRegistry│
│  (Base Chain)   │
└─────────────────┘
         │
         │ Events
         ▼
┌─────────────────┐
│  CDP SQL API    │
│  (Indexing)     │
└─────────────────┘
```

---

## Quickstart (Local Development)

### Prerequisites

- **Node.js**: Version 20.x (see `package.json` engines)
- **npm**: Version 9.x or later
- **Git**: For cloning the repository
- **nvm** (recommended): Use `.nvmrc` to enter the supported Node runtime quickly

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/galipgokalp/BaseMan.git
cd BaseMan
```

2. **Install dependencies**:
```bash
nvm use              # Recommended: picks Node 20 from .nvmrc
npm install
```

3. **Build the game bundle**:
```bash
npm run game:build
```

This creates `pacman.js` from source files in `src/`.

4. **Set up environment variables**:
```bash
cp .env.example .env  # If .env.example exists
# Or create .env manually with required variables (see Environment Variables section)
```

5. **Start the development server**:
```bash
npm run dev
```

6. **Access the application**:
```
http://localhost:5173
```

### Development Workflow

- **Game Development**: Edit files in `src/`, then run `npm run game:build`
- **API Development**: Edit files in `api/`, changes hot-reload in dev server
- **Contract Development**: Use Hardhat scripts (see `package.json` scripts)

### Testing

Run the test suite:

```bash
npm run check:local     # Hermetic local gate: config + docs lint/spell + lint + tests
npm run check:integration # Starts/reuses local dev server and runs env-backed integration checks
npm run check:external  # Live docs-link validation
npm run test:all        # Aggregate: local + integration + external
npm run test:phase5     # Phase 5 tests
npm run test:phase6     # Phase 6 tests
npm run self:check      # Self-check validation
```

---

## Environment Variables

BaseMan requires comprehensive environment configuration for blockchain integration, API services, and MiniApp functionality.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REGISTRY_DEFAULT_TARGET` | Default registry network (`base` or `base-sepolia`) | `base` |
| `REGISTRY_CHAIN_ID` | Default chain ID for registry | `8453` (Base Mainnet) |
| `BASE_SEPOLIA_REGISTRY_CHAIN_ID` | Base Sepolia chain ID | `84532` |
| `BASE_MAINNET_REGISTRY_ADDRESS` | BaseManRegistry address on Mainnet | `0x...` |
| `BASE_SEPOLIA_REGISTRY_ADDRESS` | BaseManRegistry address on Sepolia | `0x...` |
| `NEXT_PUBLIC_REGISTRY_ADDRESS` | Active registry address exposed to client | `0x...` |
| `NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS` | Base Mainnet registry address (client) | `0x...` |
| `NEXT_PUBLIC_BASE_SEPOLIA_REGISTRY_ADDRESS` | Base Sepolia registry address (client) | `0x...` |
| `BASE_MAINNET_RPC_URL` | RPC endpoint for Base Mainnet | `https://mainnet.base.org` |
| `BASE_SEPOLIA_RPC_URL` | RPC endpoint for Base Sepolia | `https://sepolia.base.org` |
| `CDP_API_KEY_ID` | CDP API key identifier | `your-key-id` |
| `CDP_API_KEY_SECRET` | CDP API key secret | `your-key-secret` |
| `PAYMASTER_SERVICE_URL` | Paymaster service URL (server proxy target) | `https://api.developer.coinbase.com/rpc/v1/base/...` |
| `NEXT_PUBLIC_PAYMASTER_URL` | Paymaster URL exposed to client | `/api/paymaster-proxy` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | `https://...redis.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | `your-token` |
| `MINIAPP_APP_ID` | Farcaster MiniApp app ID | `your-app-id` |
| `MINIAPP_WEBHOOK_SECRET` | Webhook secret for verification | `your-secret` |
| `NEXT_PUBLIC_BASE_URL` | Public base URL of deployment | `https://base-man.vercel.app` |
| `NEXT_PUBLIC_BASEMAN_ENV` | Environment identifier | `production` or `development` |
| `NEXT_PUBLIC_CDP_API_BASE_URL` | CDP API base URL | `https://api.cdp.coinbase.com` |

Registry address notes:
- Set server-side addresses via `BASE_MAINNET_REGISTRY_ADDRESS` and `BASE_SEPOLIA_REGISTRY_ADDRESS`.
- Set client-side addresses via `NEXT_PUBLIC_REGISTRY_ADDRESS` (active) plus `NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS` and `NEXT_PUBLIC_BASE_SEPOLIA_REGISTRY_ADDRESS` for UI/runtime detection.

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CDP_SQL_API_KEY` | CDP SQL API key for leaderboard | (empty) |
| `CDP_SQL_API_BASE_URL` | CDP SQL API base URL | `https://api.cdp.coinbase.com` |
| `CDP_PAYMASTER_URL` | CDP paymaster endpoint (server-side SDK) | (empty) |
| `NEYNAR_API_KEY` | Neynar API key for profile enrichment | (empty) |
| `FARCASTER_PROFILE_PROVIDER` | Profile provider (`neynar` or `none`) | (empty) |
| `PAYMASTER_ENFORCE_ALLOWLIST` | Enforce paymaster allowlist | `true` |
| `LEADERBOARD_DISABLE_PROFILE_ENRICHMENT` | Disable profile enrichment | `false` |
| `LEADERBOARD_RPC_URL` | Custom RPC for leaderboard fallback | (uses chain defaults) |
| `LEADERBOARD_FALLBACK_WINDOW_BLOCKS` | RPC fallback window size | `50000` |
| `LEADERBOARD_FALLBACK_CHUNK_SIZE` | RPC fallback chunk size | `400` |
| `SCORE_SIGNER_PRIVATE_KEY` | Backend signer private key | (required for score-sign) |
| `BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY` | Sepolia-specific signer | (optional) |

### Example `.env` File

```bash
# Chain Configuration
REGISTRY_DEFAULT_TARGET=base
REGISTRY_CHAIN_ID=8453
BASE_SEPOLIA_REGISTRY_CHAIN_ID=84532
BASE_MAINNET_REGISTRY_ADDRESS=0x2fd9492E5f0F9559152bB5d4d23843072bCF17E2
BASE_SEPOLIA_REGISTRY_ADDRESS=0x3c52dEd86f9E56663cA680D773B64f8f62380cBc
NEXT_PUBLIC_REGISTRY_ADDRESS=0x2fd9492E5f0F9559152bB5d4d23843072bCF17E2
NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS=0x2fd9492E5f0F9559152bB5d4d23843072bCF17E2
NEXT_PUBLIC_BASE_SEPOLIA_REGISTRY_ADDRESS=0x3c52dEd86f9E56663cA680D773B64f8f62380cBc

# RPC Endpoints
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# CDP Configuration
CDP_API_KEY_ID=your-cdp-key-id
CDP_API_KEY_SECRET=your-cdp-key-secret
PAYMASTER_SERVICE_URL=https://api.developer.coinbase.com/rpc/v1/base/...
NEXT_PUBLIC_PAYMASTER_URL=/api/paymaster-proxy
CDP_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base/...
CDP_SQL_API_KEY=your-sql-api-key
CDP_SQL_API_BASE_URL=https://api.cdp.coinbase.com
NEXT_PUBLIC_CDP_API_BASE_URL=https://api.cdp.coinbase.com

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# MiniApp Configuration
MINIAPP_APP_ID=your-farcaster-app-id
MINIAPP_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_BASE_URL=https://base-man.vercel.app
NEXT_PUBLIC_BASEMAN_ENV=production

# Profile Enrichment (Optional)
NEYNAR_API_KEY=your-neynar-api-key
FARCASTER_PROFILE_PROVIDER=neynar

# Backend Signer (Required for score-sign endpoint)
SCORE_SIGNER_PRIVATE_KEY=0x...
BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY=0x...

# Paymaster Settings
PAYMASTER_ENFORCE_ALLOWLIST=true
```

### Environment Variable Security

- **Never commit `.env` files** to version control
- **Use Vercel Environment Variables** for production deployments
- **Rotate secrets regularly**, especially signer private keys
- **Use separate signer keys** for Mainnet and Sepolia
- **Restrict CDP API keys** to required permissions only

---

## Smart Contract Details

### BaseManRegistry.sol Overview

The `BaseManRegistry` contract is the on-chain storage layer for all game scores and quest completions. It uses **EIP-712 v2** typed data signing for secure, replay-protected submissions.

**Contract Addresses**:
- **Base Mainnet**: `0x2fd9492E5f0F9559152bB5d4d23843072bCF17E2`
- **Base Sepolia**: `0x3c52dEd86f9E56663cA680D773B64f8f62380cBc` (example)

### Score Model

Each player's score is stored as a `Score` struct:

```solidity
struct Score {
    uint256 highScore;      // Best single-run score (personal best)
    uint256 totalScore;     // Cumulative score (sum of all runs)
    uint256 lastUpdatedAt;  // Unix timestamp of last update
}
```

**Score Tracking Logic**:
- **High Score**: Updated only when a new single-run score exceeds the previous best
- **Total Score**: Incremented by the run score on every submission
- **Last Updated**: Set to `block.timestamp` on each submission

### EIP-712 v2 Signing Flow

BaseMan uses **EIP-712 v2** (nonce-based) for all score and quest submissions. This provides:

- **Replay Protection**: Each request includes a unique nonce
- **Expiration**: Deadlines prevent stale signatures
- **Type Safety**: Structured data signing prevents signature misuse

**Type Hash**:
```solidity
bytes32 public constant SCORE_TYPEHASH =
    keccak256("Score(address player,uint256 score,uint256 deadline,uint256 nonce)");
```

**Domain Separator**:
```solidity
EIP712("BaseManRegistry", "2")  // Version 2
```

**Signature Verification**:
1. Client requests signature from `/api/score-sign` with score data
2. Backend generates EIP-712 v2 signature using authorizer private key
3. Client submits transaction with signature to contract
4. Contract verifies signature against `authorizer` address
5. Contract checks `usedRequests` mapping for replay protection
6. Contract updates score and emits events

### Replay Protection

The contract uses a `mapping(bytes32 => bool) public usedRequests` to track all processed requests:

```solidity
bytes32 digest = _hashTypedDataV4(
    keccak256(abi.encode(SCORE_TYPEHASH, player, score, deadline, nonce))
);
if (usedRequests[digest]) revert Replay();
usedRequests[digest] = true;
```

Each unique combination of `(player, score, deadline, nonce)` creates a unique digest. Once processed, the digest is marked as used and cannot be reused.

### Authorizer Pattern

The contract uses an **authorizer address** (set by owner) to verify all signatures:

```solidity
address public authorizer;  // Backend signer address

function _verifyAuthorizer(bytes32 digest, bytes calldata signature) internal view returns (bool) {
    address recovered = ECDSA.recover(digest, signature);
    if (recovered == authorizer) return true;
    // Fallback: EIP-1271 for contract wallets
    if (authorizer.code.length > 0) {
        return IERC1271(authorizer).isValidSignature(digest, signature) == 0x1626ba7e;
    }
    return false;
}
```

**Security Model**:
- Only the backend signer (authorizer) can generate valid signatures
- Clients cannot forge signatures without the private key
- Contract wallets (multisigs) supported via EIP-1271

### Contract Functions

**Public Functions**:
- `submitScore(player, score, deadline, nonce, signature)` - Submit a score
- `completeQuest(player, questId, deadline, nonce, signature)` - Complete a quest
- `getScore(address player)` - Query player's score data
- `getHighScore(address player)` - Get player's best single-run score
- `getTotalScore(address player)` - Get player's cumulative score
- `isQuestCompleted(player, questId)` - Check quest completion status

**Owner Functions**:
- `setAuthorizer(address)` - Update backend signer
- `setQuest(questId, active, metadataURI)` - Configure quests
- `pause() / unpause()` - Emergency controls
- `seedTotals(players, totals, highs, timestamps)` - Bulk migration

### Contract Deployment

Deploy to Base Sepolia:
```bash
npm run contracts:deploy:sepolia
```

Deploy to Base Mainnet:
```bash
npm run contracts:deploy:base
```

Verify on Etherscan:
```bash
npm run contracts:verify:sepolia
npm run contracts:verify:base
```

Set authorizer:
```bash
npm run contracts:set-authorizer:sepolia
npm run contracts:set-authorizer:base
```

---

## Score Submission Flow

The score submission process involves multiple steps from game completion to on-chain storage.

### Step-by-Step Flow

1. **Game Completion**
   - Player finishes a game run with a final score
   - Frontend calls `window.BaseManOnchain.submitScore(score)`

2. **Signature Request**
   - Frontend sends POST request to `/api/score-sign`:
   ```json
   {
     "player": "0x...",
     "score": 12345,
     "chainId": 8453
  }
  ```

3. **Backend Signature Generation**
   - Backend validates request (rate limiting, score limits)
   - Backend generates EIP-712 v2 signature:
     - Creates typed data hash with nonce and deadline
     - Signs with `SCORE_SIGNER_PRIVATE_KEY`
     - Returns signature and request metadata

4. **Transaction Construction**
   - Frontend constructs contract call:
   ```javascript
   const callData = registry.interface.encodeFunctionData("submitScore", [
     playerAddress,
     score,
     deadline,
     nonce,
     signature
   ]);
   ```

5. **Transaction Submission**
   - **MiniApp Environment**: Uses `wallet_sendCalls` (EIP-5792)
   - **Web Environment**: Uses `eth_sendTransaction`
   - Paymaster integration (if enabled) sponsors gas fees

6. **On-Chain Execution**
   - Contract verifies signature
   - Contract checks replay protection
   - Contract updates score storage
   - Contract emits `ScoreAdded` and/or `ScoreSubmitted` events

7. **Indexing**
   - CDP SQL API indexes contract events
   - Leaderboard updates automatically reflect new scores

### Error Handling

**Common Errors**:
- `InvalidSignature` - Signature verification failed
- `ExpiredSignature` - Deadline has passed
- `Replay` - Request already processed
- `PausedError` - Contract is paused

**Frontend Error Recovery**:
- Automatic retry with exponential backoff
- User-friendly error messages
- Fallback to manual retry option

### Code Example

```javascript
// Frontend: src/onchain-client.js
async function submitScore(score) {
  try {
    // 1. Request signature from backend
    const signResponse = await fetch('/api/score-sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player: walletAddress,
        score: score,
        chainId: currentChainId
      })
    });
    
    const { signature, deadline, nonce } = await signResponse.json();
    
    // 2. Construct contract call
    const registry = new ethers.Contract(registryAddress, ABI, provider);
    const callData = registry.interface.encodeFunctionData("submitScore", [
      walletAddress,
      score,
      deadline,
      nonce,
      signature
    ]);
    
    // 3. Submit transaction
    if (isMiniAppEnv()) {
      await sendCalls([{ to: registryAddress, data: callData }], paymasterUrl);
    } else {
      await sendEthTransaction({ to: registryAddress, data: callData });
    }
    
    // 4. Wait for confirmation
    // 5. Update UI
  } catch (error) {
    // Handle errors
  }
}
```

---

## Leaderboard System

The leaderboard system provides global rankings with real-time updates and rich profile information.

### Architecture

**Data Sources** (priority order):
1. **CDP SQL API** - Primary source, indexes contract events
2. **RPC Fallback** - Reads events from recent blocks if SQL API unavailable
3. **Redis Cache** - Profile data caching for fast lookups

### Leaderboard Endpoint

**GET `/api/leaderboard`**

**Query Parameters**:
- `limit` (required): Number of entries to return (default: 10, max: 100)
- `chain` (optional): Chain ID override. Frontend requests default to the active runtime registry chain.
- `debug` (optional): Enable debug mode (`?debug=1`)

**Response Format**:
```json
{
  "source": "cdp-sql-api",
  "chainId": 8453,
  "limit": 10,
  "count": 10,
  "items": [
    {
      "rank": 1,
      "player": "0x...",
      "totalScore": 1234567,
      "highScore": 50000,
      "lastUpdate": 1704067200,
      "lastUpdatedAt": "2024-01-01T00:00:00.000Z",
      "profile": {
        "fid": "12345",
        "username": "player1",
        "displayName": "Player One",
        "avatarUrl": "https://...",
        "profileUrl": "https://warpcast.com/player1",
        "platform": "farcaster"
      }
    }
  ],
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Profile Enrichment

The leaderboard enriches player addresses with Farcaster profile data:

**Enrichment Sources** (priority order):
1. **Header Mapping** - Profile data sent in request header (`X-Profile-Mapping`)
2. **Redis Cache** - Persistent profile storage
3. **Neynar API** - Direct API lookup (if `NEYNAR_API_KEY` configured)
4. **FID Mapping** - Bulk FID lookups for efficiency

**Profile Data Structure**:
```typescript
interface Profile {
  fid: string;              // Farcaster ID
  username: string | null;  // Farcaster username
  displayName: string | null; // Display name
  avatarUrl: string | null;  // Profile picture URL
  profileUrl: string | null; // Warpcast profile URL
  platform: 'farcaster' | 'base-app' | null;
  provider: string;         // Data source identifier
}
```

### Caching & Performance

**Leaderboard Caching**:
- **In-Memory Cache**: 10-second TTL for leaderboard data
- **Request Deduplication**: In-flight requests are shared
- **Profile Cache**: Redis with persistent storage

**Performance Optimizations**:
- **Bulk FID Lookups**: Minimize Neynar API calls
- **Lazy Loading**: Profiles loaded on-demand
- **CDN Caching**: Static assets cached via Vercel

### RPC Fallback

If CDP SQL API is unavailable, the system falls back to reading events directly from the blockchain:

**Fallback Logic**:
1. Check last N blocks (configurable, default: 50,000)
2. Read `ScoreAdded` and `ScoreSubmitted` events
3. Aggregate scores by player address
4. Return leaderboard with RPC-sourced data

**Configuration**:
- `LEADERBOARD_FALLBACK_WINDOW_BLOCKS`: Number of blocks to scan (default: 50000)
- `LEADERBOARD_FALLBACK_CHUNK_SIZE`: Events per chunk (default: 400)

### Frontend Integration

The leaderboard panel (`src/leaderboard-panel.js`) provides:

- **Top 10 Display**: Pinned top players
- **Scrollable List**: Remaining players
- **Search Functionality**: Find players by username or address
- **My Rank Summary**: Current user's position and score
- **Real-Time Updates**: Polling for new scores

The frontend leaderboard request follows the active runtime chain from `window.BaseManOnchainConfig.chainId` after runtime overrides are applied. In production this is typically Base Mainnet, while Sepolia remains available for configured test/staging environments.

**Usage**:
```javascript
import { loadLeaderboard } from './leaderboard/api.js';

loadLeaderboard({
  limit: 100,
  onSuccess: (items, debugInfo) => {
    // Render leaderboard
  },
  onError: (error) => {
    // Handle error
  }
});
```

**Search Example**:

The leaderboard supports client-side search functionality. After loading the leaderboard, you can filter results by username, display name, or address:

```javascript
import { loadLeaderboard } from './leaderboard/api.js';
import { getAllEntries } from './leaderboard/state.js';

// Load full leaderboard first
loadLeaderboard({
  limit: 100,
  onSuccess: (items) => {
    // Store all entries for search
    const allEntries = getAllEntries();
    
    // Search function
    function searchLeaderboard(searchTerm) {
      if (!searchTerm || searchTerm.trim() === '') {
        return allEntries; // Return all if search is empty
      }
      
      const term = searchTerm.toLowerCase().trim();
      
      // Filter entries by username, displayName, or address
      return allEntries.filter(entry => {
        const username = entry?.profile?.username?.toLowerCase() || '';
        const displayName = entry?.profile?.displayName?.toLowerCase() || '';
        const address = entry?.player?.toLowerCase() || '';
        
        return username.includes(term) || 
               displayName.includes(term) || 
               address.includes(term);
      });
    }
    
    // Example: Search for a specific user
    const searchResults = searchLeaderboard('player1');
    console.log(`Found ${searchResults.length} matching entries`);
    
    // Render filtered results
    renderLeaderboard(searchResults);
  },
  onError: (error) => {
    console.error('Failed to load leaderboard:', error);
  }
});
```

The search is performed client-side on the loaded leaderboard data, providing instant results without additional API calls.

---

## MiniApp Authentication

BaseMan supports seamless authentication through Farcaster Quick Auth and Base App wallet integration.

### Quick Auth (Farcaster)

**Endpoint**: `POST /api/miniapp-auth`

**Flow**:
1. MiniApp requests authentication token
2. Backend verifies token signature
3. Backend returns user context (FID, username, etc.)

**Implementation**:
```javascript
// Frontend: src/miniapp-auth.js
import { authenticate } from '@farcaster/quick-auth';

const { token } = await authenticate({
  domain: 'base-man.vercel.app',
  siweUri: 'https://base-man.vercel.app',
  statement: 'Sign in to BaseMan'
});

// Send token to backend for verification
const response = await fetch('/api/miniapp-auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
});
```

### Base App Wallet Integration

Base App provides automatic wallet connection via SDK with comprehensive initialization and error handling:

```javascript
// Frontend: src/onchain-client.js

// Step 1: Detect Base App environment
function isBaseAppEnvironment() {
  if (typeof window === 'undefined') return false;
  
  // Use centralized SDK detection utility (preferred)
  if (typeof window.resolveSDK === 'function') {
    const sdk = window.resolveSDK();
    if (sdk) {
      // Check if SDK is from Base App
      return typeof window.isBaseApp === 'function' && window.isBaseApp();
    }
  }
  
  // Fallback detection methods
  return typeof window.MiniKit !== 'undefined' || 
         typeof window.BaseAppSDK !== 'undefined';
}

// Step 2: Initialize Base App SDK
async function initializeBaseAppWallet() {
  try {
    // Detect environment first
    if (!isBaseAppEnvironment()) {
      console.warn('Not running in Base App environment');
      return null;
    }
    
    // Resolve SDK using centralized utility
    let sdk = null;
    if (typeof window.resolveSDK === 'function') {
      sdk = window.resolveSDK();
    } else if (window.MiniKit) {
      sdk = window.MiniKit.sdk || window.MiniKit;
    } else if (window.sdk) {
      sdk = window.sdk;
    }
    
    if (!sdk) {
      throw new Error('Base App SDK not available');
    }
    
    // Step 3: Retrieve Ethereum provider
    const provider = await sdk.wallet.getEthereumProvider();
    if (!provider) {
      throw new Error('Ethereum provider not available');
    }
    
    // Step 4: Request accounts (non-interactive, no prompt)
    const accounts = await provider.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      console.warn('No accounts available');
      return null;
    }
    
    return {
      sdk,
      provider,
      accounts,
      address: accounts[0]
    };
    
  } catch (error) {
    console.error('Base App wallet initialization failed:', error);
    // Handle SDK unavailable case
    if (error.message.includes('SDK not available')) {
      // Fallback to web3 wallet connection
      return null;
    }
    throw error;
  }
}

// Usage
const wallet = await initializeBaseAppWallet();
if (wallet) {
  console.log('Connected to Base App wallet:', wallet.address);
  // Use wallet.provider for transactions
} else {
  console.log('Base App SDK unavailable, using fallback');
}
```

### Authentication Verification

**Backend**: `api/_lib/miniapp-auth-verify.js`

- Verifies JWT tokens from Quick Auth
- Uses JWKS verification by default
- Validates domain and signature
- Returns deterministic auth errors (`missing_token`, `invalid_token`, `verification_failed`, `misconfigured_auth`)
- Keeps verbose verification diagnostics behind debug-only configuration

---

## Paymaster Integration

BaseMan supports gasless transactions through CDP Paymaster integration.

### Paymaster Proxy

**Endpoint**: `POST /api/paymaster-proxy`

**Purpose**: Proxy paymaster requests to CDP service with allowlist enforcement.

**Configuration**:
- `PAYMASTER_SERVICE_URL`: CDP Paymaster endpoint
- `PAYMASTER_ENFORCE_ALLOWLIST`: Enable allowlist checks (default: `true`)
- `PAYMASTER_ALLOWED_TARGETS`: Allowed contract addresses
- `PAYMASTER_ALLOWED_SELECTORS`: Allowed function selectors
- Client-supplied `Authorization` and `x-api-key` headers are not accepted
- Proxy authentication is resolved from server environment only

### Allowlist Enforcement

The paymaster proxy enforces strict allowlist rules:

**Allowed Targets**:
- BaseManRegistry contract addresses (Mainnet and Sepolia)

**Allowed Selectors**:
- `submitScore` function selector
- `completeQuest` function selector

**Request Validation**:
```javascript
// api/paymaster-proxy.js
const allowedTargets = [registryAddressMainnet, registryAddressSepolia];
const allowedSelectors = ['0x...submitScore', '0x...completeQuest'];

// Validate each call in the batch
for (const call of calls) {
  if (!allowedTargets.includes(call.to)) {
    throw new Error('Target not allowed');
  }
  if (!allowedSelectors.includes(call.data.slice(0, 10))) {
    throw new Error('Selector not allowed');
  }
}
```

### Sponsorless Mode

Currently, BaseMan operates in **sponsorless mode**, meaning users pay their own gas fees. Paymaster integration is configured but can be enabled by:

1. Setting `PAYMASTER_SERVICE_URL` to a valid CDP Paymaster endpoint
2. Configuring allowlist rules
3. Updating frontend to use paymaster URL in transaction submissions

**Current Behavior**:
- Transactions sent without paymaster sponsorship
- Users approve and pay gas fees directly
- Works on both Base Mainnet and Base Sepolia

---

## Development Scripts

BaseMan includes comprehensive development and testing scripts.

### Game Development

```bash
npm run game:build          # Build pacman.js from src/
npm run dev                 # Start development server
```

### Contract Development

```bash
npm run contracts:compile   # Compile Solidity contracts
npm run contracts:test      # Run contract tests
npm run contracts:deploy:sepolia  # Deploy to Base Sepolia
npm run contracts:deploy:base      # Deploy to Base Mainnet
npm run contracts:verify:sepolia   # Verify on Etherscan (Sepolia)
npm run contracts:verify:base       # Verify on Etherscan (Mainnet)
npm run contracts:set-authorizer:sepolia  # Set authorizer (Sepolia)
npm run contracts:set-authorizer:base     # Set authorizer (Mainnet)
```

### Testing

```bash
npm run check:local          # Hermetic local validation
npm run check:integration    # Starts/reuses local dev server + env-backed validation
npm run check:external       # Live external link validation
npm run test:phase5:axis-a  # Phase 5 tests - Axis A
npm run test:phase5:axis-b  # Phase 5 tests - Axis B
npm run test:phase5:axis-c  # Phase 5 tests - Axis C
npm run test:phase5         # All Phase 5 tests
npm run test:phase6         # Phase 6 tests
npm run test:all            # Aggregate: local + integration + external
npm run self:check           # Self-check validation
npm run healthcheck          # Health check endpoint
```

### MiniApp Configuration

```bash
npm run manifest:generate   # Generate .well-known/farcaster.json
npm run onchain:config     # Generate onchain configuration
```

### Quality Assurance

```bash
npm run lint                # Run ESLint
npm run lint:fix            # Fix ESLint errors
npm run docs:verify         # Local docs lint + spell checks
npm run docs:verify:external # Live docs-link validation
```

### E2E Testing

```bash
npm run smoke:sepolia       # Smoke tests on Sepolia
npm run e2e:sponsor         # E2E sponsor tests
npm run e2e:bundler        # E2E bundler tests
```

---

## Deployment Notes

### Vercel Deployment

BaseMan is designed for deployment on Vercel with serverless functions.

**Build Configuration**:
- **Build Command**: `npm run manifest:generate`
- **Output Directory**: `.` (root)
- **Framework**: None (static + serverless)

**Important Notes**:
- Run `npm run game:build` before deployment to update `pacman.js`
- Set all environment variables in Vercel dashboard
- Configure CORS headers in `vercel.json`
- Enable serverless functions for `/api/*` routes

### Environment Variables in Vercel

All environment variables must be set in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add all required variables (see Environment Variables section)
3. Set different values for Production, Preview, and Development
4. Ensure `NEXT_PUBLIC_*` variables are available at build time

### MiniApp Hosting

**Farcaster MiniApp**:
- Manifest available at `/.well-known/farcaster.json`
- Webhook URL: `https://your-domain.com/api/miniapp-webhook`
- Domain verification via `accountAssociation` in manifest

**Base App MiniApp**:
- Same manifest structure
- Base Builder analytics via `baseBuilder.allowedAddresses`
- Automatic discovery via Base App platform

### Static Asset Optimization

**Caching Strategy** (configured in `vercel.json`):
- `/.well-known/*`: 5-minute cache
- `/src/*`: No cache (development files)
- `/vendor/*`: 1-year cache (immutable)
- `/pacman.js`: No cache (game bundle)
- `/index.html`: No cache (entry point)

### CDN Configuration

Vercel automatically provides:
- Global CDN distribution
- Automatic HTTPS
- DDoS protection
- Edge caching

---

## Troubleshooting

### Common Issues

#### Game Not Loading

**Symptoms**: Blank screen or JavaScript errors

**Solutions**:
1. Check browser console for errors
2. Verify `pacman.js` exists: `npm run game:build`
3. Check network tab for failed resource loads
4. Clear browser cache

#### Wallet Connection Fails

**Symptoms**: Wallet panel shows "Not Connected"

**Solutions**:
1. Verify MiniApp SDK is loaded: Check `window.sdk` in console
2. Check platform detection: `window.isFarcasterMiniApp()` or `window.isBaseApp()`
3. Verify RPC endpoints are accessible
4. Check chain ID configuration matches contract deployment

#### Score Submission Fails

**Symptoms**: Transaction fails or signature error

**Solutions**:
1. Check backend signer key is set: `SCORE_SIGNER_PRIVATE_KEY`
2. Verify contract address matches environment
3. Check signature endpoint: `POST /api/score-sign` returns valid signature
4. Verify contract is not paused
5. Check replay protection: Ensure nonce is unique

#### Leaderboard Not Loading

**Symptoms**: Empty leaderboard or API errors

**Solutions**:
1. Check CDP SQL API key: `CDP_SQL_API_KEY`
2. Verify RPC fallback is configured if SQL API unavailable
3. Check Redis connection: `UPSTASH_REDIS_REST_URL` and token
4. Enable debug mode: `?debug=1` to see detailed errors

#### Profile Enrichment Not Working

**Symptoms**: Leaderboard shows addresses instead of usernames

**Solutions**:
1. Check Neynar API key: `NEYNAR_API_KEY`
2. Verify `FARCASTER_PROFILE_PROVIDER=neynar`
3. Check Redis connection for profile caching
4. Verify profile mapping is sent in request headers

### Debug Mode

Enable debug mode for detailed logging:

**Frontend**:
- Add `?debug=1` to URL
- Check browser console for detailed logs

**Backend**:
- Add `?debug=1` to API endpoints
- Check server logs for detailed responses

### Health Check

Run health check to verify configuration:

```bash
npm run healthcheck
```

This validates:
- Environment variables
- Contract addresses
- RPC connectivity
- API endpoints

### Getting Help

- **Documentation**: See `docs/` directory for detailed guides
- **Issues**: Open GitHub issue with error logs and steps to reproduce
- **Logs**: Check Vercel function logs for API errors

---

## Appendix: Full Game Engine Module Reference

This section provides a comprehensive reference to all game engine modules in the `src/` directory, organized by functional category.

### Core Game Logic

- **`src/game.js`** - Core game loop, state machine, and main game orchestration. Handles game initialization, update cycles, and state transitions.

- **`src/executive.js`** - Executive controller that manages game flow, level progression, and coordinates between game systems.

- **`src/main.js`** - Application entry point that initializes the game, loads high scores, and sets up the initial game state.

- **`src/states.js`** - Game state definitions and state management system for different game modes (home, playing, game over, etc.).

### Game Entities

- **`src/Actor.js`** - Base class for all game entities (Pac-Man, ghosts, fruits). Provides common functionality for movement, collision, and rendering.

- **`src/Player.js`** - Player (Pac-Man) entity implementation. Handles player movement, input processing, and player-specific game logic.

- **`src/Ghost.js`** - Ghost entity implementation with AI behavior patterns. Implements the classic ghost AI modes: scatter, chase, frightened, and eaten.

- **`src/actors.js`** - Actor factory and management system. Creates and manages all game entities.

### Artificial Intelligence

- **`src/ghostCommander.js`** - Ghost AI controller that manages ghost behavior modes and coordinates ghost movements based on game state.

- **`src/ghostReleaser.js`** - Ghost release system that controls when ghosts are released from the center area during gameplay.

- **`src/targets.js`** - Target calculation system for ghost AI. Computes target tiles for each ghost based on their behavior mode.

- **`src/elroyTimer.js`** - Elroy mode timer system. Manages the special "Elroy" behavior where ghosts become more aggressive in later levels.

### Rendering & Graphics

- **`src/renderers.js`** - Rendering system that handles canvas drawing operations for all game entities and UI elements.

- **`src/sprites.js`** - Sprite management system. Loads and manages sprite sheets for game entities and animations.

- **`src/atlas.js`** - Texture atlas system for efficient sprite rendering and texture management.

- **`src/hud.js`** - Heads-up display rendering. Draws score, lives, level information, and game status overlays.

- **`src/cutscenes.js`** - Cutscene rendering system for inter-level animations and game events.

### Game World & Maps

- **`src/Map.js`** - Map/maze system. Handles tile-based map representation, collision detection, and maze navigation.

- **`src/maps.js`** - Predefined map data for classic Pac-Man and Ms. Pac-Man levels.

- **`src/mapgen.js`** - Procedural map generator for Cookie-Man mode. Creates random mazes following Pac-Man design patterns.

### Game Mechanics

- **`src/energizer.js`** - Power pellet (energizer) system. Manages power pellet effects, ghost vulnerability, and scoring bonuses.

- **`src/fruit.js`** - Fruit spawning and collection system. Handles fruit appearance, scoring, and level-specific fruit types.

- **`src/direction.js`** - Direction and movement utilities. Provides direction constants and movement calculations.

### Input & Controls

- **`src/input.js`** - Input handling system. Processes keyboard, touch, and swipe inputs for player control.

### State Management

- **`src/inGameMenu.js`** - In-game menu system. Handles pause menu, settings, and game options during gameplay.

- **`src/Menu.js`** - Main menu system. Manages game mode selection, high score display, and menu navigation.

### Utilities & Helpers

- **`src/random.js`** - Random number generator with seed support for reproducible gameplay patterns.

- **`src/colors.js`** - Color palette management for different game modes and themes.

- **`src/inherit.js`** - JavaScript inheritance utilities for object-oriented game entity structure.

- **`src/vcr.js` - Video cassette recorder system for practice mode. Enables time manipulation features like rewind and slow-motion.

### Data Structures

- **`src/Button.js`** - Button UI component for menus and interfaces.

### Special Features

- **`src/galagaStars.js`** - Starfield background effect system inspired by Galaga.

- **`src/sound.js`** - Sound effect and music system (currently under construction).

### Debug & Development

- **`src/debug-autosubmit.js`** - Debug utility for automatically submitting test scores during development.

- **`src/console-logger.js`** - Console logging utility with log levels and formatting.

### UI Components (Non-Game)

- **`src/leaderboard-panel.js`** - Leaderboard UI panel with search and ranking display.

- **`src/profile-panel.js`** - User profile panel showing on-chain stats and Farcaster profile information.

- **`src/wallet-panel.js`** - Wallet connection status panel.

- **`src/settings-panel.js`** - Game settings and configuration panel.

- **`src/bottom-nav.js`** - Mobile bottom navigation bar for MiniApp interfaces.

### Blockchain Integration

- **`src/onchain-client.js`** - Main on-chain client that handles wallet connection, score submission, and blockchain interactions.

- **`src/onchain-bootstrap.js`** - On-chain system initialization and SDK detection.

- **`src/onchain-config.js`** - On-chain configuration loader and environment setup.

- **`src/onchain/`** - On-chain module directory containing provider, score service, profile service, and SDK context utilities.

### MiniApp Integration

- **`src/miniapp-auth.js`** - MiniApp authentication handler for Farcaster Quick Auth.

- **`src/miniapp-ethereum-shim.js`** - Ethereum provider shim for MiniApp environments.

- **`src/mock-miniapp-provider.js`** - Mock MiniApp provider for local development and testing.

### Utilities & Libraries

- **`src/lib/`** - Utility library directory containing safe fetch, contract reading, and error handling utilities.

- **`src/utils/`** - General utilities including logger, platform detection, and SDK detection helpers.

- **`src/ui/`** - React-based UI components directory for connection menus and modern UI elements.

- **`src/leaderboard/`** - Leaderboard module directory containing API client, DOM rendering, search functionality, state management, and service modules.

- **`src/game/`** - Additional game-specific modules and utilities.

---

## License

This program is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License Version 3** as published by the Free Software Foundation.

See `LICENSE` file for full license text.

---

## Credits

### Original Game

BaseMan is built upon the original Pac-Man arcade game by Namco (1980) and Ms. Pac-Man by GCC/Midway (1981). The game engine implementation is inspired by [The Pac-Man Dossier](http://home.comcast.net/~jpittman2/pacman/pacmandossier.html) by Jamey Pittman.

### Reverse Engineering

Thanks to **Jamey Pittman** and **Bart Grantham** for their extensive reverse engineering work that made this accurate implementation possible.

### Blockchain Integration

Built for the **Base** ecosystem with integration for **Farcaster MiniApps** and **Base App**.

---

**Built with ❤️ for the Base ecosystem**
