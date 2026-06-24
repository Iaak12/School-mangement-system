const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/transport.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(protect);

// Routes
router.get('/routes', ctrl.getRoutes);
router.post('/routes', authorize('admin', 'principal'), ctrl.createRoute);
router.put('/routes/:id', authorize('admin', 'principal'), ctrl.updateRoute);
router.delete('/routes/:id', authorize('admin', 'principal'), ctrl.deleteRoute);

// Vehicles
router.get('/vehicles', ctrl.getVehicles);
router.post('/vehicles', authorize('admin', 'principal'), ctrl.createVehicle);
router.put('/vehicles/:id', authorize('admin', 'principal'), ctrl.updateVehicle);

// Drivers
router.get('/drivers', ctrl.getDrivers);
router.post('/drivers', authorize('admin', 'principal'), ctrl.createDriver);
router.put('/drivers/:id', authorize('admin', 'principal'), ctrl.updateDriver);

module.exports = router;
