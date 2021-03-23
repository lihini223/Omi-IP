/*const urlString = window.location.href;
const url = new URL(urlString);
const room = url.searchParams.get('room');
const scoreLimit = url.searchParams.get('scoreLimit');*/

function getToken() {
    const name = 'omi-token' + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
}

function getRoom() {
    const name = 'omi-room' + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            console.log(c.substring(name.length, c.length));
            console.log(typeof c.substring(name.length, c.length));
            return c.substring(name.length, c.length);
        }
    }

    return "";
}


const socket = io("http://localhost:3000", {
    query: {
        token: getToken(),
        room: getRoom(),
        scoreLimit: 10
    }
});

const table = document.querySelector('#table');

const trumpCardImg = document.querySelector('#trumpCard');
const player1Card = document.querySelector('#player-1-card');
const player2Card = document.querySelector('#player-2-card');
const player3Card = document.querySelector('#player-3-card');
const player4Card = document.querySelector('#player-4-card');
const popupDiv = document.querySelector('.popups');
const playerConnectDiv = document.querySelector('#playerConnectInner');
const trumpCallDiv = document.querySelector('#select-trumps-div');
const waitingForTrumps = document.querySelector(".waiting-for-trumps");
const gameDetails = document.querySelector('.game-details');
const fourRandomCards = document.querySelector('.four-trump-cards');

let matchNumber = 1;
let playerNumber = -1;
let playerHand = [];

socket.on('connection-error', data => {
    console.log(data);
    window.location = 'login.html';
});

socket.on('new-room', data => {
    console.log(data);
});

// sends any errors that can occur while joining room (room full, already in the room)
socket.on('room-error', data => {
    console.log(data);
});

// sends all the players currently in the room when a new player joins
socket.on('player-connect', data => {
    playerConnect(data);
});

socket.on('player-disconnect', () => {
    //window.location.replace('http://localhost:5000');

    console.log('Player disconnected');
});

// sends current players number when player joins
socket.on('player-number', data => {
    playerNumber = data;
});

socket.on('game-started', () => {
    startGame();
});

// sends the players cards when at the start of each match
socket.on('player-hand', hand => {
    playerHand = hand;
    waitingForTrumps.style.display = "flex";

});

// sends the player number and card when someone plays a card
socket.on('played-card', data => {
    console.log(data);
    if (data.player == playerNumber) {
        playCard(data);
    }
    tableCard(data);
});

// your turn to call trumps
socket.on('call-trump', () => {
    trumpCallDiv.style.display = 'flex';
    waitingForTrumps.style.display = 'none';
    showRandomCards();
});

// sends the player number and trumps when someone calls trumps
socket.on('trump-card', data => {
    console.log(data);
    trumpCard(data);
});

// sends the player who won the current round and current points (when 4 cards are on the table)
socket.on('round-winner', data => {
    console.log(data);
    roundWinner(data);
});

// sends the winner of the current match at the end
socket.on('match-winner', data => {
    console.log(data);
});

// sends the current scores of the players at the end of the match
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
    popupDiv.style.display = 'none';

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

function playerConnect(data) {
    console.log(data);
    const players = data.players;

    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `
        <div>
            <p><span>${player.playerNumber}.</span>${player.playerName}</p>
        </div>
        `;

        playerConnectDiv.appendChild(playerDiv);
    });
}

function startGame() {
    playerConnectDiv.style.display = 'none';
    gameDetails.style.display = 'flex';
    gameDetails.innerText = 'Game is starting';
    setTimeout(() => {
        gameDetails.style.display = 'none';
    }, 4000);


}
function showRandomCards() {
    for (let i = 0; i < 4; i++) {
        const img = document.createElement('img');
        img.src = `assets/imgs/cards/${playerHand[i].imageName}`;

        fourRandomCards.appendChild(img);
    }
}