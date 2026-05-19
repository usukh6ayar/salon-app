const express = require('express');
const { getAllSalons, getSalonById } = require('../controllers/salonController');
const {
  getStylistsBySalon,
  getServicesBySalon,
} = require('../controllers/stylistController');

const router = express.Router();

router.get('/', getAllSalons);
router.get('/:id/stylists', getStylistsBySalon);
router.get('/:id/services', getServicesBySalon);
router.get('/:id', getSalonById);

module.exports = router;
