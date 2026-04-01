import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '../services/maintenance.service';
import { useAuth } from '../../auth/hooks/useAuth';
import { MaintenanceStatus } from '../types/maintenance.types';

const STATUS_COLORS: Record<string, string> = {
  Submitted: 'bg-blue-100 text-blue-800', Assigned: 'bg-purple-100 text-purple-800',
  InProgress: 'bg-yellow-100 text-yellow-800', Resolved: 'bg-green-100 text-green-800', Closed: 'bg-gray-100 text-gray-800',
};

const PM_NEXT_STATUS: Partial<Record<MaintenanceStatus, MaintenanceStatus>> = {
  Assigned: 'InProgress', InProgress: 'Resolved',
};

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isActing, setIsActing] = useState(false);

  const { data: request, isLoading } = useQuery({
    queryKey: ['maintenance-request', id],
    queryFn: () => maintenanceService.getRequest(id!).then(r => r.data),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['maintenance-request', id] });

  const handleStatusUpdate = async (status: MaintenanceStatus) => {
    setIsActing(true);
    try { await maintenanceService.updateStatus(id!, { status }); refresh(); }
    catch (err: any) { alert(err.response?.data?.message || 'Update failed'); }
    finally { setIsActing(false); }
  };

  const handleConfirm = async () => {
    setIsActing(true);
    try { await maintenanceService.confirmResolution(id!); refresh(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setIsActing(false); }
  };

  const handleReopen = async () => {
    setIsActing(true);
    try { await maintenanceService.reopenRequest(id!); refresh(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setIsActing(false); }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    await maintenanceService.addNote(id!, { content: noteContent, isInternal });
    setNoteContent('');
    refresh();
  };

  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading...</div>;
  if (!request) return <div className="p-6 text-center text-red-500">Request not found</div>;

  const canReopen = request.status === 'Resolved' && request.reopenDeadline && new Date() <= new Date(request.reopenDeadline);
  const nextPMStatus = PM_NEXT_STATUS[request.status as MaintenanceStatus];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate('/maintenance')} className="text-sm text-blue-600 hover:underline mb-4 block">← Back to requests</button>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{request.requestNumber}</h1>
          <p className="text-sm text-gray-500">{request.category} · {request.location}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[request.status]}`}>{request.status}</span>
      </div>

      <p className="text-gray-700 mb-6">{request.description}</p>

      {/* Photos */}
      {request.photos && request.photos.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2 text-sm">Photos</h2>
          <div className="flex gap-2">{request.photos.map(p => <img key={p.id} src={p.presignedUrl} alt="" className="w-24 h-24 object-cover rounded border" />)}</div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="mb-6">
        <h2 className="font-semibold mb-3 text-sm">Status History</h2>
        <div className="space-y-2">
          {request.statusHistory?.map(h => (
            <div key={h.id} className="flex gap-3 text-sm">
              <span className="text-gray-400 whitespace-nowrap">{new Date(h.createdAt).toLocaleDateString()}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[h.toStatus]}`}>{h.toStatus}</span>
              {h.note && <span className="text-gray-600">{h.note}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <h2 className="font-semibold mb-3 text-sm">Notes</h2>
        <div className="space-y-2 mb-3">
          {request.notes?.map(n => (
            <div key={n.id} className={`p-3 rounded text-sm ${n.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
              {n.isInternal && <span className="text-xs text-yellow-700 font-medium mr-2">[Internal]</span>}
              {n.content}
            </div>
          ))}
        </div>
        {request.status !== 'Closed' && (
          <div className="flex gap-2">
            <input value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Add a note..." className="flex-1 border rounded px-3 py-2 text-sm" />
            {(user?.role === 'PropertyManager' || user?.role === 'BoardMember') && (
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                Internal
              </label>
            )}
            <button onClick={handleAddNote} className="bg-gray-600 text-white px-3 py-2 rounded text-sm">Add</button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {user?.role === 'PropertyManager' && nextPMStatus && (
          <button data-testid={`update-status-${nextPMStatus}`} onClick={() => handleStatusUpdate(nextPMStatus)} disabled={isActing} className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
            Mark as {nextPMStatus}
          </button>
        )}
        {user?.role === 'Resident' && request.status === 'Resolved' && (
          <>
            <button data-testid="confirm-resolution-button" onClick={handleConfirm} disabled={isActing} className="bg-green-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">Confirm Resolved</button>
            {canReopen && <button data-testid="reopen-button" onClick={handleReopen} disabled={isActing} className="border border-orange-500 text-orange-600 px-4 py-2 rounded text-sm disabled:opacity-50">Reopen</button>}
          </>
        )}
      </div>
    </div>
  );
}
