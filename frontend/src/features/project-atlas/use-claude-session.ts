import { useEffect, useState } from 'react';
import { CLAUDE_SESSION_URL } from './claude-session';
import type { ClaudeSessionLoadState, ClaudeSessionSnapshot } from './claude-session';

export function useClaudeSession(): ClaudeSessionLoadState {
  const [state, setState] = useState<ClaudeSessionLoadState>({
    status: 'loading',
    session: null,
    message: null,
  });

  useEffect(() => {
    let active = true;

    fetch(CLAUDE_SESSION_URL, { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<ClaudeSessionSnapshot>;
      })
      .then((session) => {
        if (!active) return;
        setState(session
          ? { status: 'ready', session, message: null }
          : { status: 'empty', session: null, message: '가져온 Claude 세션이 없습니다.' });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : '세션을 읽지 못했습니다.';
        setState({ status: 'error', session: null, message });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
