const ApiError = require('../utils/ApiError');

const ROLE_HIERARCHY = {
  principal: 7,
  admin: 6,
  accountant: 5,
  librarian: 4,
  teacher: 3,
  parent: 2,
  student: 1,
};

// Allow specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated.');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role '${req.user.role}' is not authorized to access this resource.`
      );
    }
    next();
  };
};

// Allow roles at or above a minimum level
const authorizeMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) throw new ApiError(401, 'Not authenticated.');
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const minLevel = ROLE_HIERARCHY[minRole] || 0;
    if (userLevel < minLevel) {
      throw new ApiError(403, 'Insufficient permissions.');
    }
    next();
  };
};

module.exports = { authorize, authorizeMinRole, ROLE_HIERARCHY };
