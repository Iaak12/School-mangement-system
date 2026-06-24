const Transport = require('../models/Transport');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Routes
const getRoutes = asyncHandler(async (req, res) => {
  const routes = await Transport.find()
    .populate('vehicle', 'registrationNumber model capacity')
    .populate('driver', 'firstName lastName phone')
    .populate('students', 'firstName lastName admissionNumber');
  return res.status(200).json(new ApiResponse(200, routes));
});

const createRoute = asyncHandler(async (req, res) => {
  const route = await Transport.create(req.body);
  return res.status(201).json(new ApiResponse(201, route, 'Route created.'));
});

const updateRoute = asyncHandler(async (req, res) => {
  const route = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!route) throw new ApiError(404, 'Route not found.');
  return res.status(200).json(new ApiResponse(200, route, 'Route updated.'));
});

const deleteRoute = asyncHandler(async (req, res) => {
  await Transport.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, null, 'Route deleted.'));
});

// Vehicles
const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find().sort({ registrationNumber: 1 });
  return res.status(200).json(new ApiResponse(200, vehicles));
});

const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  return res.status(201).json(new ApiResponse(201, vehicle, 'Vehicle added.'));
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found.');
  return res.status(200).json(new ApiResponse(200, vehicle, 'Vehicle updated.'));
});

// Drivers
const getDrivers = asyncHandler(async (req, res) => {
  const drivers = await Driver.find()
    .populate('vehicle', 'registrationNumber model')
    .populate('route', 'routeName routeNumber')
    .sort({ firstName: 1 });
  return res.status(200).json(new ApiResponse(200, drivers));
});

const createDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.create(req.body);
  return res.status(201).json(new ApiResponse(201, driver, 'Driver added.'));
});

const updateDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!driver) throw new ApiError(404, 'Driver not found.');
  return res.status(200).json(new ApiResponse(200, driver, 'Driver updated.'));
});

module.exports = { getRoutes, createRoute, updateRoute, deleteRoute, getVehicles, createVehicle, updateVehicle, getDrivers, createDriver, updateDriver };
