const path = require('path');
const mongoose = require('mongoose');

const advertisementImageBasePath = 'uploads/advertisement-photos';

const requiredString = {
    type: String,
    required: true
};

const AdvertisementSchema = mongoose.Schema({
    title: requiredString,
    details: requiredString,
    link: requiredString,
    imageName: requiredString,
    views: {
        type: Number,
        required: true,
        default: 0
    },
    clicks: {
        type: Number,
        required: true,
        default: 0
    }
});

AdvertisementSchema.virtual('advertisementImagePath').get(function(){
    if(this.imageName){
        return path.join('/', advertisementImageBasePath, this.imageName);
    }
});

const Advertisement = mongoose.model('Advertisement', AdvertisementSchema);

module.exports = Advertisement;
module.exports.advertisementImageBasePath = advertisementImageBasePath;