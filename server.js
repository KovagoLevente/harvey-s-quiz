const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const ejs = require('ejs');
require('dotenv').config();

const app = express();
const session = require('express-session');
const server = http.createServer(app);
const io = socketio(server);

const mysql = require('mysql');
const { users, rooms, userJoin, userLeave, getRoomUsers, inRoomsList } = require('./utils');

const port = process.env.PORT || 3001;
const timers = {};
const answerTimers = {};  // A válaszadási időtartam nyilvántartása
const roomQuestions = {};  // Store questions per room

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
});

pool.getConnection((err) => {
    if (err) {
        console.log('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

app.use('/assets', express.static('assets'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game/:room/:user', (req, res) => {
    req.session.user = req.params.user;
    req.session.room = req.params.room;
    res.render('quizGame', { user: req.session.user, room: req.session.room });
});

io.on('connection', (socket) => {

    socket.on('joinRoom', (username, room) => {
        if (!username || !room) {
            console.log('Missing username or room!');
            return;
        }

        const user = userJoin(socket.id, username, room);
        socket.join(room);

        const roomUsers = getRoomUsers(room);
        io.to(room).emit('updateRoomUsers', roomUsers);

        if (!inRoomsList(room)) {
            rooms.push(room);
            io.emit('updateRoomList', rooms);
        }

        // Szoba feltöltése után a játék indítása
        if (roomUsers.length === 1) {
            timers[room] = setTimeout(() => {
                startGame(room);
            }, 5000); // 5 másodperc várakozás a szoba feltöltése után
            io.to(room).emit('countdown', 10); // Várakozás a játék indítása előtt
        } else if (roomUsers.length === 5) {
            clearTimeout(timers[room]);
            delete timers[room];
            startGame(room);
        }
    });

    socket.on('submitAnswer', ({ room, username, answer, questionIndex }) => {
        console.log(`${username} in room ${room} answered: ${answer}`);
        
        // Nyilvántartjuk a válaszokat a játékosoktól
        if (!answerTimers[room]) {
            answerTimers[room] = {};  // Ha nem létezik még válaszadási idő
        }

        // Ellenőrizzük a válaszokat
        answerTimers[room][username] = { answer, questionIndex };

        // Késleltetett válasz kiértékelés
        setTimeout(() => {
            evaluateAnswers(room); // Válaszok kiértékelése
        }, 10000); // 10 másodperc válaszadási idő
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            const roomUsers = getRoomUsers(user.room);
            io.to(user.room).emit('updateRoomUsers', roomUsers);

            if (roomUsers.length === 0 && timers[user.room]) {
                clearTimeout(timers[user.room]);
                delete timers[user.room];
            }
        }
    });

    // Játék indítása
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

            // Start the first question immediately
            io.to(room).emit('startGame', { questions: result });
            startNextQuestion(room, 0); // Start the first question (index 0)
        });
    }

    // Kérdések kiértékelése és pontozás
    function evaluateAnswers(room) {
        const answers = answerTimers[room];
        const questions = roomQuestions[room]; // Access the questions for the room
        let winner = null;
        let closestAnswer = null;

        // Iterate over answers
        for (const user in answers) {
            const userAnswer = answers[user].answer;
            const questionIndex = answers[user].questionIndex; // Using questionIndex

            const correctAnswer = questions[questionIndex].correctAnswer;

            // Kiértékeljük a legjobb választ
            if (closestAnswer === null || Math.abs(userAnswer - correctAnswer) < Math.abs(closestAnswer.answer - correctAnswer)) {
                closestAnswer = { answer: userAnswer, questionIndex };
                winner = user;
            }
        }

        io.to(room).emit('roundWinner', winner); // Emit the winner for the round
    }

    // Visszaszámlálás és következő kérdés
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
            io.to(room).emit('gameOver'); // You can implement a game over or end of round logic here
        }
    }

    function gameOver(room) {
        // Stop any remaining timeouts
        if (timers[room]) {
            clearTimeout(timers[room]);
            delete timers[room];
        }
        // Emit end of game message
        io.to(room).emit('gameOver');
    }

});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
