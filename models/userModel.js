import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
    {
        fullName: String,
        createdEvents: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        }],
        assignedEvents: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        }],
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
        image: {
            type: String,
            default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'nurse', 'superadmin', 'patient'],
            default: 'user'
        }
    },
    {timestamps:true}
);

// Change to default export
const User = mongoose.model('User', userSchema);
export default User;