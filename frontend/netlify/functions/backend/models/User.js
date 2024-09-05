const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userType: {
        type: String,
        require: true
    },
    userFullName: {
        type: String,
        require: true,
        unique: true
    },
    admissionId: {
        type: String,
        min: 3,
        max: 15,
    },
    employeeId: {
        type: String,
        min: 3,
        max: 15,
    },
    age: {
        type: Number,
        default: null
    },
    gender: {
        type: String,
        default: null
    },
    dob: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: ""
    },
    mobileNumber: {
        type: Number,
        require: true,
        default: null
    },
    photo: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        require: true,
        max: 50,
        unique: true
    },
    password: {
        type: String,
        require: true,
        min: 6
    },
    points: {
        type: Number,
        default: 0
    },
    activeTransactions: [{
        type: mongoose.Types.ObjectId,
        ref: "BookTransaction"
    }],
    prevTransactions: [{
        type: mongoose.Types.ObjectId,
        ref: "BookTransaction"
    }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    passCode:{
        type:Number,
        default:null
    }
},
    {
        timestamps: true
    });

    module.exports = mongoose.model("User", UserSchema);