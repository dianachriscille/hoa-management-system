import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { billingService } from '../services/billing.service';

const schema = z.object({
  amount: z.number({ invalid_type_error: 'Amount is required' }).positive('Must be positive'),
  paymentMethod: z.enum(['Cash', 'Cheque']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props { invoiceId: string; onClose: () => void; onSuccess: () => void; }

export function RecordManualPaymentModal({ invoiceId, onClose, onSuccess }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'Cash' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await billingService.recordManualPayment(invoiceId, data);
      onSuccess();
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message || 'Failed to record payment' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Record Manual Payment</h2>
        <form onSubmit={handleSubmit(onSubmit)} data-testid="manual-payment-form" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (₱)</label>
            <input data-testid="manual-payment-amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="w-full border rounded px-3 py-2" />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select data-testid="manual-payment-method" {...register('paymentMethod')} className="w-full border rounded px-3 py-2">
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reference Number (optional)</label>
            <input {...register('referenceNumber')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea {...register('notes')} rows={2} className="w-full border rounded px-3 py-2" />
          </div>
          {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 border rounded py-2 text-sm">Cancel</button>
            <button data-testid="manual-payment-submit" type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50">
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
