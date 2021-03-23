const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

const User = require('../models/User');
const { validateSocket } = require('../config/auth');

const OmiGame = require('./omi/OmiGame');
const Player = require('./omi/Player');

const games = new Map();

module.exports = (io) => {
    // validate socket connection before connecting client to games
    /*io.use((socket, next) => {
        if (validateSocket(socket)) {
            return next();
        }

        return next(new Error('Error authenticating user.'));
    });*/

    io.on('connection', async (socket) => {
        try {
            if (validateSocket(socket)) {
                const userTokenData = jwt.verify(socket.handshake.query.token, process.env.JWT_TOKEN);

                const user = await User.findOne({ _id: userTokenData.dbId });
            
                if (user.username == userTokenData.username) {
                    clientConnect(io, socket, user);
                }
            } else {
                socket.emit('connection-error', { error: 'Invalid token' });
            }
        } catch (err) {
            socket.emit('connection-error', { error: 'Connection error' });
            console.log(err);
        }
    });
}

function clientConnect(io, socket, user) {
    const playerId = user._id;
    const playerName = user.username;

    let room = socket.handshake.query.room;
    let scoreLimit = parseInt(socket.handshake.query.scoreLimit);
    
    // check if room exists
    if (io.sockets.adapter.rooms.get(room)) {
        if (!games.get(room)) return;

        if (games.get(room).gameStarted == false && io.sockets.adapter.rooms.get(room).size < 4) {
            // check if player is already in the room
            for (const player of games.get(room).players.values()) {
                if (playerId == player.id) {
                    socket.emit('room-error', { messsage: 'Player already in the room '});
                    return;
                }
            }

            socket.join(room);

            const playerNumber = io.sockets.adapter.rooms.get(room).size;
            const player = new Player(playerId, playerName, playerNumber, socket.id);
            socket.emit('player-number', playerNumber);
            games.get(room).addPlayer(player);
            io.to(room).emit('player-connect', { players: games.get(room).getPlayers() });

            // start game if 4 players join a room
            if (games.get(room).players.size == 4) {
                startNewOmiGame(io, room);
            }
        } else {
            socket.emit('room-error', { message: 'Room is full' });
        }
    } else {
        // create a new room if no room id is sent
        if (room == '') {
            room = nanoid(5);
            socket.emit('new-room', { roomId: room });
            socket.join(room);

            if (!scoreLimit || isNaN(scoreLimit) || scoreLimit < 2 || scoreLimit > 10) {
                scoreLimit = 10;
            }

            // create a new omi game and add to games list
            games.set(room, new OmiGame(room, scoreLimit));

            // first player will be player 1
            const player = new Player(playerId, playerName, 1, socket.id);
            socket.emit('player-number', 1);
            games.get(room).addPlayer(player);
            io.to(room).emit('player-connect', { players: games.get(room).getPlayers() });
        } else {
            socket.emit('room-error', { message: 'Invalid room ID' });
        }
    }

    socket.on('play-card', card => {
        playCard(io, socket.id, room, card);
    });

    socket.on('call-trump', trump => {
        callTrump(io, socket.id, room, trump);
    });

    // player disconnect
    socket.on('disconnect', () => {
        clientDisconnect(io, socket, room);
    });
}

function clientDisconnect(io, socket, room) {
    if (!games.get(room)) return;

    // player left before the game started
    /*if (games.get(room).gameStarted == false) {
        io.to(room).emit('player-left', 'Player left');
        return;
    }*/

    // send a player disconnect event if game is started
    for (let i = 1; i <= games.get(room).players.size; i++) {
        if (games.get(room).players.get(i).socketId == socket.id) {
            io.to(room).emit('player-disconnect');
            games.delete(room);
            return;
        }
    }
}

function startNewOmiGame(io, room) {
    io.to(room).emit('game-started');

    const game = games.get(room);

    game.startGame();
    
    newMatch(io, room, game);
}

function newMatch(io, room, game) {
    game.newMatch();
    
    for (let i = 1; i <= 4; i++) {
        const socketId = game.players.get(i).socketId;
        const playerHand = game.players.get(i).hand;
        
        io.to(socketId).emit('player-hand', Array.from(playerHand.values()));

        if (getPlayerNumber(game.players, socketId) == game.trumpCaller) {
            io.to(socketId).emit('call-trump');
        }
    }
}

function playCard(io, socketId, room, card) {
    const game = games.get(room);

    if (!game) return;

    const playerNumber = getPlayerNumber(game.players, socketId);

    // check if player is the current player
    if (playerNumber == game.currentPlayer) {
        const playedCard = game.playCard(card.name);

        if (playedCard) {
            io.to(room).emit('played-card', { player: playerNumber, card });

            if (game.table[0] && game.table[1] && game.table[2] && game.table[3]) {
                roundWinner(io, room, game);
            }
        }
    }
}

function callTrump(io, socketId, room, trump) {
    const game = games.get(room);

    if (!game) return;

    const playerNumber = getPlayerNumber(game.players, socketId);

    if (playerNumber == game.trumpCaller && game.trump == null) {
        const calledTrump = game.callTrump(trump);

        if (calledTrump) {
            io.to(room).emit('trump-card', { player: playerNumber, trump });
        }
    }
}

function roundWinner(io, room, game) {
    const currentRoundWinner = game.roundWinner();

    if (currentRoundWinner == 1 || currentRoundWinner == 3) {
        game.addPoints(1, 1);
    } else if (currentRoundWinner == 2 || currentRoundWinner == 4) {
        game.addPoints(2, 1);
    }

    // send current game state
    io.to(room).emit('round-winner', {
        roundWinner: currentRoundWinner,
        teamOnePoints: game.teamOnePoints,
        teamTwoPoints: game.teamTwoPoints
    });

    if ((game.teamOnePoints + game.teamTwoPoints) >= 8) {
        if (game.teamOnePoints > game.teamTwoPoints) {
            game.addScore(1, 1);
            io.to(room).emit('match-winner', { matchWinner: 'Team 1' });
        } else if (game.teamTwoPoints > game.teamOnePoints) {
            game.addScore(2, 1);
            io.to(room).emit('match-winner', { matchWinner: 'Team 2' });
        } else {
            game.tieMatches += 1;
            io.to(room).emit('match-winner', { matchWinner: 'Tie Match' });
        }

        // send match scores
        io.to(room).emit('match-scores', {
            teamOneScore: game.teamOneScore,
            teamTwoScore: game.teamTwoScore,
            ties: game.tieMatches
        });

        // start next match or end game
        if (game.teamOneScore >= game.scoreLimit || game.teamTwoScore >= game.scoreLimit) {
            endGame(io, room, game);
        } else {
            newMatch(io, room, game);
        }
    }
}

function endGame(io, room, game) {
    game.endGame();

    io.to(room).emit('game-finished', { gameWinner: game.winner });
}

// helper function to get player number of socket
function getPlayerNumber(players, socketId) {
    for (let [playerNumber, player] of players.entries()) {
        if (player.socketId == socketId) {
            return playerNumber;
        }
    }
}