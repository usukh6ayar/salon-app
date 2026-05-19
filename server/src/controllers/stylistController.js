const { query } = require('../db');

function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour <= 18; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 18 && minute === 30) break;
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
}

function formatTime(value) {
  if (!value) return null;
  return String(value).slice(0, 5);
}

function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));
}

async function getStylistsBySalon(req, res) {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM stylists WHERE salon_id = $1 ORDER BY name',
      [id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('getStylistsBySalon error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch stylists' });
  }
}

async function getServicesBySalon(req, res) {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM services WHERE salon_id = $1 ORDER BY price',
      [id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('getServicesBySalon error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
}

async function getStylistAvailability(req, res) {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'date must be a valid YYYY-MM-DD value' });
    }

    const stylistResult = await query('SELECT id FROM stylists WHERE id = $1', [id]);
    if (stylistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Stylist not found' });
    }

    const bookingsResult = await query(
      `SELECT booking_time FROM bookings
       WHERE stylist_id = $1 AND booking_date = $2`,
      [id, date]
    );

    const bookedTimes = new Set(
      bookingsResult.rows.map((row) => formatTime(row.booking_time))
    );

    const slots = generateTimeSlots().map((time) => ({
      time,
      available: !bookedTimes.has(time),
    }));

    return res.json(slots);
  } catch (err) {
    console.error('getStylistAvailability error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch availability' });
  }
}

module.exports = {
  getStylistsBySalon,
  getServicesBySalon,
  getStylistAvailability,
};
