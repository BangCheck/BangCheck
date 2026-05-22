import type { Page } from '@playwright/test';

const GUEST_ROOM_KEY = 'guest-room-storage';
const AUTH_KEY = 'auth-storage';

export async function clearStorage(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch {
      /* about:blank 등에서 접근 불가한 경우 무시 */
    }
  });
}

export async function seedGuestRoom(page: Page, data: unknown) {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    { key: GUEST_ROOM_KEY, value: data }
  );
}

export async function seedAuth(page: Page, user: unknown) {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    { key: AUTH_KEY, value: user }
  );
}
