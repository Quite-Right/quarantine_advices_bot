const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adv_Users = new Schema({
    id: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        default: 'start',
    },
    adv1: {
        type: String,
        default: '',
    },
    adv2: {
        type: String,
        default: '',
    },
    adv3: {
        type: String,
        default: '',
    },
    adv4: {
        type: String,
        default: '',
    },
    adv5: {
        type: String,
        default: '',
    },
});



module.exports = mongoose.model('adv_users', adv_Users);