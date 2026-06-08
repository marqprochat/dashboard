const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { authenticate } = require('../middleware/authMiddleware');

// Protected routes
router.get('/production', authenticate, dataController.getProduction);

module.exports = router;
