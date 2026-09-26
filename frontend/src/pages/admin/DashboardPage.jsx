import { CalendarDays, Clock3, RefreshCcw, Scissors, Users, Armchair, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import StatCard from '../../components/admin/StatCard';
import { api } from '../../services/api';
import { createSeatSocket } from '../../services/liveSeatSocket';
import { Skeleton } from '../../components/ui/Skeleton';

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    totalSeats: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    waitingCustomers: 0,
    todayAppointments: 0,
    leadBarber: 'No appointments yet',
    busiestHour: 'No schedule data yet',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveSeatSync, setLiveSeatSync] = useState(true);

  useEffect(() => {
    const readLiveSync = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('barberflow-settings')) || [];
        setLiveSeatSync(saved.find((setting) => setting.key === 'liveSeatSync')?.enabled ?? true);
      } catch {
        setLiveSeatSync(true);
      }
    };

    readLiveSync();
    window.addEventListener('barberflow-settings-change', readLiveSync);
    return () => window.removeEventListener('barberflow-settings-change', readLiveSync);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [seats, queue, appointments, barbers] = await Promise.all([
          api.get('/seats/'),
          api.get('/queue/'),
          api.get('/appointments/'),
          api.get('/barbers/'),
        ]);

        const barberCounts = appointments.reduce((counts, appointment) => {
          if (appointment.barber_name) counts[appointment.barber_name] = (counts[appointment.barber_name] || 0) + 1;
          return counts;
        }, {});
        const leadBarber = Object.entries(barberCounts).sort(([, first], [, second]) => second - first)[0]?.[0]
          || `${barbers[0]?.first_name || ''} ${barbers[0]?.last_name || ''}`.trim()
          || 'No appointments yet';
        const hourCounts = appointments.reduce((counts, appointment) => {
          const hour = new Date(appointment.starts_at).getHours();
          counts[hour] = (counts[hour] || 0) + 1;
          return counts;
        }, {});
        const busiestHourValue = Object.entries(hourCounts).sort(([, first], [, second]) => second - first)[0]?.[0];
        const busiestHour = busiestHourValue === undefined ? 'No schedule data yet' : `${String(busiestHourValue).padStart(2, '0')}:00 - ${String((Number(busiestHourValue) + 1) % 24).padStart(2, '0')}:00`;

        setSummary({
          totalSeats: seats.length,
          available: seats.filter((seat) => seat.status === 'AVAILABLE').length,
          occupied: seats.filter((seat) => seat.status === 'OCCUPIED').length,
          reserved: seats.filter((seat) => seat.status === 'RESERVED').length,
          waitingCustomers: queue.filter((entry) => entry.status === 'WAITING').length,
          todayAppointments: appointments.filter((appt) => new Date(appt.starts_at).toDateString() === new Date().toDateString()).length,
          leadBarber,
          busiestHour,
        });
      } catch (err) {
        setError(err.message || 'ဒက်ရှ်ဘုတ် အချက်အလက်များ မရယူနိုင်ပါ');
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const socket = liveSeatSync ? createSeatSocket({ onUpdate: loadData }) : null;

    return () => socket?.close();
  }, [refreshKey, liveSeatSync]);

  const cards = useMemo(() => [
    { title: 'Total seats', value: summary.totalSeats, tone: 'amber', icon: Armchair, subtitle: 'Current seating capacity' },
    { title: 'Available seats', value: summary.available, tone: 'emerald', icon: Sparkles, subtitle: 'Ready for service' },
    { title: 'In use', value: summary.occupied, tone: 'amber', icon: Clock3, subtitle: 'Currently occupied' },
    { title: 'Reserved', value: summary.reserved, tone: 'rose', icon: Scissors, subtitle: 'Booked seats' },
    { title: 'Waiting customers', value: summary.waitingCustomers, tone: 'sky', icon: Users, subtitle: 'Active queue' },
    { title: "Today's appointments", value: summary.todayAppointments, tone: 'amber', icon: CalendarDays, subtitle: 'Bookings scheduled today' },
  ], [summary]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end">
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"><RefreshCcw className="h-4 w-4" />Refresh overview</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live operations</h3>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">Live updates</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-slate-800">
              <p className="text-sm text-slate-500">Available seats</p>
              <p className="mt-2 text-3xl font-bold text-emerald-500">{summary.available}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-amber-50 dark:bg-slate-800/60 dark:hover:bg-slate-800">
              <p className="text-sm text-slate-500">Waiting customers</p>
              <p className="mt-2 text-3xl font-bold text-amber-500">{summary.waitingCustomers}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold">Staff insights</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/50 dark:border-slate-800 dark:hover:bg-slate-800">
              <p className="text-sm text-slate-500">Most booked barber</p>
              <p className="mt-2 text-xl font-semibold">{summary.leadBarber}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/50 dark:border-slate-800 dark:hover:bg-slate-800">
              <p className="text-sm text-slate-500">Busiest booking hour</p>
              <p className="mt-2 text-xl font-semibold">{summary.busiestHour}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
