const mongoose = require('mongoose');

const { Schema } = mongoose;

const saleSchema = new Schema({
    typeOfProperty: { type: String, required: true },
    transaction: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    isOwner: { type: Boolean, required: true },
    relationshipWithOwner: { type: String, required: true },
    ownerFullName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    ownersAgreement: { type: Boolean, default: true, required: true },
    moreInformation: String,
    isAgree: { type: Boolean, default: true, required: true },
    state: { type: String, default: 'pending', required: true },
    price: Number,
    created: { type: Date, default: Date.now, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Sale', saleSchema);
