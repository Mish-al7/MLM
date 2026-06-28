'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Trash2, 
  Plus, 
  Search, 
  Download, 
  ExternalLink, 
  Upload, 
  X, 
  ShieldAlert,
  Loader2,
  FileSpreadsheet,
  FileIcon
} from 'lucide-react';

export default function DocumentsClient({ isAdmin = false }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [fileSize, setFileSize] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      const json = await res.json();
      if (json.success) {
        setDocuments(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    
    // Auto-fill title if empty
    if (!title) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setTitle(baseName);
    }

    // Determine type
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) setFileType('pdf');
    else if (['doc', 'docx'].includes(ext)) setFileType('doc');
    else if (['xls', 'xlsx', 'csv'].includes(ext)) setFileType('xls');
    else if (['ppt', 'pptx'].includes(ext)) setFileType('ppt');
    else setFileType('other');

    // Human-readable file size
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileSize(`${sizeMB} MB`);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (res.ok && json.url) {
        setFileUrl(json.url);
      } else {
        setError(json.error || 'Upload failed');
      }
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !fileUrl) {
      setError('Title and File are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          fileUrl,
          fileType,
          fileSize
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setDocuments(prev => [json.data, ...prev]);
        setIsModalOpen(false);
        // Reset form
        setTitle('');
        setDescription('');
        setFileUrl('');
        setFileType('pdf');
        setFileSize('');
      } else {
        setError(json.error || 'Failed to save document');
      }
    } catch (err) {
      setError('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(doc => doc._id !== id));
      } else {
        alert('Failed to delete document');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="text-red-500" size={24} />;
      case 'xls':
        return <FileSpreadsheet className="text-emerald-600" size={24} />;
      case 'doc':
        return <FileIcon className="text-blue-500" size={24} />;
      case 'ppt':
        return <FileIcon className="text-orange-500" size={24} />;
      default:
        return <FileIcon className="text-slate-400" size={24} />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.fileType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-[#C5A059]/10 p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search documents by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FBF9F4]/40 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#001B3A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#FBF9F4]/40 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm text-[#001B3A] focus:outline-none focus:border-[#C5A059] transition-colors cursor-pointer"
          >
            <option value="all">All File Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="doc">Word Files</option>
            <option value="xls">Spreadsheets</option>
            <option value="ppt">Presentations</option>
            <option value="other">Other Files</option>
          </select>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10 whitespace-nowrap"
            >
              <Plus size={14} />
              <span>Upload Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#C5A059]" size={36} />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-[#C5A059]/20 rounded-2xl bg-white shadow-sm space-y-3">
          <div className="w-12 h-12 bg-[#FBF9F4] text-[#C5A059] rounded-full flex items-center justify-center mx-auto border border-[#C5A059]/10">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700">No documents found</h3>
            <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto">There are no business documents matching the filters or search criteria.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc._id} 
              className="bg-white border border-slate-150 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_4px_16px_rgba(197,160,89,0.08)] hover:border-[#C5A059]/30 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="p-3 bg-[#FBF9F4] rounded-xl border border-[#C5A059]/10 group-hover:bg-[#C5A059]/10 transition-colors">
                    {getFileIcon(doc.fileType)}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-[#001B3A] line-clamp-1 group-hover:text-[#C5A059] transition-colors">{doc.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[32px]">{doc.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-4">
                <span className="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded font-medium">
                  By {doc.uploadedBy || 'Admin'}
                </span>
                
                <div className="flex gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-[#0A1E3D] hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Open document"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <a
                    href={doc.fileUrl}
                    download
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Download document"
                  >
                    <Download size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#C5A059]/20 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl relative text-left">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#001B3A] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <h2 className="text-base font-bold text-[#001B3A] font-heading">Upload New Document</h2>
              <p className="text-slate-500 text-xs mt-0.5">Add resources or documentation for organization members.</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs flex items-center gap-1.5">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Upload File *
                </label>
                <div className="flex gap-2">
                  {fileUrl && (
                    <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 truncate flex-1 font-semibold">
                      Selected: {fileUrl.substring(fileUrl.lastIndexOf('/') + 1)}
                    </div>
                  )}
                  <label className="bg-[#0A1E3D] hover:bg-[#001B3A] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors w-full border border-[#C5A059]/30">
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Choose File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Compensation Plan v2.0"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#001B3A] focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="A short summary of what this document covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#001B3A] focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading || !fileUrl}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
