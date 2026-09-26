import { Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../services/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/customers/list/');
      setCustomers(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const deleteAllCustomers = async () => {
    if (!customers.length || !window.confirm(`Delete all ${customers.length} customer records? This cannot be undone.`)) return;

    try {
      setDeleting(true);
      await api.del('/customers/delete-all/');
      setCustomers([]);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to delete customers');
    } finally {
      setDeleting(false);
    }
  };

  const deleteCustomer = async (customer) => {
    if (!window.confirm(`Delete ${customer.first_name} ${customer.last_name}? This cannot be undone.`)) return;

    try {
      setDeletingCustomerId(customer.id);
      await api.del(`/customers/${customer.id}/`);
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to delete customer');
    } finally {
      setDeletingCustomerId(null);
    }
  };

  if (loading) {
    return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-40 w-full" />)}</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Customer records</p>
          <h2 className="mt-1 text-2xl font-semibold">{customers.length} customer{customers.length === 1 ? '' : 's'}</h2>
        </div>
        <button type="button" onClick={deleteAllCustomers} disabled={deleting || customers.length === 0} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50">
          <Trash2 className="h-4 w-4" />
          {deleting ? 'Deleting...' : 'Delete all customers'}
        </button>
      </div>

      {customers.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">No customer records.</div> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {customers.map((customer) => (
        <div key={customer.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
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
          <button type="button" onClick={() => deleteCustomer(customer)} disabled={deletingCustomerId === customer.id} className="mt-5 inline-flex items-center rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40">
            {deletingCustomerId === customer.id ? 'Deleting...' : 'Delete customer'}
          </button>
        </div>
      ))}
      </div>
    </div>
  );
}
