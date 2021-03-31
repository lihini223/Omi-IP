const roomForm = document.querySelector('#roomForm');
const roomElement = document.querySelector('#room');

roomForm.addEventListener('submit', e => {
    e.preventDefault();

    const room = roomElement.value;

    setRoom(room);

    window.location = 'omi.html';
});

function getCookie() {
    const name = 'omi-token' + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while(c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    
    return "";
}

if (getCookie() == '') {
    window.location = 'login.html';
}

function setRoom(room) {
    console.log('saving room');
    const d = new Date();
    d.setTime(d.getTime() + 60*60*1000);
    const expires = 'expires='+ d.toUTCString();
    document.cookie = 'omi-room' + '=' + room + ';' + expires + ';path=/';
}