export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const adminNavItems = [
  { label: 'အနှစ်ချုပ်', path: '/admin/dashboard', icon: 'LayoutGrid' },
  { label: 'ထိုင်ခုံများ', path: '/admin/seats', icon: 'Armchair' },
  { label: 'စောင့်ဆိုင်းစာရင်း', path: '/admin/queue', icon: 'Users' },
  { label: 'ဆံပင်ညှပ်ဆရာများ', path: '/admin/barbers', icon: 'Scissors' },
  { label: 'ဖောက်သည်များ', path: '/admin/customers', icon: 'UserRound' },
  { label: 'ချိန်းဆိုမှုများ', path: '/admin/appointments', icon: 'CalendarDays' },
  { label: 'စာရင်းအင်း', path: '/admin/analytics', icon: 'BarChart3' },
  { label: 'ဆက်တင်များ', path: '/admin/settings', icon: 'Settings' },
];
