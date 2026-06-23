import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import User from '@/models/User';
import Event from '@/models/Event';
import { getSessionUser } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params; // event id
    const { searchParams } = new URL(req.url);
    const exportExcel = searchParams.get('export') === 'true';

    // Fetch registrations for this event
    const registrations = await Registration.find({ eventId: id }).sort({ createdAt: -1 }).lean();

    // Enrich with user profiles
    const enrichedData = [];
    for (const reg of registrations) {
      const user = await User.findOne({ userId: reg.userId }).select('name allianzaId phone rank leftBV rightBV');
      enrichedData.push({
        _id: reg._id.toString(),
        userId: reg.userId,
        allianzaId: user ? user.allianzaId : '',
        name: user ? user.name : 'Unknown',
        phone: user ? user.phone : reg.contactNumber,
        contactNumber: reg.contactNumber,
        mainLeader: reg.mainLeader,
        rank: user ? user.rank : 'Associate',
        leftBV: user ? user.leftBV : 0,
        rightBV: user ? user.rightBV : 0,
        paymentReceipt: reg.paymentReceipt,
        paidTo: reg.paidTo,
        status: reg.status,
        registrationDate: reg.registrationDate
      });
    }

    if (exportExcel) {
      const event = await Event.findById(id).select('name');
      const eventName = event ? event.name : 'Event';

      // Format for Excel columns
      const excelRows = enrichedData.map(item => ({
        'Member Name': item.name,
        'User ID': item.userId,
        'Allianza ID': item.allianzaId,
        'Phone Number': item.phone,
        'Leader': item.mainLeader,
        'Left BV': item.leftBV,
        'Right BV': item.rightBV,
        'Rank': item.rank,
        'Paid To': item.paidTo,
        'Status': item.status,
        'Registration Date': new Date(item.registrationDate).toLocaleDateString()
      }));

      // Generate Excel buffer
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelRows);

      // Set column widths
      const wscols = [
        { wch: 20 }, // Member Name
        { wch: 12 }, // User ID
        { wch: 12 }, // Allianza ID
        { wch: 15 }, // Phone Number
        { wch: 20 }, // Leader
        { wch: 10 }, // Left BV
        { wch: 10 }, // Right BV
        { wch: 12 }, // Rank
        { wch: 15 }, // Paid To
        { wch: 12 }, // Status
        { wch: 18 }  // Registration Date
      ];
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, 'Participants');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Clean filename
      const safeEventName = eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      return new Response(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="participants_${safeEventName}.xlsx"`
        }
      });
    }

    return NextResponse.json({ success: true, data: enrichedData });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params; // event id
    const body = await req.json();
    const { registrationId, status } = body;

    if (!registrationId || !status) {
      return NextResponse.json({ error: 'Registration ID and status are required' }, { status: 400 });
    }

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const registration = await Registration.findOne({ _id: registrationId, eventId: id });
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found for this event' }, { status: 404 });
    }

    registration.status = status;
    await registration.save();

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error('Error updating registration status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
