import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../services/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const data = await api.get('/customers/list/');
        setCustomers(data);
      } catch (err) {
        setError(err.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  if (loading) {
    return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-40 w-full" />)}</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {customers.map((customer) => (
        <div key={customer.id} className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Users className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">Client</span>
          </div>

          <div className="mt-5">
            <p className="text-xl font-bold">{customer.first_name} {customer.last_name}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{customer.phone || customer.email || 'No contact info'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
