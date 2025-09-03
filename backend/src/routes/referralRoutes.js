const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require provider authentication
router.use(authMiddleware.requireProvider);


router.post('/', referralController.createReferral);
router.get('/', referralController.getReferrals);
// Cancel a referral
router.patch('/:id/cancel', referralController.cancelReferral);

module.exports = router;