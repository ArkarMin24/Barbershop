import { BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [appointments, queue] = await Promise.all([api.get('/appointments/'), api.get('/queue/')]);
        const startedEntries = queue.filter((entry) => entry.started_at && entry.joined_at);
        const averageWait = startedEntries.length
          ? Math.round(startedEntries.reduce((total, entry) => total + (new Date(entry.started_at) - new Date(entry.joined_at)), 0) / startedEntries.length / 60000)
          : 0;
        setMetrics({
          appointments: appointments.length,
          completedAppointments: appointments.filter((item) => item.status === 'COMPLETED').length,
          waitingCustomers: queue.filter((item) => item.status === 'WAITING').length,
          averageWait,
        });
      } catch (err) {
        setError(err.message || 'Unable to load analytics');
      }
    }
    loadAnalytics();
  }, []);

  if (error) return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>;
  if (!metrics) return <div className="p-6 text-slate-500">Loading live analytics...</div>;

  const cards = [
    ['Total appointments', metrics.appointments],
    ['Completed appointments', metrics.completedAppointments],
    ['Customers waiting', metrics.waitingCustomers],
    ['Average queue wait', `${metrics.averageWait} min`],
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-amber-600" />
        <div><p className="text-xs uppercase tracking-[0.2em] text-amber-500">Operations</p><h3 className="text-2xl font-bold">Live analytics</h3></div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
