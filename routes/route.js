// server/routes/route.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// This route is use for signUp of the user
router.post('/signup', userController.signup);

// This route is use for login of the user
router.post('/login', userController.login);

// This route is use for get all details of specific user
router.get('/user/:userId', userController.allowIfLoggedin, userController.getUser);

// This route is use for create user if user have and access for it
router.post('/create/user', userController.allowIfLoggedin, userController.grantAccess('createAny'), userController.signup);

// This route is use for get all details of all users if user have and access for it
router.get('/users', userController.allowIfLoggedin, userController.grantAccess('readAny'), userController.getUsers);

// This route is use for modify specific user's data if user have and access for it
router.put('/user/:userId', userController.allowIfLoggedin, userController.grantAccess('updateAny'), userController.updateUser);

// This route is use for provide permission to specific user if user have and access for it
router.put('/permission/:userId', userController.allowIfLoggedin, userController.updatePermission);

// This route is use for revoke specific users's permission if user have and access for it
router.put('/permissionRevoke/:userId', userController.allowIfLoggedin, userController.revokePermission);

// This route is use for delete specific user if user have and access for it
router.delete('/user/:userId', userController.allowIfLoggedin, userController.grantAccess('deleteAny'), userController.deleteUser);

module.exports = router;