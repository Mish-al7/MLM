'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Plus, X, MapPin, Calendar, Clock, Globe, Trash2,
  Eye, EyeOff, Filter, ChevronDown, Briefcase, CheckCircle
} from 'lucide-react';

// Load map only on client side — avoids SSR failures with Leaflet
const BopMap = dynamic(() => import('@/components/shared/BopMap'), { ssr: false });

// ─── Constants ─────────────────────────────────────────────────────────────────
const REGIONS = ['Kerala', 'Karnataka', 'Tamil Nadu', 'Rest of India', 'Abroad'];

const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
];

const TEMPORAL_OPTIONS = [
  { value: 'all',   label: 'Show All Active' },
  { value: 'month', label: 'Current Month' },
  { value: 'next',  label: 'Next Month' },
];

const EMPTY_FORM = {
  title: '', dateTime: '', venue: '',
  region: '', district: '', lat: '', lng: '',
  published: false,
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function inCurrentMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function inNextMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return d.getMonth() === next.getMonth() && d.getFullYear() === next.getFullYear();
}

// ─── Input helper ───────────────────────────────────────────────────────────────
function FormField({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-[#C5A059]/25 bg-white text-sm text-[#001B3A] ' +
  'focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 transition-colors placeholder-slate-400';

const selectCls = inputCls + ' appearance-none cursor-pointer';

// ─── Create BOP Event Modal ─────────────────────────────────────────────────────
function CreateBopModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);

  // Geocoding state
  const [geoQuery, setGeoQuery]       = useState('');
  const [geoResults, setGeoResults]   = useState([]);
  const [geoLoading, setGeoLoading]   = useState(false);
  const [geoError, setGeoError]       = useState('');
  const [geoLabel, setGeoLabel]       = useState('');   // display name of pinned place

  const set = (key, val) => setForm(prev => ({
    ...prev,
    [key]: val,
    ...(key === 'region' && val !== 'Kerala' ? { district: '' } : {}),
  }));

  // Search OpenStreetMap Nominatim for a place name
  const handleGeoSearch = async () => {
    if (!geoQuery.trim()) return;
    setGeoLoading(true);
    setGeoError('');
    setGeoResults([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(geoQuery)}&format=json&limit=5&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (data.length === 0) setGeoError('No results found. Try a different search.');
      else setGeoResults(data);
    } catch {
      setGeoError('Search failed. Check your internet connection.');
    } finally {
      setGeoLoading(false);
    }
  };

  // Pin a selected result onto the form
  const handlePickResult = (result) => {
    set('lat', result.lat);
    set('lng', result.lon);
    setGeoLabel(result.display_name);
    setGeoResults([]);
    setGeoQuery('');
    setShowMap(true);
  };

  const clearPin = () => {
    set('lat', '');
    set('lng', '');
    setGeoLabel('');
    setShowMap(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.dateTime || !form.venue || !form.region) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/bop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          district: form.region === 'Kerala' ? form.district || null : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create');
      onCreated(json.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const mapLat = form.lat ? parseFloat(form.lat) : null;
  const mapLng = form.lng ? parseFloat(form.lng) : null;
  const mapValid = mapLat != null && mapLng != null && !isNaN(mapLat) && !isNaN(mapLng);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-[#C5A059]/25 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#C5A059]/15">
          <div>
            <h2 className="text-lg font-bold text-[#001B3A] font-heading tracking-widest uppercase">
              New BOP Event
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Create a Business Opportunity Program event</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <FormField label="Event Title" required>
            <input
              className={inputCls}
              placeholder="e.g. Allianza Kerala Leadership Summit"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </FormField>

          {/* Date & Time */}
          <FormField label="Date & Time" required>
            <input
              type="datetime-local"
              className={inputCls}
              value={form.dateTime}
              onChange={e => set('dateTime', e.target.value)}
            />
          </FormField>

          {/* Venue */}
          <FormField label="Venue / Address" required>
            <textarea
              className={inputCls + ' resize-none h-20'}
              placeholder="Enter full venue address..."
              value={form.venue}
              onChange={e => set('venue', e.target.value)}
            />
          </FormField>

          {/* Region + District (cascading) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Region" required>
              <div className="relative">
                <select
                  className={selectCls}
                  value={form.region}
                  onChange={e => set('region', e.target.value)}
                >
                  <option value="">— Select Region —</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </FormField>

            {/* Conditionally reveal District only for Kerala */}
            {form.region === 'Kerala' && (
              <FormField label="District">
                <div className="relative">
                  <select
                    className={selectCls}
                    value={form.district}
                    onChange={e => set('district', e.target.value)}
                  >
                    <option value="">— Select District —</option>
                    {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </FormField>
            )}
          </div>

          {/* Map Location — Address Search */}
          <div className="rounded-xl border border-[#C5A059]/20 bg-[#FBF9F4] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Map Location <span className="text-slate-400 normal-case font-normal">(optional)</span>
              </span>
              {mapValid && (
                <button type="button" onClick={clearPin} className="text-[10px] text-red-400 hover:underline font-semibold">
                  Clear pin
                </button>
              )}
            </div>

            {/* Search box */}
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="Search address or place name, e.g. Le Méridien Kochi"
                value={geoQuery}
                onChange={e => setGeoQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleGeoSearch())}
              />
              <button
                type="button"
                onClick={handleGeoSearch}
                disabled={geoLoading || !geoQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold whitespace-nowrap disabled:opacity-50 transition-colors"
              >
                {geoLoading ? '…' : 'Search'}
              </button>
            </div>

            {/* Search error */}
            {geoError && (
              <p className="text-xs text-red-500">{geoError}</p>
            )}

            {/* Results dropdown */}
            {geoResults.length > 0 && (
              <ul className="bg-white border border-[#C5A059]/20 rounded-xl overflow-hidden shadow-md divide-y divide-slate-100">
                {geoResults.map((r) => (
                  <li key={r.place_id}>
                    <button
                      type="button"
                      onClick={() => handlePickResult(r)}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-[#FBF9F4] transition-colors leading-relaxed"
                    >
                      <span className="font-semibold text-[#001B3A]">{r.name || r.display_name.split(',')[0]}</span>
                      <span className="text-slate-400 ml-1">{r.display_name.split(',').slice(1).join(',').trim()}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Pinned location label */}
            {geoLabel && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <MapPin size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700 leading-relaxed">{geoLabel}</p>
              </div>
            )}

            {/* Map preview */}
            {showMap && mapValid && (
              <BopMap lat={mapLat} lng={mapLng} venue={form.venue || geoLabel} zoom={14} />
            )}
          </div>

          {/* Publish toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-[#C5A059]/20 bg-[#FBF9F4]">
            <button
              type="button"
              onClick={() => set('published', !form.published)}
              className={`w-11 h-6 rounded-full transition-colors flex items-center ${form.published ? 'bg-[#0A1E3D]' : 'bg-slate-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.published ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <div>
              <p className="text-xs font-semibold text-slate-700">
                {form.published ? 'Published — Members can see this' : 'Draft — Hidden from members'}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Admin Event Row ─────────────────────────────────────────────────────────────
function AdminEventRow({ event, onTogglePublish, onDelete, onViewMap }) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(event._id);
    setDeleting(false);
  };

  const handleToggle = async () => {
    setToggling(true);
    await onTogglePublish(event._id, !event.published);
    setToggling(false);
  };

  return (
    <tr className="border-b border-[#C5A059]/10 hover:bg-[#FBF9F4] transition-colors">
      <td className="px-4 py-3">
        <p className="font-semibold text-[#001B3A] text-sm">{event.title}</p>
        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
          <MapPin size={10} />{event.region}{event.district ? ` · ${event.district}` : ''}
        </p>
      </td>
      <td className="px-4 py-3 text-xs text-slate-600">{formatDate(event.dateTime)}</td>
      <td className="px-4 py-3">
        <p className="text-xs text-slate-600 max-w-[200px] truncate">{event.venue}</p>
        {event.lat && event.lng && (
          <button
            onClick={() => onViewMap(event)}
            className="text-[10px] text-[#C5A059] hover:underline mt-0.5 flex items-center gap-1"
          >
            <MapPin size={9} /> View on Map
          </button>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-colors ${
            event.published
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {event.published ? <Eye size={10} /> : <EyeOff size={10} />}
          {event.published ? 'Published' : 'Draft'}
        </button>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

// ─── Member BOP Card ─────────────────────────────────────────────────────────────
function BopCard({ event, onViewMap }) {
  const isUpcoming = new Date(event.dateTime) >= new Date();
  return (
    <div className="bg-white rounded-2xl border border-[#C5A059]/20 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      {/* Region badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#0A1E3D] text-[#C5A059]">
          <Globe size={9} />
          {event.region}{event.district ? ` · ${event.district}` : ''}
        </span>
        {isUpcoming && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-wider">
            <CheckCircle size={9} /> Upcoming
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-[#001B3A] leading-snug font-heading tracking-wide text-base">
        {event.title}
      </h3>

      {/* Date */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Calendar size={12} className="text-[#C5A059]" />
        <span>{formatDate(event.dateTime)}</span>
      </div>

      {/* Venue */}
      <div className="flex items-start gap-2 text-xs text-slate-500">
        <MapPin size={12} className="text-[#C5A059] shrink-0 mt-0.5" />
        <span className="leading-relaxed">{event.venue}</span>
      </div>

      {/* Map preview link */}
      {event.lat && event.lng && (
        <button
          onClick={() => onViewMap(event)}
          className="self-start mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white transition-colors"
        >
          <MapPin size={11} /> View Location on Map
        </button>
      )}
    </div>
  );
}

// ─── Map Modal ──────────────────────────────────────────────────────────────────
function MapModal({ event, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-[#C5A059]/25 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#C5A059]/15">
          <div>
            <h3 className="font-bold text-[#001B3A] text-sm font-heading tracking-wider uppercase">{event.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{event.venue}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 shadow-sm shadow-emerald-500/10"
            >
              Google Maps ↗
            </a>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="p-4">
          <BopMap lat={event.lat} lng={event.lng} venue={event.venue} zoom={14} />
        </div>
      </div>
    </div>
  );
}

// ─── Main BOPClient ──────────────────────────────────────────────────────────────
export default function BOPClient({ isAdmin = false }) {
  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showCreate, setShowCreate]   = useState(false);
  const [mapEvent, setMapEvent]       = useState(null);

  // Member filter state
  const [filterRegion,   setFilterRegion]   = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterTime,     setFilterTime]     = useState('all');

  // Fetch on mount
  useEffect(() => {
    fetch('/api/bop')
      .then(r => r.json())
      .then(json => { if (json.success) setEvents(json.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Admin actions
  const handleCreated = (ev) => setEvents(prev => [ev, ...prev]);

  const handleTogglePublish = async (id, published) => {
    const res = await fetch(`/api/bop/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published }),
    });
    if (res.ok) {
      setEvents(prev => prev.map(e => e._id === id ? { ...e, published } : e));
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/bop/${id}`, { method: 'DELETE' });
    if (res.ok) setEvents(prev => prev.filter(e => e._id !== id));
  };

  // Member filtered list
  const filteredEvents = useMemo(() => {
    let list = events.filter(e => new Date(e.dateTime) >= new Date()); // upcoming only for members
    if (filterRegion) list = list.filter(e => e.region === filterRegion);
    if (filterRegion === 'Kerala' && filterDistrict) {
      list = list.filter(e => e.district === filterDistrict);
    }
    if (filterTime === 'month') list = list.filter(e => inCurrentMonth(e.dateTime));
    if (filterTime === 'next')  list = list.filter(e => inNextMonth(e.dateTime));
    return list;
  }, [events, filterRegion, filterDistrict, filterTime]);

  // ── Admin View ──────────────────────────────────────────────────────────────
  if (isAdmin) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#001B3A] font-heading tracking-widest uppercase">
              Business Opportunity Program
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Manage and publish BOP events for your team.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Plus size={15} strokeWidth={2.5} />
            Create BOP Event
          </button>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-2xl border border-[#C5A059]/20 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#C5A059]/10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">All BOP Events</span>
            <span className="text-xs text-slate-400">{events.length} total</span>
          </div>
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Loading events…</div>
          ) : events.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Briefcase size={32} className="text-slate-200 mx-auto" />
              <p className="text-slate-400 text-sm">No BOP events yet. Create your first one!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0A1E3D] text-[#C5A059]">
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Event</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Date & Time</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Venue</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <AdminEventRow
                      key={ev._id}
                      event={ev}
                      onTogglePublish={handleTogglePublish}
                      onDelete={handleDelete}
                      onViewMap={setMapEvent}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}
        {showCreate && (
          <CreateBopModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
        )}
        {mapEvent && <MapModal event={mapEvent} onClose={() => setMapEvent(null)} />}
      </div>
    );
  }

  // ── Member View ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#001B3A] font-heading tracking-widest uppercase">
          Business Opportunity Program
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Explore upcoming business opportunity programs available to you.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#C5A059]/20 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={13} className="text-[#C5A059]" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Filter Events</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Region filter */}
          <div className="relative">
            <select
              className={selectCls + ' min-w-[170px]'}
              value={filterRegion}
              onChange={e => { setFilterRegion(e.target.value); setFilterDistrict(''); }}
            >
              <option value="">All Regions</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* District sub-filter — only visible when Kerala selected */}
          {filterRegion === 'Kerala' && (
            <div className="relative">
              <select
                className={selectCls + ' min-w-[200px]'}
                value={filterDistrict}
                onChange={e => setFilterDistrict(e.target.value)}
              >
                <option value="">All Districts</option>
                {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Temporal filter */}
          <div className="flex rounded-xl border border-[#C5A059]/20 overflow-hidden">
            {TEMPORAL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterTime(opt.value)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  filterTime === opt.value
                    ? 'bg-[#0A1E3D] text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event Cards */}
      {loading ? (
        <div className="p-10 text-center text-slate-400 text-sm">Loading events…</div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Briefcase size={40} className="text-slate-200" />
          <p className="text-slate-400 text-sm font-medium">No upcoming BOP events match your filters.</p>
          {(filterRegion || filterTime !== 'all') && (
            <button
              onClick={() => { setFilterRegion(''); setFilterDistrict(''); setFilterTime('all'); }}
              className="text-xs text-[#C5A059] hover:underline font-semibold"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map(ev => (
            <BopCard key={ev._id} event={ev} onViewMap={setMapEvent} />
          ))}
        </div>
      )}

      {/* Map Modal */}
      {mapEvent && <MapModal event={mapEvent} onClose={() => setMapEvent(null)} />}
    </div>
  );
}
