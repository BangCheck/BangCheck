# _wood Patch Changelog

Tracks changes made to `_wood/` in BangCheck that are candidates for back-porting to the base template (00_bmad).

> **Scope:** `_wood/**` only. Changes outside this directory (`.claude/`, `docs/`, etc.) are not tracked here.
> **Origin:** BangCheck (patches flow BangCheck → 00_bmad, not the other way)

---

| Patch | Title | Target File(s) | Template-ready |
|-------|-------|----------------|----------------|
| [PATCH-001](PATCH-001.md) | Admin Action Detection Rule | `_wood/workflows/_protocol.md` | ✅ |
| [PATCH-002](PATCH-002.md) | Commit Convention Format | `_wood/workflows/_coding-guide.md` | ✅ |
| [PATCH-003](PATCH-003.md) | PM Init State Triggers | `_wood/agents/pm/pm-actions.csv`, `_wood/agents/pm/workflows/pm-recommend.md` | ✅ |
| [PATCH-004](PATCH-004.md) | Sub-issue Detection Flow (FE/BE Agent) | `_wood/agents/fe-dev/agent.md`, `_wood/agents/be-dev/agent.md` | ⚠️ partial |
