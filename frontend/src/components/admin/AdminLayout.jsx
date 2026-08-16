import {
  Armchair,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  LayoutGrid,
  Menu,
  Moon,
  Scissors,
  Search,
  Settings,
  Sun,
  UserCircle2,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { adminNavItems } from '../../config';
import { cn } from '../../lib/utils';
import { api } from '../../services/api';

function Icon({ name, className = 'h-5 w-5' }) {
  const icons = {
    LayoutGrid,
    Armchair,
    Users,
    Scissors,
    UserRound,
    CalendarDays,
    BarChart3,
    Settings,
  };
  const Component = icons[name] || LayoutGrid;
  return <Component className={className} />;
}

export default function AdminLayout() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('barberflow-theme') !== 'light');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentTitle = useMemo(() => {
    const item = adminNavItems.find((nav) => nav.path === location.pathname);
    return item ? item.label : 'စီမံခန့်ခွဲမှု';
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('barberflow-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const matchingNavItems = useMemo(() => (
    adminNavItems.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery]);

  useEffect(() => {
    let active = true;

    api.get('/auth/session/').catch(() => {
      if (active) navigate('/admin/login', { replace: true });
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      await api.post('/auth/logout/', {});
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white/90 p-5 backdrop-blur-xl transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900/90 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
              <div>
                <p className="text-xs tracking-[0.25em] text-violet-500">ဆံပင်ညှပ်ဆိုင်</p>
                <h1 className="mt-1 text-xl font-bold">BarberFlow</h1>
              </div>
              <button className="rounded-full border border-slate-200 p-2 lg:hidden dark:border-slate-700" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-7 space-y-2">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  )}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
              <p className="text-xs tracking-[0.2em] text-violet-600 dark:text-violet-300">စနစ်အခြေအနေ</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium">စနစ် အသုံးပြုနိုင်ပါသည်</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button className="rounded-xl border border-slate-200 p-2 lg:hidden dark:border-slate-700" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-xs tracking-[0.2em] text-slate-500">စီမံခန့်ခွဲမှု</p>
                  <h2 className="text-xl font-semibold">{currentTitle}</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative hidden md:block">
                  <button onClick={() => setSearchOpen((open) => !open)} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Search className="h-4 w-4" />
                    <span className="text-sm">စာမျက်နှာရှာရန်</span>
                  </button>
                  {searchOpen ? (
                    <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                      <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="စာမျက်နှာရှာရန်" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800" />
                      <div className="mt-2 space-y-1">
                        {matchingNavItems.map((item) => <button key={item.path} onClick={() => { navigate(item.path); setSearchOpen(false); setSearchQuery(''); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800">{item.label}</button>)}
                        {matchingNavItems.length === 0 ? <p className="px-3 py-2 text-sm text-slate-500">ကိုက်ညီသော စာမျက်နှာမရှိပါ</p> : null}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="relative">
                <button onClick={() => setNotificationsOpen((open) => !open)} className="relative rounded-xl border border-slate-200 bg-slate-100 p-2.5 dark:border-slate-700 dark:bg-slate-800" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
                </button>
                {notificationsOpen ? <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-900"><p className="font-semibold">အသိပေးချက်များ</p><p className="mt-2 text-slate-500 dark:text-slate-400">အသိပေးချက်အသစ် မရှိပါ</p></div> : null}
                </div>
                <button
                  className="rounded-xl border border-slate-200 bg-slate-100 p-2.5 dark:border-slate-700 dark:bg-slate-800"
                    aria-label={darkMode ? 'အလင်းရောင်ပုံစံသို့ ပြောင်းရန်' : 'အမှောင်ပုံစံသို့ ပြောင်းရန်'}
                  onClick={() => setDarkMode((prev) => !prev)}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <div className="relative">
                <button onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                  <UserCircle2 className="h-8 w-8 text-violet-500" />
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-semibold">Sarah Bell</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">မန်နေဂျာ</p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
                </button>
                {profileOpen ? <div className="absolute right-0 top-12 z-50 w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"><button onClick={signOut} className="w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">ထွက်ရန်</button></div> : null}
                </div>
              </div>
            </div>
          </header>

          <main className="p-5 lg:p-7">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
