import mongoose from "mongoose";

//user schema to determine type of data we want to store
const userSchema = mongoose.Schema(
    {
        name: String,
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true
        },
        eventsCompleted: {
            type: Number,
            default: 0
        },
        bio: String,
        lastLogin:{
            type: Date,
            default: Date.now()
        },
        resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
        role: {
            type: String,
            enum: ['user', 'admin', 'nurse', 'superadmin', 'patient'],
            default: 'user'
        }

    },{timestamps:true})

export const User = mongoose.model('User', userSchema);