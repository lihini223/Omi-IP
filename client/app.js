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
    createHand(hand);
});

function createHand(hand) {
    hand.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.style.width = '18rem';

        const img = document.createElement('img');
        img.src = `assets/imgs/cards/${card.imageName}`;

        const cardBody = document.createElement('div');
        cardBody.innerText = card.imageName.split('.')[0];

        const btn = document.createElement('button');
        btn.classList.add('btn');
        btn.classList.add('btn-primary');
        btn.innerText = 'Play';
        btn.addEventListener('click', () => {
            socket.emit('play-card', card.name);
        });

        cardBody.appendChild(btn);

        cardDiv.appendChild(img);
        cardDiv.appendChild(cardBody);

        playerHand.appendChild(cardDiv);
    });
}

socket.emit('card-played', 'data');