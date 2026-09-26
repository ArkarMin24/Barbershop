import { AlarmClockCheck, BadgeCheck, BriefcaseBusiness, Clock3, Scissors, UserRound } from 'lucide-react';

const statusStyles = {
  AVAILABLE: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  OCCUPIED: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  RESERVED: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
};

export default function SeatCard({ seat, onClick }) {
  const status = seat.status || 'AVAILABLE';

  return (
    <button
      type="button"
      onClick={() => onClick(seat)}
      className="group w-full rounded-[28px] border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 ease-out hover:border-amber-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Seat {String(seat.id).padStart(2, '0')}</p>
          <h3 className="mt-2 text-xl font-bold">{seat.label || `Seat ${String(seat.id).padStart(2, '0')}`}</h3>
        </div>
        <div className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] ${statusStyles[status]}`}>
          {status}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <UserRound className="h-4 w-4" />
          <span>{seat.barber_name || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <BriefcaseBusiness className="h-4 w-4" />
          <span>{seat.barber ? `Barber ${seat.barber}` : 'No barber assigned'}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {status === 'AVAILABLE' ? <BadgeCheck className="h-4 w-4 text-emerald-500" /> : status === 'OCCUPIED' ? <AlarmClockCheck className="h-4 w-4 text-amber-500" /> : <Clock3 className="h-4 w-4 text-rose-500" />}
          {status === 'AVAILABLE' ? 'Ready' : status === 'OCCUPIED' ? 'In service' : 'Reserved'}
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-300">
          <Scissors className="h-4 w-4" />
          Manage
        </div>
      </div>
    </button>
  );
}
