const mongoose = require('mongoose');

// User schema definition
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  phone_number: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  village: {
    type: String,
    required: [true, 'Village name is required'],
    trim: true,
    minlength: [2, 'Village name must be at least 2 characters']
  },
  total_amount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  payment_history: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Index for faster phone number lookups
userSchema.index({ phone_number: 1 });

// Method to add payment amount
userSchema.methods.addPayment = async function(amount) {
  this.total_amount += amount;
  this.payment_history.push({ amount: amount });
  return await this.save();
};

module.exports = mongoose.model('User', userSchema);