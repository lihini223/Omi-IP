const popupDiv = document.querySelector('.room-popups')
const leaderboardDiv = document.querySelector('#leaderboard-div')
const joinPartyDiv = document.querySelector('#join-party-div')
const joinForm = document.querySelector('#joinForm');
const roomId = document.querySelector('#room-id');
const scoreElement = document.querySelector('#score');
const createRoomPopup = document.querySelector('.creating-room');
const leaderboardElement = document.querySelector('#leaderboard');
const advertisementElement = document.querySelector('.addbar');

function popupLeaderboard(){
    popupDiv.style.display = 'flex';
    leaderboardDiv.style.display = 'flex';
    createLeaderboard();
}

function popupJoinParty(){
    popupDiv.style.display = 'flex';
    joinPartyDiv.style.display = 'flex';
}

function popoutDiv(){
    popupDiv.style.display = 'none';
    leaderboardDiv.style.display = 'none';
    joinPartyDiv.style.display = 'none';
}

joinForm.addEventListener('submit', e => {
    e.preventDefault();

    const room = roomId.value;

    setRoom(room);

    window.location = 'omi.html';
});

function getToken() {
    const cookieName = 'omi-token' + '=';
    const cookie = decodeURIComponent(document.cookie);
    const cookieArray = cookie.split(';');
    for(let i = 0; i < cookieArray.length; i++) {
        let c = cookieArray[i];
        while(c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cookieName) == 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    
    return "";
}

function decodeToken(token) {
    const tokenData = token.split('.')[1];

    const decodedTokenData = atob(tokenData);

    return JSON.parse(decodedTokenData);
}

async function fetchScore(dbId) {
    try {
        const result = await fetch(`http://localhost:3000/users/score/${dbId}`);
        const data = await result.json();
        
        return data;
    } catch(err) {
        console.log(err);
        return 0;
    }
}

async function fetchLeaderboard() {
    try {
        const result = await fetch('http://localhost:3000/scores/leaderboard');
        const data = await result.json();

        return data.leaderboard;
    } catch(err) {
        console.log(err);
        return [];
    }
}

async function fetchAdvertisement() {
    try {
        const result = await fetch('http://localhost:3000/advertisements/random');
        const data = await result.json();

        return data;
    } catch(err) {
        console.log(err);
        return null;
    }
}

function createAdvertisement(advertisement) {
    if (advertisement == null) return;

    console.log(advertisement);

    advertisementElement.addEventListener('click', () => {
        console.log('advertisement clicked');
    });
}

function createRoom() {
    createRoomPopup.style.display = 'flex';
    setTimeout(() => {
        window.location = 'omi.html';
    }, 3000);
}

async function createLeaderboard() {
    const leaderboard = await fetchLeaderboard();
    leaderboardElement.innerHTML = '';
    console.log(leaderboard);

    leaderboard.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('leaderboard-score');

        const playerNameDiv = document.createElement('div');
        playerNameDiv.classList.add('player-name');
        playerNameDiv.classList.add('div-space');

        const playerRankingDiv = document.createElement('div');
        playerRankingDiv.classList.add('player-ranking');
        playerRankingDiv.classList.add('div-space');

        playerDiv.appendChild(playerNameDiv);
        playerDiv.appendChild(playerRankingDiv);

        leaderboardElement.appendChild(playerDiv);
    });
}

async function main() {
    const token = getToken();
    deleteRoom();

    if (token == '') {
        window.location = 'login.html';
    }

    const decodedToken = decodeToken(token);

    const score = await fetchScore(decodedToken.dbId);
    scoreElement.innerText = score;

    const advertisement = await fetchAdvertisement();
    createAdvertisement(advertisement);
}

main();

function setRoom(room) {
    console.log('saving room');
    const d = new Date();
    d.setTime(d.getTime() + 60*60*1000);
    const expires = 'expires='+ d.toUTCString();
    document.cookie = 'omi-room' + '=' + room + ';' + expires + ';path=/';
}

function deleteRoom() {
    document.cookie = 'omi-room=;expires=Thu 01 Jan 1970 00:00:00UTC;path=/;';
}