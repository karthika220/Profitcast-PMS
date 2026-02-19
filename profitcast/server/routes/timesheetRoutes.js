const express = require('express');
const router = express.Router();
const { getTimesheets, logTime, updateTimesheet, deleteTimesheet } = require('../controllers/timesheetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getTimesheets);
router.post('/', logTime);
router.put('/:id', updateTimesheet);
router.delete('/:id', deleteTimesheet);

module.exports = router;
