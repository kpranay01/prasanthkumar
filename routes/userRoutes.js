const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');

// Validation rules
const validateUser = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('phone_number').matches(/^\d{10}$/).withMessage('Phone number must be 10 digits'),
  body('village').trim().isLength({ min: 2, max: 100 }).withMessage('Village name must be 2-100 characters')
];

// Routes
router.get('/check/:phone_number', userController.checkUserExists);
router.post('/create', validateUser, userController.createUser);
router.put('/add-amount', userController.addAmount);
router.get('/details/:phone_number', userController.getUserDetails);
router.get('/all', userController.getAllUsers);
router.delete('/delete/:id', userController.deleteUser);

module.exports = router;
async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/users/delete/${userId}`, {
      method: "DELETE"
    });

    const data = await res.json();

    alert(data.message);

    loadUsers(); // Refresh user list
  } catch (err) {
    console.error(err);
  }
}