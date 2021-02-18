const Deck = require('./Deck');

class OmiGame {
    constructor(room) {
        this.deck = new Deck();
        this.deck.generateDeck();
        this.players = new Map();
        this.room = room;
        this.gameStarted = false;
        this.gameFinished = false;
        this.matchNumber = 0;
    }

    addPlayer(player) {
        const playerNumber = player.playerNumber;
        this.players.set(playerNumber, player);

        if (this.players.size == 4) {
            this.gameStarted = true;
        }
    }
}

module.exports = OmiGame;