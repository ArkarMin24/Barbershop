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
    <div className="flex min-h-screen items-center justify-center bg-[#f5f1e8] p-6 text-[#24302b]">
      <div className="grid w-full max-w-5xl overflow-hidden border border-[#d9d0c0] bg-[#fffdf8] shadow-xl shadow-[#6b5d4920] md:grid-cols-[1.05fr_0.95fr]">
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-between bg-[#29433a] p-8 text-white md:col-span-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">BarberFlow</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">A calmer way to run the shop.</h1>
            </div>

            <div className="mt-10 border-t border-white/15 pt-5">
              <p className="max-w-sm text-sm leading-7 text-[#dce7dd]">Keep an eye on chairs, appointments, and the queue from one simple workspace.</p>
            </div>
          </div>

          <div className="bg-[#fffdf8] p-8 md:col-span-1 md:p-12">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">Staff sign in</p>
                <h2 className="mt-3 text-3xl font-semibold">Welcome back</h2>
                <p className="mt-2 text-sm text-[#6e776f]">Use your staff account to continue.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
              <div className="border border-[#d9d0c0] bg-[#f7f3ea] px-4 py-3 hover:border-[#c8a45b]">
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#6e776f]">Email</label>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#7b887d]" />
                  <input autoComplete="off" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="manager@example.com" required className="w-full bg-transparent text-sm text-[#24302b] outline-none placeholder:text-[#9a9f98]" />
                </div>
              </div>

              <div className="border border-[#d9d0c0] bg-[#f7f3ea] px-4 py-3 hover:border-[#c8a45b]">
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#6e776f]">Password</label>
                <div className="flex items-center gap-3">
                  <LockKeyhole className="h-4 w-4 text-[#7b887d]" />
                  <input autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="w-full bg-transparent text-sm text-[#24302b] outline-none placeholder:text-[#9a9f98]" />
                </div>
              </div>

              {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 bg-[#d9a136] px-5 py-3.5 font-semibold text-[#24302b] shadow-sm hover:bg-[#e3b34e] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60">
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
