import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/document.service';
import { DocumentCategory } from '../types/document.types';
import { useAuth } from '../../auth/hooks/useAuth';

const CATEGORIES: (DocumentCategory | 'All')[] = ['All', 'Policies', 'MeetingMinutes', 'Forms', 'Announcements'];
const CATEGORY_LABELS: Record<string, string> = { All: 'All', Policies: 'Policies', MeetingMinutes: 'Meeting Minutes', Forms: 'Forms', Announcements: 'Announcements' };

export function DocumentRepositoryPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<DocumentCategory | 'All'>('All');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('Policies');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canManage = user?.role === 'PropertyManager' || user?.role === 'BoardMember';

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', category, search],
    queryFn: () => documentService.listDocuments(category === 'All' ? undefined : category, search || undefined).then(r => r.data),
  });

  const handleDownload = async (id: string) => {
    try {
      const { data } = await documentService.getDownloadUrl(id);
      window.open(data.url, '_blank');
    } catch { alert('Download failed'); }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('title', uploadTitle);
      fd.append('category', uploadCategory);
      fd.append('description', uploadDesc);
      await documentService.uploadDocument(fd);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowUpload(false);
      setUploadTitle(''); setUploadCategory('Policies'); setUploadDesc(''); setUploadFile(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally { setIsUploading(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try { await documentService.deleteDocument(id); queryClient.invalidateQueries({ queryKey: ['documents'] }); }
    catch { alert('Delete failed'); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Document Repository</h1>
        {canManage && <button data-testid="upload-document-button" onClick={() => setShowUpload(true)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">+ Upload Document</button>}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title..." className="border rounded px-3 py-1.5 text-sm flex-1 min-w-48" />
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1 rounded-full text-sm border ${category === c ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}>{CATEGORY_LABELS[c]}</button>
          ))}
        </div>
      </div>

      {isLoading ? <p className="text-center py-8 text-gray-500">Loading...</p> : (
        <div className="space-y-2" data-testid="document-list">
          {documents.map(doc => (
            <div key={doc.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-xs text-gray-500">{CATEGORY_LABELS[doc.category]} · {new Date(doc.createdAt).toLocaleDateString()}</p>
                {doc.description && <p className="text-sm text-gray-600 mt-0.5">{doc.description}</p>}
              </div>
              <div className="flex gap-2 ml-4">
                <button data-testid={`download-${doc.id}`} onClick={() => handleDownload(doc.id)} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded">Download</button>
                {canManage && <button data-testid={`delete-${doc.id}`} onClick={() => handleDelete(doc.id, doc.title)} className="text-sm border border-red-400 text-red-600 px-3 py-1.5 rounded">Delete</button>}
              </div>
            </div>
          ))}
          {documents.length === 0 && <p className="text-center py-8 text-gray-500">No documents found.</p>}
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Upload Document</h2>
            <div className="space-y-3">
              <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Document title" className="w-full border rounded px-3 py-2 text-sm" />
              <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value as DocumentCategory)} className="w-full border rounded px-3 py-2 text-sm">
                {(['Policies', 'MeetingMinutes', 'Forms', 'Announcements'] as DocumentCategory[]).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
              <textarea value={uploadDesc} onChange={e => setUploadDesc(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full border rounded px-3 py-2 text-sm" />
              <div>
                <button onClick={() => fileRef.current?.click()} className="border rounded px-3 py-2 text-sm w-full text-left text-gray-500">
                  {uploadFile ? uploadFile.name : 'Choose file...'}
                </button>
                <input ref={fileRef} type="file" className="hidden" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowUpload(false)} className="flex-1 border rounded py-2 text-sm">Cancel</button>
              <button data-testid="confirm-upload-button" onClick={handleUpload} disabled={!uploadFile || !uploadTitle || isUploading} className="flex-1 bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50">
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
