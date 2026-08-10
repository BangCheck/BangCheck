import { test, expect } from '@playwright/test';
import { clearStorage, seedGuestRoom } from '../helpers/storage';

/**
 * 방 카드 → 지도 위치 이동 (#245)
 *
 * 무엇을 붙드나
 *   1. 목록에서 지도로 **대상을 지정해 넘기는 경로**가 실제로 생겼는가 (`?roomId=`)
 *   2. **주소가 없는 방에는 아이콘이 없다**
 *
 * 2 가 이 테스트의 핵심이다. 지도는 `rooms.filter((r) => r.address)` 만 좌표로
 * 바꾼다. 주소 없는 방에 아이콘을 주면 눌러서 지도로 넘어간 뒤 **아무 일도
 * 일어나지 않고**, 사용자는 왜 안 되는지 알 방법이 없다.
 * #245 본문이 "정해야 한다"고 지목한 네 항목 중 하나다.
 *
 * 비로그인 방은 localStorage 에 있어 백엔드 없이 돈다.
 */

const ICON_LABEL = '지도에서 방 위치 보기';

// role=button 으로 찾으면 카드 컨테이너까지 잡힌다 — 그 div 가 role="button" 이고
// 접근성 이름이 자식 내용에서 만들어져 아이콘 라벨을 포함하기 때문이다.
// 실제 버튼만 겨냥한다.
const locateButtons = (page: import('@playwright/test').Page) =>
  page.locator(`button[aria-label="${ICON_LABEL}"]`);

const room = (id: string, name: string, address: string) => ({
  id,
  name,
  address,
  type: '월세',
  deposit: 0,
  rent: 0,
  price: '월세 0/0',
  tags: [],
  score: 0,
  issues: {},
  memo: '',
  createdAt: new Date().toISOString(),
});

const seed = (rooms: unknown[]) => ({ state: { guestRooms: rooms }, version: 0 });

test.describe('#245 방 카드에서 지도 위치로 이동', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('주소가 있는 방에만 위치 아이콘이 있다', async ({ page }) => {
    await seedGuestRoom(page, seed([
      room('r-addr', '주소있는방', '서울시 강남구 테헤란로 1'),
      room('r-noaddr', '주소없는방', ''),
    ]));
    await page.goto('/rooms');

    // 방 두 개가 모두 보이는데 아이콘은 하나뿐이어야 한다.
    await expect(page.getByText('주소있는방')).toBeVisible();
    await expect(page.getByText('주소없는방')).toBeVisible();
    await expect(locateButtons(page)).toHaveCount(1);
  });

  test('아이콘을 누르면 그 방을 지정해 지도로 간다', async ({ page }) => {
    await seedGuestRoom(page, seed([room('r-addr', '주소있는방', '서울시 강남구 테헤란로 1')]));
    await page.goto('/rooms');

    await locateButtons(page).click();

    // 대상 전달 방식은 쿼리스트링이다 — 이 계약이 깨지면 지도가 대상을 못 받는다.
    await expect(page).toHaveURL(/\/map\?roomId=r-addr/);
  });

  test('주소 없는 방만 있으면 아이콘이 하나도 없다', async ({ page }) => {
    await seedGuestRoom(page, seed([
      room('r-1', '주소없는방1', ''),
      room('r-2', '주소없는방2', ''),
    ]));
    await page.goto('/rooms');

    await expect(page.getByText('주소없는방1')).toBeVisible();
    await expect(locateButtons(page)).toHaveCount(0);
  });
});
