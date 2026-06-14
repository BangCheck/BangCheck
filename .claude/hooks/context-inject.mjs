#!/usr/bin/env node
/**
 * UserPromptSubmit hook — BangCheck context injection
 * Reads _wood/context/current.yaml and prepends version/P1 context to every session.
 * Exit 0 always (inform only, never block).
 */

import { readFileSync, existsSync } from "fs";

const CONTEXT_PATH = "_wood/context/current.yaml";

if (!existsSync(CONTEXT_PATH)) process.exit(0);

const yaml = readFileSync(CONTEXT_PATH, "utf8");

function scalar(key) {
  return yaml.match(new RegExp(`^${key}:\\s*(.+)`, "m"))?.[1]?.trim() ?? "?";
}

const version = scalar("version");
const focus   = scalar("focus");
const repo    = scalar("repo");

// P1 items
const p1Block = yaml.match(/^p1:\n([\s\S]*?)(?=^\S|\Z)/m)?.[1] ?? "";
const p1 = (p1Block.match(/^\s+-\s+(\S+)/gm) ?? [])
  .map((l) => l.replace(/^\s+-\s+/, "").split(/\s+/)[0]);

const lines = [
  `[BangCheck] ${version} | ${focus}`,
  `repo: ${repo}`,
  p1.length ? `P1 (보안·운영급): ${p1.join(", ")}` : "",
  `impl: docs/impl/${version}/  |  dev-note: docs/개발자노트-ver1.1.md`,
].filter(Boolean);

process.stdout.write(lines.join("\n") + "\n");
process.exit(0);
