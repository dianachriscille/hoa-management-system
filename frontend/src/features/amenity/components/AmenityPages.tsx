import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { amenityService } from '../services/amenity.service';
import { BookingStatus } from '../types/amenity.types';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800', Confirmed: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800', Cancelled: 'bg-gray-100 text-gray-600',
};

export function MyBookingsPage() {
  const [filter, setFilter] = useState<BookingStatus | 'All'>('All');
  const queryClient = useQueryClient();
  const { data: bookings = [] } = useQuery({ queryKey: ['my-bookings'], queryFn: () => amenityService.getMyBookings().then(r => r.data) });

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  const handleCancel = async (id: string, bookingDate: string) => {
    const isWithin24h = new Date(bookingDate).getTime() - Date.now() < 24 * 3600 * 1000;
    if (isWithin24h && !confirm('Cancellation within 24 hours of booking date. Are you sure?')) return;
    try { await amenityService.cancelBooking(id); queryClient.invalidateQueries({ queryKey: ['my-bookings'] }); }
    catch (err: any) { alert(err.response?.data?.message || 'Cancellation failed'); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['All', 'Pending', 'Confirmed', 'Rejected', 'Cancelled'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-sm border ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(b => (
          <div key={b.id} className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{b.bookingNumber}</p>
              <p className="text-sm text-gray-500">{new Date(b.bookingDate).toLocaleDateString()}</p>
              {b.pmNotes && <p className="text-xs text-red-600 mt-1">Reason: {b.pmNotes}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status]}`}>{b.status}</span>
              {['Pending', 'Confirmed'].includes(b.status) && (
                <button data-testid={`cancel-booking-${b.id}`} onClick={() => handleCancel(b.id, b.bookingDate)} className="text-xs text-red-600 hover:underline">Cancel</button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-gray-500">No bookings found.</p>}
      </div>
    </div>
  );
}

export function AmenityManagementPage() {
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: pending = [] } = useQuery({ queryKey: ['pending-bookings'], queryFn: () => amenityService.getPendingBookings().then(r => r.data) });

  const handleApprove = async (id: string) => {
    try { await amenityService.approveBooking(id); queryClient.invalidateQueries({ queryKey: ['pending-bookings'] }); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    try { await amenityService.rejectBooking(rejectId, rejectReason); queryClient.invalidateQueries({ queryKey: ['pending-bookings'] }); setRejectId(null); setRejectReason(''); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Amenity Management</h1>
      <h2 className="font-semibold mb-3">Pending Bookings ({pending.length})</h2>
      <div className="space-y-3">
        {pending.map(b => (
          <div key={b.id} className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{b.bookingNumber}</p>
              <p className="text-sm text-gray-500">{new Date(b.bookingDate).toLocaleDateString()}</p>
              {b.bookingFeeAmount && <p className="text-xs text-orange-600">Fee: ₱{b.bookingFeeAmount}</p>}
            </div>
            <div className="flex gap-2">
              <button data-testid={`approve-booking-${b.id}`} onClick={() => handleApprove(b.id)} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm">Approve</button>
              <button data-testid={`reject-booking-${b.id}`} onClick={() => setRejectId(b.id)} className="border border-red-500 text-red-600 px-3 py-1.5 rounded text-sm">Reject</button>
            </div>
          </div>
        ))}
        {pending.length === 0 && <p className="text-gray-500 text-sm">No pending bookings.</p>}
      </div>

      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="font-bold mb-3">Reject Booking</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection (required)" rows={3} className="w-full border rounded px-3 py-2 text-sm mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setRejectId(null)} className="flex-1 border rounded py-2 text-sm">Cancel</button>
              <button data-testid="confirm-reject-button" onClick={handleReject} disabled={!rejectReason.trim()} className="flex-1 bg-red-600 text-white py-2 rounded text-sm disabled:opacity-50">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
