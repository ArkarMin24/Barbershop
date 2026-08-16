import { Plus, RefreshCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SeatCard from '../../components/admin/SeatCard';
import SeatDrawer from '../../components/admin/SeatDrawer';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../services/api';
import { createSeatSocket } from '../../services/liveSeatSocket';

export default function SeatsPage() {
  const [seats, setSeats] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewSeat, setShowNewSeat] = useState(false);
  const [newSeat, setNewSeat] = useState({ label: '', shop: '', barber: '' });
  const [creatingSeat, setCreatingSeat] = useState(false);
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [seatData, barberData, shopData] = await Promise.all([api.get('/seats/'), api.get('/barbers/'), api.get('/shop/')]);
      setSeats(seatData);
      setBarbers(barberData);
      setShops(shopData);
    } catch (err) {
      setError(err.message || 'Failed to load seats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const socket = createSeatSocket({
      onUpdate: (payload) => {
        setSeats((currentSeats) => {
          if (currentSeats.some((seat) => seat.id === payload.id)) {
            return currentSeats.map((seat) => (seat.id === payload.id ? payload : seat));
          }
          return [...currentSeats, payload];
        });

        setToast({
          title: 'Seat changed',
          message: `${payload.label || `Seat ${payload.id}`} is now ${payload.status}`,
        });

        window.setTimeout(() => setToast(null), 2500);
      },
    });

    return () => socket.close();
  }, []);

  const filteredSeats = useMemo(() => {
    return seats.filter((seat) => {
      const matchesStatus = activeFilter === 'ALL' || seat.status === activeFilter;
      const matchesSearch = `${seat.label} ${seat.barber_name || ''} ${seat.shop_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [activeFilter, seats, searchTerm]);

  const showToast = (toastData) => {
    setToast(toastData);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSeatUpdated = async () => {
    await loadData();
  };

  const createSeat = async (event) => {
    event.preventDefault();
    try {
      setCreatingSeat(true);
      const created = await api.post('/seats/create/', {
        label: newSeat.label,
        shop: Number(newSeat.shop),
        barber: newSeat.barber ? Number(newSeat.barber) : null,
        status: 'AVAILABLE',
      });
      setSeats((current) => [...current, created]);
      setNewSeat({ label: '', shop: '', barber: '' });
      setShowNewSeat(false);
      showToast({ title: 'Seat created', message: `${created.label} is ready for use.`, type: 'success' });
    } catch (err) {
      showToast({ title: 'Could not create seat', message: err.message, type: 'error' });
    } finally {
      setCreatingSeat(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Seat management</p>
          <h3 className="mt-1 text-2xl font-bold">Chair overview</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Search className="h-4 w-4" />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="bg-transparent text-sm outline-none" placeholder="Search seat" />
          </div>
          <button onClick={() => loadData()} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium dark:border-slate-700">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={() => setShowNewSeat((current) => !current)} className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20">
            <Plus className="h-4 w-4" />
            New seat
          </button>
        </div>
      </div>

      {showNewSeat ? (
        <form onSubmit={createSeat} className="grid gap-3 rounded-[28px] border border-slate-200 bg-white p-5 md:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
          <input required value={newSeat.label} onChange={(event) => setNewSeat((current) => ({ ...current, label: event.target.value }))} placeholder="Seat label" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <select required value={newSeat.shop} onChange={(event) => setNewSeat((current) => ({ ...current, shop: event.target.value, barber: '' }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
            <option value="">Select shop</option>
            {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
          </select>
          <select value={newSeat.barber} onChange={(event) => setNewSeat((current) => ({ ...current, barber: event.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
            <option value="">No assigned barber</option>
            {barbers.filter((barber) => String(barber.shop) === newSeat.shop).map((barber) => <option key={barber.id} value={barber.id}>{barber.first_name} {barber.last_name}</option>)}
          </select>
          <button disabled={creatingSeat} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">{creatingSeat ? 'Creating...' : 'Create seat'}</button>
        </form>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED'].map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeFilter === filter
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredSeats.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-semibold">No seats match this filter.</p>
          <p className="mt-2 text-sm text-slate-500">Try another status or add a seat.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredSeats.map((seat) => (
            <SeatCard key={seat.id} seat={seat} onClick={setSelectedSeat} />
          ))}
        </div>
      )}

      <SeatDrawer
        seat={selectedSeat}
        open={Boolean(selectedSeat)}
        onClose={() => setSelectedSeat(null)}
        barbers={barbers}
        onStatusUpdated={handleSeatUpdated}
        toast={showToast}
      />

      {toast ? (
        <div className="fixed right-5 top-5 z-[60] rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          {toast.title}
        </div>
      ) : null}
    </div>
  );
}
