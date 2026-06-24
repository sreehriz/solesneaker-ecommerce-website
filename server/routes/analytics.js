const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');

router.get('/nqueens', verifyToken, analyticsController.getNQueens);
router.get('/obst', verifyToken, analyticsController.getOBST);
router.get('/floyd', verifyToken, analyticsController.getFloyd);
router.get('/hamiltonian', verifyToken, analyticsController.getHamiltonian);
router.get('/warshall', verifyToken, analyticsController.getWarshall);

module.exports = router;
