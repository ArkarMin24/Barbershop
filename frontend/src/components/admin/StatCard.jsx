export default function StatCard({ title, value, change, tone = 'amber', icon: Icon, subtitle }) {
  const tones = {
    amber: 'from-amber-500/15 to-amber-500/5 text-amber-600 ring-amber-500/15 dark:text-amber-300',
    emerald: 'from-emerald-500/15 to-emerald-500/5 text-emerald-600 ring-emerald-500/15 dark:text-emerald-300',
    rose: 'from-rose-500/15 to-rose-500/5 text-rose-600 ring-rose-500/15 dark:text-rose-300',
    sky: 'from-sky-500/15 to-sky-500/5 text-sky-600 ring-sky-500/15 dark:text-sky-300',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br p-3 ring-1 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {subtitle ? <div className="mt-5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</div> : null}
    </div>
  );
}
