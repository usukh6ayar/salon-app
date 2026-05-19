const { query } = require('../db');

const PAYMENT_METHODS = ['card', 'qpay', 'socialpay'];

async function getUserBooking(bookingId, userId) {
  const result = await query(
    'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
    [bookingId, userId]
  );
  return result.rows[0] || null;
}

async function createPayment(req, res) {
  try {
    const { booking_id, amount, method } = req.body;

    if (!booking_id || amount === undefined || !method) {
      return res.status(400).json({ error: 'booking_id, amount, and method are required' });
    }

    if (!PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({ error: "method must be 'card', 'qpay', or 'socialpay'" });
    }

    const booking = await getUserBooking(booking_id, req.user.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bookings can be paid' });
    }

    const success = Math.random() < 0.9;
    const paymentStatus = success ? 'completed' : 'failed';

    const paymentResult = await query(
      `INSERT INTO payments (booking_id, user_id, amount, method, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [booking_id, req.user.id, amount, method, paymentStatus]
    );

    const payment = paymentResult.rows[0];
    let updatedBooking = booking;

    if (success) {
      const bookingResult = await query(
        `UPDATE bookings SET status = 'confirmed' WHERE id = $1 RETURNING *`,
        [booking_id]
      );
      updatedBooking = bookingResult.rows[0];
    }

    return res.status(201).json({
      success,
      payment,
      booking: updatedBooking,
    });
  } catch (err) {
    console.error('createPayment error:', err.message);
    return res.status(500).json({ error: 'Failed to process payment' });
  }
}

async function getPaymentByBooking(req, res) {
  try {
    const { bookingId } = req.params;

    const booking = await getUserBooking(bookingId, req.user.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const result = await query(
      `SELECT * FROM payments
       WHERE booking_id = $1 AND user_id = $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [bookingId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('getPaymentByBooking error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch payment' });
  }
}

async function getSavedCards(req, res) {
  try {
    const result = await query(
      'SELECT * FROM saved_cards WHERE user_id = $1 ORDER BY id',
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('getSavedCards error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch saved cards' });
  }
}

async function saveCard(req, res) {
  try {
    const { last4, brand, exp_month, exp_year } = req.body;

    if (!last4 || !brand || exp_month === undefined || exp_year === undefined) {
      return res.status(400).json({ error: 'last4, brand, exp_month, and exp_year are required' });
    }

    const result = await query(
      `INSERT INTO saved_cards (user_id, last4, brand, exp_month, exp_year)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, last4, brand, exp_month, exp_year]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('saveCard error:', err.message);
    return res.status(500).json({ error: 'Failed to save card' });
  }
}

module.exports = {
  createPayment,
  getPaymentByBooking,
  getSavedCards,
  saveCard,
};
