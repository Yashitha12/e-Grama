const express = require('express');
const router = express.Router();
const microfinanceController = require('../controllers/microFinanceController');

// Loan Application Routes
router.post('/loans', microfinanceController.createLoanApplication);
router.get('/loans/:residentId', microfinanceController.getLoanApplications);
router.put('/loans/:id', microfinanceController.updateLoanApplication);
router.delete('/loans/:id', microfinanceController.deleteLoanApplication);

// Samurdhi Application Routes
router.post('/samurdhi', microfinanceController.createSamurdhiApplication);
router.get('/samurdhi/:residentId', microfinanceController.getSamurdhiApplications);
router.put('/samurdhi/:id', microfinanceController.updateSamurdhiApplication);
router.delete('/samurdhi/:id', microfinanceController.deleteSamurdhiApplication);

// Email Sending Route
router.post('/send-appointment-email', microfinanceController.sendAppointmentEmail);

module.exports = router;