#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const frontendRoot = path.resolve(scriptDir, '..');

function getArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const sourcePath = getArg('--source');
const outputPath = getArg('--output') ?? path.join(frontendRoot, 'public/atlas/claude-session.json');

if (!sourcePath) {
  console.error('Usage: node frontend/scripts/import-claude-session.mjs --source <session.jsonl> [--output <json>]');
  process.exit(1);
}

const input = fs.readFileSync(path.resolve(sourcePath), 'utf8');
const lines = input.split('\n').filter((line) => line.trim().length > 0);
let redactionCount = 0;

function redactString(value) {
  let result = value;
  const patterns = [
    { regex: /\b(?:sk|rk)-[A-Za-z0-9_-]{12,}\b/g, replacement: '[REDACTED_SECRET]' },
    { regex: /\b(?:ghp|gho|github_pat|xox[baprs])_[A-Za-z0-9_-]{12,}\b/g, replacement: '[REDACTED_TOKEN]' },
    { regex: /\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi, replacement: 'Bearer [REDACTED_TOKEN]' },
    { regex: /([?&](?:token|api_key|apikey|secret|password)=)[^&\s]+/gi, replacement: '$1[REDACTED]' },
  ];
  for (const { regex, replacement } of patterns) {
    result = result.replace(regex, (match, prefix) => {
      redactionCount += 1;
      return prefix ? `${prefix}${replacement}` : replacement;
    });
  }
  return result;
}

function redactValue(value, key = '') {
  if (typeof value === 'string') {
    if (/(token|secret|password|api.?key|authorization|cookie|signature)/i.test(key)) {
      redactionCount += 1;
      return '[REDACTED]';
    }
    return redactString(value);
  }
  if (Array.isArray(value)) return value.map((item) => redactValue(item, key));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [
      childKey,
      redactValue(childValue, childKey),
    ]));
  }
  return value;
}

function readBlockText(block) {
  if (typeof block === 'string') return block;
  if (!block || typeof block !== 'object') return '';
  const item = block;
  if (typeof item.text === 'string') return item.text;
  if (typeof item.thinking === 'string') return item.thinking;
  if (typeof item.content === 'string') return item.content;
  if (Array.isArray(item.content)) return item.content.map(readBlockText).filter(Boolean).join('\n');
  if (item.type === 'tool_use' && typeof item.name === 'string') return `tool_use · ${item.name}`;
  if (item.type === 'tool_result') return 'tool_result';
  return '';
}

function getBlocks(record) {
  const content = record.message?.content ?? record.content;
  if (Array.isArray(content)) return content;
  if (typeof content === 'string') return [{ type: 'text', text: content }];
  return [];
}

function recordRole(record) {
  return record.message?.role ?? record.role ?? null;
}

function entryKind(record, block) {
  const type = block?.type;
  if (type === 'thinking') return 'thinking';
  if (type === 'tool_use' || type === 'tool_result') return 'tool';
  if (record.type === 'system' || record.type === 'mode' || record.type === 'last-prompt') return 'system';
  if (recordRole(record) === 'user') return 'user';
  if (recordRole(record) === 'assistant') return 'assistant';
  return 'meta';
}

function entryLabel(kind, record, block) {
  if (kind === 'user') return 'INPUT';
  if (kind === 'assistant') return 'OUTPUT';
  if (kind === 'thinking') return 'THINKING';
  if (kind === 'tool') return block?.type === 'tool_use'
    ? `TOOL / ${block.name ?? 'CALL'}`
    : 'TOOL RESULT';
  if (record.subtype) return `${record.type ?? 'SYSTEM'} / ${record.subtype}`;
  return (record.type ?? 'META').toUpperCase();
}

const parsedRecords = lines.map((line, index) => {
  try {
    return { line: index + 1, ...redactValue(JSON.parse(line)) };
  } catch {
    return { line: index + 1, type: 'invalid', raw: redactString(line) };
  }
});

const timeline = parsedRecords.flatMap((record) => {
  const blocks = getBlocks(record);
  if (blocks.length === 0) {
    const text = record.subtype || record.type || '';
    return text ? [{
      line: record.line,
      kind: entryKind(record, null),
      label: entryLabel(entryKind(record, null), record, null),
      eventType: record.type ?? 'unknown',
      role: recordRole(record),
      model: record.message?.model ?? null,
      timestamp: record.timestamp ?? null,
      text,
    }] : [];
  }
  return blocks.map((block) => {
    const kind = entryKind(record, block);
    const rawText = readBlockText(block);
    const toolText = block?.type === 'tool_use' && block.input
      ? `${rawText}\n${JSON.stringify(block.input, null, 2)}`
      : rawText;
    return {
      line: record.line,
      kind,
      label: entryLabel(kind, record, block),
      eventType: record.type ?? 'unknown',
      role: recordRole(record),
      model: record.message?.model ?? null,
      timestamp: record.timestamp ?? null,
      text: redactString(toolText),
      blockType: block?.type ?? 'text',
    };
  }).filter((entry) => entry.text.length > 0 || entry.kind === 'tool' || entry.kind === 'thinking');
});

const userIndexes = timeline
  .map((entry, index) => entry.kind === 'user' && entry.text.trim() ? index : -1)
  .filter((index) => index >= 0);

const conversations = userIndexes.map((start, index) => {
  const end = userIndexes[index + 1] ?? timeline.length;
  const entries = timeline.slice(start, end);
  const input = entries[0];
  const counts = entries.reduce((result, entry) => {
    result[entry.kind] = (result[entry.kind] ?? 0) + 1;
    return result;
  }, {});
  return {
    id: `conversation-${String(index + 1).padStart(3, '0')}`,
    sequence: index + 1,
    input,
    entries,
    counts,
  };
});
const prelude = userIndexes.length > 0 ? timeline.slice(0, userIndexes[0]) : timeline;

const typeCounts = parsedRecords.reduce((result, record) => {
  const key = record.type ?? 'unknown';
  result[key] = (result[key] ?? 0) + 1;
  return result;
}, {});
const roleCounts = parsedRecords.reduce((result, record) => {
  const key = recordRole(record) ?? 'none';
  result[key] = (result[key] ?? 0) + 1;
  return result;
}, {});
const models = [...new Set(parsedRecords.map((record) => record.message?.model).filter(Boolean))];
const tools = [...new Set(parsedRecords.flatMap((record) => getBlocks(record)
  .filter((block) => block?.type === 'tool_use' && block.name)
  .map((block) => block.name)))];
const thinkingEntries = parsedRecords.flatMap((record) => getBlocks(record))
  .filter((block) => block?.type === 'thinking').length;
const toolCalls = parsedRecords.flatMap((record) => getBlocks(record))
  .filter((block) => block?.type === 'tool_use').length;
const toolResults = parsedRecords.flatMap((record) => getBlocks(record))
  .filter((block) => block?.type === 'tool_result').length;
const firstRecord = parsedRecords[0] ?? {};
const lastRecord = parsedRecords.at(-1) ?? {};
const firstRecordWithCwd = parsedRecords.find((record) => record.cwd) ?? firstRecord;
const firstRecordWithBranch = parsedRecords.find((record) => record.gitBranch) ?? firstRecord;
const firstRecordWithMode = parsedRecords.find((record) => record.mode) ?? firstRecord;

const snapshot = {
  version: 1,
  importedAt: new Date().toISOString(),
  source: {
    path: sourcePath.replace(process.env.HOME ?? '', '~'),
    bytes: Buffer.byteLength(input),
    lines: parsedRecords.length,
    redactions: redactionCount,
  },
  session: {
    id: firstRecord.sessionId ?? lastRecord.sessionId ?? null,
    cwd: firstRecordWithCwd.cwd ?? lastRecord.cwd ?? null,
    gitBranch: firstRecordWithBranch.gitBranch ?? lastRecord.gitBranch ?? null,
    mode: firstRecordWithMode.mode ?? null,
    startedAt: firstRecord.timestamp ?? null,
    updatedAt: lastRecord.timestamp ?? null,
    models,
  },
  summary: {
    records: parsedRecords.length,
    timelineEntries: timeline.length,
    conversations: conversations.length,
    typeCounts,
    roleCounts,
    thinking: thinkingEntries,
    toolCalls,
    toolResults,
    tools,
  },
  prelude,
  conversations,
  records: parsedRecords,
};

const destination = path.resolve(outputPath);
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify({
  output: destination,
  records: snapshot.summary.records,
  conversations: snapshot.summary.conversations,
  timelineEntries: snapshot.summary.timelineEntries,
  redactions: snapshot.source.redactions,
}, null, 2));
