export const ROUTES = {
  HOME: '/rooms',
  ROOMS: '/rooms',
  LOGIN: '/login',
  LOGIN_ERROR: '/login-error',
  AUTH_CALLBACK: (provider: string) => `/auth/callback/${provider}`,
  REPORT: '/report',
  SETTINGS: '/settings',
  CHECKLIST_NEW: '/checklist/new',
  CHECKLIST_DETAIL: (id: string) => `/checklist/${id}`,
  LANDING: '/',
} as const;

export const loginRedirect = (_reason?: string) => ROUTES.LOGIN;

export const PROTECTED_ROUTES: readonly string[] = [
  ROUTES.ROOMS,
  ROUTES.REPORT,
  ROUTES.SETTINGS,
  ROUTES.CHECKLIST_NEW,
];
