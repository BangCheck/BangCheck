/**
 * 기능 통신 FLOW — 사용자 / 화면 / 서버 세 레인을 세로로 두고,
 * 단계가 레인 사이를 오갈 때마다 화살표로 잇는다.
 *
 * 시퀀스 다이어그램의 왕복 화살표와 같은 읽기 방식이다. 인허가 절차도처럼
 * "누가 받아서 누구에게 넘겼는가"가 한눈에 보여야 API 계약을 읽을 수 있다.
 *
 * 데이터는 CardStep.actor(USER|FRONT|BACK)를 그대로 쓴다 — 그리려고 새로 만든
 * 축이 아니라 이미 카드가 가지고 있던 축이다.
 * 다이어그램 라이브러리를 쓰지 않는다. CSS grid의 열 지정만으로 충분하고,
 * 그래야 6개 테마 변수를 그대로 따라간다.
 */
import { ACTOR_LABEL } from '../atlas-theme';
import { AtlasCodeRef } from './AtlasCodeRef';
import type { CardStep } from '@/types/atlas-card';

/** 레인 순서 = 요청이 흘러가는 방향. 오른쪽으로 갈수록 안쪽 계층이다. */
const LANES: ReadonlyArray<CardStep['actor']> = ['USER', 'FRONT', 'BACK'];

interface Props {
  steps: readonly CardStep[];
}

export function AtlasCardFlow({ steps }: Props) {
  if (steps.length === 0) {
    return <p className="is-muted">기록된 단계가 없다.</p>;
  }

  return (
    <div className="atlas-flow">
      <div className="atlas-flow-head">
        {LANES.map((lane) => (
          <span key={lane} data-actor={lane}>{ACTOR_LABEL[lane]}</span>
        ))}
      </div>

      <div className="atlas-flow-body">
        {/* 레인 세로선. 내용이 아니라 배경이라 aria에서 감춘다 */}
        <div className="atlas-flow-lanes" aria-hidden="true">
          {LANES.map((lane) => <span key={lane} />)}
        </div>

        <ol className="atlas-flow-steps">
          {steps.map((step, index) => {
            const lane = LANES.indexOf(step.actor);
            const previousLane = index === 0 ? -1 : LANES.indexOf(steps[index - 1].actor);
            const moved = previousLane >= 0 && previousLane !== lane;

            return (
              <li key={`${step.actor}-${index}`} className="atlas-flow-row">
                {moved && (
                  <span
                    className="atlas-flow-arrow"
                    data-dir={lane > previousLane ? 'right' : 'left'}
                    // 지나온 레인만큼 정확히 걸치게 한다 — 화살표 길이가 곧 계층 이동 폭이다.
                    // 행을 못 박지 않으면 자동 배치가 화살표와 단계를 같은 줄에 끼워 넣는다.
                    style={{
                      gridRow: 1,
                      gridColumn: `${Math.min(previousLane, lane) + 1} / ${Math.max(previousLane, lane) + 2}`,
                    }}
                  >
                    <i className="atlas-flow-arrow-line" />
                    <i className="atlas-flow-arrow-head" />
                    <b>{ACTOR_LABEL[LANES[previousLane]]} → {ACTOR_LABEL[step.actor]}</b>
                  </span>
                )}

                <span
                  className="atlas-flow-box"
                  data-actor={step.actor}
                  style={{ gridRow: 2, gridColumn: `${lane + 1} / ${lane + 2}` }}
                >
                  <em>{String(index + 1).padStart(2, '0')}</em>
                  <span className="atlas-flow-text">{step.step}</span>
                  {step.source && <AtlasCodeRef text={step.source} />}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
