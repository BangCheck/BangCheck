import { test, expect, type Page } from '@playwright/test';
import { clearStorage, seedGuestRoom } from '../helpers/storage';

/**
 * BC-ROOM-06 — 비로그인 저장이 동적 체크 항목의 답변을 통째로 버린다
 * Issue: #241
 *
 * 무엇이 문제였나
 *   `addGuestRoom` 이 basic·building·interior·safety·custom 다섯 덩이만 넘겼다.
 *   화면이 실제로 수집하는 값은 `answers` 에 모이는데 그것이 인자에도, 저장 타입
 *   (`GuestRoomRaw`)에도 없었다. 읽는 쪽도 `setAnswers` 를 부르지 않아 동적 항목이
 *   전부 미선택으로 그려졌다.
 *
 * 왜 SAFETY·ENVIRONMENT 로 검사하나
 *   레거시 파생 경로(`deriveInteriorFromAnswers`)가 덮는 것은 PROBLEM 과
 *   INTERNAL_STATE 뿐이다. SAFETY·CONVENIENCE·ENVIRONMENT 는 어느 섹션으로도
 *   매핑되지 않아 `answers` 가 유일한 보관처다 — 이 카테고리가 결함의 표면이다.
 *   (`deriveSafetyFromAnswers` 는 아직 base 를 그대로 돌려준다.)
 *
 * 왜 픽스처를 손으로 적지 않았나
 *   `GuestRoomRaw` 는 다섯 섹션 50여 개 필드다. 손으로 적은 시드는 실제 저장물과
 *   어긋나고, 어긋난 채로도 테스트는 통과할 수 있다. 실제로 빈 객체로 시드했더니
 *   `building.options` 가 undefined 라 화면이 크래시했다 — 앱이 아니라 시드가 틀린
 *   것이었다. 그래서 **앱이 저장한 것을 그대로 다시 읽는다.**
 *
 * 비로그인 카탈로그는 정적이라(`data/guest-items.ts`, DEFAULT 항목만) 백엔드 없이 돈다.
 *   id 21 공동 현관       SAFETY      있음 / 없음
 *   id 37 편의점 / 마트    ENVIRONMENT 가깝다 / 보통 / 멀다
 */

const SAFETY_ITEM = { id: 21, label: '공동 현관', pick: '있음' };
const ENV_ITEM = { id: 37, label: '편의점 / 마트', pick: '가깝다' };

const GUEST_ROOM_KEY = 'guest-room-storage';

/** 항목 라벨 아래의 옵션 버튼. 라벨로 카드를 찾고 그 안에서 고른다. */
const optionButton = (page: Page, label: string, option: string) =>
  page
    .locator('div.flex.flex-col.gap-3')
    .filter({ has: page.getByText(label, { exact: true }) })
    .getByRole('button', { name: option, exact: true })
    .first();

/** 새 체크리스트를 채워 저장하고, 저장된 방을 통째로 돌려준다. */
async function createGuestRoom(page: Page, name: string) {
  await page.goto('/checklist/new');
  await page.getByPlaceholder('예 : 역삼역 원룸 3층').fill(name);
  await optionButton(page, SAFETY_ITEM.label, SAFETY_ITEM.pick).click();
  await optionButton(page, ENV_ITEM.label, ENV_ITEM.pick).click();
  await page.getByRole('button', { name: '저장하기' }).click();

  const stored = await page.evaluate((key) => localStorage.getItem(key), GUEST_ROOM_KEY);
  expect(stored, '저장 후 guest-room-storage 가 있어야 한다').not.toBeNull();
  const parsed = JSON.parse(stored as string);
  return { parsed, room: parsed.state.guestRooms.at(-1) };
}

test.describe('BC-ROOM-06 비로그인 동적 답변 보관', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('동적 답변이 저장에 실려 나간다', async ({ page }) => {
    const { room } = await createGuestRoom(page, '저장검사방');

    // 화면이 아니라 저장된 것을 직접 본다. 복원 경로가 고쳐지지 않았더라도
    // 저장 경로만 고쳐졌다면 이 검사는 통과해야 한다 — 두 경로를 갈라 놓는다.
    expect(room.raw.answers?.[SAFETY_ITEM.id]).toBe(SAFETY_ITEM.pick);
    expect(room.raw.answers?.[ENV_ITEM.id]).toBe(ENV_ITEM.pick);
  });

  test('저장한 답변이 상세 화면에서 선택 상태로 복원된다', async ({ page }) => {
    const { parsed, room } = await createGuestRoom(page, '복원검사방');

    // 앱이 저장한 것을 그대로 다시 심는다. `clearStorage` 가 addInitScript 라
    // **페이지를 열 때마다** localStorage 를 지우기 때문에, 다시 심지 않으면
    // 상세 화면이 방을 못 찾고 notFound 로 간다 — 결함이 아니라 하네스의 성질이다.
    await seedGuestRoom(page, parsed);
    await page.goto(`/checklist/${room.id}`);

    // 고치기 전에는 둘 다 aria-pressed=false 였다 — answers 를 세팅하지 않아서다.
    await expect(optionButton(page, SAFETY_ITEM.label, SAFETY_ITEM.pick)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(optionButton(page, ENV_ITEM.label, ENV_ITEM.pick)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('answers 없이 저장된 옛 방도 깨지지 않는다', async ({ page }) => {
    const { parsed, room } = await createGuestRoom(page, '레거시검사방');

    // 이 필드가 생기기 전에 저장된 방을 재현한다. optional 로 둔 이유가 이것이다 —
    // 필수로 뒀다면 기존 사용자의 방이 복원 시 깨졌을 것이다.
    delete room.raw.answers;
    await seedGuestRoom(page, parsed);
    await page.goto(`/checklist/${room.id}`);

    // 복원할 답이 없으니 미선택이 정상이다. 화면이 뜨는 것 자체가 검사 대상이다.
    await expect(page.getByText(SAFETY_ITEM.label, { exact: true })).toBeVisible();
    await expect(optionButton(page, SAFETY_ITEM.label, SAFETY_ITEM.pick)).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
