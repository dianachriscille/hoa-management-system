import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { amenityService } from '../services/amenity.service';
import { Amenity, AvailabilityMap } from '../types/amenity.types';

const DAY_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 cursor-pointer hover:bg-green-200',
  BOOKED: 'bg-red-100 text-red-400 cursor-not-allowed',
  BLOCKED: 'bg-gray-200 text-gray-400 cursor-not-allowed',
  UNAVAILABLE: 'bg-gray-100 text-gray-300 cursor-not-allowed',
};

export function AmenityListPage() {
  const [selected, setSelected] = useState<Amenity | null>(null);

  const { data: amenities = [] } = useQuery({ queryKey: ['amenities'], queryFn: () => amenityService.getAmenities().then(r => r.data) });
  const { data: availability } = useQuery<AvailabilityMap>({
    queryKey: ['amenity-availability', selected?.id],
    queryFn: () => amenityService.getAvailability(selected!.id).then(r => r.data),
    enabled: !!selected,
  });

  const [bookingDate, setBookingDate] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [success, setSuccess] = useState('');

  const handleBook = async () => {
    if (!selected || !bookingDate) return;
    setIsBooking(true);
    try {
      const { data } = await amenityService.createBooking(selected.id, bookingDate);
      setSuccess(`Booking ${data.bookingNumber} submitted! Awaiting PM approval.`);
      setBookingDate(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally { setIsBooking(false); }
  };

  if (selected && availability) return (
    <div className="p-6 max-w-xl mx-auto">
      <button onClick={() => { setSelected(null); setBookingDate(null); setSuccess(''); }} className="text-sm text-blue-600 hover:underline mb-4 block">← Back to amenities</button>
      <h1 className="text-2xl font-bold mb-1">{selected.name}</h1>
      {selected.bookingFee && <p className="text-sm text-orange-600 mb-1">Booking fee: ₱{selected.bookingFee} {selected.depositAmount ? `+ ₱${selected.depositAmount} deposit` : ''} (payable to PM)</p>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>}
      <h2 className="font-semibold mb-3 text-sm">Select a date (next {selected.maxAdvanceDays} days)</h2>
      <div className="grid grid-cols-7 gap-1 mb-4">
        {Object.entries(availability).map(([date, status]) => (
          <button key={date} onClick={() => status === 'AVAILABLE' ? setBookingDate(date) : null}
            className={`p-2 rounded text-xs text-center border-2 ${bookingDate === date ? 'border-blue-500' : 'border-transparent'} ${DAY_COLORS[status]}`}>
            {new Date(date).getDate()}
            <br /><span className="text-xs">{new Date(date).toLocaleDateString('en', { month: 'short' })}</span>
          </button>
        ))}
      </div>
      {bookingDate && (
        <div className="border rounded p-4 bg-gray-50">
          <p className="text-sm mb-3">Book <strong>{selected.name}</strong> for <strong>{new Date(bookingDate).toLocaleDateString()}</strong> (full day)</p>
          <button data-testid="confirm-booking-button" onClick={handleBook} disabled={isBooking} className="w-full bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50">
            {isBooking ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Amenity Booking</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {amenities.map(a => (
          <div key={a.id} className="border rounded-lg p-4">
            <h2 className="font-semibold">{a.name}</h2>
            {a.description && <p className="text-sm text-gray-500 mt-1">{a.description}</p>}
            {a.bookingFee ? <p className="text-sm text-orange-600 mt-1">Fee: ₱{a.bookingFee}</p> : <p className="text-sm text-green-600 mt-1">Free</p>}
            <button data-testid={`view-availability-${a.id}`} onClick={() => setSelected(a)} className="mt-3 w-full bg-blue-600 text-white py-1.5 rounded text-sm">View Availability</button>
          </div>
        ))}
      </div>
    </div>
  );
}
