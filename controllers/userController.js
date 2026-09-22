const User = require('../models/User');
const { validationResult } = require('express-validator');

// Check if user exists by phone number
const checkUserExists = async (req, res) => {
  try {
    const { phone_number } = req.params;
    
    // Validate phone number format
    if (!/^\d{10}$/.test(phone_number)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    const user = await User.findOne({ phone_number });
    
    res.json({
      success: true,
      exists: !!user,
      user: user ? {
        id: user._id,
        name: user.name,
        phone_number: user.phone_number,
        village: user.village,
        total_amount: user.total_amount
      } : null
    });
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking user existence'
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, phone_number, village } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone_number });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone number'
      });
    }

    // Create new user
    const user = new User({
      name,
      phone_number,
      village,
      total_amount: 0
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        phone_number: user.phone_number,
        village: user.village,
        total_amount: user.total_amount
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
};

// Add amount to existing user
const addAmount = async (req, res) => {
  try {
    const { phone_number, amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid amount greater than 0'
      });
    }

    // Find user by phone number
    const user = await User.findOne({ phone_number });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update total amount
    const previousAmount = user.total_amount;
    user.total_amount += parseFloat(amount);
    user.payment_history.push({ amount: parseFloat(amount) });
    await user.save();

    res.json({
      success: true,
      message: `Amount added successfully! Previous: ₹${previousAmount}, New: ₹${user.total_amount}`,
      user: {
        id: user._id,
        name: user.name,
        phone_number: user.phone_number,
        village: user.village,
        total_amount: user.total_amount,
        previous_amount: previousAmount,
        added_amount: parseFloat(amount)
      }
    });
  } catch (error) {
    console.error('Error adding amount:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding amount'
    });
  }
};

// Get user details
const getUserDetails = async (req, res) => {
  try {
    const { phone_number } = req.params;
    
    const user = await User.findOne({ phone_number });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone_number: user.phone_number,
        village: user.village,
        total_amount: user.total_amount,
        created_at: user.created_at,
        payment_history: user.payment_history
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};

// Get all users (for admin purposes)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-payment_history');
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};
// Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user"
    });
  }
};

module.exports = {
  checkUserExists,
  createUser,
  addAmount,
  getUserDetails,
  getAllUsers,
  deleteUser
};
