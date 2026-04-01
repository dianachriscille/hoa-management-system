import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { securityService } from '../services/security.service';
import { VerificationResult } from '../types/security.types';

export function GateGuardDashboard() {
  const [passCode, setPassCode] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [unitNumber, setUnitNumber] = useState('');
  const [residentInfo, setResidentInfo] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLooking, setIsLooking] = useState(false);

  const { data: todayVisitors = [] } = useQuery({
    queryKey: ['today-visitors'],
    queryFn: () => securityService.getTodayVisitors().then(r => r.data),
  });

  const handleVerify = async () => {
    if (!passCode.trim()) return;
    setIsVerifying(true);
    try {
      const { data } = await securityService.verifyPass(passCode.toUpperCase());
      setResult(data);
    } catch { setResult({ valid: false, reason: 'Verification failed' }); }
    finally { setIsVerifying(false); }
  };

  const handleLookup = async () => {
    if (!unitNumber.trim()) return;
    setIsLooking(true);
    try {
      const { data } = await securityService.lookupResident(unitNumber);
      setResidentInfo(data);
    } catch { setResidentInfo(null); alert('No resident found for this unit'); }
    finally { setIsLooking(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-4 text-center">Gate Guard</h1>

      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-3 text-sm text-gray-300">Today's Expected Visitors ({todayVisitors.length})</h2>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {todayVisitors.map(v => (
            <div key={v.id} className="flex justify-between text-sm bg-gray-700 rounded-lg px-3 py-2">
              <span>{v.visitorName}</span>
              <span className="text-gray-400">{(v as any).unitNumber}</span>
            </div>
          ))}
          {todayVisitors.length === 0 && <p className="text-sm text-gray-500 text-center">No visitors expected today</p>}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-3 text-sm text-gray-300">Verify Visitor Pass</h2>
        <div className="flex gap-2 mb-3">
          <input data-testid="pass-code-input" value={passCode} onChange={e => setPassCode(e.target.value.toUpperCase())} placeholder="Enter pass code" className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-lg font-mono uppercase tracking-widest" maxLength={8} />
          <button data-testid="verify-button" onClick={handleVerify} disabled={isVerifying || !passCode.trim()} className="bg-blue-600 px-6 py-3 rounded-lg font-semibold text-lg disabled:opacity-50">
            {isVerifying ? '...' : 'Verify'}
          </button>
        </div>
        {result && (
          <div className={`rounded-xl p-4 text-center ${result.valid ? 'bg-green-600' : 'bg-red-600'}`}>
            <p className="text-2xl font-bold mb-1">{result.valid ? '✓ VALID' : '✗ INVALID'}</p>
            {result.valid
              ? <div className="text-sm"><p>{result.visitorName}</p><p>Unit: {result.unitNumber}</p></div>
              : <p className="text-sm">{result.reason}</p>}
            <button onClick={() => { setResult(null); setPassCode(''); }} className="mt-3 bg-white/20 px-4 py-1.5 rounded-lg text-sm">Clear</button>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-4">
        <h2 className="font-semibold mb-3 text-sm text-gray-300">Resident Lookup</h2>
        <div className="flex gap-2 mb-3">
          <input data-testid="unit-lookup-input" value={unitNumber} onChange={e => setUnitNumber(e.target.value)} placeholder="Unit number" className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-lg" />
          <button data-testid="lookup-button" onClick={handleLookup} disabled={isLooking || !unitNumber.trim()} className="bg-purple-600 px-6 py-3 rounded-lg font-semibold disabled:opacity-50">
            {isLooking ? '...' : 'Look Up'}
          </button>
        </div>
        {residentInfo && (
          <div className="bg-gray-700 rounded-xl p-4 flex items-center gap-4">
            {residentInfo.profilePhotoUrl && <img src={residentInfo.profilePhotoUrl} alt="" className="w-16 h-16 rounded-full object-cover" />}
            <div><p className="font-bold text-lg">{residentInfo.firstName} {residentInfo.lastName}</p><p className="text-gray-400">Unit {residentInfo.unitNumber}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
