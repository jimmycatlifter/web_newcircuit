// const jwt = require('jsonwebtoken');
// const { jwtSecret, cookieName } = require('../config/auth');
// const { getUserById } = require('../models/userModel');

// const { getUserByEmailDB,getUserByIdDB ,createUserDB } = require('../db');

// // Check if user is authenticated
//   const isAuthenticated = async (req, res, next) => {
//   // Get token from cookie
//   const token = req.cookies[cookieName];

//   console.log("req");
//   console.log(req.body);
//   console.log("req");
//   // If no token, redirect to login
//   if (!token) {
//     return res.redirect('/login?error=Please log in to access this page');
//   }

//   // console.log("This is cokkie");
//   // console.log(token);

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, jwtSecret);

//     // Check if user exists
//     const user = await getUserByIdDB(decoded.id);
//     if (!user) {
//       res.clearCookie(cookieName);
//       return res.redirect('/login?error=Invalid session, please login again!');
//     }else{

//        console.log("user @ middleware---");
//        console.log( user);

//     }

//     // Attach user to request object (exclude password)
//     const  { nc_email , nc_password, id } = user;
//     console.log("nc_email");
//     console.log(nc_email);
//     console.log("{{{user}}");
//     console.log(user);
//     console.log(user.nc_email);

//     req.user = user.id;
//     req.email = user.nc_email;
//     if( req.user == undefined ){
//       console.log("-- undfn ----");
//       req.user = id;
//     }
//     if( req.email == undefined ){
//       console.log("-- undfn --");
//       req.email = nc_email;
//     }
//     console.log(user);
//     console.log("user --- middle ware email here here"  );
//     consle.log(req.email);
//     consle.log(req.user);
//     console.log("middle ware " );
//     next();
//   } catch (error) {
//     // If token is invalid, redirect to login
//     res.clearCookie(cookieName);
//     res.redirect('/login?error=Your session has expired, please login again');
//   }
// };

// // Set current user for all templates
// const setCurrentUser = (req, res, next) => {
//   res.locals.currentUser = req.user || null;
//   console.log("setCurrentUser req.user");
//   console.log(req.user);
//   next();
// };
//
//
//
// module.exports = {
//   isAuthenticated,
//   setCurrentUser
// };

const jwt = require("jsonwebtoken");
const { jwtSecret, cookieName } = require("../config/auth");
const { getUserById } = require("../models/userModel");

const { getUserByEmailDB, getUserByIdDB, createUserDB } = require("../db");

// Check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  // Get token from cookie
  const token = req.cookies[cookieName];

  // If no token, redirect to login
  if (!token) {
    if (true) {
      console.log("login token");
      console.log(req.originalUrl);
      console.log(req.hostname);
      return res.redirect("/login?error=Please log in to access this page");
    } else {
      console.log("login");
    }
  }

  console.log("This is cokkie");
  console.log(token);
  try {
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    let user = null;
    user = await getdb_email(decoded.id).then((value) => {
      req.user = value.nc_email;
      req.userinfo = value.nc_details_user;
      req.userfullname = JSON.parse(value.nc_details_user).Name;
      req.user_ischannel = value.nc_ischannel;
      user = value;
      console.log("full====name================");
      console.log(req.userfullname);
      if (!user || user == null) {
        console.log("@ then clause null");

        res.clearCookie(cookieName);
        return res.redirect(
          "/login?error=Invalid session, please login again!"
        );
      }
    });

    // console.log("user null clause");
    // console.log(req.user);
    // console.log(req.email);

    // Attach user to request object (exclude password)

    next();
  } catch (error) {
    // If token is invalid, redirect to login
    console.log("Error on isAuthenticated @ 140", error);
    res.clearCookie(cookieName);
    res.redirect("/login?error=Your session has expired, please login again");
  }
};

// Set current user for all templates
const setCurrentUser = (req, res, next) => {
  // console.log("set current user req.user");
  // console.log(req.user);

  res.locals.currentUser = req.user || null;
  res.locals.currentUserInfo = req.userinfo || null;

  // console.log(" res.locals.currentUser ");
  // console.log( res.locals.currentUser );
  next();
};

async function getdb_email(int_id) {
  try {
    let user = null;
    user = await getUserByIdDB(int_id);
    return user;
  } catch (err) {
    console.log("Error on email checking @auth");
    console.log(err);
  }
}

module.exports = {
  isAuthenticated,
  setCurrentUser,
};
