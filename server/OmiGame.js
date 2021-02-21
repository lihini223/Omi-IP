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
        this.currentPlayer = -1;
        this.trump = -1;
        this.table = [null, null, null, null];
    }

    addPlayer(player) {
        const playerNumber = player.playerNumber;
        this.players.set(playerNumber, player);
    }

    startGame() {
        this.gameStarted = true;
        this.matchNumber = 1;
        this.currentPlayer = 1;

        this.dealCards();
    }

    dealCards() {
        this.deck.generateDeck();
        this.deck.shuffle();

        // deal 8 cards to each player
        for (let i = 1; i <= 4; i++) {
            for (let j = 0; j < 8; j++) {
                const card = this.deck.deal();
                this.players.get(i).hand.set(card.name, card);
            }
        }
    }

    playCard(card) {
        if (this.players.get(this.currentPlayer).playCard(card)) {
            this.table[this.currentPlayer - 1] = card;
            
            this.currentPlayer += 1;
            if (this.currentPlayer > 4) {
                this.currentPlayer = 1;
            }

            return true;
        }

        return false;
    }
}

module.exports = OmiGame;