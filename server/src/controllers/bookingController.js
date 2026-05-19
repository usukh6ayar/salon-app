const { query } = require('../db');

async function createBooking(req, res) {
  try {
    const { salon_id, stylist_id, service_id, booking_date, booking_time } = req.body;

    if (!salon_id || !stylist_id || !service_id || !booking_date || !booking_time) {
      return res.status(400).json({
        error: 'salon_id, stylist_id, service_id, booking_date, and booking_time are required',
      });
    }

    const conflict = await query(
      `SELECT id FROM bookings
       WHERE stylist_id = $1 AND booking_date = $2 AND booking_time = $3
       AND status != 'cancelled'`,
      [stylist_id, booking_date, booking_time]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({ error: 'Stylist is already booked at this date and time' });
    }

    const serviceResult = await query('SELECT price FROM services WHERE id = $1', [service_id]);
    if (serviceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Service not found' });
    }

    const totalPrice = serviceResult.rows[0].price;

    const result = await query(
      `INSERT INTO bookings (
        user_id, salon_id, stylist_id, service_id,
        booking_date, booking_time, status, total_price
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
      RETURNING *`,
      [
        req.user.id,
        salon_id,
        stylist_id,
        service_id,
        booking_date,
        booking_time,
        totalPrice,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createBooking error:', err.message);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
}

async function getMyBookings(req, res) {
  try {
    const result = await query(
      `SELECT
        b.*,
        s.name AS salon_name,
        st.name AS stylist_name,
        sv.name AS service_name
       FROM bookings b
       JOIN salons s ON s.id = b.salon_id
       JOIN stylists st ON st.id = b.stylist_id
       JOIN services sv ON sv.id = b.service_id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [req.user.id]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('getMyBookings error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

async function cancelBooking(req, res) {
  try {
    const { id } = req.params;

    const existing = await query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = existing.rows[0];

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bookings can be cancelled' });
    }

    const result = await query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [id]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('cancelBooking error:', err.message);
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
}

module.exports = { createBooking, getMyBookings, cancelBooking };
