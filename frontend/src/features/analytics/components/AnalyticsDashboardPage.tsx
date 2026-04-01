import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import { useAuth } from '../../auth/hooks/useAuth';

type Tab = 'financial' | 'maintenance' | 'engagement';

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export function AnalyticsDashboardPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('financial');
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [budgetInput, setBudgetInput] = useState('');
  const [isSettingBudget, setIsSettingBudget] = useState(false);

  const startDate = `${period}-01`;
  const endDate = `${period}-31`;

  const { data: financial } = useQuery({ queryKey: ['analytics-financial', period], queryFn: () => analyticsService.getFinancial(period).then(r => r.data), enabled: tab === 'financial' });
  const { data: maintenance } = useQuery({ queryKey: ['analytics-maintenance', period], queryFn: () => analyticsService.getMaintenance(startDate, endDate).then(r => r.data), enabled: tab === 'maintenance' });
  const { data: engagement } = useQuery({ queryKey: ['analytics-engagement', period], queryFn: () => analyticsService.getEngagement(startDate, endDate).then(r => r.data), enabled: tab === 'engagement' });

  const handleSetBudget = async () => {
    if (!budgetInput) return;
    setIsSettingBudget(true);
    try { await analyticsService.setBudget(period, parseFloat(budgetInput)); qc.invalidateQueries({ queryKey: ['analytics-financial'] }); setBudgetInput(''); }
    catch { alert('Failed to set budget'); }
    finally { setIsSettingBudget(false); }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'financial', label: 'Financial' },
    { key: 'maintenance', label: 'Maintenance' },
    { key: 'engagement', label: 'Engagement' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
        <input type="month" value={period} onChange={e => setPeriod(e.target.value)} className="border rounded px-3 py-1.5 text-sm" />
      </div>

      <div className="flex gap-1 mb-6 border-b">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>{t.label}</button>
        ))}
      </div>

      {/* Financial Tab */}
      {tab === 'financial' && financial && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <div><p className="text-xs text-blue-600 font-medium">Monthly Budget</p><p className="text-xl font-bold">{financial.budgetAmount != null ? `₱${Number(financial.budgetAmount).toLocaleString()}` : 'Not set'}</p></div>
              {user?.role === 'PropertyManager' && (
                <div className="flex gap-2">
                  <input value={budgetInput} onChange={e => setBudgetInput(e.target.value)} placeholder="Set budget" type="number" className="border rounded px-2 py-1 text-sm w-32" />
                  <button onClick={handleSetBudget} disabled={isSettingBudget} className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50">Set</button>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Total Invoiced" value={`₱${Number(financial.totalInvoiced).toLocaleString()}`} />
            <MetricCard label="Total Collected" value={`₱${Number(financial.totalCollected).toLocaleString()}`} />
            <MetricCard label="Outstanding" value={`₱${Number(financial.totalOutstanding).toLocaleString()}`} />
            <MetricCard label="Collection Rate" value={financial.collectionRate} />
          </div>
          {financial.overdueAging.length > 0 && (
            <div className="border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left px-4 py-2">Overdue Bucket</th><th className="text-right px-4 py-2">Count</th><th className="text-right px-4 py-2">Amount</th></tr></thead>
                <tbody>{financial.overdueAging.map(r => <tr key={r.bucket} className="border-t"><td className="px-4 py-2">{r.bucket}</td><td className="text-right px-4 py-2">{r.count}</td><td className="text-right px-4 py-2">₱{Number(r.amount).toLocaleString()}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          <div className="flex gap-2">
            <button data-testid="export-pdf" onClick={() => analyticsService.exportReport('financial', period, 'pdf')} className="border rounded px-4 py-2 text-sm">Export PDF</button>
            <button data-testid="export-csv" onClick={() => analyticsService.exportReport('financial', period, 'csv')} className="border rounded px-4 py-2 text-sm">Export CSV</button>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {tab === 'maintenance' && maintenance && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard label="Open Requests" value={maintenance.open} />
            <MetricCard label="Closed This Period" value={maintenance.closed} />
            <MetricCard label="Avg Resolution" value={`${maintenance.avgResolutionDays} days`} />
          </div>
          <div className="border rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left px-4 py-2">Category</th><th className="text-right px-4 py-2">Count</th></tr></thead>
              <tbody>{maintenance.byCategory.map(r => <tr key={r.category} className="border-t"><td className="px-4 py-2">{r.category}</td><td className="text-right px-4 py-2">{r.count}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button onClick={() => analyticsService.exportReport('maintenance', period, 'pdf')} className="border rounded px-4 py-2 text-sm">Export PDF</button>
            <button onClick={() => analyticsService.exportReport('maintenance', period, 'csv')} className="border rounded px-4 py-2 text-sm">Export CSV</button>
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {tab === 'engagement' && engagement && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard label="Poll Participation" value={engagement.pollParticipationRate} />
            <MetricCard label="Event RSVP Rate" value={engagement.eventRsvpRate} />
            <MetricCard label="Announcement Opens" value={engagement.announcementOpenRate} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => analyticsService.exportReport('engagement', period, 'pdf')} className="border rounded px-4 py-2 text-sm">Export PDF</button>
            <button onClick={() => analyticsService.exportReport('engagement', period, 'csv')} className="border rounded px-4 py-2 text-sm">Export CSV</button>
          </div>
        </div>
      )}
    </div>
  );
}
