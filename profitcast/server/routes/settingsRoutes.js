const express = require('express');
const router = express.Router();
const { getSettings, updateSetting } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getSettings);
router.put('/:key', authorize('MD'), updateSetting);

module.exports = router;
