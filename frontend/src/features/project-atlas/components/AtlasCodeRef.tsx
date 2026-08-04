/**
 * 코드 식별자 한 조각 — 눌러서 복사한다.
 *
 * 이 캔버스는 개발 영역이다. 화면에서 본 경로·심볼·operationId를 그대로
 * 편집기 검색창에 붙일 수 있어야 "화면 ↔ 코드"가 실제로 이어진다.
 * 그래서 식별자는 전부 등폭이고 전부 복사 대상이다.
 *
 * 복사 실패를 성공처럼 보이게 두지 않는다 — clipboard API는 비보안 컨텍스트나
 * 권한 거부에서 그냥 reject한다. 그때는 '복사 실패'라고 적는다.
 */
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

type CopyState = 'idle' | 'done' | 'fail';

interface Props {
  /** 화면에 보이는 문자열 */
  text: string;
  /** 복사되는 문자열. 생략하면 text와 같다 */
  copyValue?: string;
  /** 앞에 붙는 작은 이름표 (예: FRONT, GET). 없으면 그리지 않는다 */
  tag?: string;
  /** 이름표를 강조색으로 칠할지 — 메서드처럼 값 자체가 분류인 경우에 쓴다 */
  tagAccent?: boolean;
}

export function AtlasCodeRef({ text, copyValue, tag, tagAccent = false }: Props) {
  const [state, setState] = useState<CopyState>('idle');
  // 타이머를 ref에 잡아둬야 연타할 때 이전 타이머가 새 상태를 지우지 않는다.
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const markState = (next: CopyState) => {
    setState(next);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setState('idle'), 1400);
  };

  const copy = () => {
    const value = copyValue ?? text;
    // navigator.clipboard는 보안 컨텍스트에서만 존재한다. 없으면 없다고 말한다.
    if (!navigator.clipboard) {
      markState('fail');
      return;
    }
    navigator.clipboard.writeText(value).then(
      () => markState('done'),
      () => markState('fail'),
    );
  };

  return (
    <button
      type="button"
      className="atlas-code-ref"
      data-copy-state={state}
      onClick={copy}
      title={`${copyValue ?? text} 복사`}
    >
      {tag && <em data-accent={tagAccent ? 'on' : 'off'}>{tag}</em>}
      <code>{text}</code>
      <Icon
        icon={
          state === 'done' ? 'solar:check-read-outline'
            : state === 'fail' ? 'solar:danger-triangle-outline'
              : 'solar:copy-outline'
        }
        width={11}
      />
      {state !== 'idle' && (
        <span className="atlas-code-ref-say">{state === 'done' ? '복사됨' : '복사 실패'}</span>
      )}
    </button>
  );
}
