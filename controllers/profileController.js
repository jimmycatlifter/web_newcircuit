const { getUserById, updateUser } = require('../models/userModel');

// Show profile page
const showProfile = (req, res) => {
  console.log("PROFILE ?!!!!");
  console.log(req.user);
  res.render('profile', {
    title: 'My Profile',
    user: req.user,
    success: req.query.success,
    error: req.query.error
  });
};

// Update profile
const updateProfile = (req, res) => {
  const { name } = req.body;
  
  // Validate input
  if (!name) {
    return res.redirect('/profile?error=Name is required');
  }
  
  try {
    // Update user
    updateUser(req.user.id, { name });
    
    // Redirect to profile page with success message
    res.redirect('/profile?success=Profile updated successfully');
  } catch (error) {
    res.redirect('/profile?error=Error updating profile');
  }
};

module.exports = {
  showProfile,
  updateProfile
};