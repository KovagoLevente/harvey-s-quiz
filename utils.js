let users = [];
let rooms = [];

function userJoin(id, username, room) {
    const user = { id, username, room };
    users.push(user);
    return user;
}

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) return users.splice(index, 1)[0];
}

function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

function inRoomsList(room) {
    return rooms.includes(room);
}

module.exports = {
    users,
    rooms,
    userJoin,
    userLeave,
    getRoomUsers,
    inRoomsList,
};
