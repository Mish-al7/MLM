'use client';

import React, { useState, useEffect } from 'react';
import { Award, Calendar, Users, Plus, Eye, CheckCircle, XCircle, Download, X } from 'lucide-react';
import AddEventModal from '@/components/modals/AddEventModal';

export default function AdminEventsClient({ initialEvents }) {
  const [events, setEvents] = useState(initialEvents || []);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const json = await res.json();
        setEvents(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewRegistrations = async (eventItem) => {
    setViewingEvent(eventItem);
    setRegLoading(true);
    try {
      const res = await fetch(`/api/events/${eventItem._id}/registrations`);
      if (res.ok) {
        const json = await res.json();
        setRegistrations(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegLoading(false);
    }
  };

  const handleUpdateStatus = async (registrationId, status) => {
    try {
      const res = await fetch(`/api/events/${viewingEvent._id}/registrations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, status }),
      });
      if (res.ok) {
        setRegistrations(prev =>
          prev.map(r => r._id === registrationId ? { ...r, status } : r)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    if (!viewingEvent) return;
    window.open(`/api/events/${viewingEvent._id}/registrations?export=true`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Event Management</h1>
          <p className="text-zinc-400 text-xs mt-1">Create events, set eligibility criteria, and manage participant approvals.</p>
        </div>
        <button 
          onClick={() => setIsAddEventOpen(true)}
          className="flex items-center gap-1.5 bg-amber-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          <span>Create New Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(item => (
          <div key={item._id} className="p-4 rounded-xl glass-panel border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-white">{item.name}</h4>
                <Award className="text-amber-500" size={20} />
              </div>
              <p className="text-xs text-zinc-400 mt-2 flex items-center gap-2">
                <Calendar size={14} /> {new Date(item.date).toLocaleDateString()}
              </p>
              {item.venue && (
                <p className="text-xs text-zinc-500 mt-1">📍 {item.venue}</p>
              )}
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                <Users size={14} /> Max: {item.maxParticipants || 'Unlimited'}
              </p>
              <div className="mt-4 p-3 bg-zinc-900 rounded-lg">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Eligibility Requirements</p>
                <div className="flex justify-between mt-1 text-sm font-mono text-zinc-300">
                  <span>Left BV: {item.minLeftBV}</span>
                  <span>Right BV: {item.minRightBV}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-center">
              <span className="text-sm font-semibold text-zinc-300">₹{item.ticketPrice}</span>
              <button 
                onClick={() => handleViewRegistrations(item)}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:text-white transition-colors"
              >
                <Eye size={14} />
                View Registrations
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-full p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
            No events created yet.
          </div>
        )}
      </div>

      {/* Registrations Panel */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl p-6 relative shadow-2xl max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => { setViewingEvent(null); setRegistrations([]); }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white font-heading">Registrations</h2>
                <p className="text-sm text-zinc-400 mt-1">Event: <span className="text-amber-500 font-semibold">{viewingEvent.name}</span></p>
              </div>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                <Download size={14} />
                Export Excel
              </button>
            </div>

            {regLoading ? (
              <div className="p-8 text-center text-zinc-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                Loading registrations...
              </div>
            ) : registrations.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                No registrations yet for this event.
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map(reg => (
                  <div key={reg._id} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-amber-500 font-bold text-sm">
                        {reg.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{reg.name}</h4>
                        <p className="text-xs text-zinc-500">{reg.userId} | {reg.phone}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Leader: {reg.mainLeader} • Paid to: {reg.paidTo}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                        reg.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                        reg.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {reg.status}
                      </span>

                      {reg.status === 'Pending' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(reg._id, 'Approved')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(reg._id, 'Rejected')}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <AddEventModal 
        isOpen={isAddEventOpen} 
        onClose={() => setIsAddEventOpen(false)}
        onSuccess={(newEvent) => {
          setEvents([...events, newEvent]);
        }}
      />
    </div>
  );
}
