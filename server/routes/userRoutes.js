const express = require('express');
const router = express.Router();
const { registerUser, loginUser, searchUsers, getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/chatAuthMiddleware');
// User routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/search',protect, searchUsers);
router.get('/', getAllUsers);

module.exports = router;
