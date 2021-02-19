const express = require('express');

const router = express.Router();

router.post('/join', (req, res) => {
    let { playerId, playerName, room, scoreLimit } = req.body;

    playerId = encodeURIComponent(playerId);
    playerName = encodeURIComponent(playerName);
    room = encodeURIComponent(room);
    scoreLimit = encodeURIComponent(scoreLimit);

    res.redirect(`http://localhost:5000/omi?playerId=${playerId}&playerName=${playerName}&room=${room}&scoreLimit=${scoreLimit}`);
});

module.exports = router;