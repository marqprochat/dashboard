const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(authenticate);

// Admin-only routes
router.get('/', requireAdmin, userController.getAll);
router.delete('/:username', requireAdmin, userController.deleteUser);
router.post('/change-password', userController.changePassword);

module.exports = router;
