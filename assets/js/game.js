const socket = io();

// Játékos csatlakozása a szobához
socket.emit('joinRoom', user, room);

// Frissíti a játékosok listáját
socket.on('updateRoomUsers', (roomUsers) => {
    const playerList = document.querySelector('.playerList');
    playerList.innerHTML = ''; // Előző lista törlése

    const ul = document.createElement('ul');
    playerList.appendChild(ul);

    roomUsers.forEach(roomUser => {
        const li = document.createElement('li');
        li.innerText = roomUser.username;
        ul.appendChild(li);
        ul.classList.add('text-light');
    });
});

// A visszaszámlálás megjelenítése
socket.on('countdown', (timeLeft) => {
    document.querySelector('h1').innerText = `A játék ${timeLeft} másodperc múlva indul...`;
});

// A játék kezdete
socket.on('startGame', (data) => {
    document.querySelector('h1').innerText = 'A játék elkezdődött!';
    console.log('Questions received:', data.questions);

    // Kérdések megjelenítése
    displayQuestion(data.questions[0]);
});

// Kérdések kezelése
function displayQuestion(question) {
    const questionElem = document.querySelector('.question');
    questionElem.innerText = question.question;  // Kérdés kiírása

    // További logika a válaszokhoz...
}