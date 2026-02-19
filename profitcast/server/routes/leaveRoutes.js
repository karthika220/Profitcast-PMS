const express = require('express');
const router = express.Router();
const { getLeaves, applyLeave, updateLeaveStatus, deleteLeave } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getLeaves);
router.post('/', applyLeave);
router.put('/:id/status', authorize('MD', 'HR_MANAGER'), updateLeaveStatus);
router.delete('/:id', deleteLeave);

module.exports = router;
