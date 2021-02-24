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
const player1Card = document.querySelector('#player-1-card');
const player2Card = document.querySelector('#player-2-card');
const player3Card = document.querySelector('#player-3-card');
const player4Card = document.querySelector('#player-4-card');

let playerNumber = -1;

socket.on('room-error', data => {
    console.log(data);
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
    console.log(data);
    if (data.player == playerNumber) {
        playCard(data);
    }
    tableCard(data);
});

socket.on('call-trump', () => {
    trumpCallDiv.style.display = 'flex';
});

socket.on('trump-card', data => {
    console.log(data);
    trumpCard(data);
});

socket.on('round-winner', data => {
    console.log(data);
    roundWinner(data);
});

socket.on('match-winner', data => {
    console.log(data);
});

socket.on('match-scores', data => {
    console.log(data);
});

socket.on('game-finished', data => {
    console.log(data);
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

function playCard(data) {
    try {
        const cardDiv = playerHand.querySelector(`div[data-card-name="${data.card.name}"]`);
        cardDiv.remove();
    } catch (err) {
        console.log(err);
    }
}

function trumpCard(data) {
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
}

function tableCard(data) {
    if (data.player == 1) {
        player1Card.src = `assets/imgs/cards/${data.card.imageName}`;
    } else if (data.player == 2) {
        player2Card.src = `assets/imgs/cards/${data.card.imageName}`;
    } else if (data.player == 3) {
        player3Card.src = `assets/imgs/cards/${data.card.imageName}`;
    } else if (data.player == 4) {
        player4Card.src = `assets/imgs/cards/${data.card.imageName}`;
    }
}

function roundWinner(data) {
    setTimeout(clearTable, 1000);
}

function clearTable() {
    player1Card.src = '';
    player2Card.src = '';
    player3Card.src = '';
    player4Card.src = '';
}