const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, orderController.getUserOrders);
router.post('/checkout', verifyToken, orderController.checkout);
router.post('/optimize', verifyToken, orderController.budgetOptimize);
router.get('/bundles', verifyToken, orderController.getBundleSuggestions);

module.exports = router;
