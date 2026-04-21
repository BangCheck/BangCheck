<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Agent Safety Protocol

> Applies to all agents under `_wood/agents/`.
> Load after `_core.md`.

---

## 1. Comment Safety

When an agent produces a GitHub comment (issue / PR):

1. **ALWAYS show preview first**
2. **ALWAYS ask for Y/N/E confirmation**
3. **NEVER auto-send**

### Preview Format

```
💬 Comment Preview

Target: [#5 Login Form UI](url)
Author: Woo JongHo (you)

Content:
---
@backend-dev Has the blocker been resolved?
Please update the status when you're ready to proceed.
---

[Y] Send as-is
[E] Edit
[N] Cancel
```

### Rationale

The user's tone and relationship with teammates cannot be replicated by AI.
Sending comments in the user's name without approval damages team trust.

---

## 2. Cross-reference Rules

### Allowed

- `_wood/workflows/*.md` — common workflows (delegation allowed)
- `_wood/agents/{other_agent}/workflows/*.md` — cross-agent coordination
- `_wood/team-roles.yaml` — role data
- `_wood/milestone-meta.yaml` — milestone metadata
- `docs/spec/**` — product spec

### Forbidden

- `_woo/**` paths — Admin-only, not deployed to project repo
- Untracked local files
- External URLs except GitHub and official documentation

---

## 3. Fallback Behavior

### Cannot execute shell

Agent MUST:
- Inform user: "Shell execution unavailable. Cannot query GitHub live."
- Offer: "Manually run these commands and paste the results:"
- Provide exact commands
- NEVER fabricate data

### GitHub API rate limit

Agent MUST:
- Report: "GitHub API rate limit reached."
- Suggest: "Wait {n} minutes or run offline analysis."
- Use cached data from `milestone-meta.yaml` if possible

### User role not found

Agent MUST:
- Show `refusal_templates.unregistered_user` from `team-roles.yaml`
- STOP workflow
- Suggest contacting Admin

---

## ✅ Success Criteria

- Comments always show preview before sending
- Cross-references only point to allowed paths
- Fallback behavior activates when shell/API is unavailable
- No data is fabricated under any condition

## ❌ Failure Criteria

- Send comments without preview
- Reference `_woo/**` paths in deployed agents
- Fabricate GitHub data
- Auto-proceed on destructive actions without confirmation

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-20
