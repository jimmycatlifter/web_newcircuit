const express = require('express');
const router = express.Router();
const { 
  showLoginPage,
  showRegisterPage,
  loginUser,
  registerUser,
  logoutUser
} = require('../controllers/authController');
const { setCurrentUser } = require('../middleware/authMiddleware');

// Apply middleware
router.use(setCurrentUser);

// Auth routes
router.get('/login', showLoginPage);
router.post('/login', loginUser);
router.get('/register', showRegisterPage);
router.post('/register', registerUser);
router.get('/logout', logoutUser);

module.exports = router;
