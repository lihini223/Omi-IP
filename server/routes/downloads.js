const express = require('express');

const router = express.Router();

router.get('/omi', (req, res) => {
    res.download('downloads/spades.png');
});

module.exports = router;