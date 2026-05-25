const express = require('express');
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require('../controllers/favoriteController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/', getFavorites);
router.get('/:salonId', checkFavorite);
router.post('/:salonId', addFavorite);
router.delete('/:salonId', removeFavorite);

module.exports = router;
