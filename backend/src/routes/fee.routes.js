const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fee.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);

// Fee structure
router.get('/structure', ctrl.getFeeStructure);
router.post('/structure', authorize('admin', 'principal', 'accountant'), ctrl.createFeeStructure);
router.put('/structure/:id', authorize('admin', 'principal', 'accountant'), ctrl.updateFeeStructure);

// Payments
router.get('/payments', ctrl.getPayments);
router.post('/payments', authorize('admin', 'accountant', 'principal'), ctrl.collectFee);
router.get('/payments/:id/receipt', ctrl.downloadReceipt);
router.get('/payments/export', authorize('admin', 'accountant', 'principal'), ctrl.exportPaymentsExcel);

// Reports
router.get('/defaulters', authorize('admin', 'accountant', 'principal'), ctrl.getDefaulters);
router.get('/stats', authorize('admin', 'accountant', 'principal'), ctrl.getFeeStats);

module.exports = router;
