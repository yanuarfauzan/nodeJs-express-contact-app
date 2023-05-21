const mongoose = require('mongoose');

// Membuat schema/model
const Contact = mongoose.model('Contact', {
    nama: {
        type: String,
        required: true
    },
    noHp: {
        type: String,
        required: true
    }, email: {
        type: String,
        required: true
    }
});

module.exports = Contact;