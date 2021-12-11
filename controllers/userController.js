const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// This function is use for password encryption
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// This function is use for validate password entered by user
async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

// This controller is use for signUp route
exports.signup = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        // Check that missing information like email, password or role
        if (!email || !password || !role) {
            res.send({
                type: "error",
                message: "Please enter Email or Password or Role.",
            })
        } else {
            let allRoles = ["hr", "manager", "teamLead", "employee"];
            // Check that entered role is from pre-define role or not, if not then send responnse with error.
            if (allRoles.indexOf(role) <= -1) {
                res.send({
                    type: "error",
                    message: "Please select Role from hr, manager, teamLead or employee",
                })
            } else {
                const user = await User.findOne({ email: email });
                // Check that user id already registered with same email id or not
                if (user) {
                    res.send({
                        type: "error",
                        message: "User is already registered with " + email + " email id."
                    })
                } else {
                    // Set default permission for all users.
                    let permission = ["readOwn", "updateOwn"];
                    // If role is hr then provide more access
                    if (role == "hr") {
                        permission.push("readAny", "createAny", "updateAny", "deleteAny");
                    }

                    const hashedPassword = await hashPassword(password);
                    const newUser = new User({ email, password: hashedPassword, role, permission });
                    const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
                        expiresIn: "1d"
                    });
                    newUser.accessToken = accessToken;
                    await newUser.save();

                    res.send({
                        type: "success",
                        data: newUser,
                        accessToken
                    })
                }
            }
        }
    } catch (error) {
        res.send({
            type: "error",
            message: error,
        })
        // next(error)
    }
}

// This controller is use for login route
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ isDeleted: false, email: email });
        // Check that Email or Password is exist in body or not
        if (!user || !password) {
            res.send({
                type: "error",
                message: "Email or Password is not found."
            })
        } else {
            const validPassword = await validatePassword(password, user.password);
            // Check that if entered password id valid or not
            if (!validPassword) {
                res.send({
                    type: "error",
                    message: "Password is not correct."
                })
            } else {
                const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                    expiresIn: "1d"
                });
                await User.findByIdAndUpdate(user._id, { accessToken })
                res.send({
                    type: "success",
                    data: { email: user.email, role: user.role },
                    accessToken
                })
            }
        }
    } catch (error) {
        next(error);
    }
}

// This controller is use for get all users
exports.getUsers = async (req, res, next) => {
    try {
        // Find all users
        const users = await User.find({ isDeleted: false });
        res.send({
            type: "sucess",
            data: users
        });
    } catch (error) {
        res.send({
            type: "error",
            message: error,
        });
    }
}

// This controller is use for getting specific user data
exports.getUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await User.find({ isDeleted: false, _id: userId });
        // Check that user exist or not with provided UserId
        if (!user) {
            res.send({
                type: "error",
                message: "User does not exist with " + userId,
            });
        } else {
            res.send({
                type: "sucess",
                data: user
            });
        }
    } catch (error) {
        // next(error)
        res.send({
            type: "error",
            message: error,
        });
    }
}

// This controller is use for update specific user data
exports.updateUser = async (req, res, next) => {
    try {
        // const update = req.body;
        const { email, password, role } = req.body;
        // If password field exist then do encryption and store it into DB
        if (password) {
            password = await hashPassword(password);
        }
        const userId = req.params.userId;
        const user = await User.findOne({ isDeleted: false, _id:userId });
        // Chekc that with provided UserId that User is exist or not
        if (user) {
            let allRoles = ["hr", "manager", "teamLead", "employee"];
            // Check that entered role is from pre-define role or not, if not then send responnse with error.
            if (allRoles.indexOf(role) <= -1) {
                res.send({
                    type: "error",
                    message: "Please select Role from hr, manager, teamLead or employee",
                })
            } else {
                await User.findByIdAndUpdate(userId, { email, password, role });
                const userData = await User.findOne({_id:userId });
                res.send({
                    type: "success",
                    data: userData,
                    message: 'User has been updated'
                });
            }
        } else {
            res.send({
                type: "error",
                message: "User does not exist with " + userId,
            });
        }
    } catch (error) {
        // next(error)
        res.send({
            type: "error",
            message: error,
        });
    }
}

// This controller is use for delete specific user
exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        let user = await User.findByIdAndUpdate(userId, { isDeleted: true });
        // Check that User is exist or not
        if (!user || user.isDeleted) {
            res.send({
                type: "error",
                message: 'User does not exist with ' + userId
            });
        } else {
            res.send({
                type: "success",
                message: 'User has been deleted successfully',
                // userDetails: user,
            });
        }
    } catch (error) {
        // next(error)
        res.send({
            type: "error",
            message: error,
        });
    }
}

// This controller is use for check that access is given that specific user to perform action or not
exports.grantAccess = function (action) {
    return async (req, res, next) => {
        try {
            const userId = req.user._id;
            const user = await User.findOne({ isDeleted: false, _id:userId }, { permission: 1 });
            // Check that if given action is exist in specific user then it will allow to perform that operation or else decline it
            if (user.permission.indexOf(action) > -1) {
                // const permmission = roles.can(req.user.role)[action](resource);
            } else {
                return res.send({
                    type: "error",
                    message: "You don't have enough permission to perform this action"
                });
            }
            next();
        } catch (error) {
            res.send({
                type: "error",
                message: error,
            });
            // next(error)
        }
    }
}

// This controller is use for update permission for specific user
exports.updatePermission = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        let user = await User.findOne({ isDeleted: false, _id: userId }, { permission: 1 });
        // Check that User is exist with provided UserId or not
        if (user){
            let permission = user.permission;

            if (typeof(req.body.permission) == "string"){
                if (!permission.includes(req.body.permission)) {
                    permission.push(req.body.permission);
                }
            } else {
                // Assign comming permission from body with existing one
                for (let i in req.body.permission) {
                    if (!permission.includes(req.body.permission[i])) {
                        permission.push(req.body.permission[i]);
                    }
                }
            }
            // Check that User is exist or not with provided UserId
            await User.findByIdAndUpdate(userId, { $set: { permission } });
            const userData = await User.findOne({ isDeleted: false, _id:userId });
            res.send({
                type: "success",
                data: userData,
                message: 'Permission granted to User successfully'
            });
        } else {
            res.send({
                type: "error",
                message: "User does not exist with " + userId,
            });
        }
    } catch (error) {
        // next(error)
        res.send({
            type: "error",
            message: error,
        });
    }
}

// This controller is use for revoke permission from specific user
exports.revokePermission = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        let user = await User.findOne({ isDeleted: false, _id: userId }, { permission: 1 });
        // check that user is exist with provided UserId or not
        if (user){
            let permission = user.permission;

            if (typeof(req.body.permission) == "string"){
                if (permission.indexOf(req.body.permission) > -1) {
                    permission.splice(permission.indexOf(req.body.permission), 1);
                }
            } else {
                // Remove that given permission in body from user permissions
                for (let i in req.body.permission) {
                    if (permission.indexOf(req.body.permission[i]) > -1) {
                        permission.splice(permission.indexOf(req.body.permission[i]), 1);
                    }
                }
            }

            await User.findByIdAndUpdate(userId, { $set: { permission } });
            const userData = await User.findById(userId);
            res.send({
                type: "success",
                data: userData,
                message: 'Permission granted to User successfully'
            });
        } else {
            res.send({
                type: "error",
                message: "User does not exist with " + userId,
            });
        }
    } catch (error) {
        // next(error)
        res.send({
            type: "error",
            message: error,
        });
    }
}

// This controller is use for check that route is accessible via login or not
exports.allowIfLoggedin = async (req, res, next) => {
    try {
        const user = res.locals.loggedInUser;
        // Check stored session data for allo to login or not
        if (!user)
            return res.send({
                type: "error",
                message: "You need to be logged in to access this route"
            });
        req.user = user;
        next();
    } catch (error) {
        res.send({
            type: "error",
            message: error,
        });
        // next(error);
    }
}