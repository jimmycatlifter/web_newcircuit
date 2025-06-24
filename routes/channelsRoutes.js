const express = require('express');
const router = express.Router();
const {   post_subs  } = require('../controllers/dashboardController'); 
const { isAuthenticated, setCurrentUser } = require('../middleware/authMiddleware');


router.use(isAuthenticated);
router.use(setCurrentUser);

// Search route
 

router.post('/subs', post_subs); 

 
module.exports = router;