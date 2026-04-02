import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../services/billing.service';
import { Invoice } from '../types/billing.types';

const STATUS_COLORS: Record<string, string> = {
  Unpaid: 'bg-yellow-100 text-yellow-800',
  PartiallyPaid: 'bg-blue-100 text-blue-800',
  Paid: 'bg-green-100 text-green-800',
  Overdue: 'bg-red-100 text-red-800',
};

export function BillingPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [refNumber, setRefNumber] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  const { data: invoices = [] } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: () => billingService.getMyInvoices().then(r => r.data),
  });

  const { data: gcashInfo } = useQuery({
    queryKey: ['gcash-info'],
    queryFn: () => billingService.getGcashInfo().then(r => r.data),
  });

  const submitPayment = useMutation({
    mutationFn: async () => {
      if (!payingInvoice || !screenshot || !refNumber) return;
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('gcashReferenceNumber', refNumber);
      if (notes) formData.append('notes', notes);
      return billingService.submitGcashPayment(payingInvoice.id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invoices'] });
      setPayingInvoice(null);
      setRefNumber('');
      setScreenshot(null);
      setNotes('');
      alert('Payment submitted! Please wait for verification by the property manager.');
    },
    onError: (err: any) => alert(err.response?.data?.message || 'Submission failed'),
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Billing</h1>

      <div className="space-y-3" data-testid="invoice-list">
        {invoices.map(invoice => (
          <div key={invoice.id} className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{invoice.invoiceNumber}</p>
              <p className="text-sm text-gray-500">Period: {invoice.billingPeriod} · Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[invoice.status]}`}>{invoice.status}</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">₱{Number(invoice.amount).toFixed(2)}</p>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setSelected(invoice)} className="text-sm text-blue-600 hover:underline">View</button>
                {invoice.status !== 'Paid' && (
                  <button onClick={() => setPayingInvoice(invoice)} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">
                    Pay via GCash
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {invoices.length === 0 && <p className="text-gray-500 text-center py-8">No invoices found.</p>}
      </div>

      {/* Invoice Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Invoice {selected.invoiceNumber}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Period</span><span>{selected.billingPeriod}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold">₱{Number(selected.amount).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Due Date</span><span>{new Date(selected.dueDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selected.status]}`}>{selected.status}</span></div>
              {selected.paidAt && <div className="flex justify-between"><span className="text-gray-500">Paid At</span><span>{new Date(selected.paidAt).toLocaleString()}</span></div>}
            </div>
            <button onClick={() => setSelected(null)} className="mt-4 w-full border rounded py-2 text-sm">Close</button>
          </div>
        </div>
      )}

      {/* GCash Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-2">Pay via GCash</h2>
            <p className="text-sm text-gray-500 mb-4">Invoice {payingInvoice.invoiceNumber} · ₱{Number(payingInvoice.amount).toFixed(2)}</p>

            {/* QR Code */}
            {gcashInfo?.qrCodeUrl ? (
              <div className="text-center mb-4">
                <img src={gcashInfo.qrCodeUrl} alt="GCash QR Code" className="mx-auto w-48 h-48 border rounded" />
                <p className="text-sm mt-2 font-medium">{gcashInfo.accountName}</p>
                <p className="text-sm text-gray-500">{gcashInfo.gcashNumber}</p>
              </div>
            ) : (
              <div className="text-center mb-4 p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">GCash QR code not configured. Contact your property manager.</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">GCash Reference Number *</label>
                <input type="text" value={refNumber} onChange={e => setRefNumber(e.target.value)} placeholder="e.g. 1234 5678 9012" className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Screenshot of Transaction *</label>
                <input type="file" accept="image/*" onChange={e => setScreenshot(e.target.files?.[0] || null)} className="w-full text-sm" />
                {screenshot && <p className="text-xs text-green-600 mt-1">{screenshot.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional info" className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => { setPayingInvoice(null); setRefNumber(''); setScreenshot(null); setNotes(''); }} className="flex-1 border rounded py-2 text-sm">Cancel</button>
              <button onClick={() => submitPayment.mutate()} disabled={!refNumber || !screenshot || submitPayment.isPending} className="flex-1 bg-blue-600 text-white rounded py-2 text-sm disabled:opacity-50">
                {submitPayment.isPending ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
