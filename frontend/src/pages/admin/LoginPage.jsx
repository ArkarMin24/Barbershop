import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await api.post('/auth/login/', { email, password });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.2),_transparent_30%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_100%)] p-6 dark:bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.2),_transparent_30%),linear-gradient(135deg,#020617_0%,#111827_65%)]">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/30">
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-between bg-slate-950 p-8 text-white dark:bg-slate-950">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-violet-300">BarberFlow</p>
              <h1 className="mt-4 text-4xl font-bold">Modern barber operations</h1>
            </div>

            <div className="mt-10 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">Live chair availability</p>
                <p className="mt-2 text-3xl font-bold">24 seats</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">Today's bookings</p>
                <p className="mt-2 text-3xl font-bold">18</p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.25em] text-violet-500">Staff access</p>
                <h2 className="mt-3 text-3xl font-bold">Welcome back</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in with your staff account.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-500">Email</label>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="manager@example.com" required className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-500">Password</label>
                <div className="flex items-center gap-3">
                  <LockKeyhole className="h-4 w-4 text-slate-400" />
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100" />
                </div>
              </div>

              {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/25 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? 'Signing in...' : 'Sign in'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
