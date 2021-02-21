const urlString = window.location.href;
const url = new URL(urlString);
const playerId = url.searchParams.get('playerId');
const playerName = url.searchParams.get('playerName');
const room = url.searchParams.get('room');
const scoreLimit = url.searchParams.get('scoreLimit');

const socket = io("http://localhost:3000", {
    query: {
        playerId,
        playerName,
        room,
        scoreLimit
    }
});

const table = document.querySelector('#table');
const playerHand = document.querySelector('#playerHand');
const trumpCallDiv = document.querySelector('#trumpCall');
const trumpCardImg = document.querySelector('#trumpCard');

let playerNumber = -1;

socket.on('room-full', () => {
    console.log('Room is full');
});

socket.on('player-disconnect', () => {
    //window.location.replace('http://localhost:5000');

    console.log('Player disconnected');
});

socket.on('player-number', data => {
    playerNumber = data;
});

socket.on('game-started', () => {
    console.log('Game started');
});

socket.on('player-hand', hand => {
    createHand(hand);
});

socket.on('played-card', data => {
    if (data.player == playerNumber) {
        try {
            const cardDiv = playerHand.querySelector(`div[data-card-name="${data.card.name}"]`);
            cardDiv.remove();
        } catch (err) {
            console.log(err);
        }
    }
});

socket.on('call-trump', () => {
    trumpCallDiv.style.display = 'flex';
});

socket.on('trump-card', data => {
    const trump = data.trump;

    trumpCardImg.style.display = '';

    if (trump == 'S') {
        trumpCardImg.src = 'assets/imgs/spades.png';
    } else if (trump == 'H') {
        trumpCardImg.src = 'assets/imgs/hearts.png';
    } else if (trump == 'C') {
        trumpCardImg.src = 'assets/imgs/clubs.png';
    } else if (trump == 'D') {
        trumpCardImg.src = 'assets/imgs/diamonds.png';
    }
});

function createHand(hand) {
    playerHand.innerHTML = '';
    trumpCallDiv.style.display = 'none';

    hand.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.style.width = '18rem';
        cardDiv.setAttribute('data-card-name', card.name);

        const img = document.createElement('img');
        img.src = `assets/imgs/cards/${card.imageName}`;

        const cardBody = document.createElement('div');
        cardBody.innerText = card.imageName.split('.')[0];

        cardDiv.addEventListener('click', () => {
            socket.emit('play-card', card);
        });

        cardDiv.appendChild(img);
        cardDiv.appendChild(cardBody);

        playerHand.appendChild(cardDiv);
    });
}

function callTrump(trump) {
    socket.emit('call-trump', trump);
    trumpCallDiv.style.display = 'none';
}