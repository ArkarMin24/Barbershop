import { Activity, CalendarDays, CircleDot, Clock3, RefreshCcw, Scissors, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { createSeatSocket } from '../services/liveSeatSocket';

export default function CustomerPage() {
  const [seats, setSeats] = useState([]);
  const [shops, setShops] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [toast, setToast] = useState(null);
  const [booking, setBooking] = useState({ first_name: '', last_name: '', phone: '', email: '', barber: '', seat: '', starts_at: '', notes: '' });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const loadSeats = async () => {
    try {
      setLoading(true);
      const [seatData, shopData, barberData, queueData] = await Promise.all([
        api.get('/seats/'),
        api.get('/shop/'),
        api.get('/barbers/'),
        api.get('/queue/'),
      ]);
      setSeats(seatData);
      setShops(shopData);
      setBarbers(barberData);
      setQueue(queueData);
      setError('');
    } catch (err) {
      setError(err.message || 'ထိုင်ခုံအခြေအနေ မရယူနိုင်ပါ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeats();

    const socket = createSeatSocket({
      onUpdate: (payload) => {
        setSeats((currentSeats) => {
          const exists = currentSeats.some((seat) => seat.id === payload.id);
          if (exists) {
            return currentSeats.map((seat) => (seat.id === payload.id ? payload : seat));
          }
          return [...currentSeats, payload];
        });

        setToast({
          title: 'ထိုင်ခုံအခြေအနေ ပြောင်းလဲပြီးပါပြီ',
          message: `${payload.label || `ထိုင်ခုံ ${payload.id}`} အခြေအနေ: ${payload.status}`,
        });

        window.setTimeout(() => setToast(null), 2500);
      },
      onConnectionChange: setConnectionStatus,
      onError: (message) => {
        setError(message || 'WebSocket error');
      },
    });

    return () => socket.close();
  }, []);

  const summary = useMemo(() => {
    const available = seats.filter((seat) => seat.status === 'AVAILABLE').length;
    const occupied = seats.filter((seat) => seat.status === 'OCCUPIED').length;
    const reserved = seats.filter((seat) => seat.status === 'RESERVED').length;
    const currentQueue = queue.filter((entry) => ['WAITING', 'SERVING'].includes(entry.status));
    const waiting = currentQueue.filter((entry) => entry.status === 'WAITING').length;
    return { available, occupied, reserved, currentQueue, waiting, estimatedWait: waiting * 15 };
  }, [seats, queue]);

  const availableSeats = seats.filter((seat) => seat.status === 'AVAILABLE');
  const selectedSeat = seats.find((seat) => String(seat.id) === booking.seat);
  const bookingBarbers = barbers.filter((barber) => !selectedSeat || barber.shop === selectedSeat.shop);

  const updateBooking = (field, value) => {
    setBooking((current) => ({ ...current, [field]: value }));
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    if (!selectedSeat) {
      setBookingError('အားလပ်သော ထိုင်ခုံကို ရွေးချယ်ပါ။');
      return;
    }
    if (!booking.phone.trim() && !booking.email.trim()) {
      setBookingError('ဖုန်းနံပါတ် သို့မဟုတ် အီးမေးလ်လိပ်စာ ဖြည့်ပါ။');
      return;
    }

    try {
      setBookingSubmitting(true);
      setBookingError('');
      setBookingSuccess('');
      await api.post('/appointments/book/', {
        ...booking,
        shop: selectedSeat.shop,
        seat: Number(booking.seat),
        barber: booking.barber ? Number(booking.barber) : null,
        starts_at: new Date(booking.starts_at).toISOString(),
      });
      setBookingSuccess('သင်၏ ချိန်းဆိုမှုကို စီစဉ်ပြီးပါပြီ။');
      setBooking((current) => ({ ...current, seat: '', barber: '', starts_at: '', notes: '' }));
    } catch (err) {
      setBookingError(err.message || 'ချိန်းဆိုမှုကို စီစဉ်မရပါ။');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const statusTone = {
    connected: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    connecting: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
    reconnecting: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
    error: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
  };

  const shop = shops[0];

  if (loading && seats.length === 0) {
    return <div className="p-8 text-slate-600">ထိုင်ခုံအခြေအနေ ရယူနေပါသည်...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs tracking-[0.3em] text-violet-400">ဆံပင်ညှပ်ဆိုင်</p>
            <h1 className="mt-2 text-3xl font-bold">{shop?.name || 'ထိုင်ခုံအခြေအနေ'}</h1>
            <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${shop?.is_active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-200'}`}>{shop?.is_active ? 'ဖွင့်ထားပါသည်' : 'ပိတ်ထားပါသည်'}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${statusTone[connectionStatus] || statusTone.connected}`}>
              <CircleDot className="h-3.5 w-3.5 fill-current" />
              {connectionStatus === 'connected' ? 'ချိတ်ဆက်ပြီး' : 'ချိတ်ဆက်နေသည်'}
            </span>
            <button onClick={loadSeats} className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200">
              <RefreshCcw className="h-4 w-4" />
              ပြန်လည်ရယူရန်
            </button>
          </div>
        </header>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
        ) : null}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-xs tracking-[0.25em] text-emerald-200">အားလပ်နေသည်</p>
            <p className="mt-3 text-4xl font-bold text-emerald-300">{summary.available}</p>
          </div>
          <div className="rounded-[24px] border border-amber-500/30 bg-amber-500/10 p-5">
            <p className="text-xs tracking-[0.25em] text-amber-200">အသုံးပြုနေသည်</p>
            <p className="mt-3 text-4xl font-bold text-amber-300">{summary.occupied}</p>
          </div>
          <div className="rounded-[24px] border border-violet-500/30 bg-violet-500/10 p-5">
            <p className="text-xs tracking-[0.25em] text-violet-200">တိုက်ရိုက် အပ်ဒိတ်</p>
            <p className="mt-3 flex items-center gap-2 text-base font-medium text-violet-200">
              <Activity className="h-5 w-5" />
              ပြန်လည်ရယူရန် မလိုအပ်ပါ
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-[28px] border border-violet-500/30 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30">
          <div className="mb-6 flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-violet-300" />
            <div>
              <p className="text-xs tracking-[0.25em] text-violet-300">ချိန်းဆိုရန်</p>
              <h2 className="mt-1 text-2xl font-bold">သင်၏ ချိန်းဆိုမှုကို စီစဉ်ပါ</h2>
            </div>
          </div>
          <div className="rounded-[24px] border border-rose-500/30 bg-rose-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-200">Reserved</p>
            <p className="mt-3 text-4xl font-bold text-rose-300">{summary.reserved}</p>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={submitBooking}>
            <input required value={booking.first_name} onChange={(event) => updateBooking('first_name', event.target.value)} placeholder="First name" className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-violet-400" />
            <input required value={booking.last_name} onChange={(event) => updateBooking('last_name', event.target.value)} placeholder="Last name" className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-violet-400" />
            <input value={booking.phone} onChange={(event) => updateBooking('phone', event.target.value)} placeholder="Phone number (phone or email required)" className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-violet-400" />
            <input type="email" value={booking.email} onChange={(event) => updateBooking('email', event.target.value)} placeholder="Email address (phone or email required)" className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-violet-400" />
            <select required value={booking.seat} onChange={(event) => updateBooking('seat', event.target.value)} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-violet-400">
              <option value="">Choose an available seat</option>
              {availableSeats.map((seat) => <option key={seat.id} value={seat.id}>{seat.label} — {seat.shop_name}</option>)}
            </select>
            <select value={booking.barber} onChange={(event) => updateBooking('barber', event.target.value)} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-violet-400">
              <option value="">No barber preference</option>
              {bookingBarbers.map((barber) => <option key={barber.id} value={barber.id}>{barber.first_name} {barber.last_name}</option>)}
            </select>
            <input required type="datetime-local" value={booking.starts_at} onChange={(event) => updateBooking('starts_at', event.target.value)} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-violet-400" />
            <input value={booking.notes} onChange={(event) => updateBooking('notes', event.target.value)} placeholder="Notes (optional)" className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-violet-400" />
            {bookingError ? <p className="md:col-span-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{bookingError}</p> : null}
            {bookingSuccess ? <p className="md:col-span-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{bookingSuccess}</p> : null}
            <button type="submit" disabled={bookingSubmitting || shops.length === 0 || availableSeats.length === 0} className="md:col-span-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
              {bookingSubmitting ? 'Scheduling...' : 'Book appointment'}
            </button>
          </form>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center gap-3"><Users className="h-6 w-6 text-violet-300" /><div><p className="text-xs uppercase tracking-[0.25em] text-violet-300">Current queue</p><h2 className="mt-1 text-2xl font-bold">{summary.currentQueue.length} customer{summary.currentQueue.length === 1 ? '' : 's'} in line</h2></div></div>
            <div className="mt-5 space-y-3">
              {summary.currentQueue.length ? summary.currentQueue.map((entry) => <div key={entry.id} className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-3 text-sm"><span>#{entry.queue_number} · {entry.customer_name}</span><span className="text-violet-300">{entry.status}</span></div>) : <p className="text-slate-400">No customers are currently waiting.</p>}
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center gap-3"><Clock3 className="h-6 w-6 text-emerald-300" /><div><p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Estimated waiting time</p><h2 className="mt-1 text-2xl font-bold">{summary.estimatedWait ? `About ${summary.estimatedWait} min` : 'No wait right now'}</h2></div></div>
            <p className="mt-5 text-sm text-slate-400">Estimate is based on 15 minutes per customer currently waiting.</p>
          </div>
        </section>

        <section className="mb-8 rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center gap-3"><Scissors className="h-6 w-6 text-violet-300" /><div><p className="text-xs uppercase tracking-[0.25em] text-violet-300">Our barbers</p><h2 className="mt-1 text-2xl font-bold">Meet the team</h2></div></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{barbers.map((barber) => <div key={barber.id} className="rounded-2xl bg-slate-800 p-4"><p className="font-semibold">{barber.first_name} {barber.last_name}</p><p className="mt-1 text-sm text-slate-400">{barber.specialty || 'Barber'}</p></div>)}</div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {seats.map((seat) => {
            const isAvailable = seat.status === 'AVAILABLE';
            const tone = isAvailable
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
              : seat.status === 'RESERVED' ? 'border-rose-500/30 bg-rose-500/10 text-rose-100' : 'border-amber-500/30 bg-amber-500/10 text-amber-100';

            return (
              <div key={seat.id} className={`rounded-[24px] border p-4 ${tone}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] opacity-80">{seat.label}</p>
                  <span className="h-2.5 w-2.5 rounded-full bg-current" />
                </div>
                <p className="mt-5 text-2xl font-bold">{seat.status}</p>
                <p className="mt-2 text-sm opacity-80">{isAvailable ? 'Ready for service' : seat.status === 'RESERVED' ? 'Reserved for an appointment' : 'Currently occupied'}</p>
              </div>
            );
          })}
        </section>
      </div>

      {toast ? (
        <div className="fixed right-5 top-5 z-50 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 shadow-xl">
          <p className="text-sm font-semibold text-emerald-200">{toast.title}</p>
          <p className="text-xs text-emerald-100/80">{toast.message}</p>
        </div>
      ) : null}
    </main>
  );
}
