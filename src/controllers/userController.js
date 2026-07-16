// src/controllers/userController.js
const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync'); // استيراد موحد ونظيف

const softDeleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const requestedBy = { id: req.user.id, role: req.user.role };

  await userService.deleteUserAccount(id, requestedBy, reason);

  return res.ok(200, 'user.success.DELETED', null);
});

const getMyProfile = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  return res.ok(200, 'user.success.FETCHED', user);
});

const updateMyProfile = catchAsync(async (req, res) => {
  const updatedUser = await userService.updateProfile(req.user.id, req.body);
  return res.ok(200, 'user.success.UPDATED', updatedUser);
});

const toggleUserActiveStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const updatedUser = await userService.toggleUserActiveStatus(id, isActive);
  return res.ok(200, isActive ? 'user.success.ACTIVATED' : 'user.success.DEACTIVATED', updatedUser);
});

const restoreUserAccount = catchAsync(async (req, res) => {
  const { id } = req.params;
  const restoredUser = await userService.restoreUserAccount(id);
  return res.ok(200, 'user.success.RESTORED', restoredUser);
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsersForAdmin(req.query);
  return res.ok(200, 'user.success.LISTED', result);
});

module.exports = {
  softDeleteUser,
  getMyProfile,
  updateMyProfile,
  toggleUserActiveStatus,
  restoreUserAccount,
  getAllUsers
};