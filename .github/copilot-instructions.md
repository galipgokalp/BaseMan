Read AGENTS.md first - it is the only source of truth.

Checklist:
- If there is any conflict, AGENTS.md wins.
- Avoid import-time env or network side effects.
- Do not change EIP-712 domain/types or registry contract logic without explicit instruction.
- Keep paymaster allowlist and selector checks intact.
- Preserve game loop timing, input latency, and state transitions.
- Preserve backward compatibility for APIs and configs.
- Follow self-check and tests before and after changes as appropriate.
- Never log or expose secrets.

See AGENTS.md: ../AGENTS.md
