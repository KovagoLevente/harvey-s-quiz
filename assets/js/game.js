let playerList = document.querySelector('.playerList');

// Debugging log: to see the values passed from EJS
console.log('Sending joinRoom event with:', user, room);

const socket = io();

// Emit the 'joinRoom' event with the username and room after the page loads
socket.emit('joinRoom', user, room);

// Listen for updates to the room's user list
socket.on('updateRoomUsers', (roomUsers) => {
    console.log('Received updateRoomUsers:', roomUsers);

    // Clear the current list in playerList
    playerList.innerHTML = '';

    // Create a new unordered list
    let ul = document.createElement('ul');
    playerList.appendChild(ul);

    // Loop through the list of users in the room
    roomUsers.forEach(roomUser => {
        console.log('Adding player:', roomUser.username);  // Debugging line to see each user being added
        let li = document.createElement('li');
        li.innerText = roomUser.username;  // Display the username
        ul.appendChild(li);
        ul.classList.add("text-light")
    });
});
