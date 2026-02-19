const express = require('express');
const router = express.Router();
const { getDashboardStats, getProjectHealthReport, getEmployeeWorkloadReport, getTimesheetSummary } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/project-health', authorize('MD', 'HR_MANAGER'), getProjectHealthReport);
router.get('/employee-workload', authorize('MD', 'HR_MANAGER', 'TEAM_LEAD'), getEmployeeWorkloadReport);
router.get('/timesheet-summary', authorize('MD', 'HR_MANAGER'), getTimesheetSummary);

module.exports = router;
