'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Save, CheckCircle, Image as ImageIcon, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (_) {
    return url.startsWith('/') || url.startsWith('data:');
  }
};

export default function AdminBannersClient() {
  const [banners, setBanners] = useState([
    { id: 1, imageUrl: '', altText: 'Banner Slot 1' },
    { id: 2, imageUrl: '', altText: 'Banner Slot 2' }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploadingSlot, setUploadingSlot] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard-banners')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length === 2) {
          setBanners(json.data);
        }
      })
      .catch(err => {
        console.error('Failed to load banners:', err);
        setError('Failed to load current banners.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateField = (id, field, value) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    setSaved(false);
  };

  // Upload dragged/uploaded file to AWS S3 via /api/upload
  const handleFileChange = async (id, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setUploadingSlot(id);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to upload image to S3');
      }

      handleUpdateField(id, 'imageUrl', json.url);
    } catch (err) {
      console.error(err);
      setError(`Slot ${id} S3 Upload Error: ${err.message}`);
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, id) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileChange(id, file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/dashboard-banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save banners');
      setBanners(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Banners"
        subtitle="Manage and upload the dual promotional banners displayed on the Member Dashboard."
      />

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center text-slate-400">
          Loading Banner Configuration...
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left Column: Management Slots */}
          <div className="xl:col-span-7 space-y-6">
            
            {/* Slot 1 Uploader */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h3 className="text-sm font-bold text-slate-700">Banner Slot 1</h3>
                <span className="text-[10px] bg-blue-50 text-[#0A1E3D] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Left Display</span>
              </div>
              
              {/* Drag and Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 1)}
                className={`border-2 border-dashed border-[#C5A059]/20 hover:border-[#C5A059]/50 transition-colors bg-[#FBF9F4]/40 rounded-xl p-6 text-center cursor-pointer relative ${
                  uploadingSlot === 1 ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileChange(1, e.target.files?.[0])}
                  disabled={uploadingSlot === 1}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <Upload size={24} className={`mx-auto ${uploadingSlot === 1 ? 'animate-bounce text-[#C5A059]' : 'text-slate-400'}`} />
                  <p className="text-xs text-slate-600 font-semibold">
                    {uploadingSlot === 1 ? 'Uploading to S3...' : 'Drag & Drop Image or Click to Browse'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Supports PNG, JPG, GIF or WebP (Stores directly in AWS S3)</p>
                </div>
              </div>


              {/* Alt Text */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alt Text (Accessibility)</label>
                <input 
                  type="text"
                  placeholder="Alternative text describing the banner"
                  value={banners[0].altText}
                  onChange={(e) => handleUpdateField(1, 'altText', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-150 bg-white text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>
            </div>

            {/* Slot 2 Uploader */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h3 className="text-sm font-bold text-slate-700">Banner Slot 2</h3>
                <span className="text-[10px] bg-blue-50 text-[#0A1E3D] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Right Display</span>
              </div>
              
              {/* Drag and Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 2)}
                className={`border-2 border-dashed border-[#C5A059]/20 hover:border-[#C5A059]/50 transition-colors bg-[#FBF9F4]/40 rounded-xl p-6 text-center cursor-pointer relative ${
                  uploadingSlot === 2 ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileChange(2, e.target.files?.[0])}
                  disabled={uploadingSlot === 2}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <Upload size={24} className={`mx-auto ${uploadingSlot === 2 ? 'animate-bounce text-[#C5A059]' : 'text-slate-400'}`} />
                  <p className="text-xs text-slate-600 font-semibold">
                    {uploadingSlot === 2 ? 'Uploading to S3...' : 'Drag & Drop Image or Click to Browse'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Supports PNG, JPG, GIF or WebP (Stores directly in AWS S3)</p>
                </div>
              </div>


              {/* Alt Text */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alt Text (Accessibility)</label>
                <input 
                  type="text"
                  placeholder="Alternative text describing the banner"
                  value={banners[1].altText}
                  onChange={(e) => handleUpdateField(2, 'altText', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-150 bg-white text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100 flex items-center gap-1.5">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10 disabled:opacity-50 whitespace-nowrap"
              >
                {saving ? (
                  <>Publishing...</>
                ) : saved ? (
                  <><CheckCircle size={14} /> Published Changes!</>
                ) : (
                  <><Save size={14} /> Publish Changes</>
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Live Miniature Mockup Preview */}
          <div className="xl:col-span-5 space-y-4">
            <div className="bg-[#FBF9F4] rounded-2xl border border-slate-200/60 p-4 shadow-sm relative">
              <span className="absolute top-3 right-3 text-[9px] bg-amber-500/10 text-amber-600 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-500/20">
                Live Mockup
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Member Dashboard Grid Preview</h4>
              
              <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-inner space-y-3">
                {/* Greeting Card Mockup */}
                <div className="h-6 bg-slate-50 rounded-lg flex items-center px-2">
                  <div className="w-16 h-2 bg-slate-200 rounded" />
                </div>

                {/* Grid layout containing Slot 1 and Slot 2 side-by-side */}
                <div className="grid grid-cols-2 gap-2 h-44">
                  {/* Slot 1 mockup */}
                  <div className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50 relative flex items-center justify-center">
                    {isValidUrl(banners[0].imageUrl) ? (
                      <Image 
                        src={banners[0].imageUrl} 
                        alt="Slot 1 Preview" 
                        fill 
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="text-center text-slate-350 p-2">
                        <ImageIcon size={16} className="mx-auto mb-1" />
                        <span className="text-[8px] block">No Image Slot 1</span>
                      </div>
                    )}
                  </div>

                  {/* Slot 2 mockup */}
                  <div className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50 relative flex items-center justify-center">
                    {isValidUrl(banners[1].imageUrl) ? (
                      <Image 
                        src={banners[1].imageUrl} 
                        alt="Slot 2 Preview" 
                        fill 
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="text-center text-slate-350 p-2">
                        <ImageIcon size={16} className="mx-auto mb-1" />
                        <span className="text-[8px] block">No Image Slot 2</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Milestone Progress Bar Mockup */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <div className="w-12 h-2 bg-slate-200 rounded" />
                    <div className="w-8 h-2 bg-slate-200 rounded" />
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
