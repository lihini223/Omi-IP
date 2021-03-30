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
const opponent1Hand = document.querySelector("#opponent-1-hand");
const opponent2Hand = document.querySelector("#opponent-2-hand");
const teammateHand = document.querySelector("#teammate-hand");
const inviteYourFriends = document.querySelector("#invite-your-friends");

let matchNumber = 1;
let playerNumber = -1;
let playerHand = [];
let matchPlayers = [];
let firstCard = null;
let currentPlayer = 1;
let tableCards = [];

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
    inviteYourFriends.style.display = "flex";
    inviteYourFriends.innerHTML = `Room ID : <span>${data.roomId}</span>`
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
    console.log(data);
});

socket.on('game-started', () => {
    startGame();
});

// sends the players cards when at the start of each match
socket.on('player-hand', hand => {
    playerHand = hand;

    createHands();
});

// sends the player number and card when someone plays a card
socket.on('played-card', data => {
    currentPlayer = data.player + 1;
    if (currentPlayer > 4) {
        currentPlayer = 1;
    }
    if (firstCard == null) {
        firstCard = data.card;
    }
    console.log(data);
    if (data.player == playerNumber) {
        //playCard(data);
    }
    otherCardMove(getRelativePlayerNumber(playerNumber, data.player), data.card.imageName.replace('.png', ''));
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
    currentPlayer = data.player;
    waitingForTrumps.style.display = 'none';
    popupDiv.style.display = 'none';
    trumpCard(data);
    createHand(playerHand);
});

// sends the player who won the current round and current points (when 4 cards are on the table)
socket.on('round-winner', data => {
    currentPlayer = data.roundWinner;
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

            if (playerNumber == currentPlayer) {
                if (validateCard(card)) {
                    socket.emit('play-card', card);
                    tableCards.push(img);
                    playerCardMove(img, card);
                } else {
                    invalidCard(img);
                }
            }
            else {
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

function roundWinner(data) {
    firstCard = null;
    let bodyRect = document.body.getBoundingClientRect();

    let relativeRoundWinner = getRelativePlayerNumber(playerNumber, data.roundWinner);

    setTimeout(() => {
        if (relativeRoundWinner == 1) {
            for (let i = 0; i < 4; i++) {
                tableCards[i].style.transform = `translateY(${bodyRect.height}px)`;
            }
        } else if (relativeRoundWinner == 2) {
            for (let i = 0; i < 4; i++) {
                tableCards[i].style.transform = `translateX(${bodyRect.width}px)`;
            }
    
        } else if (relativeRoundWinner == 3) {
            for (let i = 0; i < 4; i++) {
                tableCards[i].style.transform = `translateY(-${bodyRect.height}px)`;
            }
    
        } else if (relativeRoundWinner == 4) {
            for (let i = 0; i < 4; i++) {
                tableCards[i].style.transform = `translateX(-${bodyRect.width}px)`;
            }
        }
    }, 2000);

    setTimeout(() => {
        tableCards = [];
        console.log(tableCards);
    }, 3000);

    console.log(tableCards);
}

function playerConnect(data) {
    playerConnectDiv.innerHTML = '';
    console.log(data);
    const players = data.players;

    players.forEach(player => {

        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `
        <div>
            <span>${player.playerNumber}.</span>${player.playerName}<br>
        </div>
        `;

        playerConnectDiv.appendChild(playerDiv);
    });
}

function startGame() {
    waitingForTrumps.style.display = 'none';
    playerConnectDiv.style.display = 'none';
    document.querySelector("#wating-for-players").style.display = 'none';
    gameDetails.style.display = 'flex';
    gameDetails.innerText = 'Game is starting';
    setTimeout(() => {
        gameDetails.style.display = 'none';
        inviteYourFriends.style.display = 'none';
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
    let bodyRect = document.body.getBoundingClientRect();
    let middleOfScreen = bodyRect.width / 2;
    let offSet = middleOfScreen - rect.x;

    img.style.transition = "transform 0.5s ease";

    img.style.transform = `translate(${offSet}px,-150%) 
                            translateX(-50%) scale(1.2)
                            rotate(${offSet > 0 ? '-' : ''}180deg)`;

    console.log(playerHand);
    for (let i = 0; i < playerHand.length; i++) {
        if (card.name == playerHand[i].name) {
            playerHand.pop(i);
            break;
        }
    }
    console.log(playerHand);
}

function invalidCard(img) {
    img.style.animation = "invalid-move 800ms ease";

    setTimeout(() => {
        img.style.animation = "none";
    }, 800)
}

function offSetX(playerCard) {
    let rect = playerCard.getBoundingClientRect();
    let bodyRect = document.body.getBoundingClientRect();
    let middleOfScreenX = bodyRect.width / 2;
    let offSetX = middleOfScreenX - rect.x;

    return offSetX;
}

function offSetY(playerCard) {
    let rect = playerCard.getBoundingClientRect();
    let bodyRect = document.body.getBoundingClientRect();
    let middleOfScreenY = bodyRect.height / 2;
    let offSetY = middleOfScreenY - rect.y;
    return offSetY;
}

function otherCardMove(player, card) {
    if (player == 1) return;

    let playerCard;
    let cardNumber = card;
    let playerPositionX;

    if (player == 2) {
        playerCard = opponent1Hand.children[Math.floor(Math.random() * opponent1Hand.children.length)];
        playerPositionX = offSetX(playerCard) - offSetX(playerCard) * 0.4;
        playerCard.style.transition = "transform 0.5s linear 0s";
        playerCard.style.transform = `translatey(${offSetY(playerCard)}px) translatex(${playerPositionX}px) rotateX(180deg) rotateY(180deg) rotateZ(0deg)`;
        setTimeout(() => {
            playerCard.src = "assets/imgs/cards/" + cardNumber + ".png";
        }, 250);

    } else if (player == 3) {
        playerCard = teammateHand.children[Math.floor(Math.random() * teammateHand.children.length)];
        console.log(playerCard)

        let rect = playerCard.getBoundingClientRect();
        let bodyRect = document.body.getBoundingClientRect();

        let middleOfScreen = bodyRect.width / 2;
        let offSet = (middleOfScreen - rect.x) * -1;

        playerPositionY = offSetY(playerCard) - offSetY(playerCard) * 0.6;

        playerCard.style.transition = "transform 0.5s linear 0s";
        playerCard.style.transform = `translatey(${playerPositionY}px) translateX(${offSet * 2}px) translateX(-50%) rotatey(180deg) scale(1.45)`;

        setTimeout(() => {
            playerCard.src = "assets/imgs/cards/" + cardNumber + ".png";
        }, 250);

    } else if (player == 4) {
        playerCard = opponent2Hand.children[Math.floor(Math.random() * opponent2Hand.children.length)];

        playerPositionX = offSetX(playerCard) - offSetX(playerCard) * 0.5;
        playerCard.style.transition = "transform 0.5s linear 0s";
        playerCard.style.transform = `translatey(${offSetY(playerCard)}px) translatex(${playerPositionX}px) rotatey(180deg) `;
        setTimeout(() => {
            playerCard.src = "assets/imgs/cards/" + cardNumber + ".png";
        }, 250);
    }
    tableCards.push(playerCard);
}
/*
otherCardMove(2, 'S10');
otherCardMove(3, 'S10');
otherCardMove(4, 'S10');*/

function createHands() {
    opponent1Hand.innerHTML = '';
    opponent2Hand.innerHTML = '';
    teammateHand.innerHTML = '';

    for (let i = 0; i < 8; i++) {
        const opponent1Card = document.createElement('img');
        const opponent2Card = document.createElement('img');
        const teammateCard = document.createElement('img');
        opponent1Card.src = "assets/imgs/cards/card-back-red.png";
        opponent2Card.src = "assets/imgs/cards/card-back-red.png";
        teammateCard.src = "assets/imgs/cards/card-back-red.png";

        opponent1Hand.appendChild(opponent1Card);
        opponent2Hand.appendChild(opponent2Card);
        teammateHand.appendChild(teammateCard);

    }
}

function getRelativePlayerNumber(playerNumber, otherPlayer) {
    if (playerNumber == 1) return otherPlayer;

    if (playerNumber == 2) {
        if (otherPlayer == 1) return 4;
        if (otherPlayer == 2) return 1;
        if (otherPlayer == 3) return 2;
        if (otherPlayer == 4) return 3;
    }

    if (playerNumber == 3) {
        if (otherPlayer == 1) return 3;
        if (otherPlayer == 2) return 4;
        if (otherPlayer == 3) return 1;
        if (otherPlayer == 4) return 2;
    }

    if (playerNumber == 4) {
        if (otherPlayer == 1) return 2;
        if (otherPlayer == 2) return 3;
        if (otherPlayer == 3) return 4;
        if (otherPlayer == 4) return 1;
    }

    return false;
}