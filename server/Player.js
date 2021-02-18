class Player {
    constructor(id, name, playerNumber, socketId) {
        this.id = id;
        this.name = name;
        this.playerNumber = playerNumber;
        this.socketId = socketId;
        this.hand = new Set();
    }

    playCard() {
        console.log('play');
    }
}

module.exports = Player;