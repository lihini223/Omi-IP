class Player {
    constructor(id, name, playerNumber, socketId) {
        this.id = id;
        this.name = name;
        this.playerNumber = playerNumber;
        this.socketId = socketId;
        this.hand = new Map();
        this.handSuits = new Set();
    }

    initializePlayer() {
        this.updateSuits();
    }

    playCard(card) {
        if (this.hand.has(card)) {
            this.hand.delete(card);

            this.updateSuits();

            return true;
        }

        return false;
    }

    updateSuits() {
        this.handSuits.clear();

        for (const card of this.hand.keys()) {
            this.handSuits.add(card.slice(0, 1));
        }
    }

    validateCard(card, firstCard) {
        // player is the first player
        if (!firstCard) return true;

        // player has first card suit and trying to put another suit
        if ((card.slice(0, 1) != firstCard.slice(0, 1)) && this.handSuits.has(firstCard.slice(0, 1))) return false;

        return true;
    }
}

module.exports = Player;