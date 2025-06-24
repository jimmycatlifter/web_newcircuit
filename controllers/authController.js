const jwt = require('jsonwebtoken');
const { getUserByEmail, createUser, verifyPassword } = require('../models/userModel');
const { jwtSecret, jwtExpiration, cookieName } = require('../config/auth');
const bcrypt = require('bcryptjs');

// Import database functions for future use
const { getUserByEmailDB, createUserDB } = require('../db');


// Show login page
const showLoginPage = (req, res) => {
  res.render('auth/login_a', { 
    title: 'Login',
    error: req.query.error || null,
    success: req.query.success || null
  });
};

// Show registration page
const showRegisterPage = (req, res) => {
  res.render('auth/register', { 
    title: 'Register',
    error: req.query.error || null 
  });
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.render('auth/login', { 
      title: 'Login',
      error: 'Email and password are required',
      email
    });
  }

   
  let user = null;
  try {
    user = await getUserByEmailDB(email);
    console.log("userlogin");
    // console.log(user);
    if (!user || user == null) {
      return res.render('auth/login_a', {
        title: 'Login',
        error: 'Invalid email or password',
        email
      });
    }
    console.log("email admin found!");
  
  // Continue with password verification and token generation
  } catch (error) {
    console.log("eror");
    console.log(error);
    return res.render('auth/login_a', {
      title: 'Login',
      error: 'An error occurred during login',
      email
    });
  }
  

  // Current implementation with in-memory storage
  //const user = getUserByEmail(email);
  
 

  const isPasswordValid = await verifyPassword(password, user.nc_password);
  console.log("isPasswordValid");
  console.log(isPasswordValid);
  if (!isPasswordValid) {
    return res.render('auth/login', { 
      title: 'Login',
      error: 'Invalid email or password',
      email
    });
  }

  const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: jwtExpiration });
  
  res.cookie(cookieName, token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'strict'
  });

  res.redirect('/app');
};

// Register user
const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  //  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const role ="Regular End User";
  if (!name || !email || !password) {
    return res.render('auth/register', {
      title: 'Register',
      error: 'All fields are required',
      name,
      email
    });
  }

  if (password !== confirmPassword) {
    return res.render('auth/register', {
      title: 'Register',
      error: 'Passwords do not match',
      name,
      email
    });
  }

   
  // Future implementation with database
  try {
    const existingUser = await getUserByEmailDB(email);
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'Email already in use',
        name
      });
    }

    const hpassword = await bcrypt.hash(password, 10);
    await createUserDB({ name, email, hpassword, role});
    res.redirect('/login?success=Registration successful! Please log in');
  } catch (error) {
    res.render('auth/register', {
      title: 'Register',
      error: 'Error creating user. Please try again.',
      name,
      email
    });
  }
   

  // Current implementation with in-memory storage
  

  
};

// Logout user
const logoutUser = (req, res) => {
  res.clearCookie(cookieName);
  res.redirect('/login?success=You have been logged out successfully');
};

// Delete user (for future implementation)
const deleteUser = async (req, res) => {
  /* 
  // Future implementation with database
  try {
    const userId = req.params.id;
    await deleteUserDB(userId);
    res.redirect('/login?success=Account deleted successfully');
  } catch (error) {
    res.redirect('/profile?error=Error deleting account');
  }
  */
  res.status(501).json({ message: 'Not implemented' });
};

module.exports = {
  showLoginPage,
  showRegisterPage,
  loginUser,
  registerUser,
  logoutUser,
  deleteUser
};