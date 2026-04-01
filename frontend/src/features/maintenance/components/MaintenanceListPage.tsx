import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { maintenanceService } from '../services/maintenance.service';
import { useMaintenanceSocket } from '../hooks/useMaintenanceSocket';
import { MaintenanceStatus } from '../types/maintenance.types';

const STATUS_COLORS: Record<string, string> = {
  Submitted: 'bg-blue-100 text-blue-800',
  Assigned: 'bg-purple-100 text-purple-800',
  InProgress: 'bg-yellow-100 text-yellow-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-100 text-gray-800',
};

export function MaintenanceListPage() {
  const [filter, setFilter] = useState<MaintenanceStatus | 'All'>('All');
  useMaintenanceSocket();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: () => maintenanceService.getMyRequests().then(r => r.data),
  });

  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Maintenance Requests</h1>
        <Link to="/maintenance/new" data-testid="new-request-button" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">+ New Request</Link>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['All', 'Submitted', 'Assigned', 'InProgress', 'Resolved', 'Closed'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-sm border ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}>{s}</button>
        ))}
      </div>

      {isLoading ? <p className="text-center py-8 text-gray-500">Loading...</p> : (
        <div className="space-y-3" data-testid="maintenance-list">
          {filtered.map(req => (
            <Link key={req.id} to={`/maintenance/${req.id}`} data-testid={`request-${req.id}`} className="block border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{req.requestNumber}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{req.description.slice(0, 80)}{req.description.length > 80 ? '...' : ''}</p>
                  <p className="text-xs text-gray-400 mt-1">{req.location} · {req.category}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-3 ${STATUS_COLORS[req.status]}`}>{req.status}</span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-gray-500">No requests found.</p>}
        </div>
      )}
    </div>
  );
}
