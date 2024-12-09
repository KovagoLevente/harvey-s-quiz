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

socket.on('displayQuestion', (question) => {
    displayQuestion(question);
});
document.getElementById('submitAnswerBtn').addEventListener('click', function (e) {
    e.preventDefault(); // Ne küldje el a formot alapértelmezetten

    const answer = document.getElementById('answer').value;
    if (answer.trim() === '') {
        alert('Kérlek adj meg egy választ!');
        return;
    }

    // Az aktuális kérdés indexét ki kell választani, például:
    const questionIndex = 0; // Ezt dinamikusan kell majd kezelni

    // A válasz elküldése a szervernek
    socket.emit('submitAnswer', { room: room, username: user, answer: answer, questionIndex: questionIndex });

    // Tisztítjuk az input mezőt
    document.getElementById('answer').value = '';
});