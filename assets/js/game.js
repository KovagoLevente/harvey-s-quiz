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
// Visszaszámlálás kezelése
socket.on('countdown', (timeLeft) => {
    const timeElem = document.getElementById('timeRemaining');
    timeElem.innerText = `${timeLeft} másodperc`;

    const countdown = setInterval(() => {
        timeLeft -= 1;
        timeElem.innerText = `${timeLeft} másodperc`;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            timeElem.innerText = 'A kérdések hamarosan kezdődnek...';
        }
    }, 1000);
});


// A játék kezdete
socket.on('startGame', (data) => {
    document.querySelector('h1').innerText = 'A játék elkezdődött!';
    console.log('Questions received:', data.questions);

    // Kérdések megjelenítése
    displayQuestion(data.questions[0]);
});



// Kérdés megjelenítése és visszaszámláló indítása
function displayQuestion(question) {
    const questionElem = document.querySelector('.question');
    questionElem.innerText = question.question;  // Kérdés kiírása

    const timeElem = document.getElementById('timeRemaining');
    let timeLeft = 10; // Például 10 másodperc visszaszámlálás

    // Frissítjük a visszaszámlálót minden másodpercben
    const countdown = setInterval(() => {
        timeLeft -= 1;
        timeElem.innerText = `${timeLeft} másodperc`;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            timeElem.innerText = 'Idő lejárt!';
        }
    }, 1000);

    // Automatikusan továbblép a következő kérdésre az idő lejárta után
    setTimeout(() => {
        clearInterval(countdown);
        timeElem.innerText = 'Következő kérdés...';
        // További logika, például a következő kérdés kezelése
    }, 10000);
}
function startNextQuestion(room, questionIndex) {
    const questions = roomQuestions[room]; // Get questions for the room
    if (questionIndex < questions.length) {
        console.log('Displaying question:', questions[questionIndex]);
        io.to(room).emit('displayQuestion', questions[questionIndex]); // Emit the current question to the room
        
        // Set up the next question after 10 seconds
        setTimeout(() => {
            console.log(`Moving to next question after 10 seconds.`);
            startNextQuestion(room, questionIndex + 1); // Proceed to the next question
        }, 10000); // Wait for 10 seconds before moving to the next question
    } else {
        // No more questions, end the game
        gameOver(room); // Call the gameOver function
    }
}

function startGame(room) {
    pool.query('SELECT * FROM questions ORDER BY RAND() LIMIT 10', (err, result) => {
        if (err) {
            console.error('Error fetching questions:', err);
            io.to(room).emit('errorMessage', 'Failed to load questions.');
            return;
        }
        if (result.length === 0) {
            io.to(room).emit('errorMessage', 'No questions available.');
            return;
        }

        // Save questions in the room context, including the correct answer
        roomQuestions[room] = result;

        // Várakozás 1 percig, mielőtt az első kérdést elküldjük
        io.to(room).emit('countdown', 60); // Megjelenítjük a visszaszámlálást a klienseken
        setTimeout(() => {
            // Start the first question after 1 minute
            io.to(room).emit('startGame', { questions: result });
            startNextQuestion(room, 0); // Start the first question (index 0)
        }, 60000); // 60 másodperc várakozás
    });
}
function gameOver(room) {
    // Stop any remaining timers
    if (timers[room]) {
        clearTimeout(timers[room]);
        delete timers[room];
    }
    if (answerTimers[room]) {
        delete answerTimers[room];
    }
    if (roomQuestions[room]) {
        delete roomQuestions[room];
    }

    // Emit end of game message
    io.to(room).emit('gameOver');
}



// Ha a szerver új kérdést küld, újraindítjuk a visszaszámlálót
socket.on('displayQuestion', (question) => {
    displayQuestion(question);
});


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