import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../services/billing.service';
import { RecordManualPaymentModal } from './RecordManualPaymentModal';
import { PendingPayment } from '../types/billing.types';

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
            { label: 'Pending Verification', value: dashboard.pendingVerification, color: 'bg-orange-50' },
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

      <PendingPaymentsSection onVerified={() => refetch()} />
    </div>
  );
}

function PendingPaymentsSection({ onVerified }: { onVerified: () => void }) {
  const queryClient = useQueryClient();
  const { data: payments = [] } = useQuery({
    queryKey: ['pending-payments'],
    queryFn: () => billingService.getPendingPayments().then(r => r.data),
  });

  const verify = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) => billingService.verifyPayment(id, approved),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pending-payments'] }); onVerified(); },
  });

  if (payments.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-4">Pending GCash Verifications ({payments.length})</h2>
      <div className="space-y-3">
        {payments.map((p: PendingPayment) => (
          <div key={p.id} className="border rounded-lg p-4 flex gap-4">
            <a href={p.screenshotUrl} target="_blank" rel="noopener noreferrer">
              <img src={p.screenshotUrl} alt="GCash screenshot" className="w-24 h-24 object-cover rounded border" />
            </a>
            <div className="flex-1">
              <p className="font-medium">Ref: {p.gcashReferenceNumber}</p>
              <p className="text-sm text-gray-500">Amount: ₱{Number(p.amount).toFixed(2)}</p>
              <p className="text-sm text-gray-500">Submitted: {new Date(p.createdAt).toLocaleString()}</p>
              {p.notes && <p className="text-sm text-gray-400 mt-1">{p.notes}</p>}
            </div>
            <div className="flex flex-col gap-2 justify-center">
              <button onClick={() => verify.mutate({ id: p.id, approved: true })} disabled={verify.isPending} className="bg-green-600 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50">Approve</button>
              <button onClick={() => verify.mutate({ id: p.id, approved: false })} disabled={verify.isPending} className="bg-red-600 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
