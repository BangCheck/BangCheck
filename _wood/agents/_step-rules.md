# Step File Rules — BangCheck _wood Standard

**Purpose:** Authoritative reference for step file structure and compliance.
All step files under `_wood/agents/**/steps-*/` MUST follow this standard.

---

## File Size Limits

| Metric | Value |
|--------|-------|
| Recommended | < 200 lines |
| Absolute Maximum | 250 lines |

**If exceeded:** Split into multiple steps or extract reference data to `/data/` files.

---

## Required Step Structure

```markdown
---
name: 'step-[N]-[name]'
description: '[what this step does — single sentence]'
nextStepFile: './step-[N+1]-[name].md'   # omit if final step
# Add only variables actually used in the step body:
# someOutput: '{output_variable}'
---

# Step [N]: [Name]

## STEP GOAL

[Single sentence: what this step accomplishes]

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input
- 📋 Follow the exact sequence below — do not skip steps

### Step-Specific Rules
- [Rule specific to this step's domain]
- FORBIDDEN: [prohibited action]

## MANDATORY SEQUENCE

### 1. [Action]
[Instructions]

### N. Route
[Completion instruction or: Load and read entirely: `{nextStepFile}`]

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- [Criterion 1]
- [Criterion 2]

### ❌ FAILURE
- [Failure condition 1 → consequence]
- [Failure condition 2 → consequence]

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
```

---

## STOP Gate Format

Use blockquote format consistently:

```markdown
> 🛑 **STOP** — Wait for user input before continuing.
```

Never use bare "STOP and WAIT." on its own line.

---

## Frontmatter Rules

- `name` and `description` are **required**
- `nextStepFile` is required unless this is the final step
- Only include variables that are **actually used** in the step body
- All file references use `{variable}` format
- Paths are relative within the workflow folder

---

## Step Type Reference

| Type | Pattern |
|------|---------|
| Init | Auto-proceed after setup, no user menu |
| Middle | Show options → 🛑 STOP → route on confirm |
| Branch | Conditional routing based on detected state |
| Edit (steps-e/) | User-driven modification flow |
| Validate (steps-v/) | Auto-check → report findings |
| Final | No nextStepFile, completion message |

---

## Session Resumption (Long Workflows Only)

Workflows with 5+ steps SHOULD support resumption via `stepsCompleted` in `workflow.md` frontmatter:

```yaml
stepsCompleted: []   # append step name as each step completes
# e.g. after step 1: stepsCompleted: [step-01-read-drive]
```

On workflow init: check `stepsCompleted` — if non-empty, offer to resume from last completed step.

---

## Validation Checklist

For every step file:

- [ ] File < 200 lines (250 max)
- [ ] `name` and `description` in frontmatter
- [ ] All frontmatter variables are used in the body
- [ ] STEP GOAL present (one sentence)
- [ ] MANDATORY EXECUTION RULES present
- [ ] MANDATORY SEQUENCE with numbered sections
- [ ] STOP gates use `> 🛑 **STOP**` format
- [ ] SUCCESS / FAILURE section present
- [ ] `nextStepFile` present (unless final step)

---

## Common Violations

| Violation | Fix |
|-----------|-----|
| Bare "STOP and WAIT." | Use `> 🛑 **STOP** — Wait for user input.` |
| Fabricated output shown as example | Remove — show format only, not fake data |
| Missing SUCCESS/FAILURE | Add at end of every step |
| `## 2-1.` section header | Use `### 2-1.` (h3, not h2) |
| Hardcoded file path | Use `{variable}` format |
| Step > 250 lines | Split or extract to `/data/` |

---

**Admin:** @Woo-JongHo
**Version:** 1.0
**Last reviewed:** 2026-04-22
