'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock,
  Plus, Pencil, Trash2, X, StickyNote, CheckCircle2, Circle
} from 'lucide-react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORY_CONFIG = {
  personal: { label: 'Personal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  work:     { label: 'Work',     color: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-500' },
  meeting:  { label: 'Meeting',  color: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  urgent:   { label: 'Urgent',   color: 'bg-rose-50 text-rose-700 border-rose-200',         dot: 'bg-rose-500' },
};

export default function CalendarView({ isAdmin = false }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'notes' | 'bop'

  // Note form state
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('personal');
  const [editingNote, setEditingNote] = useState(null); // { id, content, category }
  const [noteLoading, setNoteLoading] = useState(false);

  // Current user session info
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchNotes();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        setCurrentUserId(json.user?.userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const json = await res.json();
        setNotes(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDate(null); setSelectedEvents([]);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDate(null); setSelectedEvents([]);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(null); setSelectedEvents([]);
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({ day: daysInPrevMonth - i, isCurrentMonth: false, date: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ day: d, isCurrentMonth: true, date: dateStr });
  }
  const remaining = 42 - calendarCells.length;
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

  // Map notes to dates
  const notesByDate = {};
  notes.forEach(n => {
    if (!notesByDate[n.date]) notesByDate[n.date] = [];
    notesByDate[n.date].push(n);
  });

  const handleDateClick = (cell) => {
    if (!cell.isCurrentMonth || !cell.date) return;
    setSelectedDate(cell.date);
    setSelectedEvents(eventsByDate[cell.date] || []);
    setEditingNote(null);
    setNoteContent('');
    setNoteCategory('personal');
  };

  const isToday = (cell) => {
    if (!cell.isCurrentMonth) return false;
    return cell.day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  // --- Note CRUD ---
  const handleAddNote = async () => {
    if (!noteContent.trim() || !selectedDate) return;
    setNoteLoading(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, content: noteContent, category: noteCategory })
      });
      if (res.ok) {
        setNoteContent('');
        setNoteCategory('personal');
        await fetchNotes();
      }
    } catch (err) { console.error(err); }
    setNoteLoading(false);
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !editingNote.content.trim()) return;
    setNoteLoading(true);
    try {
      const res = await fetch(`/api/notes/${editingNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingNote.content, category: editingNote.category })
      });
      if (res.ok) {
        setEditingNote(null);
        await fetchNotes();
      }
    } catch (err) { console.error(err); }
    setNoteLoading(false);
  };

  const handleToggleComplete = async (note) => {
    try {
      await fetch(`/api/notes/${note._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !note.isCompleted })
      });
      await fetchNotes();
    } catch (err) { console.error(err); }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (res.ok) await fetchNotes();
    } catch (err) { console.error(err); }
  };

  const selectedDateNotes = selectedDate ? (notesByDate[selectedDate] || []) : [];

  // Unique dot categories for a cell (max 3 dots shown)
  const getCellDots = (date) => {
    const cellNotes = notesByDate[date] || [];
    const cats = [...new Set(cellNotes.map(n => n.category))].slice(0, 3);
    return cats;
  };

  const tabs = [
    { id: 'events', label: 'Events', icon: CalendarIcon },
    { id: 'notes',  label: 'My Notes', icon: StickyNote },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white font-heading">Organization Calendar</h1>
          <p className="text-zinc-400 text-xs mt-0.5">
            {isAdmin ? 'Manage events, add notes visible to your team.' : 'View events and notes from your leaders.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-zinc-800">
          {/* Month Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-150">
              <button 
                onClick={goToPrevMonth} 
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm transition-all"
              >
                <ChevronLeft size={15} strokeWidth={2.5} />
              </button>
              <h2 className="text-sm font-bold text-slate-800 min-w-[130px] text-center select-none font-heading px-2">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button 
                onClick={goToNextMonth} 
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm transition-all"
              >
                <ChevronRight size={15} strokeWidth={2.5} />
              </button>
            </div>
            <button 
              onClick={goToToday} 
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors shadow-sm"
            >
              Today
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider py-2">{d}</div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 border-t border-slate-100">
            {calendarCells.map((cell, idx) => {
              const hasEvents = cell.date && eventsByDate[cell.date] && eventsByDate[cell.date].length > 0;
              const hasNotes = cell.date && notesByDate[cell.date] && notesByDate[cell.date].length > 0;
              const hasEventsOrNotes = hasEvents || hasNotes;
              const isSelected = cell.date === selectedDate;
              const isTodayCell = isToday(cell);
              const noteDots = cell.date ? getCellDots(cell.date) : [];

              return (
                <button
                  key={idx}
                  onClick={() => cell.isCurrentMonth && handleDateClick(cell)}
                  disabled={!cell.isCurrentMonth}
                  className={`relative p-2 flex flex-col justify-between text-left items-stretch min-h-[56px] md:min-h-[80px] transition-all border-b border-slate-100 ${
                    !cell.isCurrentMonth
                      ? 'bg-transparent cursor-default select-none pointer-events-none'
                      : isSelected
                        ? 'bg-slate-50 hover:bg-slate-50 cursor-pointer ring-1 ring-blue-100/70'
                        : hasEventsOrNotes
                          ? 'bg-pink-100 hover:bg-pink-200 cursor-pointer border-pink-300'
                          : isTodayCell
                            ? 'bg-blue-50/50 hover:bg-blue-100/50 cursor-pointer font-bold'
                            : 'bg-white hover:bg-slate-50/60 cursor-pointer'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={`text-xs md:text-sm font-mono leading-none ${
                      !cell.isCurrentMonth
                        ? 'text-slate-300'
                        : isTodayCell
                          ? 'text-blue-600 font-bold'
                          : 'text-slate-600'
                    }`}>
                      {cell.day}
                    </span>

                    {/* Note category dots */}
                    {noteDots.length > 0 && (
                      <div className="flex gap-1 shrink-0 pt-0.5">
                        {noteDots.map((cat, i) => (
                          <div key={i} className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${CATEGORY_CONFIG[cat]?.dot || 'bg-zinc-500'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  {hasEvents && cell.isCurrentMonth && (
                    <div className="mt-1 space-y-0.5 w-full">
                      {eventsByDate[cell.date].slice(0, 1).map((ev, i) => (
                        <div key={i} className="text-[8px] md:text-[9px] font-semibold text-blue-600 bg-blue-50 px-1 py-0.5 rounded truncate border border-blue-100/30 w-full">
                          {ev.name}
                        </div>
                      ))}
                      {eventsByDate[cell.date].length > 1 && (
                        <div className="text-[8px] md:text-[9px] text-slate-400 px-1 leading-none font-medium mt-0.5">+{eventsByDate[cell.date].length - 1} event{eventsByDate[cell.date].length - 1 > 1 ? 's' : ''}</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="p-6 rounded-2xl glass-panel border border-zinc-800 flex flex-col gap-4">
          {selectedDate ? (
            <>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-zinc-900/60 rounded-xl border border-zinc-800">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/20'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Icon size={12} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">

                {/* --- EVENTS TAB --- */}
                {activeTab === 'events' && (
                  <>
                    {selectedEvents.length > 0 ? (
                      <div className="space-y-4">
                        {selectedEvents.map(ev => (
                          <div key={ev._id} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                            <h4 className="font-bold text-white">{ev.name}</h4>
                            {ev.description && <p className="text-xs text-zinc-400">{ev.description}</p>}
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
                  </>
                )}

                {/* --- NOTES TAB --- */}
                {activeTab === 'notes' && (
                  <div className="space-y-3">
                    {/* Existing notes list */}
                    {selectedDateNotes.length > 0 ? (
                      <div className="space-y-2">
                        {selectedDateNotes.map(note => {
                          const isOwner = note.authorId === currentUserId;
                          const catCfg = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.personal;
                          const isEditingThis = editingNote?.id === note._id;

                          return (
                            <div
                              key={note._id}
                              className={`p-3 rounded-xl border transition-all ${
                                note.isCompleted 
                                  ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                                  : 'bg-white border-slate-200/80 shadow-sm'
                              }`}
                            >
                              {isEditingThis ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editingNote.content}
                                    onChange={e => setEditingNote({ ...editingNote, content: e.target.value })}
                                    rows={2}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-[#0A1E3D] focus:border-[#0A1E3D] transition-all"
                                  />
                                  <div className="flex gap-1 flex-wrap">
                                    {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => (
                                      <button
                                        key={cat}
                                        onClick={() => setEditingNote({ ...editingNote, category: cat })}
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                                          editingNote.category === cat ? cfg.color : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                      >
                                        {cfg.label}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="flex gap-1.5">
                                    <button 
                                      onClick={handleUpdateNote} 
                                      disabled={noteLoading} 
                                      className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                      Save
                                    </button>
                                    <button 
                                      onClick={() => setEditingNote(null)} 
                                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* Author info */}
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-slate-500 font-medium">{note.authorName}</span>
                                      {note.authorRole === 'super_admin' && (
                                        <span className="text-[9px] bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-1.5 py-0.5 rounded-full font-bold">Admin</span>
                                      )}
                                    </div>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${catCfg.color}`}>
                                      {catCfg.label}
                                    </span>
                                  </div>

                                  {/* Note content */}
                                  <div className="flex items-start gap-2">
                                    <button
                                      onClick={() => isOwner && handleToggleComplete(note)}
                                      disabled={!isOwner}
                                      className={`mt-0.5 flex-shrink-0 transition-colors ${isOwner ? 'cursor-pointer' : 'cursor-default'}`}
                                    >
                                      {note.isCompleted
                                        ? <CheckCircle2 size={14} className="text-emerald-500" />
                                        : <Circle size={14} className="text-slate-300 hover:text-[#0A1E3D]" />
                                      }
                                    </button>
                                    <p className={`text-xs flex-1 leading-relaxed ${note.isCompleted ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-medium'}`}>
                                      {note.content}
                                    </p>
                                    {isOwner && (
                                      <div className="flex gap-1 flex-shrink-0">
                                        <button
                                          onClick={() => setEditingNote({ id: note._id, content: note.content, category: note.category })}
                                          className="p-1 rounded text-slate-400 hover:text-[#0A1E3D] hover:bg-slate-50 transition-colors"
                                        >
                                          <Pencil size={11} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteNote(note._id)}
                                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-500 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl mb-3">
                        <StickyNote size={20} className="mx-auto mb-2 text-slate-400" />
                        <p className="text-xs font-medium text-slate-500">No notes for this date.</p>
                      </div>
                    )}

                    {/* Add note form */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Add Note</p>
                      <textarea
                        value={noteContent}
                        onChange={e => setNoteContent(e.target.value)}
                        placeholder="Write a note for this day..."
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-[#0A1E3D] focus:border-[#0A1E3D] transition-all"
                      />
                      {/* Category selector */}
                      <div className="flex gap-1 flex-wrap">
                        {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => (
                          <button
                            key={cat}
                            onClick={() => setNoteCategory(cat)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                              noteCategory === cat ? cfg.color : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleAddNote}
                        disabled={noteLoading || !noteContent.trim()}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Plus size={12} />
                        Add Note
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[320px] text-center p-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                <CalendarIcon size={20} strokeWidth={1.75} />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No Events Selected</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                Select a date on the calendar to view scheduled events and shared team notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
