const COOKIE_MAX_AGE_DAYS = 7;

export const setTokenCookie = (token: string): void => {
  if (typeof window === 'undefined') return;
  const expires = new Date(Date.now() + COOKIE_MAX_AGE_DAYS * 864e5).toUTCString();
  document.cookie = `accessToken=${token}; expires=${expires}; path=/; SameSite=Lax`;
};

export const deleteTokenCookie = (): void => {
  if (typeof window === 'undefined') return;
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};
