const popupDiv = document.querySelector('.room-popups')
const leaderboardDiv = document.querySelector('#leaderboard-div')
const joinPartyDiv = document.querySelector('#join-party-div')


function popupLeaderboard(){
    popupDiv.style.display = 'flex';
    leaderboardDiv.style.display = 'flex';
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