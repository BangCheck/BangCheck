import { test, expect } from '@playwright/test';
import { clearStorage, seedGuestRoom } from '../helpers/storage';

/**
 * TC-P0-01 [UX-WEB-01] 문제요소 태그 렌더 [covers: NL-HM-09]
 * Issue: _woo/projects/08_BangCheck/07_test/qa-v2.1.2/wave1/wave1-UX-WEB-01-home-problem-tags.md
 *
 * 데이터 경로: guest-room-storage (zustand persist) → Room.issues 객체 → RoomCard chip.
 * 라벨: mold→곰팡이, leak→누수흔적, bug→벌레흔적, condensation→결로, drainSmell→냄새.
 */

const seedRoom = (id: string, name: string, issues: Record<string, boolean>) => ({
  state: {
    guestRooms: [
      {
        id,
        name,
        address: '',
        type: '월세',
        deposit: 0,
        rent: 0,
        price: '월세 0/0',
        tags: [],
        score: 0,
        issues,
        memo: '',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  version: 0,
});

test.describe('UX-WEB-01 HOME 문제요소 태그', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('2개 선택 시 곰팡이·누수흔적 태그 노출', async ({ page }) => {
    await seedGuestRoom(page, seedRoom('r1', '방1', { mold: true, leak: true }));
    await page.goto('/');

    const card = page.getByTestId('room-card').first();
    await expect(card.getByText('곰팡이')).toBeVisible();
    await expect(card.getByText('누수흔적')).toBeVisible();
  });

  test('4개 선택 시 3개 노출 + 추가 카운트 표시', async ({ page }) => {
    await seedGuestRoom(
      page,
      seedRoom('r2', '방2', { mold: true, leak: true, bug: true, drainSmell: true }),
    );
    await page.goto('/');

    const card = page.getByTestId('room-card').first();
    await expect(card.getByText('+ 1개의 문제사항')).toBeVisible();
  });

  test('0개 선택 시 "문제사항 없음" 표시', async ({ page }) => {
    await seedGuestRoom(page, seedRoom('r3', '방3', {}));
    await page.goto('/');

    const card = page.getByTestId('room-card').first();
    await expect(card.getByTestId('problem-tags')).toContainText('문제사항 없음');
  });
});
