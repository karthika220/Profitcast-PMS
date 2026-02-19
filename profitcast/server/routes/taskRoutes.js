const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask, getOverdueTasks } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/overdue', getOverdueTasks);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', authorize('MD', 'HR_MANAGER', 'TEAM_LEAD'), createTask);
router.put('/:id', updateTask);
router.delete('/:id', authorize('MD', 'HR_MANAGER', 'TEAM_LEAD'), deleteTask);

module.exports = router;
