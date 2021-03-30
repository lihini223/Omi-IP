const express = require('express');

const User = require('../models/User');

const router = express.Router();

router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find({}).sort({ score: -1 }).limit(10);

        let rank = 0;
        const leaderboard = users.map(user => {
            rank += 1;
            
            return {
                username: user.username,
                score: user.score,
                rank
            }
        });
        
        res.json({ leaderboard: leaderboard });
    } catch(err) {
        console.log(err);
        res.json({ leaderboard: [] });
    }
});

module.exports = router;