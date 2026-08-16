import { CheckCircle2, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
    error: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200',
    info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200',
  };

  const IconMap = {
    success: CheckCircle2,
    error: X,
    info: Info,
  };

  const Icon = IconMap[toast.type] || Info;

  return (
    <div className={`fixed right-5 top-5 z-50 flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-2xl transition-all ${styles[toast.type]}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message ? <p className="mt-1 text-xs opacity-80">{toast.message}</p> : null}
      </div>
      <button type="button" className="rounded-full p-1 opacity-70 hover:opacity-100" onClick={() => onClose(toast.id)}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
