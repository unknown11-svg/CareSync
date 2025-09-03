const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    name: {type: String, required: true},
    type: {type: String, required: true, enum: ['hospital', 'clinic', 'mobile']},
    location: {type: {type: String, default: 'Point'}, coordinates: [Number]},
    departments: [{
        id: {type: mongoose.Schema.Types.ObjectId, required: true},
        name: {type: String, required: true},
        slots: [{
            startAt: {type: Date, required: true},
            endAt: {type: Date, required: true},
            status: {type: String, required: true, enum: ['open', 'closed']}
        }]
    }]
})

const Facility = mongoose.model('Facility', facilitySchema);

module.exports = Facility;