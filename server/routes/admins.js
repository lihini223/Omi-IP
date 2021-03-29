const express = require('express');
const passport = require('passport');

const { checkAuthenticated, checkNotAuthenticated } = require('../config/auth');
const Advertisement = require('../models/Advertisement');

const router = express.Router();

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login');
});

router.post('/login', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admins/advertisements',
        failureRedirect: '/admins/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/advertisements', checkAuthenticated, async (req, res) => {
    try{
        const advertisements = await Advertisement.find({});

        res.render('advertisements', { advertisements: advertisements });
    } catch{
        res.render('advertisements', { advertisements: [] });
    }
});

router.get('/logout', checkAuthenticated, (req, res) => {
    req.logout(); // clear session variables
    res.redirect('/admins/login');
});

module.exports = router;