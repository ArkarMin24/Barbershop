import { CalendarDays, Clock3, Scissors, UserRound, Users, Armchair, Sparkles } from 'lucide-react';
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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [seats, queue, appointments] = await Promise.all([
          api.get('/seats/'),
          api.get('/queue/'),
          api.get('/appointments/'),
        ]);

        setSummary({
          totalSeats: seats.length,
          available: seats.filter((seat) => seat.status === 'AVAILABLE').length,
          occupied: seats.filter((seat) => seat.status === 'OCCUPIED').length,
          reserved: seats.filter((seat) => seat.status === 'RESERVED').length,
          waitingCustomers: queue.filter((entry) => entry.status === 'WAITING').length,
          todayAppointments: appointments.filter((appt) => new Date(appt.starts_at).toDateString() === new Date().toDateString()).length,
        });
      } catch (err) {
        setError(err.message || 'ဒက်ရှ်ဘုတ် အချက်အလက်များ မရယူနိုင်ပါ');
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const socket = createSeatSocket({
      onUpdate: () => {
        loadData();
      },
    });

    return () => socket.close();
  }, []);

  const cards = useMemo(() => [
    { title: 'ထိုင်ခုံစုစုပေါင်း', value: summary.totalSeats, tone: 'violet', icon: Armchair, subtitle: 'လက်ရှိထိုင်ခုံအရေအတွက်' },
    { title: 'အားလပ်နေသည်', value: summary.available, tone: 'emerald', icon: Sparkles, subtitle: 'ဝန်ဆောင်မှုပေးရန် အသင့်' },
    { title: 'အသုံးပြုနေသည်', value: summary.occupied, tone: 'amber', icon: Clock3, subtitle: 'ဝန်ဆောင်မှုပေးနေသည်' },
    { title: 'ကြိုတင်ယူထားသည်', value: summary.reserved, tone: 'rose', icon: Scissors, subtitle: 'ဘွတ်ကင်လုပ်ထားသော ထိုင်ခုံ' },
    { title: 'စောင့်ဆိုင်းနေသော ဖောက်သည်', value: summary.waitingCustomers, tone: 'sky', icon: Users, subtitle: 'လက်ရှိ စောင့်ဆိုင်းစာရင်း' },
    { title: 'ယနေ့ ချိန်းဆိုမှုများ', value: summary.todayAppointments, tone: 'violet', icon: CalendarDays, subtitle: 'ယနေ့အတွက် စီစဉ်ထားသည်' },
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">တိုက်ရိုက် လုပ်ငန်းအခြေအနေ</h3>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">တိုက်ရိုက် အပ်ဒိတ်</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-sm text-slate-500">အားလပ်သော ထိုင်ခုံ</p>
              <p className="mt-2 text-3xl font-bold text-emerald-500">{summary.available}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-sm text-slate-500">ယနေ့ စောင့်ဆိုင်းစာရင်း</p>
              <p className="mt-2 text-3xl font-bold text-violet-500">{summary.waitingCustomers}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold">ဝန်ထမ်းအချက်အလက်</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm text-slate-500">ဦးစားပေး ဆံပင်ညှပ်ဆရာ</p>
              <p className="mt-2 text-xl font-semibold">Alex Stone</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm text-slate-500">ဘွတ်ကင်အများဆုံး အချိန်</p>
              <p className="mt-2 text-xl font-semibold">13:00 - 14:00</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
