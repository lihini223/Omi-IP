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
        this.teamOneScore = 0; // total game score
        this.teamTwoScore = 0;
        this.tieMatches = 0;
        this.teamOnePoints = 0; // current match points
        this.teamTwoPoints = 0;
        this.trumpCaller = 0;
        this.winner = null;
    }

    addPlayer(player) {
        const playerNumber = player.playerNumber;
        this.players.set(playerNumber, player);
    }

    getPlayers() {
        const players = [];
        this.players.forEach(player => {
            players.push({
                playerName: player.name,
                playerNumber: player.playerNumber
            });
        });

        return players;
    }

    startGame() {
        this.gameStarted = true;
        this.matchNumber = 1;
        this.currentPlayer = 1;
        this.currentRoundFirstPlayer = 1;

        //this.newMatch();
    }

    newMatch() {
        this.dealCards();

        this.teamOnePoints = 0;
        this.teamTwoPoints = 0;
        this.trump = null;

        this.trumpCaller += 1;
        if (this.trumpCaller > 4) {
            this.trumpCaller = 1;
        }

        this.currentPlayer = this.trumpCaller;
    }

    dealCards() {
        this.deck.generateDeck();
        this.deck.shuffle();

        // deal 8 cards to each player
        this.players.forEach(player => {
            player.hand.clear();

            for (let i = 0; i < 8; i++) {
                const card = this.deck.deal();
                player.hand.set(card.name, card);
            }
            player.initializePlayer();
        });
    }

    playCard(card) {
        // check if trump is called before playing
        if (!this.trump) return;

        const player = this.players.get(this.currentPlayer);

        if (player.validateCard(card, this.table[this.currentRoundFirstPlayer - 1]) && player.playCard(card)) {
            // if table is empty, current player is first player of that round
            if (!this.table[0] && !this.table[1] && !this.table[2] && !this.table[3]) {
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
        const trumps = new Set(['S', 'H', 'C', 'D']);
        
        /*if (trump == 'S' || trump == 'H' || trump == 'C' || trump == 'D') {
            this.trump = trump;
            return true;
        }*/

        if (trumps.has(trump)) {
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
            const currentCardSuit = this.table[i].slice(0, 1);
            const currentCardValue = parseInt(this.table[i].slice(1));

            // check if current card is a trump and round winning card is not a trump
            if (currentCardSuit == this.trump && currentRoundWinnerCard.slice(0, 1) != this.trump) {
                currentRoundWinnerCard = this.table[i];
                currentRoundWinner = i;
            }

            // check if current card is higher than the round winning card
            if (currentCardSuit == currentRoundWinnerCard.slice(0, 1) && currentCardValue > parseInt(currentRoundWinnerCard.slice(1))) {
                currentRoundWinnerCard = this.table[i];
                currentRoundWinner = i;
            }

            i++;
        }

        this.clearTable();

        // +1 due to currentRoundWinner representing array position
        this.currentPlayer = currentRoundWinner + 1;
        
        return currentRoundWinner + 1;
    }

    clearTable() {
        this.table = [null, null, null, null];
    }

    addPoints(team, points) {
        if (team == 1) {
            this.teamOnePoints += points;
        } else if (team == 2) {
            this.teamTwoPoints += points;
        }
    }

    addScore(team, score) {
        if (team == 1) {
            this.teamOneScore += score;
        } else if (team == 2) {
            this.teamTwoScore += score;
        }
    }

    gameState() {
        return {
            teamOneScore: this.teamOneScore,
            teamTwoScore: this.teamTwoScore,
            currentRoundFirstPlayer: this.currentRoundFirstPlayer,
            table: this.table
        }
    }

    endGame() {
        this.gameFinished = true;

        if (this.teamOneScore > this.teamTwoScore) {
            this.winner = 1;
        } else if (this.teamTwoScore > this.teamOneScore) {
            this.winner = 2;
        }
    }
}

module.exports = OmiGame;