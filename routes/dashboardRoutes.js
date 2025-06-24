const express = require('express');
const router = express.Router();
const { rendrHome, get_search, post_microblog  } = require('../controllers/dashboardController'); 
const { isAuthenticated, setCurrentUser } = require('../middleware/authMiddleware');


router.use(isAuthenticated);
router.use(setCurrentUser);

// Dashboard route
router.get('/', rendrHome);
 

router.post('/micro', post_microblog); 

 


// router.get('/onboarding', rendrOnboard);
// router.get('/beta-trial', rendrBeta);

module.exports = router;