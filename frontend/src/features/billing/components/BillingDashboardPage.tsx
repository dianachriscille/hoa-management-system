import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { billingService } from '../services/billing.service';
import { RecordManualPaymentModal } from './RecordManualPaymentModal';

export function BillingDashboardPage() {
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: dashboard, refetch } = useQuery({
    queryKey: ['billing-dashboard', period],
    queryFn: () => billingService.getDashboard(period).then(r => r.data),
  });

  const handleGenerate = async () => {
    if (!confirm(`Generate invoices for ${period}? This will create invoices for all active units.`)) return;
    setIsGenerating(true);
    try {
      const { data } = await billingService.generateInvoices(period);
      alert(`Generated ${(data as any).generated} invoices. Skipped: ${(data as any).skipped}`);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Billing Dashboard</h1>
        <div className="flex gap-3 items-center">
          <input type="month" value={period} onChange={e => setPeriod(e.target.value)} className="border rounded px-3 py-1.5 text-sm" />
          <button data-testid="generate-invoices-button" onClick={handleGenerate} disabled={isGenerating} className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
            {isGenerating ? 'Generating...' : 'Generate Invoices'}
          </button>
        </div>
      </div>

      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Invoices', value: dashboard.total, color: 'bg-gray-50' },
            { label: 'Paid', value: dashboard.paid, color: 'bg-green-50' },
            { label: 'Outstanding', value: dashboard.outstanding, color: 'bg-yellow-50' },
            { label: 'Collection Rate', value: dashboard.collectionRate, color: 'bg-blue-50' },
          ].map(card => (
            <div key={card.label} className={`${card.color} rounded-lg p-4 border`}>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {selectedInvoiceId && (
        <RecordManualPaymentModal
          invoiceId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
          onSuccess={() => { setSelectedInvoiceId(null); refetch(); }}
        />
      )}
    </div>
  );
}
