import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { billingService } from '../services/billing.service';
import { Invoice } from '../types/billing.types';

const STATUS_COLORS: Record<string, string> = {
  Unpaid: 'bg-yellow-100 text-yellow-800',
  PartiallyPaid: 'bg-blue-100 text-blue-800',
  Paid: 'bg-green-100 text-green-800',
  Overdue: 'bg-red-100 text-red-800',
};

export function BillingPage() {
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: invoices = [], refetch } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: () => billingService.getMyInvoices().then(r => r.data),
  });

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') refetch();
  }, [searchParams]);

  const handlePayNow = async (invoice: Invoice) => {
    setIsRedirecting(true);
    try {
      const { data } = await billingService.initiatePayment(invoice.id);
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment initiation failed');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Billing</h1>

      {searchParams.get('status') === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">Payment successful! Your receipt has been emailed to you.</div>
      )}
      {searchParams.get('status') === 'failed' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">Payment was not completed. Please try again.</div>
      )}

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
                <button data-testid={`view-invoice-${invoice.id}`} onClick={() => setSelected(invoice)} className="text-sm text-blue-600 hover:underline">View</button>
                {invoice.status !== 'Paid' && (
                  <button data-testid={`pay-invoice-${invoice.id}`} onClick={() => handlePayNow(invoice)} disabled={isRedirecting} className="text-sm bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50">
                    {isRedirecting ? 'Redirecting...' : 'Pay Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {invoices.length === 0 && <p className="text-gray-500 text-center py-8">No invoices found.</p>}
      </div>

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
    </div>
  );
}
