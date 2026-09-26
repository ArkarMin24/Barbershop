import { Check, Moon, Settings as SettingsIcon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import ShopQrCode from '../../components/ShopQrCode';

const defaultSettings = [
  { key: 'liveSeatSync', label: 'Live seat sync', description: 'Refresh seat changes from the live connection.', enabled: true },
  { key: 'queueAlerts', label: 'Queue alerts', description: 'Show waiting customer notifications in the header.', enabled: true },
  { key: 'appointmentReminders', label: 'Appointment reminders', description: 'Include today\'s appointments in notifications.', enabled: true },
];

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('barberflow-settings'));
    if (!Array.isArray(saved)) return defaultSettings;
    return defaultSettings.map((setting) => ({
      ...setting,
      enabled: saved.find((item) => item.key === setting.key || item.label === setting.label)?.enabled ?? setting.enabled,
    }));
  } catch {
    return defaultSettings;
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(readSettings);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('barberflow-theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('barberflow-settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('barberflow-settings-change'));
  }, [settings]);

  const toggleSetting = (key) => {
    setSettings((current) => current.map((setting) => (
      setting.key === key ? { ...setting, enabled: !setting.enabled } : setting
    )));
  };

  const toggleTheme = () => {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);
    localStorage.setItem('barberflow-theme', nextDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', nextDarkMode);
    window.dispatchEvent(new Event('barberflow-settings-change'));
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"><SettingsIcon className="h-5 w-5" /></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Workspace settings</p><h2 className="mt-1 text-2xl font-semibold">Make BarberFlow work your way</h2></div>
        </div>
      </section>
      {settings.map((setting) => (
        <div key={setting.key} className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div><p className="text-lg font-medium">{setting.label}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{setting.description}</p></div>

          <button type="button" onClick={() => toggleSetting(setting.key)} aria-pressed={setting.enabled} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${setting.enabled ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'}`}>
            {setting.enabled ? <Check className="h-4 w-4" /> : null}
            {setting.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div><p className="text-lg font-medium">Appearance</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose the theme used across the admin workspace.</p></div>
        <button type="button" onClick={toggleTheme} aria-pressed={darkMode} aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'} title={darkMode ? 'Switch to light theme' : 'Switch to dark theme'} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300">
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
      <ShopQrCode />
    </div>
  );
}
