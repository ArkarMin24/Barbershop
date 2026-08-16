import { CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../services/api';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await api.get('/appointments/');
      setAppointments(data);
    } catch (err) {
      setError(err.message || 'ချိန်းဆိုမှုများ မရယူနိုင်ပါ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, []);

  const updateStatus = async (appointment, status) => {
    try {
      const updated = await api.patch(`/appointments/${appointment.id}/status/`, { status });
      setAppointments((current) => current.map((item) => (item.id === appointment.id ? { ...item, ...updated } : item)));
    } catch (err) {
      setError(err.message || 'ချိန်းဆိုမှုအခြေအနေ မပြောင်းနိုင်ပါ');
    }
  };

  const removeAppointment = async (appointment) => {
    if (!window.confirm(`${appointment.customer_name} ၏ ချိန်းဆိုမှုကို ဖျက်မည်လား?`)) return;
    try {
      await api.del(`/appointments/${appointment.id}/delete/`);
      setAppointments((current) => current.filter((item) => item.id !== appointment.id));
    } catch (err) {
      setError(err.message || 'ချိန်းဆိုမှု ဖျက်မရပါ');
    }
  };

  if (loading) {
    return <div className="grid gap-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 w-full" />)}</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {appointments.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-4 text-lg font-semibold">စီစဉ်ထားသော ချိန်းဆိုမှုမရှိပါ</p>
        </div>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment.id} className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xl font-bold">{appointment.customer_name}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{appointment.barber_name || 'ဆံပင်ညှပ်ဆရာ မသတ်မှတ်ရသေးပါ'}</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={appointment.status} onChange={(event) => updateStatus(appointment, event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                <button onClick={() => removeAppointment(appointment)} className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-700 dark:text-rose-300">ဖျက်ရန်</button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-3">
              <div>စတင်ချိန်: {new Date(appointment.starts_at).toLocaleString()}</div>
              <div>ပြီးဆုံးချိန်: {new Date(appointment.ends_at).toLocaleString()}</div>
              <div>Seat: {appointment.seat_label || '—'}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
