const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

// Define API routes
router.post('/checkout', checkoutController.checkout);
router.post('/pay', checkoutController.pay);
router.get('/health', checkoutController.health);

module.exports = router;
