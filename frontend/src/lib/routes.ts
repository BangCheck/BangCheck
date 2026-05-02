export const ROUTES = {
  HOME: '/',
  ROOMS: '/rooms',
  LOGIN: '/login',
  AUTH_CALLBACK: (provider: string) => `/auth/callback/${provider}`,
  REPORT: '/report',
  SETTINGS: '/settings',
  CHECKLIST_NEW: '/checklist/new',
  CHECKLIST_DETAIL: (id: string) => `/checklist/${id}`,
} as const;

export const PROTECTED_ROUTES: readonly string[] = [
  ROUTES.REPORT,
];

export const loginRedirect = (reason: 'expired' | 'auth_failed' | 'invalid_params'): string =>
  `${ROUTES.LOGIN}?error=${reason}`;
