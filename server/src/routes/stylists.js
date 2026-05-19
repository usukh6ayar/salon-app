const express = require('express');
const { getStylistAvailability } = require('../controllers/stylistController');

const router = express.Router();

router.get('/:id/availability', getStylistAvailability);

module.exports = router;
