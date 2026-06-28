'use client';

import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Plus, 
  X, 
  ShieldAlert, 
  Loader2, 
  Upload, 
  Play, 
  Eye 
} from 'lucide-react';
import Image from 'next/image';

export default function MediaClient({ isAdmin = false }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form/Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [url, setUrl] = useState('');
  const [albumName, setAlbumName] = useState('General');
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Filtering
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [albums, setAlbums] = useState(['General']);

  // Lightbox State
  const [activeLightboxItem, setActiveLightboxItem] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const json = await res.json();
      if (json.success) {
        setMediaItems(json.data);
        // Extract unique albums list
        const uniqueAlbums = Array.from(new Set(json.data.map(item => item.albumName || 'General')));
        setAlbums(uniqueAlbums.includes('General') ? uniqueAlbums : ['General', ...uniqueAlbums]);
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

    // Pre-fill title if empty
    if (!title) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setTitle(baseName);
    }

    // Determine type
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (res.ok && json.url) {
        setUrl(json.url);
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
    if (!title || !url) {
      setError('Title and File are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          mediaType,
          url,
          albumName
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMediaItems(prev => [json.data, ...prev]);
        setIsModalOpen(false);
        // Reset form
        setTitle('');
        setDescription('');
        setMediaType('image');
        setUrl('');
        setAlbumName('General');
        // Refresh albums list
        const updatedAlbums = Array.from(new Set([json.data.albumName, ...albums]));
        setAlbums(updatedAlbums);
      } else {
        setError(json.error || 'Failed to save media item');
      }
    } catch (err) {
      setError('Failed to save media item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;

    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMediaItems(prev => prev.filter(item => item._id !== id));
      } else {
        alert('Failed to delete media');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMedia = mediaItems.filter(item => {
    return selectedAlbum === 'all' || item.albumName === selectedAlbum;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="flex items-center justify-between bg-white border border-[#C5A059]/10 p-4 rounded-2xl shadow-sm">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Album:</span>
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="bg-[#FBF9F4]/40 border border-slate-200/80 rounded-xl px-4 py-2 text-sm text-[#001B3A] focus:outline-none focus:border-[#C5A059] transition-colors cursor-pointer"
          >
            <option value="all">All Albums</option>
            {albums.map((alb) => (
              <option key={alb} value={alb}>{alb}</option>
            ))}
          </select>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10 whitespace-nowrap"
          >
            <Plus size={14} />
            <span>Upload Media</span>
          </button>
        )}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#C5A059]" size={36} />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-[#C5A059]/20 rounded-2xl bg-white shadow-sm space-y-3">
          <div className="w-12 h-12 bg-[#FBF9F4] text-[#C5A059] rounded-full flex items-center justify-center mx-auto border border-[#C5A059]/10">
            <ImageIcon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700">Gallery is empty</h3>
            <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto">There are no photos or videos available in this album.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div 
              key={item._id} 
              className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(197,160,89,0.08)] hover:border-[#C5A059]/30 transition-all group flex flex-col justify-between"
            >
              {/* Media Preview Container */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => setActiveLightboxItem(item)}>
                {item.mediaType === 'video' ? (
                  <>
                    {/* Video Placeholder or Thumbnail if available */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 group-hover:bg-black/20 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-[#C5A059] text-[#0A1E3D] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>
                    <video src={item.url} className="w-full h-full object-cover opacity-60" muted playsInline />
                  </>
                ) : (
                  <>
                    <Image 
                      src={item.url} 
                      alt={item.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200">
                      <div className="w-9 h-9 rounded-full bg-white text-[#0A1E3D] flex items-center justify-center shadow-lg">
                        <Eye size={16} />
                      </div>
                    </div>
                  </>
                )}
                <span className="absolute bottom-2 left-2 text-[9px] bg-black/65 text-white backdrop-blur-sm px-2 py-0.5 rounded font-medium z-10">
                  {item.albumName || 'General'}
                </span>
              </div>

              {/* Text Info */}
              <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#001B3A] line-clamp-1 group-hover:text-[#C5A059] transition-colors">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 min-h-[30px]">{item.description || 'No description.'}</p>
                </div>

                <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-3">
                  <span className="text-[8px] text-slate-400 font-medium uppercase tracking-wider">
                    {item.mediaType}
                  </span>
                  
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item._id);
                      }}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded transition-colors cursor-pointer"
                      title="Delete media"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Video Player Modal */}
      {activeLightboxItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setActiveLightboxItem(null)}
        >
          <div 
            className="relative w-full max-w-4xl bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveLightboxItem(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/60 hover:bg-black/80 p-2 rounded-full transition-colors z-20 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Media Content */}
            <div className="flex-1 min-h-0 flex items-center justify-center p-4 bg-black">
              {activeLightboxItem.mediaType === 'video' ? (
                <video 
                  src={activeLightboxItem.url} 
                  controls 
                  autoPlay 
                  className="max-w-full max-h-[70vh] object-contain rounded"
                />
              ) : (
                <div className="relative w-full h-[70vh]">
                  <Image 
                    src={activeLightboxItem.url} 
                    alt={activeLightboxItem.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {/* Media details bar at bottom */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-850 text-left">
              <span className="text-[9px] bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                {activeLightboxItem.albumName || 'General'}
              </span>
              <h3 className="text-sm font-bold text-white mt-1.5">{activeLightboxItem.title}</h3>
              {activeLightboxItem.description && (
                <p className="text-xs text-zinc-400 mt-1">{activeLightboxItem.description}</p>
              )}
              <p className="text-[9px] text-zinc-500 mt-2">Uploaded by {activeLightboxItem.uploadedBy || 'Admin'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Media Modal */}
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
              <h2 className="text-base font-bold text-[#001B3A] font-heading">Upload New Media</h2>
              <p className="text-slate-500 text-xs mt-0.5">Add seminar photos or event highlight videos.</p>
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
                  Select Media File *
                </label>
                <div className="flex gap-2">
                  {url && (
                    <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 truncate flex-1 font-semibold">
                      Selected ({mediaType}): {url.substring(url.lastIndexOf('/') + 1)}
                    </div>
                  )}
                  <label className="bg-[#0A1E3D] hover:bg-[#001B3A] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors w-full border border-[#C5A059]/30">
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        <span>Uploading to S3...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Choose File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Media Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leadership Meet Bangalore"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#001B3A] focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Album/Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Seminars"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#001B3A] focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Media Type</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#001B3A] focus:outline-none focus:border-[#C5A059] transition-colors"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Additional context about this event..."
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
                  disabled={saving || uploading || !url}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
