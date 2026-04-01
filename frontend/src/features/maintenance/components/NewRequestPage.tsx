import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { maintenanceService } from '../services/maintenance.service';
import api from '../../../shared/services/api';

const schema = z.object({
  category: z.enum(['Plumbing', 'Electrical', 'Structural', 'Landscaping', 'Other']),
  location: z.string().min(1, 'Location is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
});
type FormData = z.infer<typeof schema>;

const ACCEPTED = ['image/jpeg', 'image/png'];
const MAX_SIZE = 10 * 1024 * 1024;

export function NewRequestPage() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<{ key: string; preview: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({ resolver: zodResolver(schema) });

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) { alert('Maximum 3 photos allowed'); return; }

    setIsUploading(true);
    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) { alert('Only JPG and PNG files accepted'); continue; }
      if (file.size > MAX_SIZE) { alert('Each photo must be under 10MB'); continue; }
      try {
        const { data } = await api.post<{ key: string; url: string }>('/files/presigned-url', { folder: 'maintenance', contentType: file.type });
        await fetch(data.url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
        setPhotos(prev => [...prev, { key: data.key, preview: URL.createObjectURL(file) }]);
      } catch { alert('Photo upload failed. Please try again.'); }
    }
    setIsUploading(false);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const req = await maintenanceService.createRequest({ ...data, photoKeys: photos.map(p => p.key) });
      navigate(`/maintenance/${req.data.id}`);
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message || 'Submission failed' });
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Maintenance Request</h1>
      <form onSubmit={handleSubmit(onSubmit)} data-testid="new-request-form" className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select data-testid="category-select" {...register('category')} className="w-full border rounded px-3 py-2">
            {['Plumbing', 'Electrical', 'Structural', 'Landscaping', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input data-testid="location-input" placeholder="e.g. Unit 12B - Bathroom" {...register('location')} className="w-full border rounded px-3 py-2" />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea data-testid="description-input" rows={4} placeholder="Describe the issue in detail (min 10 characters)" {...register('description')} className="w-full border rounded px-3 py-2" />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Photos (optional, max 3)</label>
          <div className="flex gap-2 flex-wrap">
            {photos.map((p, i) => <img key={i} src={p.preview} alt="" className="w-20 h-20 object-cover rounded border" />)}
            {photos.length < 3 && (
              <label className="w-20 h-20 border-2 border-dashed rounded flex items-center justify-center cursor-pointer text-gray-400 hover:border-blue-400">
                <span className="text-2xl">+</span>
                <input type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={handlePhotoSelect} disabled={isUploading} />
              </label>
            )}
          </div>
          {isUploading && <p className="text-sm text-blue-600 mt-1">Uploading photo...</p>}
        </div>
        {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate('/maintenance')} className="flex-1 border rounded py-2 text-sm">Cancel</button>
          <button data-testid="submit-request-button" type="submit" disabled={isSubmitting || isUploading} className="flex-1 bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50">
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
