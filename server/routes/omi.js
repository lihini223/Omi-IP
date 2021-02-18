const express = require('express');

const router = express.Router();

router.post('/join', (req, res) => {
    let { playerId, playerName, room } = req.body;

    playerId = encodeURIComponent(playerId);
    playerName = encodeURIComponent(playerName);
    room = encodeURIComponent(room);

    res.redirect(`http://localhost:5000/omi?playerId=${playerId}&playerName=${playerName}&room=${room}`);
});

module.exports = router;