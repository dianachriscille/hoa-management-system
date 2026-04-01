import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { securityService } from '../services/security.service';

export function VisitorPassPage() {
  const qc = useQueryClient();
  const [visitorName, setVisitorName] = useState('');
  const [validDate, setValidDate] = useState('');
  const [newPass, setNewPass] = useState<{ qrDataUrl: string; passCode: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const { data: passes = [] } = useQuery({ queryKey: ['my-passes'], queryFn: () => securityService.getMyPasses().then(r => r.data) });

  const handleCreate = async () => {
    if (!visitorName.trim() || !validDate) return;
    setIsCreating(true);
    try {
      const { data } = await securityService.createPass(visitorName, validDate);
      setNewPass({ qrDataUrl: data.qrDataUrl, passCode: data.pass.passCode });
      qc.invalidateQueries({ queryKey: ['my-passes'] });
      setVisitorName(''); setValidDate('');
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setIsCreating(false); }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this visitor pass?')) return;
    await securityService.revokePass(id);
    qc.invalidateQueries({ queryKey: ['my-passes'] });
  };

  const active = passes.filter(p => !p.isRevoked && new Date(p.validDate) >= new Date(today));
  const past = passes.filter(p => p.isRevoked || new Date(p.validDate) < new Date(today));

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Visitor Passes</h1>
      <div className="border rounded-lg p-4 mb-6 bg-gray-50">
        <h2 className="font-semibold mb-3 text-sm">Issue New Pass</h2>
        <div className="space-y-3">
          <input data-testid="visitor-name-input" value={visitorName} onChange={e => setVisitorName(e.target.value)} placeholder="Visitor name" className="w-full border rounded px-3 py-2 text-sm" />
          <input data-testid="valid-date-input" type="date" min={today} value={validDate} onChange={e => setValidDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          <button data-testid="create-pass-button" onClick={handleCreate} disabled={!visitorName.trim() || !validDate || isCreating} className="w-full bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50">{isCreating ? 'Creating...' : 'Create Pass'}</button>
        </div>
      </div>
      {newPass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
            <h3 className="font-bold mb-2">Visitor Pass Created</h3>
            <img src={newPass.qrDataUrl} alt="QR Code" className="mx-auto w-48 h-48" />
            <p className="text-xs text-gray-400 mt-2">Code: {newPass.passCode}</p>
            <button onClick={() => setNewPass(null)} className="mt-4 w-full bg-blue-600 text-white py-2 rounded text-sm">Done</button>
          </div>
        </div>
      )}
      <h2 className="font-semibold mb-3 text-sm">Active Passes ({active.length})</h2>
      <div className="space-y-2 mb-6">
        {active.map(p => (
          <div key={p.id} className="border rounded-lg p-3 flex items-center justify-between">
            <div><p className="font-medium text-sm">{p.visitorName}</p><p className="text-xs text-gray-500">{new Date(p.validDate).toLocaleDateString()} · {p.passCode}</p></div>
            <button data-testid={`revoke-${p.id}`} onClick={() => handleRevoke(p.id)} className="text-xs text-red-600 hover:underline">Revoke</button>
          </div>
        ))}
        {active.length === 0 && <p className="text-sm text-gray-500">No active passes.</p>}
      </div>
      {past.length > 0 && <div className="space-y-2 opacity-50">{past.map(p => <div key={p.id} className="border rounded-lg p-3"><p className="text-sm">{p.visitorName} · {new Date(p.validDate).toLocaleDateString()} · {p.isRevoked ? 'Revoked' : 'Expired'}</p></div>)}</div>}
    </div>
  );
}
