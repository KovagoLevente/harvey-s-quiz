let users = [];
let rooms = [];

function userJoin(id, username, room){
    const user = { id, username, room };
    users.push(user);
    return user;
}

function userLeave(id){
    let idx = users.findIndex(user => user.id === id);
    if (idx != -1){
        users.splice(idx, 1);
    }
    return users;
}

function roomLeave(room){
    let idx = rooms.findIndex(item => item === room);
    if (idx > -1){
        rooms.splice(idx, 1);
    }
    return rooms;
}

function getRoomUsers(room) {
    const roomUsers = users.filter(user => user.room === room);
    console.log(`Users in room ${room}:`, roomUsers);  
    return roomUsers;
}


function getCurrentUser(id){
    return users.find(user => user.id === id);
}

function inRoomsList(room){
    return rooms.find(item => item === room ) ? true : false;
}

module.exports = {
    users,
    rooms,
    userJoin,
    userLeave,
    roomLeave,
    getRoomUsers,
    getCurrentUser,
    inRoomsList
}