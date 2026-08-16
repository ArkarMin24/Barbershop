import { Plus, Scissors, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../services/api';

export default function BarbersPage() {
  const [barbers, setBarbers] = useState([]);
  const [shops, setShops] = useState([]);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBarbers = async () => {
    try {
      setLoading(true);
      const [data, shopData] = await Promise.all([api.get('/barbers/'), api.get('/shop/')]);
      setBarbers(data);
      setShops(shopData);
    } catch (err) {
      setError(err.message || 'Failed to load barbers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBarbers(); }, []);

  const toggleBarber = async (barber) => {
    try {
      setError('');
      const updated = await api.patch(`/barbers/${barber.id}/status/`, { is_active: !barber.is_active });
      setBarbers((current) => current.map((item) => (item.id === barber.id ? { ...item, ...updated } : item)));
    } catch (err) {
      setError(err.message || 'Unable to update barber status');
    }
  };

  const saveBarber = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setFormError('');
      const payload = { shop: Number(form.shop), first_name: form.first_name, last_name: form.last_name, specialty: form.specialty, is_active: form.is_active };
      const saved = form.id ? await api.patch(`/barbers/${form.id}/`, payload) : await api.post('/barbers/create/', payload);
      setBarbers((current) => form.id ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
      setForm(null);
    } catch (err) {
      setFormError(err.message || 'ဆံပင်ညှပ်ဆရာ အချက်အလက် မသိမ်းနိုင်ပါ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40 w-full" />)}</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><h3 className="text-2xl font-bold">ဆံပင်ညှပ်ဆရာများ</h3><button onClick={() => { setFormError(''); setForm({ shop: shops[0]?.id || '', first_name: '', last_name: '', specialty: '', is_active: true }); }} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white"><Plus className="h-4 w-4" />ဆံပင်ညှပ်ဆရာ အသစ်</button></div>
      {form ? <form onSubmit={saveBarber} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="md:col-span-5 font-semibold">{form.id ? 'ဆံပင်ညှပ်ဆရာ အချက်အလက် ပြင်ဆင်ရန်' : 'ဆံပင်ညှပ်ဆရာ အသစ် ထည့်ရန်'}</p>
        <select required value={form.shop} onChange={(e) => setForm({ ...form, shop: e.target.value })} className="rounded-xl border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"><option value="">ဆိုင်ရွေးပါ</option>{shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}</select>
        <input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="အမည်" className="rounded-xl border border-slate-300 bg-white p-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400" />
        <input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="မျိုးရိုးအမည်" className="rounded-xl border border-slate-300 bg-white p-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400" />
        <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="ကျွမ်းကျင်မှု" className="rounded-xl border border-slate-300 bg-white p-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400" />
        <div className="flex gap-2"><button disabled={saving} className="rounded-xl bg-violet-600 px-3 py-2 text-white disabled:opacity-60">{saving ? 'သိမ်းနေသည်...' : 'သိမ်းရန်'}</button><button type="button" onClick={() => setForm(null)} className="rounded-xl border px-3 py-2">မလုပ်တော့ပါ</button></div>
        {formError ? <p className="md:col-span-5 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-300">{formError}</p> : null}
      </form> : null}
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {barbers.map((barber) => (
        <div key={barber.id} className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
              <Scissors className="h-5 w-5" />
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${barber.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              {barber.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="mt-5">
            <p className="text-xl font-bold">{barber.first_name} {barber.last_name}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{barber.specialty || 'General barber'}</p>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <UserRound className="h-4 w-4" />
            {barber.shop_name}
          </div>
          <button onClick={() => toggleBarber(barber)} className="mt-5 w-full rounded-xl bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600">
            {barber.is_active ? 'မလုပ်ဆောင်တော့ပါ' : 'ပြန်လည်ဖွင့်ရန်'}
          </button>
          <button onClick={() => { setFormError(''); setForm({ ...barber }); }} className="mt-2 w-full rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500">ပြင်ဆင်ရန်</button>
        </div>
      ))}
    </div></div>
  );
}
