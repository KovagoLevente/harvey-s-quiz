const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const ejs = require('ejs');
require('dotenv').config(); 

const app = express();
var session = require('express-session');
const moment = require('moment');
const server = http.createServer(app);
const io = socketio(server);

var mysql = require('mysql');
const port = 3001;
const { users, rooms, userJoin, userLeave, getRoomUsers, getCurrentUser, inRoomsList, roomLeave } = require('./utils');

var pool = mysql.createPool({
    connectionLimit: process.env.connectionLimit,
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME
});

pool.getConnection((err) => {
    if (err) {
        console.log('Error connection to MYSQL: ' + err);
    } else {
        console.log('Connected to MySQL database');
    }
});


app.use('/assets', express.static('assets'));

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/game/:room/:user', (req, res) => {
    session.user = req.params.user;
    session.room = req.params.room;
    res.render('quizGame.ejs', { user: session.user, room: session.room });
});


io.on('connection', socket => {
    console.log('A user connected');


    socket.on('joinRoom', (username, room) => {

        userJoin(socket.id, username, room);
        socket.join(room);


        const roomUsers = getRoomUsers(room);


        io.to(room).emit('updatePlayerList', roomUsers);

        console.log(`${username} joined the room: ${room}`);
    });


    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            const roomUsers = getRoomUsers(user.room);
            io.to(user.room).emit('updatePlayerList', roomUsers);
        }
    });
});

server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
