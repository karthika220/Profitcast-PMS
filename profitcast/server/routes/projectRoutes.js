const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject, deleteProject, addMember, removeMember } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorize('MD', 'HR_MANAGER'), createProject);
router.put('/:id', authorize('MD', 'HR_MANAGER'), updateProject);
router.delete('/:id', authorize('MD', 'HR_MANAGER'), deleteProject);
router.post('/:id/members', authorize('MD', 'HR_MANAGER'), addMember);
router.delete('/:id/members/:userId', authorize('MD', 'HR_MANAGER'), removeMember);

module.exports = router;
