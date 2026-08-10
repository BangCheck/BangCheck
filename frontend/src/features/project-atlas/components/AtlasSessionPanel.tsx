import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useClaudeSession } from '../use-claude-session';
import type { ClaudeSessionConversation, ClaudeSessionEntry, ClaudeSessionEntryKind } from '../claude-session';

const ROLE_LABEL: Record<ClaudeSessionEntryKind, string> = {
  user: 'INPUT',
  assistant: 'OUTPUT',
  thinking: 'THINKING',
  tool: 'TOOL',
  system: 'SYSTEM',
  meta: 'META',
};

function formatTimestamp(timestamp: string | null) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return Number.isNaN(date.valueOf())
    ? timestamp
    : new Intl.DateTimeFormat('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
}

function compactText(text: string) {
  const compact = text.replace(/\s+/g, ' ').trim();
  return compact.length > 108 ? `${compact.slice(0, 108)}…` : compact;
}

function ConversationEntry({ entry, index }: { entry: ClaudeSessionEntry; index: number }) {
  const isInput = entry.kind === 'user';
  const isLong = entry.text.length > 900;
  return (
    <article className="atlas-conversation-entry" data-role={entry.kind}>
      <div className="atlas-conversation-entry-head">
        <span className="atlas-role-mark"><i /> {ROLE_LABEL[entry.kind]}</span>
        <span>LINE {String(entry.line).padStart(4, '0')}</span>
        <time>{formatTimestamp(entry.timestamp)}</time>
      </div>
      {isInput ? (
        <p className="atlas-conversation-entry-text">{entry.text}</p>
      ) : (
        <details open={entry.kind === 'assistant' && index < 3}>
          <summary>{compactText(entry.text || entry.label)}</summary>
          <pre>{entry.text || entry.label}</pre>
        </details>
      )}
      {isLong && <span className="atlas-conversation-entry-note">FULL PAYLOAD / DISCLOSURE</span>}
    </article>
  );
}

function ConversationBox({ conversation }: { conversation: ClaudeSessionConversation }) {
  return (
    <article className="atlas-conversation-box">
      <header className="atlas-conversation-box-head">
        <div>
          <span>CONVERSATION {String(conversation.sequence).padStart(3, '0')}</span>
          <strong>ONE INPUT / MULTIPLE OUTPUTS</strong>
        </div>
        <span className="atlas-conversation-count">
          {conversation.entries.length.toString().padStart(2, '0')} EVENTS
        </span>
      </header>
      <div className="atlas-conversation-stream">
        {conversation.entries.map((entry, index) => (
          <ConversationEntry key={`${entry.line}-${entry.kind}-${index}`} entry={entry} index={index} />
        ))}
      </div>
    </article>
  );
}

function SessionPrelude({ entries }: { entries: readonly ClaudeSessionEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <details className="atlas-session-prelude">
      <summary>
        <span>SESSION PRELUDE / {entries.length.toString().padStart(2, '0')} RECORDS</span>
        <strong>BEFORE FIRST INPUT / FULL COVERAGE</strong>
      </summary>
      <div className="atlas-session-prelude-list">
        {entries.map((entry, index) => (
          <ConversationEntry key={`prelude-${entry.line}-${index}`} entry={entry} index={index} />
        ))}
      </div>
    </details>
  );
}

function SessionSummary({ session }: { session: NonNullable<ReturnType<typeof useClaudeSession>['session']> }) {
  return (
    <div className="atlas-session-summary">
      <div className="atlas-session-signal" aria-hidden="true"><i /><i /><i /></div>
      <div className="atlas-session-summary-copy">
        <span>CLAUDE SESSION / FULL RECORD</span>
        <strong>{session.session.id ?? 'SESSION ID UNAVAILABLE'}</strong>
        <p>{session.session.cwd ?? 'cwd unavailable'} · {session.session.gitBranch ?? 'branch unavailable'}</p>
      </div>
      <dl>
        <div><dt>RECORDS</dt><dd>{session.summary.records}</dd></div>
        <div><dt>INPUT BOXES</dt><dd>{session.summary.conversations}</dd></div>
        <div><dt>THINKING</dt><dd>{session.summary.thinking}</dd></div>
        <div><dt>TOOLS</dt><dd>{session.summary.toolCalls}</dd></div>
      </dl>
    </div>
  );
}

export function AtlasSessionPanel() {
  const { status, session, message } = useClaudeSession();
  const [selectedId, setSelectedId] = useState('conversation-001');

  useEffect(() => {
    const firstRichConversation = session?.conversations.find((conversation) => (
      conversation.input.text.length < 120
      && conversation.entries.some((entry) => entry.kind === 'assistant' || entry.kind === 'thinking' || entry.kind === 'tool')
    ));
    if (firstRichConversation) setSelectedId(firstRichConversation.id);
    else if (session?.conversations[0]) setSelectedId(session.conversations[0].id);
  }, [session]);

  const selected = session?.conversations.find((conversation) => conversation.id === selectedId)
    ?? session?.conversations[0]
    ?? null;

  return (
    <section className="atlas-session-panel" data-session-state={status}>
      <header className="atlas-session-panel-head">
        <div>
          <span>LOOP 01 / MOTION GRAPHICS / SESSION EVIDENCE</span>
          <strong>CLAUDE SESSION IMPORT</strong>
        </div>
        <p><i /> READ-ONLY <i /> LOCAL ARTIFACT <i /> INPUT-BOUND BOXES</p>
      </header>

      {status === 'loading' && (
        <div className="atlas-session-empty"><Icon icon="solar:radar-2-outline" width={18} /> SESSION INDEXING</div>
      )}
      {(status === 'empty' || status === 'error') && (
        <div className="atlas-session-empty"><Icon icon="solar:danger-triangle-outline" width={18} /> {message}</div>
      )}

      {session && selected && (
        <>
          <SessionSummary session={session} />
          <div className="atlas-session-grid">
            <nav className="atlas-session-rail" aria-label="Claude 대화 목록">
              <div className="atlas-session-rail-head">
                <span>INPUT INDEX</span>
                <strong>{session.conversations.length.toString().padStart(2, '0')}</strong>
              </div>
              <div className="atlas-session-rail-list">
                {session.conversations.map((conversation) => (
                  <button
                    type="button"
                    key={conversation.id}
                    className={conversation.id === selected.id ? 'is-selected' : ''}
                    onClick={() => setSelectedId(conversation.id)}
                    aria-pressed={conversation.id === selected.id}
                  >
                    <span><small>{String(conversation.sequence).padStart(3, '0')}</small><time>{formatTimestamp(conversation.input.timestamp)}</time></span>
                    <strong>{compactText(conversation.input.text) || '입력 텍스트 없음'}</strong>
                    <em>{conversation.entries.length} EVENTS</em>
                  </button>
                ))}
              </div>
            </nav>
            <div className="atlas-session-detail">
              <SessionPrelude entries={session.prelude} />
              <ConversationBox conversation={selected} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
