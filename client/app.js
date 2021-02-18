const urlString = window.location.href;
const url = new URL(urlString);
const playerId = url.searchParams.get('playerId');
const playerName = url.searchParams.get('playerName');
const room = url.searchParams.get('room');

const socket = io("http://localhost:3000", {
    query: {
        playerId,
        playerName,
        room
    }
});

const table = document.querySelector('#table');
const hand = document.querySelector('#hand');

socket.on('room-full', () => {
    console.log('Room is full');
});

socket.on('player-disconnect', () => {
    console.log('Player disconnected');
});

socket.on('game-started', () => {
    console.log('Game started');
});

socket.on('player-hand', hand => {
    console.log(hand);
    console.log(typeof hand);
});

socket.emit('card-played', 'data');