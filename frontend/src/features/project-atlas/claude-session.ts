export type ClaudeSessionEntryKind = 'user' | 'assistant' | 'thinking' | 'tool' | 'system' | 'meta';

export interface ClaudeSessionEntry {
  line: number;
  kind: ClaudeSessionEntryKind;
  label: string;
  eventType: string;
  role: string | null;
  model: string | null;
  timestamp: string | null;
  text: string;
  blockType?: string;
}

export interface ClaudeSessionConversation {
  id: string;
  sequence: number;
  input: ClaudeSessionEntry;
  entries: readonly ClaudeSessionEntry[];
  counts: Readonly<Record<string, number>>;
}

export interface ClaudeSessionSnapshot {
  version: number;
  importedAt: string;
  source: {
    path: string;
    bytes: number;
    lines: number;
    redactions: number;
  };
  session: {
    id: string | null;
    cwd: string | null;
    gitBranch: string | null;
    mode: string | null;
    startedAt: string | null;
    updatedAt: string | null;
    models: readonly string[];
  };
  summary: {
    records: number;
    timelineEntries: number;
    conversations: number;
    typeCounts: Readonly<Record<string, number>>;
    roleCounts: Readonly<Record<string, number>>;
    thinking: number;
    toolCalls: number;
    tools: readonly string[];
  };
  prelude: readonly ClaudeSessionEntry[];
  conversations: readonly ClaudeSessionConversation[];
  records: readonly (Record<string, unknown> & { line: number })[];
}

export interface ClaudeSessionLoadState {
  status: 'loading' | 'ready' | 'empty' | 'error';
  session: ClaudeSessionSnapshot | null;
  message: string | null;
}

export const CLAUDE_SESSION_URL = '/atlas/claude-session.json';
