const playerHand = document.getElementById('player-hand');
const playerCard = document.getElementById('player-card');
const teammateCard = document.getElementById('teammate-card');
const opponent1Card = document.getElementById('opponent1-card');
const opponent2Card = document.getElementById('opponent2-card');
const trumpCards = document.querySelector('.trump-cards');
const teamScore = document.getElementById('team-score');
const opponentScore = document.getElementById('opponent-score');
const container = document.querySelector('.container');
const winnerDisplay = document.querySelector('.winner-display');
const trumpCard = document.getElementById('trump-card');

const socket = io();

let playerNumber = -1;
let playerCards = []; // player hand
let currentTrump = 0;
let roundWinner = 0;

// assign player number
socket.on('player-number', num => {
    if(num == -1){
        console.log('Server is full');
    }
    else{
        playerNumber = num;
    }
});

// new player connection
socket.on('player-connection', num => {
    console.log(`Player ${num} has connected`);
});

socket.on('start-game', data => {
    console.log(data);
});

// listen for player hand and assign to respective players
socket.on('player1-hand', hand => {
    if(playerNumber == 0){
        createCards(hand);
    }
});
socket.on('player2-hand', hand => {
    if(playerNumber == 1){
        createCards(hand);
    }
});
socket.on('player3-hand', hand => {
    if(playerNumber == 2){
        createCards(hand);
    }
});
socket.on('player4-hand', hand => {
    if(playerNumber == 3){
        createCards(hand);
    }
});

// listen for trump call
socket.on('trump-call', data => {
    if(data == playerNumber){
        trumpCall();
    }
});

// check player turn and enable cards
socket.on('player-turn', turn => {
    if(turn == playerNumber){
        enableCards();
    }
    else{
        disableCards();
    }
});

// update table player cards
socket.on('table-card', data => {
    tableCard(data);
});

// game end
socket.on('game-finish', data => {
    if(data == 'Team 1'){
        if(playerNumber == 0 || playerNumber == 2){
            winnerDisplay.innerText = 'You won';
        }
        else{
            winnerDisplay.innerText = 'Opponents won';
        }
    }
    else{
        if(playerNumber == 1 || playerNumber == 3){
            winnerDisplay.innerText = 'You won';
        }
        else{
            winnerDisplay.innerText = 'Opponents won';
        }
    }
    container.style.display = 'none';
    winnerDisplay.style.display = "block";
});

// listen for trump card
socket.on('current-trump', data => {
    currentTrump = data;
    if(currentTrump == 1){
        trumpCard.style.background = 'url("./assets/imgs/spadesS.png")';
    }
    else if(currentTrump == 2){
        trumpCard.style.background = 'url("./assets/imgs/heartsS.png")';
    }
    else if(currentTrump == 3){
        trumpCard.style.background = 'url("./assets/imgs/clubsS.png")';
    }
    else if(currentTrump == 4){
        trumpCard.style.background = 'url("./assets/imgs/diamondsS.png")';
    }
    trumpCard.style.backgroundSize = 'cover';
});

// listen for round winner
socket.on('round-winner', data => {
    roundWinner = data;
    console.log(roundWinner);
});

socket.on('team1-score', data => {
    if(playerNumber == 0 || playerNumber == 2){
        teamScore.innerText = data;
    }
    else{
        opponentScore.innerText = data;
    }
});

socket.on('team2-score', data => {
    if(playerNumber == 0 || playerNumber == 2){
        opponentScore.innerText = data;
    }
    else{
        teamScore.innerText = data;
    }
});

// create player cards and add to player hand
function createCards(hand){
    let i = 0;
    playerHand.innerHTML = '';
    hand.forEach(card => {
        const button = document.createElement('button');
        button.value = card.name;
        button.style.backgroundImage = card.img;
        button.dataset.img = card.img;
        button.classList.add(`card${i}`);
        i++;
        playerHand.appendChild(button);
    });

    addCardClickEvents();
    //disableCards();
}

function addCardClickEvents(){
    const buttons = document.querySelectorAll('.player-cards button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            socket.emit('card-played', { player: playerNumber, card: button.value, img: button.dataset.img });
            button.remove();
        });
    });
}

function enableCards(){
    const buttons = document.querySelectorAll('.player-cards button');
    buttons.forEach(button => {
        button.disabled = false;
    });
}

function disableCards(){
    const buttons = document.querySelectorAll('.player-cards button');
    buttons.forEach(button => {
        button.disabled = true;
    });
}

// call trumps
function trumpCall(){
    let trump = 0;

    disableCards();

    trumpCards.style.display = "flex";
    trumpCards.innerHTML = '';

    // remove last 4 cards
    for(let i = 4; i < 8; i++){
        playerHand.children[i].style.display = "none";
    }

    const trumpValues = ['1', '2', '3', '4'];
    const trumpImg = ['url("./assets/imgs/spades.png")', 'url("./assets/imgs/hearts.png")', 'url("./assets/imgs/clubs.png")', 'url("./assets/imgs/diamonds.png")'];

    // add trump card buttons
    for(let i = 0; i < 4; i++){
        const button = document.createElement('button');
        button.value = trumpValues[i];
        button.style.background = trumpImg[i];
        trumpCards.appendChild(button);
        button.addEventListener('click', () => {
            trump = button.value;
            trumpCards.innerHTML = '';
            trumpCards.style.display = "none";
            console.log(trump);
            socket.emit('trump-called', trump);
            for(let i = 4; i < 8; i++){ // add last 4 cards
                playerHand.children[i].style.display = "block";
            }
            enableCards();
        });
    }
}

// add card to table
function tableCard(data){
    const playedPlayer = data.player;
    const playedCard = data.card.img;
    
    if(playerNumber == 0){
        if(playedPlayer == 0){
            playerCard.style.backgroundImage = playedCard;
        }
        else if(playedPlayer == 1){
            opponent2Card.style.backgroundImage = playedCard;
        }
        else if(playedPlayer == 2){
            teammateCard.style.backgroundImage = playedCard;
        }
        else if(playedPlayer == 3){
            opponent1Card.style.backgroundImage = playedCard;
        }
    }
    else if(playerNumber == 1){
        if(playedPlayer == 0){
            opponent1Card.style.backgroundImage = playedCard;
        }
        else if(playedPlayer == 1){
            playerCard.style.backgroundImage = playedCard;
        }
        else if(playedPlayer == 2){
            opponent2Card.style.backgroundImage = playedCard;
        }
        else if(playedPlayer == 3){
            teammateCard.style.backgroundImage = playedCard;
        }
    }
    else if(playerNumber == 2){
        if(playedPlayer == 0){
            teammateCard.style.backgroundImage = playedCard;
        }
        else if(playedPlayer == 1){
            opponent1Card.style.backgroundImage = playedCard;
        }
        else if(playedPlayer == 2){
            playerCard.style.backgroundImage = playedCard;
        }
        else if(playedPlayer == 3){
            opponent2Card.style.backgroundImage = playedCard;
        }
    }
    else{
        if(playedPlayer == 0){
            opponent2Card.style.backgroundImage = playedCard;
        }
        else if(playedPlayer == 1){
            teammateCard.style.backgroundImage = playedCard;
        }
        else if(playedPlayer == 2){
            opponent1Card.style.backgroundImage = playedCard;
        }
        else if(playedPlayer == 3){
            playerCard.style.backgroundImage = playedCard;
        }
    }
}

// in client side the player is always player 1
// in client side, player 2 always refer to teammate and player 3 and 4 are opponents
