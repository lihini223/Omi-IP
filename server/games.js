const Player = require('./Player');
const OmiGame = require('./OmiGame');

const games = new Map();

module.exports = (io) => {
    io.on('connection', socket => {
        const room = socket.handshake.query.room;

        const { playerId, playerName } = socket.handshake.query;

        let scoreLimit = parseInt(socket.handshake.query.scoreLimit);
        
        // check if room exists
        if (io.sockets.adapter.rooms.get(room)) {
            if (!games.get(room)) return;

            if (games.get(room).gameStarted == false && io.sockets.adapter.rooms.get(room).size < 4) {
                socket.join(room);

                const playerNumber = io.sockets.adapter.rooms.get(room).size;
                const player = new Player(playerId, playerName, playerNumber, socket.id);
                socket.emit('player-number', playerNumber);
                games.get(room).addPlayer(player);
                
            } else {
                socket.emit('room-full');
            }

            // start game if 4 players join a room
            if (games.get(room).players.size == 4) {
                startNewOmiGame(io, room);
            }
        } else {
            // create a new room
            socket.join(room);

            if (!scoreLimit || isNaN(scoreLimit) || scoreLimit < 2 || scoreLimit > 10) {
                scoreLimit = 10;
            }

            games.set(room, new OmiGame(room, scoreLimit));

            // first player will be player 1
            const player = new Player(playerId, playerName, 1, socket.id);
            socket.emit('player-number', 1);
            games.get(room).addPlayer(player);
        }

        socket.on('play-card', card => {
            playCard(io, socket.id, room, card);
        });

        socket.on('call-trump', trump => {
            callTrump(io, socket.id, room, trump);
        });

        // player disconnect
        socket.on('disconnect', () => {
            if (!games.get(room)) return;

            // player left before the game started
            if (games.get(room).gameStarted == false) {
                io.to(room).emit('player-left', 'Player left');
                return;
            }

            // send a player disconnect event if game is started
            for (let i = 1; i <= games.get(room).players.size; i++) {
                if (games.get(room).players.get(i).socketId == socket.id) {
                    io.to(room).emit('player-disconnect');
                    games.delete(room);
                    return;
                }
            }
        });
    });
}

function startNewOmiGame(io, room) {
    io.to(room).emit('game-started');

    const game = games.get(room);

    game.startGame();
    
    newMatch(io, room, game);
}

function newMatch(io, room, game) {
    for (let i = 1; i <= 4; i++) {
        const socketId = game.players.get(i).socketId;
        const playerHand = game.players.get(i).hand;
        
        io.to(socketId).emit('player-hand', Array.from(playerHand.values()));

        if (getPlayerNumber(game.players, socketId) == game.currentPlayer) {
            io.to(socketId).emit('call-trump');
        }
    }
}

function playCard(io, socketId, room, card) {
    const game = games.get(room);

    const playerNumber = getPlayerNumber(game.players, socketId);

    // check if player is the current player
    if (playerNumber == game.currentPlayer) {
        const playedCard = game.playCard(card.name);

        if (playedCard) {
            io.to(room).emit('played-card', { player: playerNumber, card });
        }
    }
}

function callTrump(io, socketId, room, trump) {
    const game = games.get(room);

    const playerNumber = getPlayerNumber(game.players, socketId);

    if (playerNumber == game.currentPlayer && game.trump == null) {
        const calledTrump = game.callTrump(trump);

        if (calledTrump) {
            io.to(room).emit('trump-card', { trump });
        }
    }
}

function getPlayerNumber(players, socketId) {
    for (let [playerNumber, player] of players.entries()) {
        if (player.socketId == socketId) {
            return playerNumber;
        }
    }
}

/*const Deck = require('./Deck');

let deck = new Deck();

let player1Hand = [];
let player2Hand = [];
let player3Hand = [];
let player4Hand = [];

let connections = [null, null, null, null];
let playerCards = [null, null, null, null]; // current cards on the table
let playerTurn = 0; // current player turn
let trump = 0; // trump card of that hand
let trumpCall = 0; // player who calls trump
let team1Points = 0; // team 1 rounds won
let team2Points = 0; // team 2 rounds won
let team1Score = 0; // team 1 kata kola
let team2Score = 0; // team 2 kata kola
let ties = 0; // tie rounds of that hand
let firstPlayer = 0; // first player of that round

io.on('connection', socket => {
    let playerIndex = -1; //assign player number
    for(const i in connections){
        if(connections[i] == null){
            playerIndex = i;
            break;
        }
    }

    connections[playerIndex] = false;

    socket.emit('player-number', playerIndex); // send player index number
    console.log(`Player ${playerIndex} has connected`);

    if(playerIndex == -1) return; // return out of function if server is full

    socket.broadcast.emit('player-connection', playerIndex); // send new player join

    // start game if 4 players join
    if(connections[0] != null && connections[1] != null && connections[2] != null && connections[3] != null){
        startGame();
        io.emit('start-game', 'Game started');
    }

    // listen for trump call
    socket.on('trump-called', data => {
        trump = data;
        console.log(trump);
        io.emit('current-trump', trump);
    });
    
    playerTurn = trumpCall;

    // listen for cards played
    socket.on('card-played', data => {
        // get played card suit and card value
        const playerCard = { suit: parseInt(data.card[0]), value: parseInt(data.card.substring(1)) };

        // check if player is first player of that round
        if(playerCards[0] == null && playerCards[1] == null && playerCards[2] == null && playerCards[3] == null){
            firstPlayer = playerIndex;
        }

        playerCards[playerIndex] = playerCard;

        playerTurn++;
        if(playerTurn == 4){
            playerTurn = 0;
        }

        // send current player turn
        io.emit('player-turn', playerTurn);

        // send current table cards
        io.emit('table-card', { player: playerIndex, card: data });

        // check winner
        if(playerCards[0] != null && playerCards[1] != null && playerCards[2] != null && playerCards[3] != null){
            const winner = roundWinner(playerCards, trump, firstPlayer);
            playerCards = [null, null, null, null];
            console.log(winner);
            io.emit('round-winner', winner);
            if(winner == 0 || winner == 2){
                team1Points++;
            }
            else{
                team2Points++;
            }
            playerTurn = winner;
            io.emit('player-turn', playerTurn);
            if((team1Points + team2Points) == 8){
                if(team1Points > team2Points){
                    team1Score++;
                    io.emit('team1-score', team1Score);
                }
                else if(team2Points > team1Points){
                    team2Score++;
                    io.emit('team2-score', team2Score);
                }
                else{
                    ties++;
                }

                if(team1Score >= 10){
                    io.emit('game-finish', 'Team 1');
                }
                else if(team2Score >= 10){
                    io.emit('game-finish', 'Team 2');
                }
                else{
                    newRound();
                }
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`Player ${playerIndex} has disconnected`);
        connections[playerIndex] = null; // remove player from server
        //socket.broadcast.emit('player-connection', playerIndex);
    });
});

function startGame(){
    // reset all variables
    player1Hand = [];
    player2Hand = [];
    player3Hand = [];
    player4Hand = [];
    playerCards = [null, null, null, null];
    playerTurn = 0;
    trumpCall = 0;
    team1Points = 0; 
    team2Points = 0; 
    team1Score = 0; 
    team2Score = 0; 
    ties = 0;
    firstPlayer = 0;

    deck.generateDeck(); // generate deck
    deck.shuffle();

    dealCards(); // deal cards to players

    // send cards to players
    io.emit('player1-hand', player1Hand);
    io.emit('player2-hand', player2Hand);
    io.emit('player3-hand', player3Hand);
    io.emit('player4-hand', player4Hand);

    // initial player turn
    io.emit('player-turn', playerTurn);

    // trump call
    io.emit('trump-call', trumpCall);
}

function newRound(){
    team1Points = 0;
    team2Points = 0;

    deck.generateDeck();
    deck.shuffle();

    player1Hand = [];
    player2Hand = [];
    player3Hand = [];
    player4Hand = [];

    dealCards();

    io.emit('player1-hand', player1Hand);
    io.emit('player2-hand', player2Hand);
    io.emit('player3-hand', player3Hand);
    io.emit('player4-hand', player4Hand);
        
    trumpCall++;
    if(trumpCall == 4){
        trumpCall = 0;
    }
    io.emit('trump-call', trumpCall);

    playerTurn = trumpCall;
    if(playerTurn == 4){
        playerTurn = 0;
    }
    io.emit('player-turn', playerTurn);
}

function dealCards(){
    for(let i = 0; i < 8; i++){
        player1Hand.push(deck.deal());
        player2Hand.push(deck.deal());
        player3Hand.push(deck.deal());
        player4Hand.push(deck.deal());
    }
}

function roundWinner(cards, tCard, fCardPlayer){
    let playerCards = cards;
    let trumpCard = tCard;
    let firstCardPlayer = fCardPlayer;
    let highestCard = playerCards[firstCardPlayer];
    let highestCardPlayer = fCardPlayer;
    
    let i = 0;
    while(i < 4){
        //if(cards[i] != highestCard){
            if(cards[i].suit == trumpCard && highestCard.suit != trumpCard){ //check if current card is a trump card and if highest card is not a trump card
                highestCard = cards[i];
                highestCardPlayer = i;
            }
            if(cards[i].suit == highestCard.suit && cards[i].value > highestCard.value){ //check if current card is higher than highest card
                highestCard = cards[i];
                highestCardPlayer = i;
            }
        //}

        i++;
    }

    return highestCardPlayer;
}*/