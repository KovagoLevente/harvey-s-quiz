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
    console.log('Session user:', session.user);  // Log user value
    console.log('Session room:', session.room);  // Log room value
    res.render('quizGame.ejs', { user: session.user, room: session.room });
});


io.on('connection', (socket) => {
    socket.on('getRoomList', () => {
        io.emit('updateRoomList', rooms);
    });

    socket.on('joinRoom', (username, room) => {
        if (!username || !room) {
            console.log('Missing username or room!');
            return;
        }
    
        console.log(`User joined room: ${JSON.stringify({ username, room })}`);
    
        // Add the user to the list
        let user = userJoin(socket.id, username, room);
        console.log('Updated users:', users);  // Debugging line to check users array
        socket.join(room);
    
        // Emit updated room users to the room
        io.to(room).emit('updateRoomUsers', getRoomUsers(room));
    
        // Log when we emit the event
        console.log('Emitting updateRoomUsers event with:', getRoomUsers(room));
    
        // Add the room if it doesn't exist in the list
        if (!inRoomsList(room)) {
            rooms.push(room);
            io.emit('updateRoomList', rooms);
        }
    });
    
    
    
});

server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
