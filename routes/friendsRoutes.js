const express = require('express');
const router = express.Router();
const {   post_friends, get_frsearch  } = require('../controllers/dashboardController'); 
const { isAuthenticated, setCurrentUser } = require('../middleware/authMiddleware');


router.use(isAuthenticated);
router.use(setCurrentUser);

// Search route
 
router.get('/', get_frsearch); 

router.post('/add', post_friends); 

 
module.exports = router;