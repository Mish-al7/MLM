'use client';

import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar } from 'lucide-react';

export default function AddLedgerEntryModal({ isOpen, onClose, onSuccess, ledgerId, editEntry = null }) {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editEntry) {
      setDate(editEntry.date ? new Date(editEntry.date).toISOString().split('T')[0] : '');
      setDescription(editEntry.description || '');
      setType(editEntry.type || 'income');
      setAmount(editEntry.amount || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setType('income');
      setAmount('');
    }
    setError('');
  }, [editEntry, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return setError('Description is required.');
    if (!amount || Number(amount) <= 0) return setError('Please enter a valid positive amount.');
    setLoading(true);
    setError('');

    try {
      const url = editEntry 
        ? `/api/ledgers/${ledgerId}/entries/${editEntry._id}`
        : `/api/ledgers/${ledgerId}/entries`;
      const method = editEntry ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          description: description.trim(),
          type,
          amount: Number(amount)
        })
      });
      const json = await res.json();
      if (res.ok) {
        onSuccess(json.data);
        onClose();
      } else {
        setError(json.error || 'Failed to record transaction');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] relative p-6 space-y-4 animate-in fade-in zoom-in duration-200 text-slate-800">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <DollarSign size={16} className="text-blue-500" />
            <span>{editEntry ? 'Edit Entry Details' : 'Add Cash Transaction'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Radio Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-bold rounded-lg transition-all text-center ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Income (+)
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-bold rounded-lg transition-all text-center ${
                type === 'expense'
                  ? 'bg-white text-red-600 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Expense (-)
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Transaction Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Description *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Received joining fees, Office refreshments"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Amount (₹) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors font-mono placeholder-slate-400"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-150">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : editEntry ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
