const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser, updateProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', authorize('MD', 'HR_MANAGER'), createUser);
router.put('/profile/me', updateProfile);
router.put('/:id', authorize('MD', 'HR_MANAGER'), updateUser);
router.delete('/:id', authorize('MD', 'HR_MANAGER'), deleteUser);

module.exports = router;
