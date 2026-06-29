const express = require("express");
const router = express.Router();
const Parent = require("../models/Parent");
const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/rbac.middleware");

router.use(protect);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    const total = await Parent.countDocuments(query);
    const parents = await Parent.find(query)
      .populate("students", "firstName lastName admissionNumber class")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    return res.status(200).json(
      new ApiResponse(200, {
        parents,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
      }),
    );
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const parent = await Parent.findById(req.params.id).populate({
      path: "students",
      populate: [
        { path: "class", select: "name" },
        { path: "section", select: "name" },
      ],
    });
    if (!parent) throw new ApiError(404, "Parent not found.");
    return res.status(200).json(new ApiResponse(200, parent));
  }),
);

router.post(
  "/",
  authorize("admin", "principal"),
  asyncHandler(async (req, res) => {
    const { email, password, ...parentData } = req.body;
    const user = await User.create({
      name: `${parentData.firstName} ${parentData.lastName}`,
      email,
      password: password || `Parent@${new Date().getFullYear()}`,
      role: "parent",
      phone: parentData.phone,
    });
    const parent = await Parent.create({
      ...parentData,
      email,
      user: user._id,
    });
    await User.findByIdAndUpdate(user._id, {
      profileRef: parent._id,
      profileModel: "Parent",
    });
    return res
      .status(201)
      .json(new ApiResponse(201, parent, "Parent created."));
  }),
);

router.put(
  "/:id",
  authorize("admin", "principal"),
  asyncHandler(async (req, res) => {
    const parent = await Parent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!parent) throw new ApiError(404, "Parent not found.");
    return res
      .status(200)
      .json(new ApiResponse(200, parent, "Parent updated."));
  }),
);

router.delete(
  "/:id",
  authorize("admin", "principal"),
  asyncHandler(async (req, res) => {
    const parent = await Parent.findById(req.params.id);
    if (!parent) throw new ApiError(404, "Parent not found.");
    await User.findByIdAndDelete(parent.user);
    await Parent.findByIdAndDelete(req.params.id);
    return res.status(200).json(new ApiResponse(200, null, "Parent deleted."));
  }),
);

module.exports = router;
