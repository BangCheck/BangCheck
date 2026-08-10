import { test, expect } from '@playwright/test';
import {
  CHECKLIST_ITEMS,
  BASE_ITEM_LABELS,
  TYPE_ITEM_MAP,
  recommendedItemsFor,
  step3Categories,
} from '../../src/features/customization/constants';

/**
 * STEP2 · STEP3 목록 규칙 — BC-CHK-08(#243) · BC-CHK-09(#244)
 *
 * 왜 브라우저를 안 띄우나
 *   맞춤 설정 화면은 비로그인에서 `inert` + `pointer-events-none` 이고(STEP 조작
 *   자체가 막힌다) 로그인 경로는 백엔드를 요구한다. e2e 로는 이 규칙에 닿을 수 없다.
 *   그래서 규칙을 화면 밖(`constants.ts`)으로 꺼내고 여기서 직접 검사한다.
 *   SettingsPage 는 이제 같은 함수를 부르므로, 화면과 검사가 같은 규칙을 본다.
 *
 * playwright 를 쓰는 것은 이 저장소에 유닛 러너가 없기 때문이다. 러너를 추가하려면
 * package.json 을 고쳐야 하는데 지금 그 파일은 다른 작업이 잡고 있다.
 */

const labelsOf = (items: { label: string }[]) => items.map((i) => i.label);

test.describe('#243 STEP2 — 그 유형의 추천 항목만', () => {
  // 유형 넷은 TYPE_ITEM_MAP 이 목록을 정한다. 첫자취형·핵심만은 그렇지 않아 따로 본다.
  const MAPPED_TYPES = ['BUG_AVOIDER', 'NOISE_SENSITIVE', 'CLEAN_FREAK', 'PERFORMANCE_TYPE'];

  for (const typeId of MAPPED_TYPES) {
    test(`${typeId} — TYPE_ITEM_MAP 과 정확히 같다`, () => {
      const got = recommendedItemsFor(typeId);
      expect(got.map((i) => i.id).sort()).toEqual([...TYPE_ITEM_MAP[typeId]].sort());
    });

    test(`${typeId} — 유형과 무관한 기본 항목이 섞이지 않는다`, () => {
      // 이것이 #243 의 본체다. 예전에는 기본 항목 24개가 앞에 붙었다.
      // 유형이 실제로 추천하는 기본 항목(예: '벌레 흔적')은 남아야 하므로,
      // "기본이면 무조건 없다"가 아니라 "매핑에 없는 것이 없다"를 본다.
      const mapped = new Set(TYPE_ITEM_MAP[typeId]);
      const strays = recommendedItemsFor(typeId).filter((i) => !mapped.has(i.id));
      expect(labelsOf(strays)).toEqual([]);
    });
  }

  test('첫자취형은 전체 항목이다', () => {
    expect(recommendedItemsFor('FIRST_TIMER')).toHaveLength(CHECKLIST_ITEMS.length);
  });

  test('핵심만 빠르게는 기본 항목이다', () => {
    const got = labelsOf(recommendedItemsFor('ESSENTIALS_ONLY'));
    expect(got.sort()).toEqual([...BASE_ITEM_LABELS].sort());
  });

  test('모르는 유형이면 빈 목록 — 지어내지 않는다', () => {
    expect(recommendedItemsFor('NO_SUCH_TYPE')).toEqual([]);
  });
});

test.describe('#244 STEP3 — 다섯 카테고리 · 전체 개수', () => {
  test('안전/보안은 STEP3 에서 빠진다', () => {
    expect(step3Categories().map((c) => c.label)).toEqual([
      '기본 옵션', '내부 상태', '문제 요소', '생활 편의', '주변 환경',
    ]);
  });

  test('각 카테고리가 전체 개수를 보여준다', () => {
    // 2026-07-29 PM 이 확정한 수다. 예전에는 기본 항목을 걷어내 이렇게 나왔다:
    //   기본 옵션 0 · 내부 상태 6 · 문제 요소 5 · 생활 편의 3 · 주변 환경 6
    // 0 이 된 카테고리는 화면에서 통째로 사라졌다.
    const counts = Object.fromEntries(step3Categories().map((c) => [c.label, c.items.length]));
    expect(counts).toEqual({
      '기본 옵션': 8, '내부 상태': 6, '문제 요소': 6, '생활 편의': 8, '주변 환경': 8,
    });
  });

  test('빈 카테고리가 하나도 없다 — 사라질 카테고리가 없다', () => {
    const empty = step3Categories().filter((c) => c.items.length === 0);
    expect(empty.map((c) => c.label)).toEqual([]);
  });

  test('기본 항목이 카테고리 안에 들어 있다', () => {
    // #244 의 본체. 기본 항목을 별도 묶음으로 빼내던 것을 되돌렸다.
    const shown = new Set(step3Categories().flatMap((c) => labelsOf(c.items)));
    // 안전/보안 8개는 STEP3 에서 제외되므로 기대에서도 뺀다.
    const safetyLabels = new Set(
      CHECKLIST_ITEMS.filter((i) => i.category === '안전/보안').map((i) => i.label),
    );
    const expected = BASE_ITEM_LABELS.filter((l) => !safetyLabels.has(l));
    for (const label of expected) {
      expect(shown.has(label), `'${label}' 이 카테고리 안에 있어야 한다`).toBe(true);
    }
  });

  test('STEP3 항목과 전체 항목의 차이는 안전/보안뿐이다', () => {
    const shown = step3Categories().reduce((n, c) => n + c.items.length, 0);
    const safety = CHECKLIST_ITEMS.filter((i) => i.category === '안전/보안').length;
    expect(shown + safety).toBe(CHECKLIST_ITEMS.length);
  });
});
