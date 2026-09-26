const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const apiBaseUrl = configuredApiUrl.replace(/\/$/, '');
const configuredWsUrl = import.meta.env.VITE_WS_URL || apiBaseUrl.replace(/\/api$/, '');

const normalizeWebSocketBase = (value) => value
  .replace(/^http:\/\//i, 'ws://')
  .replace(/^https:\/\//i, 'wss://')
  .replace(/\/$/, '');

export const API_BASE_URL = apiBaseUrl;
export const WS_BASE_URL = normalizeWebSocketBase(configuredWsUrl);

export const adminNavItems = [
  { label: 'Overview', path: '/admin/dashboard', icon: 'LayoutGrid' },
  { label: 'Seats', path: '/admin/seats', icon: 'Armchair' },
  { label: 'Queue', path: '/admin/queue', icon: 'Users' },
  { label: 'Barbers', path: '/admin/barbers', icon: 'Scissors' },
  { label: 'Customers', path: '/admin/customers', icon: 'UserRound' },
  { label: 'Appointments', path: '/admin/appointments', icon: 'CalendarDays' },
  { label: 'Analytics', path: '/admin/analytics', icon: 'BarChart3' },
  { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
];
