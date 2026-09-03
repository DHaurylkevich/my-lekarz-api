const userList = async ({ io, socket }) => {
    const users = [];
    for (let sockets of await io.fetchSockets()) {
        if (socket.user.id == sockets.user.id) {
            users.push({
                userId: sockets.user.id, username: `user${sockets.user.id}`, role: sockets.user.role, connected: true, myself: true
            });
        } else {
            users.push({
                userId: sockets.user.id, username: `user${sockets.user.id}`, role: sockets.user.role, connected: true,
            });
        }
    }
    return users;
};

module.exports = { userList };