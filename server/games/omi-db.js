const mongoose = require('mongoose');

const User = require('../models/User');

const WIN_SCORE = 50;

async function updateScore(playerId) {
    try {
        const player = await User.findOne({ _id: playerId });
        
        const updatedPlayer = await User.updateOne({ _id: player.id }, { score: player.score + WIN_SCORE });
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    updateScore
}