const fs = require('fs');
const path = require('path');
const express = require('express');
const passport = require('passport');
const multer = require('multer');

const { checkAuthenticated, checkNotAuthenticated } = require('../config/auth');
const Advertisement = require('../models/Advertisement');

const router = express.Router();

const uploadPath = path.join('public', Advertisement.advertisementImageBasePath); // upload location of advertisement images

const imageMimeTypes = ['image/jpeg', 'image/png']; // accepted image types

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
});
const upload = multer({
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    },
    storage: storage
});