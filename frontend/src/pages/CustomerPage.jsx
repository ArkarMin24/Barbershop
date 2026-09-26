import { Activity, CalendarDays, CircleDot, Clock3, RefreshCcw, Scissors, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { createSeatSocket } from '../services/liveSeatSocket';

const teamImages = [
  { src: '/hairstyles/cartoon-fade.svg', alt: 'Cute cartoon barber with a modern fade' },
  { src: '/hairstyles/cartoon-classic.svg', alt: 'Cute cartoon barber with a classic hairstyle' },
  { src: '/hairstyles/cartoon-curly.svg', alt: 'Cute cartoon barber with curly hair' },
  { src: '/hairstyles/cartoon-bob.svg', alt: 'Cute cartoon barber with a bob haircut' },
  { src: '/hairstyles/cartoon-spiky.svg', alt: 'Cute cartoon barber with spiky hair' },
  { src: '/hairstyles/cartoon-braids.svg', alt: 'Cute cartoon barber with braided hair' },
];

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
      setError(err.message || 'We could not load the shop data.');
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
          title: 'Seat status updated',
          message: `${payload.label || `Seat ${payload.id}`} is now ${payload.status.toLowerCase()}.`,
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
      setBookingError('Choose an available seat.');
      return;
    }
    if (!booking.phone.trim() && !booking.email.trim()) {
      setBookingError('Enter a phone number or email address.');
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
      setBookingSuccess('Your appointment has been booked.');
      setBooking({ first_name: '', last_name: '', phone: '', email: '', barber: '', seat: '', starts_at: '', notes: '' });
    } catch (err) {
      setBookingError(err.message || 'We could not book that appointment.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const statusTone = {
    connected: 'bg-emerald-100 text-emerald-700',
    connecting: 'bg-amber-100 text-amber-700',
    reconnecting: 'bg-amber-100 text-amber-700',
    error: 'bg-rose-100 text-rose-700',
  };

  const shop = shops[0];

  if (loading && seats.length === 0) {
    return <div className="p-8 text-slate-600">Loading the shop...</div>;
  }

  return (
    <main className="min-h-screen bg-[#eef4ef] px-4 py-8 text-[#24302b] sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-[#d9d0c0] pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">BarberFlow / Walk-ins welcome</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">{shop?.name || 'The barber shop'}</h1>
            <p className={`mt-3 text-sm ${shop?.is_active ? 'text-emerald-700' : 'text-rose-700'}`}>{shop?.is_active ? 'Open today' : 'Currently closed'}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${statusTone[connectionStatus] || statusTone.connected}`}>
              <CircleDot className="h-3.5 w-3.5 fill-current" />
              {connectionStatus === 'connected' ? 'Live updates on' : 'Connecting...'}
            </span>
            <button onClick={loadSeats} className="inline-flex items-center gap-2 rounded-full border border-[#cfc5b5] bg-[#fffdf8] px-3 py-1.5 text-sm text-[#405047] shadow-sm hover:border-[#c8a45b] hover:bg-[#fff9ed]">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </header>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
        ) : null}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-emerald-200/80 border-l-4 bg-white/72 p-5 shadow-sm backdrop-blur-sm transition duration-300 ease-out hover:border-emerald-400 hover:bg-white/86 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Available seats</p>
            <p className="mt-3 text-4xl font-bold text-emerald-600">{summary.available}</p>
          </div>
          <div className="border border-amber-200/80 border-l-4 bg-white/72 p-5 shadow-sm backdrop-blur-sm transition duration-300 ease-out hover:border-amber-400 hover:bg-white/86 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">In use</p>
            <p className="mt-3 text-4xl font-bold text-amber-600">{summary.occupied}</p>
          </div>
          <div className="border border-sky-200/80 border-l-4 bg-white/72 p-5 shadow-sm backdrop-blur-sm transition duration-300 ease-out hover:border-sky-400 hover:bg-white/86 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Live status</p>
            <p className="mt-3 flex items-center gap-2 text-base font-medium text-sky-700">
              <Activity className="h-5 w-5" />
              Updates appear automatically
            </p>
          </div>
        </section>

        <section className="mb-8 border border-white/65 bg-[#fffdf8]/76 p-6 shadow-lg shadow-[#6b5d4915] backdrop-blur-md">
          <div className="mb-6 flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-amber-700" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Book a visit</p>
              <h2 className="mt-1 text-2xl font-semibold">Reserve your chair</h2>
            </div>
          </div>
          <div className="mt-5 border border-amber-200 bg-amber-50 p-5 transition duration-300 ease-out hover:border-amber-300 hover:bg-amber-100/70">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Reserved for appointments</p>
            <p className="mt-3 text-4xl font-bold text-amber-600">{summary.reserved}</p>
          </div>

          <form className="mt-5 grid gap-5 md:grid-cols-2" onSubmit={submitBooking}>
            <fieldset className="rounded-2xl border border-[#d9e4da] bg-[#f7fbf7] p-4 md:col-span-2">
              <legend className="px-2 text-sm font-semibold text-[#405047]">Your details</legend>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium text-[#405047]" htmlFor="first-name">First name <span className="text-amber-700">*</span>
                  <input id="first-name" autoComplete="given-name" required value={booking.first_name} onChange={(event) => updateBooking('first_name', event.target.value)} className="rounded-xl border border-[#d9d0c0] bg-white px-4 py-3 font-normal text-[#24302b] outline-none hover:border-[#c8a45b] focus:border-[#c8a45b]" />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-[#405047]" htmlFor="last-name">Last name <span className="text-amber-700">*</span>
                  <input id="last-name" autoComplete="family-name" required value={booking.last_name} onChange={(event) => updateBooking('last_name', event.target.value)} className="rounded-xl border border-[#d9d0c0] bg-white px-4 py-3 font-normal text-[#24302b] outline-none hover:border-[#c8a45b] focus:border-[#c8a45b]" />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-[#405047]" htmlFor="phone">Phone number <span className="text-xs font-normal text-[#6e776f]">(phone or email required)</span>
                  <input id="phone" autoComplete="tel" value={booking.phone} onChange={(event) => updateBooking('phone', event.target.value)} className="rounded-xl border border-[#d9d0c0] bg-white px-4 py-3 font-normal text-[#24302b] outline-none hover:border-[#c8a45b] focus:border-[#c8a45b]" />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-[#405047]" htmlFor="email">Email address <span className="text-xs font-normal text-[#6e776f]">(phone or email required)</span>
                  <input id="email" autoComplete="email" type="email" value={booking.email} onChange={(event) => updateBooking('email', event.target.value)} className="rounded-xl border border-[#d9d0c0] bg-white px-4 py-3 font-normal text-[#24302b] outline-none hover:border-[#c8a45b] focus:border-[#c8a45b]" />
                </label>
              </div>
            </fieldset>
            <fieldset className="rounded-2xl border border-[#d9e4da] bg-[#f7fbf7] p-4 md:col-span-2">
              <legend className="px-2 text-sm font-semibold text-[#405047]">Visit details</legend>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium text-[#405047]" htmlFor="seat">Available seat <span className="text-amber-700">*</span>
                  <select id="seat" required value={booking.seat} onChange={(event) => updateBooking('seat', event.target.value)} className="rounded-xl border border-[#d9d0c0] bg-white px-4 py-3 font-normal text-[#24302b] outline-none hover:border-[#c8a45b] focus:border-[#c8a45b]"><option value="">Choose an available seat</option>{availableSeats.map((seat) => <option key={seat.id} value={seat.id}>{seat.label} — {seat.shop_name}</option>)}</select>
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-[#405047]" htmlFor="barber">Barber preference
                  <select id="barber" value={booking.barber} onChange={(event) => updateBooking('barber', event.target.value)} className="rounded-xl border border-[#d9d0c0] bg-white px-4 py-3 font-normal text-[#24302b] outline-none hover:border-[#c8a45b] focus:border-[#c8a45b]"><option value="">No barber preference</option>{bookingBarbers.map((barber) => <option key={barber.id} value={barber.id}>{barber.first_name} {barber.last_name}</option>)}</select>
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-[#405047]" htmlFor="starts-at">Preferred date and time <span className="text-amber-700">*</span>
                  <input id="starts-at" required type="datetime-local" value={booking.starts_at} onChange={(event) => updateBooking('starts_at', event.target.value)} className="rounded-xl border border-[#d9d0c0] bg-white px-4 py-3 font-normal text-[#24302b] outline-none hover:border-[#c8a45b] focus:border-[#c8a45b]" />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-[#405047]" htmlFor="notes">Notes <span className="text-xs font-normal text-[#6e776f]">(optional)</span>
                  <input id="notes" autoComplete="off" value={booking.notes} onChange={(event) => updateBooking('notes', event.target.value)} className="rounded-xl border border-[#d9d0c0] bg-white px-4 py-3 font-normal text-[#24302b] outline-none hover:border-[#c8a45b] focus:border-[#c8a45b]" />
                </label>
              </div>
            </fieldset>
            {bookingError ? <p className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{bookingError}</p> : null}
            {bookingSuccess ? <p className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{bookingSuccess}</p> : null}
            <button type="submit" disabled={bookingSubmitting || shops.length === 0 || availableSeats.length === 0} className="md:col-span-2 rounded-xl bg-[#d9a136] px-5 py-3.5 font-semibold text-[#24302b] shadow-sm hover:bg-[#e3b34e] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#b37b19] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
              {bookingSubmitting ? 'Scheduling...' : 'Book appointment'}
            </button>
          </form>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/70 bg-white/76 p-6 shadow-sm backdrop-blur-md transition duration-300 ease-out hover:border-[#c8a45b] hover:bg-white/88 hover:shadow-md">
            <div className="flex items-center gap-3"><Users className="h-6 w-6 text-amber-600" /><div><p className="text-xs uppercase tracking-[0.25em] text-amber-700">Current queue</p><h2 className="mt-1 text-2xl font-bold">{summary.currentQueue.length} customer{summary.currentQueue.length === 1 ? '' : 's'} in line</h2></div></div>
            <div className="mt-5 space-y-3">
              {summary.currentQueue.length ? summary.currentQueue.map((entry) => <div key={entry.id} className="flex items-center justify-between rounded-xl bg-[#f7f3ea] px-4 py-3 text-sm"><span>#{entry.queue_number} · {entry.customer_name}</span><span className="text-amber-700">{entry.status}</span></div>) : <p className="text-[#6e776f]">No customers are currently waiting.</p>}
            </div>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/76 p-6 shadow-sm backdrop-blur-md transition duration-300 ease-out hover:border-[#c8a45b] hover:bg-white/88 hover:shadow-md">
            <div className="flex items-center gap-3"><Clock3 className="h-6 w-6 text-emerald-600" /><div><p className="text-xs uppercase tracking-[0.25em] text-emerald-700">Estimated waiting time</p><h2 className="mt-1 text-2xl font-bold">{summary.estimatedWait ? `About ${summary.estimatedWait} min` : 'No wait right now'}</h2></div></div>
            <p className="mt-5 text-sm text-[#6e776f]">Estimate is based on 15 minutes per customer currently waiting.</p>
          </div>
        </section>

        <section className="group relative mb-8 overflow-hidden rounded-2xl border border-[#b7cdbd] bg-[#e7f0e9] p-6 text-[#24302b] shadow-lg">
          <div className="absolute inset-0 bg-[#cbded0]/45 transition duration-500 group-hover:bg-[#cbded0]/25" />
          <div className="relative">
            <div className="flex items-center gap-3"><Scissors className="h-6 w-6 text-amber-700" /><div><p className="text-xs uppercase tracking-[0.25em] text-amber-700">Our barbers</p><h2 className="mt-1 text-2xl font-bold">Meet the team</h2></div></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{barbers.map((barber, index) => <div key={barber.id} className="group relative min-h-40 overflow-hidden rounded-xl border border-[#6f8f78]/70 bg-[#102119]/90 p-4 shadow-md transition duration-300 ease-out hover:border-amber-300 hover:bg-[#1d392c] hover:shadow-[0_0_0_3px_rgba(245,190,70,0.2),0_12px_28px_rgba(16,33,25,0.2)]">
              <img src={teamImages[index % teamImages.length].src} alt={teamImages[index % teamImages.length].alt} className="absolute inset-0 h-full w-full object-cover opacity-55 saturate-75 transition duration-500 ease-out group-hover:scale-105 group-hover:opacity-95 group-hover:saturate-110 group-hover:brightness-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08110d]/95 via-[#08110d]/45 to-transparent transition duration-500 group-hover:from-[#08110d]/80 group-hover:via-[#08110d]/20" />
              <div className="relative flex min-h-32 flex-col justify-end"><p className="font-semibold text-white">{barber.first_name} {barber.last_name}</p><p className="mt-1 text-sm text-white/80">{barber.specialty || 'Barber'}</p></div>
            </div>)}</div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {seats.map((seat) => {
            const isAvailable = seat.status === 'AVAILABLE';
            const tone = isAvailable
              ? 'border-emerald-200 bg-white text-emerald-900 hover:border-emerald-400 hover:bg-emerald-50'
              : seat.status === 'RESERVED' ? 'border-rose-200 bg-white text-rose-900 hover:border-rose-400 hover:bg-rose-50' : 'border-amber-200 bg-white text-amber-900 hover:border-amber-400 hover:bg-amber-50';

            return (
              <div key={seat.id} className={`rounded-2xl border p-4 shadow-sm transition duration-300 ease-out hover:shadow-md ${tone}`}>
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
        <div className="fixed right-5 top-5 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-xl">
          <p className="text-sm font-semibold text-emerald-800">{toast.title}</p>
          <p className="text-xs text-emerald-700">{toast.message}</p>
        </div>
      ) : null}
    </main>
  );
}
