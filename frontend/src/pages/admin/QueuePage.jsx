import { useEffect, useState } from 'react';
import { AlertTriangle, ListTodo, RefreshCcw } from 'lucide-react';
import { api } from '../../services/api';
import { Skeleton } from '../../components/ui/Skeleton';

export default function QueuePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await api.get('/queue/');
      setEntries(data);
    } catch (err) {
      setError(err.message || 'စောင့်ဆိုင်းစာရင်း မရယူနိုင်ပါ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQueue(); }, []);

  const updateStatus = async (entry, status) => {
    try {
      const updated = await api.patch(`/queue/${entry.id}/status/`, { status });
      setEntries((current) => current.map((item) => (item.id === entry.id ? { ...item, ...updated } : item)));
    } catch (err) {
      setError(err.message || 'စောင့်ဆိုင်းစာရင်း အခြေအနေ မပြောင်းနိုင်ပါ');
    }
  };

  const removeEntry = async (entry) => {
    if (!window.confirm(`${entry.customer_name} ကို စောင့်ဆိုင်းစာရင်းမှ ဖယ်ရှားမည်လား?`)) return;
    try {
      await api.del(`/queue/${entry.id}/delete/`);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    } catch (err) {
      setError(err.message || 'စောင့်ဆိုင်းစာရင်းမှ ဖယ်ရှားမရပါ');
    }
  };

  if (loading) {
    return <div className="grid gap-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-sm text-slate-500">ဖောက်သည် စောင့်ဆိုင်းစာရင်း</p>
          <h3 className="mt-1 text-2xl font-bold">စောင့်ဆိုင်းစာရင်း</h3>
        </div>
        <button onClick={loadQueue} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium dark:border-slate-700">
          <RefreshCcw className="h-4 w-4" />
          ပြန်လည်ရယူရန်
        </button>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <AlertTriangle className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-4 text-lg font-semibold">စောင့်ဆိုင်းစာရင်း ဗလာဖြစ်နေပါသည်</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-lg font-bold text-violet-700 dark:bg-violet-900 dark:text-violet-200">
                    #{entry.queue_number}
                  </div>
                  <div>
                    <p className="text-xl font-bold">{entry.customer_name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{entry.barber_name || 'ဆံပင်ညှပ်ဆရာ မသတ်မှတ်ရသေးပါ'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select value={entry.status} onChange={(event) => updateStatus(entry, event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
                    <option value="WAITING">WAITING</option>
                    <option value="SERVING">SERVING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <button onClick={() => removeEntry(entry)} className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-700 dark:text-rose-300">ဖယ်ရှားရန်</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
