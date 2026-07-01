'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Upload, Save, CheckCircle, Image as ImageIcon, AlertCircle,
  Plus, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
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
    { id: 1, imageUrl: '', altText: 'Banner Slot 1' }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploadingSlot, setUploadingSlot] = useState(null);

  // Live preview mockup carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('/api/dashboard-banners')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
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

  const handleAddBanner = () => {
    if (banners.length >= 5) {
      setError('Maximum of 5 banner slides allowed.');
      return;
    }
    const newId = banners.length > 0 ? Math.max(...banners.map(b => b.id)) + 1 : 1;
    setBanners(prev => [...prev, { id: newId, imageUrl: '', altText: `Banner Slot ${newId}` }]);
    setSaved(false);
    setError('');
  };

  const handleRemoveBanner = (id) => {
    if (banners.length <= 1) {
      setError('You must keep at least one banner slide.');
      return;
    }
    setBanners(prev => prev.filter(b => b.id !== id));
    setSaved(false);
    setError('');
  };

  const handleMoveBanner = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;
    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setBanners(updated);
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

    // Validate that all slides have an image URL
    const invalidBanners = banners.filter(b => !b.imageUrl.trim());
    if (invalidBanners.length > 0) {
      setError('All banner slides must contain an image. Please upload an image or enter a URL.');
      setSaving(false);
      return;
    }

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

  // Preview carousel active slides
  const activeBanners = useMemo(() => banners.filter(b => b.imageUrl), [banners]);

  useEffect(() => {
    if (activeBanners.length <= 1) {
      setCurrentSlide(0);
      return;
    }
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Banners"
        subtitle="Manage and configure up to 5 promotional banners displayed in a premium carousel on the Member Dashboard."
      />

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center text-slate-400">
          Loading Banner Configuration...
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left Column: Management Slots */}
          <div className="xl:col-span-7 space-y-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Slides Configuration ({banners.length} / 5)
              </h2>
            </div>

            {banners.map((b, index) => (
              <div 
                key={b.id} 
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4 relative"
              >
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#0A1E3D] bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Slide #{index + 1}
                    </span>
                    <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs font-semibold">
                      {b.altText || 'Untitled Slide'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Move Up */}
                    <button
                      onClick={() => handleMoveBanner(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    {/* Move Down */}
                    <button
                      onClick={() => handleMoveBanner(index, 'down')}
                      disabled={index === banners.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown size={16} />
                    </button>
                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveBanner(b.id)}
                      disabled={banners.length <= 1}
                      className="p-1.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      title="Remove Slide"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                
                {/* Drag and Drop Zone */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, b.id)}
                  className={`border-2 border-dashed border-[#C5A059]/20 hover:border-[#C5A059]/50 transition-colors bg-[#FBF9F4]/40 rounded-xl p-5 text-center cursor-pointer relative ${
                    uploadingSlot === b.id ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(b.id, e.target.files?.[0])}
                    disabled={uploadingSlot === b.id}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1.5">
                    <Upload size={20} className={`mx-auto ${uploadingSlot === b.id ? 'animate-bounce text-[#C5A059]' : 'text-slate-400'}`} />
                    <p className="text-xs text-slate-600 font-semibold">
                      {uploadingSlot === b.id ? 'Uploading to S3...' : 'Drag & Drop Image or Click to Browse'}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium">Supports PNG, JPG, GIF or WebP</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Image URL input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or Image URL</label>
                    <input 
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={b.imageUrl}
                      onChange={(e) => handleUpdateField(b.id, 'imageUrl', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-150 bg-white text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>

                  {/* Alt Text */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alt Text (Accessibility)</label>
                    <input 
                      type="text"
                      placeholder="Alternative text describing the banner"
                      value={b.altText}
                      onChange={(e) => handleUpdateField(b.id, 'altText', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-150 bg-white text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add Slide Button */}
            {banners.length < 5 && (
              <button
                onClick={handleAddBanner}
                className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Banner Slide ({banners.length} / 5)</span>
              </button>
            )}

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100 flex items-center gap-1.5">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10 disabled:opacity-50 whitespace-nowrap cursor-pointer"
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
            <div className="bg-[#FBF9F4] rounded-2xl border border-slate-200/60 p-4 shadow-sm relative sticky top-6">
              <span className="absolute top-3 right-3 text-[9px] bg-amber-500/10 text-amber-600 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-500/20">
                Live Mockup
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Dashboard Carousel Preview</h4>
              
              <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-inner space-y-3">
                {/* Greeting Card Mockup */}
                <div className="h-6 bg-slate-50 rounded-lg flex items-center px-2">
                  <div className="w-16 h-2 bg-slate-200 rounded" />
                </div>

                {/* Miniature Carousel Container */}
                <div className="relative group/mockup w-full flex justify-center items-center">
                  {activeBanners.length > 0 ? (
                    <>
                      {/* Slides Container using Fade Transition */}
                      <div className="relative w-full">
                        {activeBanners.map((b, idx) => (
                          <div 
                            key={b.id || idx} 
                            className={`w-full flex justify-center items-center transition-all duration-500 ease-in-out ${
                              currentSlide === idx 
                                ? 'relative opacity-100 z-10' 
                                : 'absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none z-0'
                            }`}
                          >
                            <img 
                              src={b.imageUrl} 
                              alt="Slot Preview" 
                              className="max-h-[140px] w-auto h-auto block select-none rounded-lg border border-slate-150 shadow-sm"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Mockup Arrows */}
                      {activeBanners.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 text-slate-800 shadow-sm flex items-center justify-center opacity-0 group-hover/mockup:opacity-100 transition-opacity z-20 cursor-pointer border border-slate-100"
                            aria-label="Previous"
                          >
                            <ChevronLeft size={12} />
                          </button>
                          <button
                            onClick={() => setCurrentSlide((prev) => (prev + 1) % activeBanners.length)}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 text-slate-800 shadow-sm flex items-center justify-center opacity-0 group-hover/mockup:opacity-100 transition-opacity z-20 cursor-pointer border border-slate-100"
                            aria-label="Next"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </>
                      )}

                      {/* Mockup Dots */}
                      {activeBanners.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20 bg-slate-900/10 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                          {activeBanners.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentSlide(idx)}
                              className={`h-1 rounded-full transition-all cursor-pointer ${
                                currentSlide === idx ? 'bg-amber-500 w-3' : 'bg-white/80 hover:bg-white w-1'
                              }`}
                              aria-label={`Slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-slate-350 p-6 w-full border border-slate-100 rounded-lg bg-slate-50">
                      <ImageIcon size={16} className="mx-auto mb-1" />
                      <span className="text-[8px] block">No Banner Images Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Milestone Progress Bar Mockup */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                  <div className="flex justify-between">
                    <div className="w-10 h-1.5 bg-slate-200 rounded" />
                    <div className="w-6 h-1.5 bg-slate-200 rounded" />
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
