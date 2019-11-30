const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
    familyName: { type: String, required: true },
    firstName: { type: String, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    isProfessional: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    godFather: { type: Schema.Types.ObjectId, ref: 'User' },
    activeToken: String,
    activeTokenExpire: Date,
    resetToken: String,
    resetTokenExpire: Date,
});

module.exports = mongoose.model('User', userSchema);
