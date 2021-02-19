const Deck = require('./Deck');

class OmiGame {
    constructor(room, scoreLimit) {
        this.deck = new Deck();
        this.players = new Map();
        this.room = room;
        this.gameStarted = false;
        this.gameFinished = false;
        this.matchNumber = 0;
        this.scoreLimit = scoreLimit;
    }

    addPlayer(player) {
        const playerNumber = player.playerNumber;
        this.players.set(playerNumber, player);
    }

    dealCards() {
        this.deck.generateDeck();
        this.deck.shuffle();

        for (let i = 0; i < 8; i++) {
            this.players.get(1).hand.add(this.deck.deal());
            this.players.get(2).hand.add(this.deck.deal());
            this.players.get(3).hand.add(this.deck.deal());
            this.players.get(4).hand.add(this.deck.deal());
        }
    }
}

module.exports = OmiGame;