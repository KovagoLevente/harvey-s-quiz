let usernameField = document.querySelector('#username');
let roomField = document.querySelector('#room');
let roomsSelect = document.querySelector('#rooms');


const socket = io();

const loginBtn = document.querySelector('#login');

loginBtn.addEventListener('click', (event) => {
    event.preventDefault();

    let usernameField = document.querySelector('#username');
    let roomField = document.querySelector('#room');
    let roomsSelect = document.querySelector('#rooms');

    if (usernameField.value === '') {
        alert('Missing username!');
        return;
    }

    let username = usernameField.value;
    let room = roomField.value || roomsSelect.value;

    if (!room) {
        alert('Missing roomname!');
        return;
    }

    document.location.href = `/game/${room}/${username}`;
});

/*
socket.emit('getRoomList');

socket.on('updateRoomList', (rooms)=>{
    roomsSelect.innerHTML = '<option value="" selected>Join to an existing room: </option>';
    rooms.forEach(room => {
        let option = document.createElement('option');
        option.value = room;
        option.innerText = room;
        roomsSelect.appendChild(option);
    });

});*/