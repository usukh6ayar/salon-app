const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  createPayment,
  getPaymentByBooking,
  getSavedCards,
  saveCard,
} = require('../controllers/paymentController');

const router = express.Router();

router.use(verifyToken);

router.get('/cards', getSavedCards);
router.post('/cards', saveCard);
router.post('/', createPayment);
router.get('/:bookingId', getPaymentByBooking);

module.exports = router;
