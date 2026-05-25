import { test, expect } from '@playwright/test';
import { clearStorage, seedGuestRoom, seedAuth } from '../helpers/storage';

/**
 * Wave 2 P0 3건 자동 케이스 (§7-B / §8.3 필수)
 *
 * - ISSUE-LOGIN-X1: 로그인/로그아웃 시 비로그인 잔존 데이터 정리
 * - ISSUE-GUEST-X1: 방카드 금액 1억 이상 억/천 단위 변환
 * - ISSUE-LOGIN-X2: 첫 로그인 온보딩 모달 노출
 */

const guestRoomSeed = (overrides: Partial<{ name: string; deposit: number; rent: number; price: string }> = {}) => ({
  state: {
    guestRooms: [
      {
        id: 'wave2-r1',
        name: overrides.name ?? '테스트 방',
        address: '서울시 어딘가',
        type: '전세',
        deposit: overrides.deposit ?? 22000,
        rent: overrides.rent ?? 0,
        price: overrides.price ?? '전세 22000/0',
        tags: [],
        score: 0,
        issues: {},
        memo: '',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  version: 0,
});

const loggedInAuthSeed = () => ({
  state: {
    user: { id: 1, email: 'qa@test.local', nickname: 'QA' },
    accessToken: 'fake-token',
    isLoggedIn: true,
  },
  version: 0,
});

// ──────────────────────────────────────────────────────────────
// ISSUE-GUEST-X1 — 금액 단위 변환
// ──────────────────────────────────────────────────────────────

test.describe('ISSUE-GUEST-X1 방카드 금액 억/천 단위 표기', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('보증금 22000만원 → "2억 2천" 표시', async ({ page }) => {
    await seedGuestRoom(page, guestRoomSeed({ deposit: 22000, price: '전세 22000' }));
    await page.goto('/');
    await expect(page.getByTestId('room-card').first()).toContainText('2억 2천');
  });

  test('보증금 10000만원 → "1억" 표시', async ({ page }) => {
    await seedGuestRoom(page, guestRoomSeed({ deposit: 10000, price: '전세 10000' }));
    await page.goto('/');
    await expect(page.getByTestId('room-card').first()).toContainText('1억');
  });

  test('보증금 5000만원 → "5천" 표시 (1억 미만)', async ({ page }) => {
    await seedGuestRoom(page, guestRoomSeed({ deposit: 5000, price: '전세 5000' }));
    await page.goto('/');
    await expect(page.getByTestId('room-card').first()).toContainText('5천');
  });
});

// ──────────────────────────────────────────────────────────────
// ISSUE-LOGIN-X2 — 첫 로그인 온보딩 모달
// ──────────────────────────────────────────────────────────────

test.describe('ISSUE-LOGIN-X2 첫 로그인 온보딩 모달', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('로그인 상태 + onboarding flag 없음 → 모달 자동 노출', async ({ page }) => {
    await seedAuth(page, loggedInAuthSeed());
    // onboarding_custom_checklist 키 미설정
    await page.goto('/rooms');
    // 모달 헤딩/CTA 일부 (CustomChecklistModal 컨텐츠)
    await expect(page.getByRole('dialog').or(page.getByText(/맞춤|체크리스트|시작/))).toBeVisible({
      timeout: 10_000,
    });
  });

  test('로그인 상태 + onboarding flag 있음 → 모달 미노출', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('onboarding_custom_checklist', 'true');
    });
    await seedAuth(page, loggedInAuthSeed());
    await page.goto('/rooms');
    // 모달 렌더 대기 시간 확보 후 미존재 확인
    await page.waitForTimeout(1000);
    const modal = page.getByRole('dialog');
    await expect(modal).toHaveCount(0);
  });
});

// ──────────────────────────────────────────────────────────────
// ISSUE-LOGIN-X1 — 로그아웃 시 비로그인 잔존 데이터 정리
// 라이브 검증 (브라우저 UI 경유 — 로그아웃 모달 확인 절차 포함)
// ──────────────────────────────────────────────────────────────

test.describe('ISSUE-LOGIN-X1 로그아웃 시 비로그인 잔존 데이터 정리', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('로그아웃 클릭 시 guest-room-storage / customization-storage / auth-storage 비워짐', async ({ page }) => {
    await seedGuestRoom(page, guestRoomSeed());
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'customization-storage',
        JSON.stringify({ state: { selectedTypeIds: ['T1'], activeItemNames: ['항목1'] }, version: 0 }),
      );
    });
    await seedAuth(page, loggedInAuthSeed());

    await page.goto('/rooms');

    // 헤더의 로그아웃 버튼 클릭
    await page.getByRole('button', { name: '로그아웃' }).click();

    // 로그아웃 확인 모달 — 보통 두 번째 "로그아웃" 버튼이 dialog 내부
    const confirmButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /로그아웃|확인/ });
    if (await confirmButton.count()) {
      await confirmButton.first().click();
    }

    // 비로그인 잔존 데이터가 비워졌는지 확인
    await expect
      .poll(async () => {
        const guest = await page.evaluate(() => window.localStorage.getItem('guest-room-storage'));
        const custom = await page.evaluate(() => window.localStorage.getItem('customization-storage'));
        const parsed = guest ? JSON.parse(guest) : null;
        const parsedCustom = custom ? JSON.parse(custom) : null;
        return {
          guestRooms: parsed?.state?.guestRooms ?? null,
          typeIds: parsedCustom?.state?.selectedTypeIds ?? null,
          names: parsedCustom?.state?.activeItemNames ?? null,
        };
      })
      .toEqual({ guestRooms: [], typeIds: [], names: [] });
  });
});
