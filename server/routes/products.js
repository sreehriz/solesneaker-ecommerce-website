const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/sort', productController.sortProducts);
router.post('/seed', productController.seedProductsDataset);
router.get('/:id', productController.getProductById);
router.post('/', verifyAdmin, productController.createProduct);

module.exports = router;
