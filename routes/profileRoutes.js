const express = require('express');
const router = express.Router();
const { showProfile, updateProfile } = require('../controllers/profileController');
const { isAuthenticated, setCurrentUser } = require('../middleware/authMiddleware');

// Apply middleware
router.use(isAuthenticated);
router.use(setCurrentUser);

// Profile routes
router.get('/', showProfile);
router.post('/', updateProfile);

module.exports = router;