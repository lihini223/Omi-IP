class Player {
    constructor(id, name, playerNumber, socketId) {
        this.id = id;
        this.name = name;
        this.playerNumber = playerNumber;
        this.socketId = socketId;
        this.hand = new Map();
    }

    playCard(card) {
        if (this.hand.has(card)) {
            this.hand.delete(card);

            return true;
        }

        return false;
    }
}

module.exports = Player;