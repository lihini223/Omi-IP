const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword 
    });

    try{
        const newUser = await user.save();
        console.log(newUser);
        res.json({
            status: 'success'
        });
    }
    catch(er){
        console.log(er);
        res.json({
            status: 'error'
        });
    }
});

router.post('/login', async (req, res) => {
    try{
        const user = await User.findOne({ email: req.body.email });

        if(!user) return res.json({ status: 'error', error: "Invalid Email"});

        if(await bcrypt.compare(req.body.password, user.password)){
            const playerData = {
                dbId: user._id,
                username: user.username
            };
            
            const accessToken = jwt.sign(playerData, process.env.JWT_TOKEN); //encrypt the player data

            return res.json({
                status: "success",
                accessToken
            });
        }
        else{   
            return res.json({ status: 'error', error: "Incorrect password" });
        }
    }
    catch(er){
        console.log(er);
    }
});

module.exports = router;