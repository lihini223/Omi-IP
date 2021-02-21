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
        this.trump = null;
        this.table = [null, null, null, null];
        this.currentRoundFirstPlayer = -1;
    }

    addPlayer(player) {
        const playerNumber = player.playerNumber;
        this.players.set(playerNumber, player);
    }

    startGame() {
        this.gameStarted = true;
        this.matchNumber = 1;
        this.currentPlayer = 1;
        this.currentRoundFirstPlayer = 1;

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
            // if table is empty, current player is first player of that round
            if (this.table[0] && this.table[1] && this.table[2] && this.table[3]) {
                this.currentRoundFirstPlayer = this.currentPlayer;
            }

            // put card in player position
            this.table[this.currentPlayer - 1] = card;
            
            this.currentPlayer += 1;
            if (this.currentPlayer > 4) {
                this.currentPlayer = 1;
            }

            return true;
        }

        return false;
    }

    callTrump(trump) {
        if (trump == 'S' || trump == 'H' || trump == 'C' || trump == 'D') {
            this.trump = trump;
            return true;
        }

        return false;
    }

    roundWinner() {
        // -1 due to array indexing, player 1 will be 0 in array
        let currentRoundWinner = this.currentRoundFirstPlayer - 1;
        let currentRoundWinnerCard = this.table[this.currentRoundFirstPlayer - 1];

        let i = 0;
        while (i < 4) {
            // check if current card is a trump and round winning card is not a trump
            if (this.table[i].suit == this.trump && currentRoundWinnerCard.suit != this.trump) {
                currentRoundWinnerCard = this.table[i];
                currentRoundWinner = i;
            }

            // check if current card is higher than the round winning card
            if (this.table[i].suit == currentRoundWinnerCard.suit && this.table[i].value > currentRoundWinnerCard.value) {
                currentRoundWinnerCard = this.table[i];
                currentRoundWinner = i;
            }
        }

        this.clearTable();

        return currentRoundWinner + 1;
    }

    clearTable() {
        this.table = [null, null, null, null];
    }
}

module.exports = OmiGame;