const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(verifyToken);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
