const express = require('express');
const { getAllSalons, getSalonById } = require('../controllers/salonController');

const router = express.Router();

router.get('/', getAllSalons);
router.get('/:id', getSalonById);

module.exports = router;
