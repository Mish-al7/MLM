'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Award, CheckCircle, XCircle } from 'lucide-react';
import NominateEventModal from '@/components/modals/NominateEventModal';

export default function MemberEventsClient({ initialEvents, currentUser }) {
  const [events, setEvents] = useState(initialEvents || []);
  const [nominateEvent, setNominateEvent] = useState(null);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading">Upcoming Events & Training</h1>
        <p className="text-zinc-400 text-xs mt-1">Discover leadership programs and self-nominate if eligible.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(item => {
          const isEligible = (currentUser.leftBV || 0) >= item.minLeftBV && (currentUser.rightBV || 0) >= item.minRightBV;
          
          return (
            <div key={item._id} className="p-4 rounded-xl glass-panel border border-zinc-800 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-lg text-white">{item.name}</h4>
                <p className="text-xs text-zinc-400 mt-2 flex items-center gap-2">
                  <Calendar size={14} /> {new Date(item.date).toLocaleDateString()}
                </p>
                {item.venue && (
                  <p className="text-xs text-zinc-500 mt-1">📍 {item.venue}</p>
                )}
                <div className="mt-4 p-3 bg-zinc-900 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Eligibility Check</span>
                    {isEligible ? (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-500 uppercase">
                        <CheckCircle size={12} /> Eligible
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold text-red-500 uppercase">
                        <XCircle size={12} /> Not Eligible
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-xs font-mono text-zinc-300">
                    <span className={(currentUser.leftBV || 0) >= item.minLeftBV ? 'text-emerald-400' : 'text-red-400'}>
                      L: {currentUser.leftBV || 0} / {item.minLeftBV}
                    </span>
                    <span className={(currentUser.rightBV || 0) >= item.minRightBV ? 'text-emerald-400' : 'text-red-400'}>
                      R: {currentUser.rightBV || 0} / {item.minRightBV}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-center">
                <span className="text-sm font-semibold text-zinc-300">₹{item.ticketPrice}</span>
                <button 
                  onClick={() => setNominateEvent(item)}
                  disabled={!isEligible}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    isEligible 
                      ? 'bg-amber-500 text-black hover:opacity-90' 
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  Self Nominate
                </button>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="col-span-full p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
            No upcoming events currently scheduled.
          </div>
        )}
      </div>

      <NominateEventModal
        isOpen={!!nominateEvent}
        onClose={() => setNominateEvent(null)}
        onSuccess={(registration) => {
          alert('Nomination submitted! Status: Pending approval.');
        }}
        eventItem={nominateEvent}
        currentUser={currentUser}
      />
    </div>
  );
}
