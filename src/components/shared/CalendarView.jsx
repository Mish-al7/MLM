'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ isAdmin = false }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const json = await res.json();
        setEvents(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({ day: daysInPrevMonth - i, isCurrentMonth: false, date: null });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ day: d, isCurrentMonth: true, date: dateStr });
  }

  // Next month leading days
  const remaining = 42 - calendarCells.length; // 6 rows x 7 cols
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({ day: i, isCurrentMonth: false, date: null });
  }

  // Map events to dates
  const eventsByDate = {};
  events.forEach(ev => {
    const evDate = new Date(ev.date);
    const key = `${evDate.getFullYear()}-${String(evDate.getMonth() + 1).padStart(2, '0')}-${String(evDate.getDate()).padStart(2, '0')}`;
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(ev);
  });

  const handleDateClick = (cell) => {
    if (!cell.isCurrentMonth || !cell.date) return;
    setSelectedDate(cell.date);
    setSelectedEvents(eventsByDate[cell.date] || []);
  };

  const isToday = (cell) => {
    if (!cell.isCurrentMonth) return false;
    return cell.day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Organization Calendar</h1>
          <p className="text-zinc-400 text-xs mt-1">
            {isAdmin ? 'View all scheduled events and programs.' : 'View scheduled events and meetings.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-zinc-800">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={goToPrevMonth} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <h2 className="text-lg font-bold text-white font-heading min-w-[200px] text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button onClick={goToNextMonth} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
            <button onClick={goToToday} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 transition-colors">
              Today
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-[1px] bg-zinc-800/30 rounded-xl overflow-hidden border border-zinc-800">
            {calendarCells.map((cell, idx) => {
              const hasEvents = cell.date && eventsByDate[cell.date];
              const isSelected = cell.date === selectedDate;
              const isTodayCell = isToday(cell);

              return (
                <button
                  key={idx}
                  onClick={() => handleDateClick(cell)}
                  disabled={!cell.isCurrentMonth}
                  className={`relative p-2 min-h-[72px] text-left transition-all ${
                    cell.isCurrentMonth
                      ? 'bg-zinc-950 hover:bg-zinc-900/80 cursor-pointer'
                      : 'bg-zinc-950/40 cursor-default'
                  } ${isSelected ? 'ring-1 ring-amber-500 bg-amber-500/5' : ''}`}
                >
                  <span className={`text-sm font-mono ${
                    !cell.isCurrentMonth ? 'text-zinc-700' :
                    isTodayCell ? 'text-black bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs' :
                    'text-zinc-400'
                  }`}>
                    {cell.day}
                  </span>
                  {hasEvents && (
                    <div className="mt-1 space-y-0.5">
                      {eventsByDate[cell.date].slice(0, 2).map((ev, i) => (
                        <div key={i} className="text-[9px] font-semibold text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded truncate">
                          {ev.name}
                        </div>
                      ))}
                      {eventsByDate[cell.date].length > 2 && (
                        <div className="text-[9px] text-zinc-500 px-1">+{eventsByDate[cell.date].length - 2} more</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Event Detail Sidebar */}
        <div className="p-6 rounded-2xl glass-panel border border-zinc-800">
          {selectedDate ? (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>

              {selectedEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedEvents.map(ev => (
                    <div key={ev._id} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                      <h4 className="font-bold text-white">{ev.name}</h4>
                      {ev.description && (
                        <p className="text-xs text-zinc-400">{ev.description}</p>
                      )}
                      <div className="space-y-2">
                        {ev.time && (
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <Clock size={12} className="text-amber-500" />
                            <span>{ev.time}</span>
                          </div>
                        )}
                        {ev.venue && (
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <MapPin size={12} className="text-amber-500" />
                            <span>{ev.venue}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                        <span className="text-xs text-zinc-500">Ticket: ₹{ev.ticketPrice}</span>
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold uppercase">
                          Min BV: L{ev.minLeftBV} / R{ev.minRightBV}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                  <CalendarIcon size={28} className="mx-auto mb-3 text-zinc-700" />
                  <p className="text-sm">No events on this date.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-zinc-600">
              <CalendarIcon size={40} className="mb-4 text-zinc-700" />
              <p className="text-sm">Click on a date to see event details.</p>
              <p className="text-xs text-zinc-600 mt-2">Events are highlighted with amber tags.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
