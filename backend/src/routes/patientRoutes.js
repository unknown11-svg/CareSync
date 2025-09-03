// Appointment reminders (within 24 hours)
router.get('/reminders', verifyToken, patientController.getReminders);
// Clear notifications
router.post('/notifications/clear', verifyToken, patientController.clearNotifications);
// Patient notifications
router.get('/notifications', verifyToken, patientController.getNotifications);
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken } = require('../middleware/authMiddleware');

// Patient login
router.post('/login', patientController.patientLogin);


// Patient dashboard endpoints (protected)
router.get('/appointments', verifyToken, patientController.getAppointments);
router.get('/referrals', verifyToken, patientController.getReferrals);
router.get('/events', verifyToken, patientController.getEvents);

// Appointment actions
router.post('/appointments/:appointmentId/cancel', verifyToken, patientController.cancelAppointment);
router.post('/appointments/:appointmentId/reschedule', verifyToken, patientController.rescheduleAppointment);

module.exports = router;
