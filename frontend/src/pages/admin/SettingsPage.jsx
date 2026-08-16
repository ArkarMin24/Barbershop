import { Check, Settings as SettingsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import ShopQrCode from '../../components/ShopQrCode';

const defaultSettings = [
  { label: 'Live seat sync', enabled: true },
  { label: 'Auto queue alerts', enabled: true },
  { label: 'Appointment reminders', enabled: false },
  { label: 'Night shift mode', enabled: true },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('barberflow-settings')) || defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('barberflow-settings', JSON.stringify(settings));
  }, [settings]);

  const toggleSetting = (label) => {
    setSettings((current) => current.map((setting) => (
      setting.label === label ? { ...setting, enabled: !setting.enabled } : setting
    )));
  };

  return (
    <div className="space-y-5">
      {settings.map((setting) => (
        <div key={setting.label} className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <p className="text-lg font-medium">{setting.label}</p>
          </div>

          <button onClick={() => toggleSetting(setting.label)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${setting.enabled ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
            {setting.enabled ? <Check className="h-4 w-4" /> : null}
            {setting.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      ))}
      <ShopQrCode />
    </div>
  );
}
