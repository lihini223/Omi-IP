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
// const player1Card = document.querySelector('#player-1-card');
// const player2Card = document.querySelector('#player-2-card');
// const player3Card = document.querySelector('#player-3-card');
// const player4Card = document.querySelector('#player-4-card');
const popupDiv = document.querySelector('.popups');
const playerConnectDiv = document.querySelector('#playerConnectInner');
const trumpCallDiv = document.querySelector('#select-trumps-div');
const waitingForTrumps = document.querySelector(".waiting-for-trumps");
const gameDetails = document.querySelector('.game-details');
const fourRandomCards = document.querySelector('.four-trump-cards');
const currentTrump = document.querySelector('#trump-of-game');
const player1Cards = document.querySelector("#player-1-cards");
const playerOneMidCard = document.querySelector("#mid-card-1");
const playerTwoMidCard = document.querySelector("#mid-card-2");
const playerThreeMidCard = document.querySelector("#mid-card-3");
const playerFourMidCard = document.querySelector("#mid-card-4");
const player1Name = document.querySelector("#player-1-name");
const player2Name = document.querySelector("#player-2-name");
const player3Name = document.querySelector("#player-3-name");
const player4Name = document.querySelector("#player-4-name");


let matchNumber = 1;
let playerNumber = -1;
let playerHand = [];
let matchPlayers = [];
let firstCard = null;

socket.on('connection-error', data => {
    console.log(data);
    window.location = 'login.html';
});

// sends any errors that can occur while joining room (room full, already in the room)
socket.on('room-error', data => {
    console.log(data);
});

socket.on('new-room', data => {
    console.log(data);
});

// sends all the players currently in the room when a new player joins
socket.on('player-connect', data => {
    playerConnect(data);

    if (data.players.length == 4) {
        matchPlayers = data.players;
    }
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
});

// sends the player number and card when someone plays a card
socket.on('played-card', data => {
    if (firstCard == null) {
        firstCard = data.card;
    }
    console.log(data);
    if (data.player == playerNumber) {
        //playCard(data);
    }
    tableCard(data);
});

// your turn to call trumps
socket.on('call-trump', () => {
    waitingForTrumps.style.display = 'none';

    setTimeout(() => {
        trumpCallDiv.style.display = 'flex';
        waitingForTrumps.style.display = 'none';
        showRandomCards();
    }, 4000);
});

// sends the player number and trumps when someone calls trumps
socket.on('trump-card', data => {
    console.log(data);
    waitingForTrumps.style.display = 'none';
    popupDiv.style.display = 'none';
    trumpCard(data);
    createHand(playerHand);
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
    player1Cards.innerHTML = '';

    hand.forEach(card => {
        const img = document.createElement('img');
        img.src = `assets/imgs/cards/${card.imageName}`;



        img.addEventListener('click', () => {
            if (validateCard(card)) {
                socket.emit('play-card', card);
                playerCardMove(img, card);
            } else {
                invalidCard(img);

            }
        });

        player1Cards.appendChild(img);
    });
}

function validateCard(card) {
    if (firstCard == null) return true;

    const playedCardSymbol = card.name[0];

    if (firstCard.name[0] == playedCardSymbol) return true;

    for (let i = 0; i < playerHand.length; i++) {
        if (firstCard.name[0] == playerHand[i].name[0]) {
            return false;
        }
    }

    return true;
}

function callTrump(trump) {
    socket.emit('call-trump', trump);
    trumpCallDiv.style.display = 'none';
    popupDiv.style.display = 'none';

}

function trumpCard(data) {
    const trump = data.trump;

    if (trump == 'S') {
        currentTrump.src = 'assets/imgs/spades.png';
    } else if (trump == 'H') {
        currentTrump.src = 'assets/imgs/hearts.png';
    } else if (trump == 'C') {
        currentTrump.src = 'assets/imgs/clubs.png';
    } else if (trump == 'D') {
        currentTrump.src = 'assets/imgs/diamonds.png';
    }
}

function tableCard(data) {
    if (data.player == 1) {
        playerOneMidCard.src = `assets/imgs/cards/${data.card.imageName}`;
    } else if (data.player == 2) {
        playerTwoMidCard.src = `assets/imgs/cards/${data.card.imageName}`;
    } else if (data.player == 3) {
        playerThreeMidCard.src = `assets/imgs/cards/${data.card.imageName}`;
    } else if (data.player == 4) {
        playerFourMidCard.src = `assets/imgs/cards/${data.card.imageName}`;
    }
}

function roundWinner(data) {
    setTimeout(clearTable, 2000);
    firstCard = null;
}

function clearTable() {
    playerOneMidCard.src = '';
    playerTwoMidCard.src = '';
    playerThreeMidCard.src = '';
    playerFourMidCard.src = '';
}

function playerConnect(data) {
    console.log(data);
    const players = data.players;

    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `
        <div>
            <p><br><span>${player.playerNumber}.</span>${player.playerName}</p>
        </div>
        `;

        playerConnectDiv.appendChild(playerDiv);
    });
}

function startGame() {
    waitingForTrumps.style.display = 'none';
    playerConnectDiv.style.display = 'none';
    gameDetails.style.display = 'flex';
    gameDetails.innerText = 'Game is starting';
    setTimeout(() => {
        gameDetails.style.display = 'none';
        waitingForTrumps.style.display = 'flex';
    }, 2000);

    player1Name.innerText = matchPlayers[0].playerName;
    player2Name.innerText = matchPlayers[1].playerName;
    player3Name.innerText = matchPlayers[2].playerName;
    player4Name.innerText = matchPlayers[3].playerName;
    console.log(matchPlayers[0].playerName);

}
function showRandomCards() {
    fourRandomCards.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        const img = document.createElement('img');
        img.src = `assets/imgs/cards/${playerHand[i].imageName}`;

        fourRandomCards.appendChild(img);
    }
}

function playerCardMove(img, card) {
    let rect = img.getBoundingClientRect();


    var bodyRect = document.body.getBoundingClientRect();
    console.log(rect);
    let middleOfScreen = bodyRect.width / 2;
    let offSet = middleOfScreen - rect.x;


    img.style.transition = "transform 0.5s ease";


    img.style.transform = `translate(${offSet}px,-150%) 
                            translateX(-50%) 
                            rotate(${offSet > 0 ? '-' : ''}180deg)`;

    console.log(playerHand);
    for (let i = 0; i < playerHand.length; i++) {
        if (card.name == playerHand[i].name) {
            playerHand.pop(i);
            break;
        }
    }
    console.log(playerHand);

    setTimeout(() => {
        img.remove();
    }, 1000);

}

function invalidCard(img) {
    img.style.animation = "invalid-move 800ms ease";
}
