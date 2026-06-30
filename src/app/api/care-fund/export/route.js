import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CareFundEntry from '@/models/CareFundEntry';
import CareFundCause from '@/models/CareFundCause';
import { getSessionUser } from '@/lib/auth';
import * as XLSX from 'xlsx';

// GET — admin only; returns Excel file of all contributions
export async function GET(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const causeId = searchParams.get('causeId');

    const filter = causeId ? { causeId } : {};
    const entries = await CareFundEntry.find(filter)
      .populate('causeId', 'title')
      .sort({ createdAt: -1 });

    // Build rows
    const rows = entries.map((e, i) => ({
      'No.': i + 1,
      'Member Name': e.userName || '',
      'Member ID': e.userId || '',
      'Cause': e.causeId?.title || '',
      'Amount (₹)': e.amount,
      'Month': e.month || '',
      'Note': e.note || '',
      'Screenshot URL': e.screenshotUrl || '',
      'Submitted On': new Date(e.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Care Fund Contributions');

    // Auto column widths
    const colWidths = [
      { wch: 5 }, { wch: 22 }, { wch: 12 }, { wch: 35 },
      { wch: 14 }, { wch: 10 }, { wch: 30 }, { wch: 50 }, { wch: 16 },
    ];
    worksheet['!cols'] = colWidths;

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="care-fund-contributions-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Care Fund export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
