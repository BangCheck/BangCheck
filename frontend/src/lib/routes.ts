export const ROUTES = {
  HOME: '/rooms',
  ROOMS: '/rooms',
  LOGIN: '/login',
  AUTH_CALLBACK: (provider: string) => `/auth/callback/${provider}`,
  REPORT: '/report',
  SETTINGS: '/settings',
  CHECKLIST_NEW: '/checklist/new',
  CHECKLIST_DETAIL: (id: string) => `/checklist/${id}`,
  LANDING: '/',
} as const;

export const PROTECTED_ROUTES: readonly string[] = [
  ROUTES.ROOMS,
  ROUTES.REPORT,
  ROUTES.SETTINGS,
  ROUTES.CHECKLIST_NEW,
];

export const loginRedirect = (reason: 'expired' | 'auth_failed' | 'invalid_params'): string =>
  `${ROUTES.LOGIN}?error=${reason}`;
