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


/* router.get('/advertisements', checkAuthenticated, async (req, res) => {
    try{
        const advertisements = await Advertisement.find({});

        res.render('advertisements', { advertisements: advertisements });
    } catch{
        res.render('/admins/advertisements', { advertisements: [] });
    }
}); */

// new advertisement
router.post('/new', checkAuthenticated, upload.single('advertisementImage'), async (req, res) => {
    const imageName = req.file != null ? req.file.filename : null;

    try{
        const advertisements = await Advertisement.find();
        
        let errors = [];

        if(req.body.title == '' || req.body.details == ''){
            errors.push({ msg: 'Please enter all the details.' });
        }

        if(errors.length > 0){
            if(imageName != null){
                removeAdvertisementImage(imageName);
            }

            return res.render('advertisements', { advertisements, errors });
        } else {
            const details = req.body.details.replace(/(?:\r\n|\r|\n)/g, '. ');

            const advertisement = new Advertisement({
                title: req.body.title,
                details: details,
                link: req.body.link,
                imageName
            });

            const newAdvertisement = await advertisement.save();

            res.redirect('/admins/advertisements');
        }
    } catch(err){
        if(imageName != null){
            removeAdvertisementImage(imageName);
        }

        res.redirect('/admins/advertisements');
    }
});


router.post('/edit/:id', checkAuthenticated, async (req, res) => {
    const advertisementId = req.params.id;

    const { title, details } = req.body;

    let errors = [];

    if(title == '' || details == ''){
        errors.push({ msg: 'Please enter all the details.' });
    }

    try{
        const advertisements = await Advertisement.find({});

        if(errors.length > 0){
            return res.render('advertisements', { advertisements, errors});
        }

        const editedDetails = details.replace(/(?:\r\n|\r|\n)/g, '. ');

        const updatedAdvertisement = await Advertisement.updateOne({ _id: advertisementId }, { title: title, details: editedDetails });

        res.redirect('/admins/advertisements');
    } catch(err){
        res.redirect('/admins/advertisements');
    }
});


router.delete('/delete/:id', checkAuthenticated, async (req, res) => {
    const advertisementId = req.params.id;

    try{
        const advertisement = await Advertisement.findOne({ _id: advertisementId });

        const deletedReport = await Advertisement.deleteOne({ _id: advertisementId });

        if(advertisement.imageName && advertisement.imageName != null){
            removeAdvertisementImage(advertisement.imageName);
        }

        res.redirect('/admins/advertisements');
    } catch(err) {
        res.redirect('/admins/advertisements');
    }
});


// get random advertisement
router.get('/random', async (req, res) => {
    try {
        const randomAdvertisement = await Advertisement.find({}).sort({ views: 1 }).limit(1);
        
        const updatedAdvertisement = await Advertisement.updateOne({ _id: randomAdvertisement[0]._id }, { views: randomAdvertisement[0].views + 1 });

        res.json({ advertisement: randomAdvertisement[0] });
    } catch(err) {
        console.log(err);
        res.json({ advertisement: {} });
    }
});

