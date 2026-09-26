import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { formatDateTime } from '../../lib/utils';

export default function SeatDrawer({ seat, open, onClose, barbers, onStatusUpdated, toast }) {
  const [status, setStatus] = useState(seat?.status || 'AVAILABLE');
  const [barberId, setBarberId] = useState(seat?.barber || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (seat) {
      setStatus(seat.status || 'AVAILABLE');
      setBarberId(seat.barber || '');
      setError('');
    }
  }, [seat]);

  if (!seat || !open) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      const payload = { status };
      if (barberId) payload.barber = Number(barberId);
      await api.patch(`/seats/${seat.id}/status/`, payload);

      if (typeof onStatusUpdated === 'function') {
        onStatusUpdated();
      }

      toast({ title: 'Seat updated', message: 'Availability changes saved successfully.', type: 'success' });
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to update seat');
      toast({ title: 'Update failed', message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-slate-950/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Seat details</p>
            <h3 className="mt-2 text-2xl font-bold">{seat.label || `Seat ${seat.id}`}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 dark:border-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 dark:border-slate-700 dark:bg-slate-800">
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="RESERVED">RESERVED</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Assign barber</label>
            <select value={barberId} onChange={(e) => setBarberId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800">
              <option value="">Unassigned</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>{barber.first_name} {barber.last_name}</option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/70">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Customer</p>
            <p className="mt-2 text-base font-semibold">{seat.customer_name || 'No customer linked'}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/70">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last update</p>
            <p className="mt-2 text-base font-medium">{formatDateTime(seat.updated_at)}</p>
          </div>

          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</div> : null}
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-3 font-medium dark:border-slate-700">Cancel</button>
          <button type="button" disabled={saving} onClick={handleSave} className="rounded-2xl bg-amber-400 px-4 py-3 font-medium text-stone-950 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
