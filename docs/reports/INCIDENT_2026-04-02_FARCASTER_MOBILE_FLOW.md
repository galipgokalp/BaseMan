# BaseMan Incident Report

Date: 2026-04-02  
Scenario: Farcaster mobile live flow covering panel open/close, full game, and Base Mainnet score submission

## Summary

The on-chain score submission path succeeded, but the `PAC-BOARD` leaderboard panel appeared empty during the same session. Live evidence shows this was not caused by missing leaderboard data. The dominant failure observed was a client-side timeout against `/api/leaderboard`, while the backend endpoint itself returned valid data after roughly 10.4 to 10.5 seconds.

Current classification:

- `S3 UI state/render or fetch-time budget issue`
- `S2 observability gap`
- `S1 noise` for at least one Telegram warning source

## User-Observed Flow

- Farcaster mobile Mini App opened
- `PAC-BOARD`, `Profile`, `Wallet`, and `Settings` panels were opened and closed during gameplay
- A full game was completed
- The final score was submitted to the Base Mainnet contract
- The score was written on-chain successfully
- `PAC-BOARD` appeared empty during this flow
- Telegram production warnings were observed during the same session

## Evidence Collected

### 1. Live app and manifest were healthy

- `https://base-man.vercel.app` returned `200`
- `https://base-man.vercel.app/.well-known/farcaster.json` returned valid manifest JSON

### 2. On-chain submission succeeded

Live `app-log` entries captured:

- `2026-04-02T14:38:04.667Z` `debug`
  - `[ToastIntegration] Score submitted: 1.860, tx: 0xa5ca89...`
- `2026-04-02T14:38:05.282Z`
  - event: `eth_sendTransaction:success`
  - hash: `0xa5ca89abea1e7adfb4423e9676c09fa97715b7a8a9c71a2cde2b6e36b6d4516c`

### 3. Leaderboard backend had the data

Live endpoint checks:

- `GET /api/leaderboard?limit=100&debug=1&chain=8453`
  - returned the user address `0xB1696E90304E2299237EEe3760FF41336e414b6b`
  - returned `totalScore: 215010`
  - returned rank `#2`
  - response time: `10.449723s`

- `GET /api/leaderboard?limit=10&debug=1&chain=8453`
  - returned the same data set
  - response time: `10.525074s`

This proves:

- the backend endpoint was not empty
- the newly submitted score was already visible through the API
- the empty `PAC-BOARD` was not a pure data-availability problem

### 4. The client timed out before the backend completed

Live `app-log` entry captured:

- `2026-04-02T14:37:15.284Z` `error`
  - `[UiLeaderboard] load failed`
  - kind: `TIMEOUT`
  - context: `leaderboard`
  - URL: `/api/leaderboard?limit=100&chain=8453`
  - timeout: `7000ms`

Relevant code path:

- client timeout default in [safe-fetch.js](/home/galip/BaseMan/src/lib/safe-fetch.js)
- leaderboard client explicitly uses `timeoutMs: 7000` in [api.js](/home/galip/BaseMan/src/leaderboard/api.js)
- leaderboard panel requests `data-limit="100"` from [index.html](/home/galip/BaseMan/index.html)

Conclusion:

- the client budget is `7s`
- the live endpoint latency was about `10.5s`
- `PAC-BOARD` can fail empty even when the backend is correct

### 5. Platform detection warning was present during the same flow

Live `app-log` entry captured:

- `2026-04-02T14:37:08.242Z` `warn`
  - `[UiLeaderboard] Platform not detected despite user/address signals - platform matching will be skipped`
  - meta:
    - `hasAddress: true`
    - `hasFid: true`
    - `hasUsername: true`

Related debug entry:

- `2026-04-02T14:37:08.249Z`
  - `[UiLeaderboard] Profile mapping check`
  - `platform: null`

This is not the primary root cause of the empty board, but it is a real signal that leaderboard identity/platform matching is incomplete in Farcaster mobile.

### 6. Telegram warning history was only partially recoverable from ring buffer

Current ring buffer findings:

- one suppressed warning remained:
  - `autoconsent already initialized`
- no additional historical Telegram warnings were present in `/api/app-log?event=warn`

This means at least one of the following is true:

- older warning entries rotated out of the 200-entry ring buffer
- Telegram received warnings before suppression rules were added
- Telegram warnings came from a path not recoverable from the current in-memory log window

This is an observability gap, not a proof that the warnings were unreal.

## Root Cause Assessment

### Primary issue

`PAC-BOARD` empty state during Farcaster mobile flow was most likely caused by a client-side timeout mismatch:

- client waits `7s`
- leaderboard endpoint currently responds in about `10.5s`

Because the API still returned valid data after the timeout threshold, the most probable user-visible outcome is:

- leaderboard fetch fails in client
- panel shows error or effectively empty state
- score still exists in backend and on-chain

### Secondary issue

Farcaster mobile platform detection remained `null` even though the app had:

- user
- fid
- username
- address

This does not explain the empty panel by itself, but it does mean profile/platform labeling is degraded in the same flow.

### Observability issue

Telegram alert history cannot be fully reconstructed from the current in-memory ring buffer. This limits post-incident accuracy once the session moves on.

## Recommended Actions

### Immediate fix wave

1. Raise or redesign leaderboard client timeout
- Increase the fetch budget for leaderboard requests beyond current live p95 behavior
- Or add staged rendering/cached-first behavior so the panel does not hard-fail on a slow first fetch

2. Reduce default leaderboard request size from mobile panel open
- `data-limit="100"` is unnecessarily expensive for a mobile first-open path when only a small number of items are visible initially
- Start with a smaller limit for first render, then expand only if needed

3. Instrument leaderboard fetch latency explicitly
- log request start, finish, duration, chain, limit, source
- log whether timeout happened before response arrived
- log whether render fell into `renderEmpty`, `renderError`, or `renderRows`

### Secondary fix wave

4. Harden platform detection in Farcaster mobile
- if `sdk.context.client.platformType === "mobile"` and Farcaster user context exists, resolve a stable `farcaster` platform rather than leaving it `null`

5. Improve incident retention
- current `app-log` ring buffer is too small for post-hoc production debugging
- persist a larger warn/error history or send structured copies to a durable sink

## Next Implementation Slice

The next concrete patch should target:

1. `src/leaderboard/api.js`
- increase timeout or make it limit-aware
- consider smaller initial limit

2. `src/leaderboard-panel.js`
- add explicit logging around `renderEmpty`, `renderError`, and successful render completion
- capture the visible-state transition around panel open

3. `src/utils/platform-detection.js`
- investigate why Farcaster mobile context still results in `platform: null`

## Acceptance Criteria For The Fix

- In Farcaster mobile, opening `PAC-BOARD` after score submission does not show empty state when leaderboard endpoint has valid data
- No leaderboard timeout occurs under the same live conditions
- The submitted player appears in the panel without requiring a full app restart
- Platform detection resolves deterministically in the same flow or logs a more specific reason when it cannot
- Telegram warnings for this flow are either eliminated or mapped to actionable categories
