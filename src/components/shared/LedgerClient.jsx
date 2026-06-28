'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Plus, ArrowUpRight, ArrowDownRight, 
  Calendar, DollarSign, Download, Edit, Trash2, Trash
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import AddLedgerModal from '@/components/modals/AddLedgerModal';
import AddLedgerEntryModal from '@/components/modals/AddLedgerEntryModal';

export default function LedgerClient() {
  const [ledgers, setLedgers] = useState([]);
  const [activeLedgerId, setActiveLedgerId] = useState('');
  const [entries, setEntries] = useState([]);
  
  // Modals state
  const [isAddLedgerOpen, setIsAddLedgerOpen] = useState(false);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Filters state
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Status / Loading
  const [loadingLedgers, setLoadingLedgers] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);

  useEffect(() => {
    fetchLedgers();
  }, []);

  useEffect(() => {
    if (activeLedgerId) {
      fetchEntries(activeLedgerId);
    } else {
      setEntries([]);
    }
  }, [activeLedgerId]);

  const fetchLedgers = async () => {
    setLoadingLedgers(true);
    try {
      const res = await fetch('/api/ledgers');
      if (res.ok) {
        const json = await res.json();
        setLedgers(json.data);
        if (json.data.length > 0) {
          // Keep active ledger if it exists, otherwise pick first
          const exists = json.data.some(l => l._id === activeLedgerId);
          if (!exists) {
            setActiveLedgerId(json.data[0]._id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching ledgers:', err);
    } finally {
      setLoadingLedgers(false);
    }
  };

  const fetchEntries = async (ledgerId) => {
    setLoadingEntries(true);
    try {
      const res = await fetch(`/api/ledgers/${ledgerId}/entries`);
      if (res.ok) {
        const json = await res.json();
        setEntries(json.data);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleDeleteLedger = async () => {
    if (!activeLedgerId) return;
    const ledger = ledgers.find(l => l._id === activeLedgerId);
    if (!ledger) return;

    if (!confirm(`Are you sure you want to delete the ledger "${ledger.name}"? All transaction entries inside this ledger will be permanently deleted.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/ledgers/${activeLedgerId}`, { method: 'DELETE' });
      if (res.ok) {
        const remaining = ledgers.filter(l => l._id !== activeLedgerId);
        setLedgers(remaining);
        if (remaining.length > 0) {
          setActiveLedgerId(remaining[0]._id);
        } else {
          setActiveLedgerId('');
          // Refresh to let GET auto-create a default ledger
          fetchLedgers();
        }
      }
    } catch (err) {
      console.error('Error deleting ledger:', err);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!activeLedgerId || !entryId) return;
    if (!confirm('Are you sure you want to delete this cash entry?')) return;

    try {
      const res = await fetch(`/api/ledgers/${activeLedgerId}/entries/${entryId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setEntries(entries.filter(e => e._id !== entryId));
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  // Chronologically compute running balances for ALL entries first, to keep math accurate
  const chronologicalEntries = useMemo(() => {
    let runningBalance = 0;
    return entries.map(entry => {
      if (entry.type === 'income') {
        runningBalance += entry.amount;
      } else {
        runningBalance -= entry.amount;
      }
      return { ...entry, runningBalance };
    });
  }, [entries]);

  // Filtered list for UI display
  const filteredEntries = useMemo(() => {
    return chronologicalEntries.filter(entry => {
      // 1. Filter by Type
      if (filterType !== 'all' && entry.type !== filterType) return false;
      
      // 2. Filter by Date range
      const entryTime = new Date(entry.date).getTime();
      if (startDate) {
        const startTime = new Date(startDate + 'T00:00:00').getTime();
        if (entryTime < startTime) return false;
      }
      if (endDate) {
        const endTime = new Date(endDate + 'T23:59:59').getTime();
        if (entryTime > endTime) return false;
      }
      
      return true;
    }).reverse(); // Display latest first in list
  }, [chronologicalEntries, filterType, startDate, endDate]);

  // Calculated totals of the active filtered entries list
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    entries.forEach(e => {
      if (e.type === 'income') income += e.amount;
      else expense += e.amount;
    });
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [entries]);

  const activeLedger = ledgers.find(l => l._id === activeLedgerId);

  const handleExportCSV = () => {
    if (!activeLedger || filteredEntries.length === 0) return;
    
    const headers = ['Date', 'Description', 'Type', 'Amount (INR)', 'Running Balance (INR)'];
    const rows = filteredEntries.map(e => [
      new Date(e.date).toLocaleDateString('en-IN'),
      e.description,
      e.type.toUpperCase(),
      e.amount,
      e.runningBalance
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeLedger.name.replace(/\s+/g, '_')}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personal Ledger"
        subtitle="Manage cash journals, track income vs expenses, and export transaction records."
      />

      {/* Ledger Selector and Main Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <BookOpen size={16} className="text-slate-400 shrink-0" />
          <select
            value={activeLedgerId}
            onChange={(e) => setActiveLedgerId(e.target.value)}
            disabled={loadingLedgers || ledgers.length === 0}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 w-full sm:w-48 cursor-pointer font-semibold"
          >
            {loadingLedgers ? (
              <option>Loading ledgers...</option>
            ) : ledgers.length === 0 ? (
              <option>No Ledgers Available</option>
            ) : (
              ledgers.map(l => (
                <option key={l._id} value={l._id}>{l.name}</option>
              ))
            )}
          </select>

          <button
            onClick={() => setIsAddLedgerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-slate-600 shrink-0"
            title="Create New Ledger"
          >
            <Plus size={14} />
            <span>New</span>
          </button>

          {ledgers.length > 1 && (
            <button
              onClick={handleDeleteLedger}
              className="flex items-center justify-center p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-slate-100 transition-colors cursor-pointer shrink-0"
              title="Delete Active Ledger"
            >
              <Trash size={14} />
            </button>
          )}
        </div>

        {activeLedgerId && (
          <button
            onClick={() => {
              setEditingEntry(null);
              setIsAddEntryOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10 w-full sm:w-auto cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add Entry</span>
          </button>
        )}
      </div>

      {activeLedgerId && (
        <>
          {/* KPI Balance Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Net Cash Balance */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Net Cash Balance</p>
                <p className={`text-2xl font-extrabold font-mono mt-1 ${totals.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                  ₹{totals.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`p-3 rounded-2xl ${totals.balance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                <DollarSign size={20} />
              </div>
            </div>

            {/* Total Income */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Cash In</p>
                <p className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
                  ₹{totals.income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <ArrowUpRight size={20} />
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Cash Out</p>
                <p className="text-2xl font-extrabold text-red-500 font-mono mt-1">
                  ₹{totals.expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-red-50 text-red-500">
                <ArrowDownRight size={20} />
              </div>
            </div>
          </div>

          {/* Transactions Log Section */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            
            {/* Filters Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 w-full sm:w-36 font-semibold"
                >
                  <option value="all">All Entries</option>
                  <option value="income">Income (+)</option>
                  <option value="expense">Expenses (-)</option>
                </select>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-36">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-semibold"
                      placeholder="Start Date"
                    />
                  </div>
                  <span className="text-slate-300 text-xs">to</span>
                  <div className="relative w-full sm:w-36">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-semibold"
                      placeholder="End Date"
                    />
                  </div>
                </div>

                {(filterType !== 'all' || startDate || endDate) && (
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="text-xs text-blue-600 hover:underline font-bold text-center sm:text-left cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {filteredEntries.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-slate-600 w-full lg:w-auto shadow-sm"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
              )}
            </div>

            {/* Table wrapper for horizontal scroll protection */}
            <div className="overflow-x-auto pb-2 custom-scrollbar">
              <div className="min-w-[650px] pr-2">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Transaction Type</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Running Balance</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loadingEntries ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Fetching transactions...
                        </td>
                      </tr>
                    ) : filteredEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                          No transactions found matching the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredEntries.map((e) => (
                        <tr key={e._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-500">
                            {new Date(e.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {e.description}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide border ${
                              e.type === 'income'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                                : 'bg-red-50 text-red-600 border-red-100/50'
                            }`}>
                              {e.type === 'income' ? 'Income' : 'Expense'}
                            </span>
                          </td>
                          <td className={`py-3.5 px-4 text-right font-extrabold font-mono text-sm ${
                            e.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {e.type === 'income' ? '+' : '-'}₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-600">
                            ₹{e.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-center space-x-1.5">
                            <button
                              onClick={() => {
                                setEditingEntry(e);
                                setIsAddEntryOpen(true);
                              }}
                              className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Edit Entry"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(e._id)}
                              className="p-1 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete Entry"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Add / Edit Ledger Modals */}
      <AddLedgerModal
        isOpen={isAddLedgerOpen}
        onClose={() => setIsAddLedgerOpen(false)}
        onSuccess={(newLedger) => {
          setLedgers([...ledgers, newLedger]);
          setActiveLedgerId(newLedger._id);
        }}
      />

      <AddLedgerEntryModal
        isOpen={isAddEntryOpen}
        onClose={() => {
          setIsAddEntryOpen(false);
          setEditingEntry(null);
        }}
        ledgerId={activeLedgerId}
        editEntry={editingEntry}
        onSuccess={() => {
          fetchEntries(activeLedgerId);
        }}
      />
    </div>
  );
}
