const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// This is for create user define name of collection and time stamps for create and update
let options = {
    collection: 'users',
    timestamps: {
        createdAt: 'created_on',
        updatedAt: 'updated_on'
    }
};

const UserSchema = new Schema({
    isDeleted: {    //  This is for soft delete operation perform
        type: Boolean,
        default: false,
    },
    email: {    //  Store user email id
        type: String,
        required: true,
        trim: true
    },
    password: { //  Store user encryption password
        type: String,
        required: true
    },
    role: { //  Store user role from pre-defined roles
        type: String,
        default: 'employee',
        enum: ["employee", "teamLead", "manager", "hr"]
    },
    permission: {   //  Store all permission given to the user
        type: mongoose.Schema.Types.Mixed,
    },
    accessToken: {  //  Store access token of user
        type: String
    }
}, options);

const User = mongoose.model('user', UserSchema);

module.exports = User;