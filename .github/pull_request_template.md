## Summary

- What changed?
- Why now?

## Change Class

- [ ] `R1` Routine
- [ ] `R2` Runtime/Product Affecting
- [ ] `R3` Security/Money Flow Affecting
- [ ] `R4` Release Blocker / Emergency

## Affected Surfaces

- [ ] UI / gameplay
- [ ] Runtime config / env resolution
- [ ] API behavior
- [ ] Auth
- [ ] Paymaster / sponsor flow
- [ ] Wallet / provider flow
- [ ] Docs / operator workflow
- [ ] Dependencies

## Checks Run

- [ ] `npm run check:local`
- [ ] `npm run check:integration`
- [ ] `npm run check:external`
- [ ] `npm audit --omit=dev` when dependency/security work is included

Check evidence:

```text
Paste the commands run and the result summary here.
```

## Risk Notes

- Contract or public API compatibility:
- Main regression risk:
- Env or deployment assumptions:

## Reviewer Expectations

- [ ] Standard reviewer only
- [ ] Security/Ops reviewer required
- [ ] Maintainer sign-off required before merge

## Rollout / Rollback

- Release-facing impact:
- Smoke checks after merge:
- Rollback path:
