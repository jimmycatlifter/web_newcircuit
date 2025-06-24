const bcrypt = require('bcryptjs');

// In-memory users database
let users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$rrm9.ROuR09ky1C1qxRIwORXJtbLO1b5mG3DxPXoWxjkSHKowXNWe', // password123
    role: 'admin',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    createdAt: new Date()
  }
];

// Get all users
const getAllUsers = () => {
  return users;
};

// Get user by ID
const getUserById = (id) => {
  return users.find(user => user.id === parseInt(id));
};

// Get user by email
const getUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

// Add new user
const createUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const newUser = {
    id: users.length + 1,
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: 'user',
    avatar: `https://randomuser.me/api/portraits/men/${users.length + 2}.jpg`,
    createdAt: new Date()
  };
  
  users.push(newUser);
  return newUser;
};

// Update user
const updateUser = (id, userData) => {
  const index = users.findIndex(user => user.id === parseInt(id));
  
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    return users[index];
  }
  
  return null;
};

// Verify password
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  verifyPassword
};