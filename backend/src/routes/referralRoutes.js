const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const authMiddleware = require('../middleware/authMiddleware');

// Analytics endpoint
router.get('/analytics', referralController.getReferralAnalytics);

router.post('/', referralController.createReferral);
router.get('/', referralController.getReferrals);
// Cancel a referral
router.patch('/:id/cancel', referralController.cancelReferral);

module.exports = router;