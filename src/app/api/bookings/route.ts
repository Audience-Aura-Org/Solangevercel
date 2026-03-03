import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Public route — no admin auth needed. Used by the booking page.
export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        // Build the booking document, defaulting optional fields
        const Booking = (await import('@/models/Booking')).default;
        // Normalize addons: allow array of strings or objects
        let addons = [];
        if (Array.isArray(body.addons)) {
            addons = body.addons.map((a: any) => {
                if (!a) return null;
                if (typeof a === 'string') return { id: '', name: a, price: 0 };
                return { id: a.id || a._id || '', name: a.name || a.title || '', price: Number(a.price || 0) };
            }).filter(Boolean);
        } else if (typeof body.addons === 'string' && body.addons.trim()) {
            addons = body.addons.split(',').map((s: string) => ({ id: '', name: s.trim(), price: 0 }));
        }

        const hairColor = typeof body.hairColor === 'string' && body.hairColor.trim() ? body.hairColor.trim() : '';

        const booking = await Booking.create({
            clientName: body.clientName,
            clientEmail: body.clientEmail,
            clientPhone: body.clientPhone,
            service: body.service,
            serviceId: body.serviceId || body.service,
            date: new Date(body.date),
            time: body.time,
            stylist: body.stylist || 'Assigned at salon',
            duration: body.duration || 0,
            price: body.price || 0,
            addons,
            notes: body.notes || '',
            hairColor,
            status: 'confirmed',
            paymentStatus: 'pending',
            paymentMethod: 'pending',
        });

        // Send confirmation email (await so we can record notification status)
        const { sendEmail, getBookingConfirmationHtml, getBookingConfirmationText } = await import('@/lib/email');
        const Notification = (await import('@/models/Notification')).default;

        // calculate envelope from address for debug
        const envelopeFrom = process.env.FROM_EMAIL || process.env.SMTP_USER || 'info@solangesignaturehair.hair';

        // Email to Client (create notification record for delivery status)
        try {
            await sendEmail({
                to: booking.clientEmail,
                subject: 'Reservation Secured — Solange',
                html: getBookingConfirmationHtml(booking),
                text: getBookingConfirmationText(booking),
            });

            await Notification.create({
                bookingId: booking._id,
                clientName: booking.clientName,
                type: 'booking_confirmation',
                status: 'sent',
                message: `Confirmation email sent to ${booking.clientEmail}`
            });
        } catch (err: any) {
            console.error('Failed to send confirmation email to client', err);
            await Notification.create({
                bookingId: booking._id,
                clientName: booking.clientName,
                type: 'booking_confirmation',
                status: 'failed',
                message: `Failed to send confirmation to ${booking.clientEmail}: ${err?.message || String(err)}`
            });
        }

        // Email to Admin (also record a notification entry)
        // prefer explicit ADMIN_FALLBACK_EMAIL so admin notifications are delivered even if SMTP_USER changes
        const adminEmail = process.env.ADMIN_FALLBACK_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || 'solangesignaturehair@gmail.com';
        try {
            await sendEmail({
                to: adminEmail,
                subject: `New Booking: ${booking.clientName} - ${booking.confirmationNumber}`,
                text: `New booking from ${booking.clientName} (${booking.clientEmail}) - ${booking.confirmationNumber}\nService: ${booking.service} - ${new Date(booking.date).toLocaleDateString()} ${booking.time}`,
                fromName: 'New Booking',
                fromAddress: envelopeFrom,
                html: `
                    <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: auto;">
                        <h1 style="color: #C5A059;">New Reservation</h1>
                        <p>A new booking has been secured through the Maison digital portal.</p>
                        <hr style="border: none; border-top: 1px solid #eee;" />
                        <p><strong>Client:</strong> ${booking.clientName}</p>
                        <p><strong>Email:</strong> ${booking.clientEmail}</p>
                        <p><strong>Phone:</strong> ${booking.clientPhone}</p>
                        <p><strong>Service:</strong> ${booking.service}</p>
                        <p><strong>Extras:</strong> ${booking.addons?.length > 0 ? booking.addons.map((a: any) => a.name).join(', ') : 'None'}</p>
                        <p><strong>Date/Time:</strong> ${new Date(booking.date).toLocaleDateString()} at ${booking.time}</p>
                        <p><strong>Hair Color Request:</strong> ${booking.hairColor || 'No specific color requested'}</p>
                        <p><strong>Total Price:</strong> $${booking.price}</p>
                        <p><strong>Reference:</strong> ${booking.confirmationNumber}</p>
                    </div>
                `,
            });

            await Notification.create({
                bookingId: booking._id,
                clientName: booking.clientName,
                type: 'booking_confirmation',
                status: 'sent',
                message: `Admin notified at ${adminEmail}`
            });
        } catch (err: any) {
            console.error('Failed to send notification email to admin', err);
            await Notification.create({
                bookingId: booking._id,
                clientName: booking.clientName,
                type: 'booking_confirmation',
                status: 'failed',
                message: `Failed to notify admin at ${adminEmail}: ${err?.message || String(err)}`
            });
        }


        return NextResponse.json(
            { booking, confirmationNumber: booking.confirmationNumber, debug: { envelopeFrom } },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
