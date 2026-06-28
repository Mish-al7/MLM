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
        <h1 className="text-xl font-bold text-white font-heading">Upcoming Events & Training</h1>
        <p className="text-zinc-400 text-xs mt-0.5">Discover leadership programs and self-nominate if eligible.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(item => {
          const isEligible = (currentUser.leftBV || 0) >= item.minLeftBV && (currentUser.rightBV || 0) >= item.minRightBV;
          
          return (
            <div key={item._id} className="bg-white rounded-2xl border border-slate-100 flex flex-col justify-between overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow">
              {item.bannerImage && (
                <div className="h-36 w-full border-b border-slate-100 overflow-hidden">
                  <img src={item.bannerImage} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-800 leading-snug">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <Calendar size={13} /> {new Date(item.date).toLocaleDateString()}
                  </p>
                  {item.venue && (
                    <p className="text-xs text-slate-500 mt-1">📍 {item.venue}</p>
                  )}
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Eligibility Check</span>
                      {isEligible ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                          <CheckCircle size={12} /> Eligible
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase">
                          <XCircle size={12} /> Not Eligible
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between text-xs font-mono text-slate-600">
                      <span className={(currentUser.leftBV || 0) >= item.minLeftBV ? 'text-emerald-600' : 'text-red-500'}>
                        L: {currentUser.leftBV || 0} / {item.minLeftBV}
                      </span>
                      <span className={(currentUser.rightBV || 0) >= item.minRightBV ? 'text-emerald-600' : 'text-red-500'}>
                        R: {currentUser.rightBV || 0} / {item.minRightBV}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800">₹{item.ticketPrice}</span>
                  <button 
                    onClick={() => setNominateEvent(item)}
                    disabled={!isEligible}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isEligible 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/10' 
                        : 'bg-slate-150 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    Self Nominate
                  </button>
                </div>
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
