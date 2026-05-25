const { query } = require('../db');

async function getFavorites(req, res) {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT s.* FROM salons s
       JOIN favorites f ON f.salon_id = s.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId],
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('getFavorites error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch favorites' });
  }
}

async function addFavorite(req, res) {
  try {
    const userId = req.user.id;
    const { salonId } = req.params;
    await query(
      `INSERT INTO favorites (user_id, salon_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, salonId],
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('addFavorite error:', err.message);
    return res.status(500).json({ error: 'Failed to add favorite' });
  }
}

async function removeFavorite(req, res) {
  try {
    const userId = req.user.id;
    const { salonId } = req.params;
    await query(
      `DELETE FROM favorites WHERE user_id = $1 AND salon_id = $2`,
      [userId, salonId],
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('removeFavorite error:', err.message);
    return res.status(500).json({ error: 'Failed to remove favorite' });
  }
}

async function checkFavorite(req, res) {
  try {
    const userId = req.user.id;
    const { salonId } = req.params;
    const result = await query(
      `SELECT id FROM favorites WHERE user_id = $1 AND salon_id = $2`,
      [userId, salonId],
    );
    return res.json({ isFavorite: result.rows.length > 0 });
  } catch (err) {
    console.error('checkFavorite error:', err.message);
    return res.status(500).json({ error: 'Failed to check favorite' });
  }
}

module.exports = { getFavorites, addFavorite, removeFavorite, checkFavorite };
