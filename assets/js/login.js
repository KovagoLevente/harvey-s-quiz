let usernameField = document.querySelector('#username');
let roomField = document.querySelector('#room');
let roomsSelect = document.querySelector('#rooms');

const socket = io();

const loginBtn = document.querySelector('#login');

loginBtn.addEventListener('click', (event) => {
    event.preventDefault();

    // Get the values of username and room from the form
    let username = usernameField.value;
    let room = roomField.value || roomsSelect.value;

    if (username === '') {
        alert('Missing username!');
        return;
    }

    if (!room) {
        alert('Missing roomname!');
        return;
    }

    console.log('Emitting joinRoom with:', username, room);
    // Emit joinRoom event with the captured username and room
    socket.emit('joinRoom', username, room);

    // Redirect to the game page after emitting the event
    document.location.href = `/game/${room}/${username}`;
});

socket.emit('getRoomList');

socket.on('updateRoomList', (rooms) => {
    roomsSelect.innerHTML = '<option value="" selected>Join to an existing room: </option>';
    rooms.forEach(room => {
        let option = document.createElement('option');
        option.value = room;
        option.innerText = room;
        roomsSelect.appendChild(option);
    });
});
