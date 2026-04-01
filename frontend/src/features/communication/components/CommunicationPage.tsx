import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { communicationService } from '../services/communication.service';
import { useAuth } from '../../auth/hooks/useAuth';
import { RsvpStatus } from '../types/communication.types';

type Tab = 'announcements' | 'polls' | 'events' | 'forms';

export function CommunicationPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('announcements');
  const qc = useQueryClient();

  const { data: announcements = [] } = useQuery({ queryKey: ['announcements'], queryFn: () => communicationService.getAnnouncements().then(r => r.data), enabled: tab === 'announcements' });
  const { data: polls = [] } = useQuery({ queryKey: ['polls'], queryFn: () => communicationService.getPolls().then(r => r.data), enabled: tab === 'polls' });
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: () => communicationService.getEvents().then(r => r.data), enabled: tab === 'events' });
  const { data: forms = [] } = useQuery({ queryKey: ['forms'], queryFn: () => communicationService.getForms().then(r => r.data), enabled: tab === 'forms' });

  const handleVote = async (pollId: string, optionId: string) => {
    try { await communicationService.vote(pollId, optionId); qc.invalidateQueries({ queryKey: ['polls'] }); }
    catch (err: any) { alert(err.response?.data?.message || 'Vote failed'); }
  };

  const handleRsvp = async (eventId: string, status: RsvpStatus) => {
    try { await communicationService.rsvp(eventId, status); qc.invalidateQueries({ queryKey: ['events'] }); }
    catch (err: any) { alert(err.response?.data?.message || 'RSVP failed'); }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'announcements', label: 'Announcements' },
    { key: 'polls', label: 'Polls' },
    { key: 'events', label: 'Events' },
    { key: 'forms', label: 'Feedback' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Community</h1>
      <div className="flex gap-1 mb-6 border-b">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'announcements' && (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50" onClick={() => communicationService.markRead(a.id).catch(() => null)} data-testid={`announcement-${a.id}`}>
              <p className="font-medium">{a.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(a.publishedAt).toLocaleDateString()}</p>
              <p className="text-sm text-gray-700 mt-2">{a.body}</p>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-center py-8 text-gray-500">No announcements yet.</p>}
        </div>
      )}

      {tab === 'polls' && (
        <div className="space-y-4">
          {polls.map(p => (
            <div key={p.id} className="border rounded-lg p-4" data-testid={`poll-${p.id}`}>
              <div className="flex items-start justify-between mb-3">
                <p className="font-medium">{p.question}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
              </div>
              {p.status === 'Active' && !p.hasVoted ? (
                <div className="space-y-2">
                  {p.options.map(o => (
                    <button key={o.id} data-testid={`vote-option-${o.id}`} onClick={() => handleVote(p.id, o.id)} className="w-full text-left border rounded px-3 py-2 text-sm hover:bg-blue-50 hover:border-blue-400">{o.optionText}</button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {p.options.map(o => {
                    const total = p.options.reduce((s, x) => s + (x.voteCount || 0), 0);
                    const pct = total > 0 ? Math.round(((o.voteCount || 0) / total) * 100) : 0;
                    return (
                      <div key={o.id} className={`rounded px-3 py-2 text-sm ${p.userVoteOptionId === o.id ? 'bg-blue-50 border border-blue-300' : 'bg-gray-50'}`}>
                        <div className="flex justify-between mb-1"><span>{o.optionText}</span><span className="text-gray-500">{o.voteCount ?? '—'} ({pct}%)</span></div>
                        <div className="h-1.5 bg-gray-200 rounded"><div className="h-1.5 bg-blue-500 rounded" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">Closes: {new Date(p.closingDate).toLocaleDateString()}</p>
            </div>
          ))}
          {polls.length === 0 && <p className="text-center py-8 text-gray-500">No polls yet.</p>}
        </div>
      )}

      {tab === 'events' && (
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="border rounded-lg p-4" data-testid={`event-${e.id}`}>
              <p className="font-medium">{e.title}</p>
              <p className="text-sm text-gray-500">{new Date(e.eventDate).toLocaleDateString()}{e.startTime ? ` · ${e.startTime}` : ''}{e.location ? ` · ${e.location}` : ''}</p>
              {e.description && <p className="text-sm text-gray-700 mt-1">{e.description}</p>}
              <div className="flex gap-2 mt-3">
                <button data-testid={`rsvp-attending-${e.id}`} onClick={() => handleRsvp(e.id, 'Attending')} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm">Attending</button>
                <button data-testid={`rsvp-not-attending-${e.id}`} onClick={() => handleRsvp(e.id, 'NotAttending')} className="border border-gray-400 text-gray-600 px-3 py-1.5 rounded text-sm">Not Attending</button>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-center py-8 text-gray-500">No events yet.</p>}
        </div>
      )}

      {tab === 'forms' && (
        <div className="space-y-3">
          {forms.map(f => (
            <div key={f.id} className="border rounded-lg p-4" data-testid={`form-${f.id}`}>
              <p className="font-medium">{f.title}</p>
              {f.description && <p className="text-sm text-gray-500 mt-1">{f.description}</p>}
              <button className="mt-2 text-sm text-blue-600 hover:underline">Open Form →</button>
            </div>
          ))}
          {forms.length === 0 && <p className="text-center py-8 text-gray-500">No feedback forms yet.</p>}
        </div>
      )}
    </div>
  );
}
