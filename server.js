const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const ejs = require('ejs');

const app = express();
var session = require('express-session');
const moment = require('moment');
const server = http.createServer(app);
const io = socketio(server);


const port = 3001;
const { users, rooms, userJoin, userLeave, getRoomUsers, getCurrentUser, inRoomsList, roomLeave } = require('./utils');

app.use('/assets', express.static('assets'));

app.get('/', (req, res)=>{
    res.render('index.ejs');
});

app.get('/game/:room/:user', (req, res)=>{
    // let { name, room } = req.body;
    session.user = req.params.user;
    session.room = req.params.room;
    res.render('quizGame.ejs', {user:session.user, room:session.room});
});

server.listen(port, ()=>{
    console.log(`Server listening on http://localhost:${port}`);
});