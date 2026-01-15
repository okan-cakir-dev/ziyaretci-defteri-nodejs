const mongoose = require('mongoose');

const mesajSchema = new mongoose.Schema({
    isim: {
        type: String,
        required: true
    },
    not: {
        type: String,
        required: true
    },
    tarih: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Mesaj', mesajSchema);