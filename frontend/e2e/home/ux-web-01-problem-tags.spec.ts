import { test, expect } from '@playwright/test';
import { clearStorage, seedGuestRoom } from '../helpers/storage';

/**
 * TC-P0-01 [UX-WEB-01] 문제요소 태그 렌더 [covers: NL-HM-09]
 * Issue: _woo/projects/08_SWYP/07_test/qa-v2.1.2/wave1/wave1-UX-WEB-01-home-problem-tags.md
 *
 * 본 스펙은 §5 diff 적용 후 통과하는 것을 목표로 한다 (TDD-style).
 * 현재는 RoomCard에 문제요소 미노출 — fail 상태가 정상.
 */

test.describe('UX-WEB-01 HOME 문제요소 태그', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('2개 선택 시 곰팡이·누수흔적 태그 노출', async ({ page }) => {
    await seedGuestRoom(page, {
      state: {
        rooms: [
          {
            id: 'r1',
            name: '방1',
            problemTags: ['곰팡이', '누수흔적'],
          },
        ],
      },
      version: 0,
    });

    await page.goto('/');

    const card = page.getByTestId('room-card').first();
    await expect(card.getByText('곰팡이')).toBeVisible();
    await expect(card.getByText('누수흔적')).toBeVisible();
  });

  test('4개 선택 시 3개 노출 + "+1개" 표시', async ({ page }) => {
    await seedGuestRoom(page, {
      state: {
        rooms: [
          {
            id: 'r2',
            name: '방2',
            problemTags: ['곰팡이', '누수흔적', '벌레흔적', '소음'],
          },
        ],
      },
      version: 0,
    });

    await page.goto('/');

    const card = page.getByTestId('room-card').first();
    await expect(card.getByText('+1개')).toBeVisible();
  });

  test('0개 선택 시 "-" 표시', async ({ page }) => {
    await seedGuestRoom(page, {
      state: {
        rooms: [
          {
            id: 'r3',
            name: '방3',
            problemTags: [],
          },
        ],
      },
      version: 0,
    });

    await page.goto('/');

    const card = page.getByTestId('room-card').first();
    await expect(card.getByTestId('problem-tags')).toHaveText('-');
  });
});
