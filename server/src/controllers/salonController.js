const { query } = require('../db');

async function getAllSalons(req, res) {
  try {
    const { city, minRating } = req.query;
    const conditions = [];
    const params = [];

    if (city) {
      params.push(city);
      conditions.push(`city = $${params.length}`);
    }

    if (minRating !== undefined && minRating !== '') {
      params.push(Number(minRating));
      conditions.push(`rating >= $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM salons ${whereClause} ORDER BY rating DESC`;

    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    console.error('getAllSalons error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch salons' });
  }
}

async function getSalonById(req, res) {
  try {
    const { id } = req.params;

    const salonResult = await query('SELECT * FROM salons WHERE id = $1', [id]);
    if (salonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Salon not found' });
    }

    const salon = salonResult.rows[0];

    const [stylistsResult, servicesResult] = await Promise.all([
      query('SELECT * FROM stylists WHERE salon_id = $1 ORDER BY name', [id]),
      query('SELECT * FROM services WHERE salon_id = $1 ORDER BY price', [id]),
    ]);

    return res.json({
      ...salon,
      stylists: stylistsResult.rows,
      services: servicesResult.rows,
    });
  } catch (err) {
    console.error('getSalonById error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch salon' });
  }
}

module.exports = { getAllSalons, getSalonById };
