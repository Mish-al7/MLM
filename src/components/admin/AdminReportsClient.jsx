'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileText, FileDown, Layers, Users, Search, 
  Download, Calendar as CalendarIcon, Cake, Check, AlertCircle 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to construct a flat list representing the parent-child hierarchy recursively with depth
function processHierarchy(users) {
  const userMap = new Map(users.map(u => [u.userId, { ...u, children: [] }]));
  const roots = [];

  userMap.forEach(user => {
    if (user.managerId && userMap.has(user.managerId)) {
      userMap.get(user.managerId).children.push(user);
    } else {
      roots.push(user);
    }
  });

  const flatList = [];
  function traverse(node, depth = 0) {
    // Determine Uplink Manager Name
    let uplineName = 'None';
    if (node.managerId) {
      const managerNode = userMap.get(node.managerId);
      uplineName = managerNode ? managerNode.name : node.managerId;
    }

    flatList.push({
      ...node,
      depth,
      managerName: uplineName
    });

    node.children.sort((a, b) => a.name.localeCompare(b.name));
    node.children.forEach(child => {
      traverse(child, depth + 1);
    });
  }

  roots.sort((a, b) => a.name.localeCompare(b.name));
  roots.forEach(root => traverse(root, 0));

  return flatList;
}

// Helper to get upcoming birthday details and sort key
function getBirthdayDetails(dobStr) {
  if (!dobStr) return { dateStr: 'N/A', monthDay: 'N/A', daysRemaining: Infinity, formattedDob: 'N/A' };
  const dob = new Date(dobStr);
  const today = new Date();
  
  // Construct birthday date for the current year
  let bdayThisYear = new Date(today.getFullYear(), dob.getUTCMonth(), dob.getUTCDate());
  
  // If birthday has passed this year, set to next year
  if (bdayThisYear < today) {
    bdayThisYear.setFullYear(today.getFullYear() + 1);
  }
  
  const diffTime = bdayThisYear - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthDay = `${monthNames[dob.getUTCMonth()]} ${dob.getUTCDate()}`;
  
  return {
    dateStr: `${dob.getUTCDate().toString().padStart(2, '0')}-${(dob.getUTCMonth() + 1).toString().padStart(2, '0')}-${dob.getUTCFullYear()}`,
    monthDay,
    daysRemaining: diffDays,
    bdayDate: bdayThisYear
  };
}

export default function AdminReportsClient({ users, currentUser }) {
  const [activeTab, setActiveTab] = useState('hierarchy'); // 'hierarchy' | 'birthday'
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1. Compute Hierarchy List
  const hierarchyList = useMemo(() => {
    return processHierarchy(users);
  }, [users]);

  // 2. Compute Birthday Chronology List
  const birthdayList = useMemo(() => {
    return users
      .map(u => ({
        ...u,
        bdayInfo: getBirthdayDetails(u.dob)
      }))
      .sort((a, b) => a.bdayInfo.daysRemaining - b.bdayInfo.daysRemaining);
  }, [users]);

  // 3. Filtered Lists
  const filteredHierarchy = useMemo(() => {
    return hierarchyList.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.managerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [hierarchyList, searchQuery]);

  const filteredBirthday = useMemo(() => {
    return birthdayList.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [birthdayList, searchQuery]);

  // CSV Export Logic
  const handleExportCSV = () => {
    let csvContent = "";
    let fileName = "";

    if (activeTab === 'hierarchy') {
      fileName = "hierarchy_business_value_report.csv";
      // Header
      csvContent += "Name,User ID,Upline Manager,Depth,Left BV,Right BV,Total BV\n";
      // Rows
      hierarchyList.forEach(u => {
        const indentIndicator = "  ".repeat(u.depth) + (u.depth > 0 ? "|- " : "");
        const cleanName = `"${indentIndicator}${u.name.replace(/"/g, '""')}"`;
        const totalBv = (u.leftBV || 0) + (u.rightBV || 0);
        csvContent += `${cleanName},${u.userId},"${u.managerName.replace(/"/g, '""')}",${u.depth},${u.leftBV || 0},${u.rightBV || 0},${totalBv}\n`;
      });
    } else {
      fileName = "birthday_calendar_report.csv";
      // Header
      csvContent += "Name,User ID,Date of Birth,Month & Day,Next Birthday,Status\n";
      // Rows
      birthdayList.forEach(u => {
        const cleanName = `"${u.name.replace(/"/g, '""')}"`;
        const bdayStatusStr = u.bdayInfo.daysRemaining === 0 ? "Today!" : `${u.bdayInfo.daysRemaining} days remaining`;
        csvContent += `${cleanName},${u.userId},${u.bdayInfo.dateStr},"${u.bdayInfo.monthDay}","${bdayStatusStr}",${u.status}\n`;
      });
    }

    // Trigger File Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export Logic using jsPDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    // Set Premium Custom Font Styles
    doc.setFont("helvetica");

    if (activeTab === 'hierarchy') {
      // PDF Header Branding
      doc.setFontSize(18);
      doc.setTextColor(184, 134, 11); // Dark Gold primary
      doc.text("ALLIANZA LEADERSHIP PLATFORM", 14, 20);
      
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text("Organizational Hierarchy Business Value Report", 14, 28);
      doc.text(`Generated Date: ${currentDate}`, 14, 34);

      // Construct rows with custom indent spacing
      const tableRows = hierarchyList.map(u => [
        "   ".repeat(u.depth) + (u.depth > 0 ? "└─ " : "") + u.name,
        u.userId,
        u.managerName || 'None',
        (u.leftBV || 0).toLocaleString(),
        (u.rightBV || 0).toLocaleString(),
        ((u.leftBV || 0) + (u.rightBV || 0)).toLocaleString()
      ]);

      // jsPDF autoTable formatting
      autoTable(doc, {
        startY: 40,
        head: [['Member Name', 'User ID', 'Manager (Upline)', 'Left BV', 'Right BV', 'Combined BV']],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 30, 30], // Dark charcoal header background
          textColor: [245, 158, 11], // Gold-amber text
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8.5,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 'auto' }
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252]
        }
      });

      doc.save("hierarchy_business_value_report.pdf");
    } else {
      // PDF Header Branding
      doc.setFontSize(18);
      doc.setTextColor(184, 134, 11);
      doc.text("ALLIANZA LEADERSHIP PLATFORM", 14, 20);

      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text("Chronological Birthday Calendar Report", 14, 28);
      doc.text(`Generated Date: ${currentDate}`, 14, 34);

      // Construct rows
      const tableRows = birthdayList.map(u => [
        u.name,
        u.userId,
        u.bdayInfo.dateStr,
        u.bdayInfo.monthDay,
        u.bdayInfo.daysRemaining === 0 ? 'Today! 🎉' : `${u.bdayInfo.daysRemaining} days`,
        u.status.toUpperCase()
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['Member Name', 'User ID', 'Date of Birth', 'Month & Day', 'Days to Birthday', 'Status']],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 30, 30],
          textColor: [245, 158, 11],
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8.5,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252]
        }
      });

      doc.save("birthday_calendar_report.pdf");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            <span>Reports & Exports Portal</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-0.5">
            Generate, analyze, and export hierarchy organizational values or birthday calendar tables in PDF/CSV format.
          </p>
        </div>

        {/* Export Buttons Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-sm shadow-blue-500/10 cursor-pointer"
          >
            <FileDown size={14} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher and Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950/20">
        <div className="flex border-b border-zinc-800 md:border-b-0 space-x-4">
          <button
            onClick={() => { setActiveTab('hierarchy'); setSearchQuery(''); }}
            className={`pb-2 md:pb-0 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'hierarchy' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Hierarchy Business Value
          </button>
          <button
            onClick={() => { setActiveTab('birthday'); setSearchQuery(''); }}
            className={`pb-2 md:pb-0 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'birthday' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Birthday Calendar
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
          <input
            type="text"
            placeholder={activeTab === 'hierarchy' ? "Search name, ID or upline..." : "Search name or ID..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors w-64"
          />
        </div>
      </div>

      {/* Reports Tables Grid */}
      <div className="p-6 rounded-2xl bg-zinc-950/20 border border-zinc-800 min-h-[400px]">
        {activeTab === 'hierarchy' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Hierarchy tree structures flat representation
              </h3>
              <span className="text-[10px] text-zinc-500">
                Indentation level displays depth under top manager upline
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/30 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Upline Manager</th>
                    <th className="py-3 px-4 text-right">Left BV</th>
                    <th className="py-3 px-4 text-right">Right BV</th>
                    <th className="py-3 px-4 text-right">Combined BV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300">
                  {filteredHierarchy.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500">
                        No hierarchy members found matching the search.
                      </td>
                    </tr>
                  ) : (
                    filteredHierarchy.map((user) => {
                      const totalBv = (user.leftBV || 0) + (user.rightBV || 0);
                      return (
                        <tr key={user.userId} className="hover:bg-zinc-900/10">
                          <td className="py-3 px-4 font-medium flex items-center">
                            {/* Visual Hierarchy Depth Spacing */}
                            <div className="flex items-center" style={{ marginLeft: `${user.depth * 24}px` }}>
                              {user.depth > 0 && (
                                <span className="text-zinc-600 font-mono mr-1.5 select-none">└─</span>
                              )}
                              <img 
                                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} 
                                alt={user.name} 
                                className="w-6 h-6 rounded-full border border-zinc-800 object-cover mr-2 shrink-0"
                              />
                              <span className="text-zinc-200">{user.name}</span>
                              {user.role === 'super_admin' && (
                                <span className="ml-1.5 text-[8px] bg-red-500/10 text-red-400 px-1 py-0.2 rounded border border-red-500/20">Admin</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-zinc-400 font-mono">{user.userId}</td>
                          <td className="py-3 px-4 text-zinc-400">{user.managerName}</td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-300">{(user.leftBV || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-300">{(user.rightBV || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">{(totalBv).toLocaleString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Chronological upcoming birth dates list
              </h3>
              <span className="text-[10px] text-zinc-500">
                Sorted by closest next birthday calendar date
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/30 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Date of Birth</th>
                    <th className="py-3 px-4">Birthday Month/Day</th>
                    <th className="py-3 px-4">Next Birthday</th>
                    <th className="py-3 px-4">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300">
                  {filteredBirthday.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500">
                        No members found matching the search.
                      </td>
                    </tr>
                  ) : (
                    filteredBirthday.map((user) => {
                      const isToday = user.bdayInfo.daysRemaining === 0 || user.bdayInfo.daysRemaining === 365;
                      return (
                        <tr key={user.userId} className="hover:bg-zinc-900/10">
                          <td className="py-3 px-4 flex items-center gap-2 font-medium">
                            <img 
                              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} 
                              alt={user.name} 
                              className="w-7 h-7 rounded-full border border-zinc-800 object-cover shrink-0"
                            />
                            <span className="text-zinc-200">{user.name}</span>
                          </td>
                          <td className="py-3 px-4 text-zinc-400 font-mono">{user.userId}</td>
                          <td className="py-3 px-4 text-zinc-400">{user.bdayInfo.dateStr}</td>
                          <td className="py-3 px-4 text-zinc-300 font-medium">{user.bdayInfo.monthDay}</td>
                          <td className="py-3 px-4">
                            {isToday ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse border border-amber-500/20">
                                <Cake size={10} />
                                <span>Today! 🎉</span>
                              </span>
                            ) : (
                              <span className="text-zinc-400 font-semibold">{user.bdayInfo.daysRemaining} days remaining</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                              user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
