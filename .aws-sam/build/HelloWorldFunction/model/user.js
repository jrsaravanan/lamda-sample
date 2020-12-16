const mongoose = require('mongoose');

const model = mongoose.model('UserModel', {
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },

});

module.exports = model;