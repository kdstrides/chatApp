const express = require('express');

const app = express();
app.set('port', process.env.PORT || 9000);
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = app.get('port');

app.use(express.static('public'));
server.listen(port, () => { console.log("Server listening on: http://localhost:%s", port); });
app.get('/', (req, res) => { return res.sendFile(__dirname + '/index.html'); });

const usernames = {};
const rooms = [];

io.sockets.on('connection', (socket) => {
	socket.on('kd-adduser', (data) => {
		const username = data.username;
		const room = data.room;

		if (rooms.indexOf(room) != -1) {
			socket.username = username;
			socket.room = room;
			usernames[username] = username;
			socket.join(room);
			socket.emit('kd-updatechat', 'SERVER', 'You are connected. Start chatting');
			socket.broadcast.to(room).emit('kd-updatechat', 'SERVER', username + ' has connected to this room');
		} else {
			socket.emit('kd-updatechat', 'SERVER', 'Please enter valid code.');
		}
	});

	socket.on('kd-createroom', (data) => {
		const new_room = ("" + Math.random()).substring(2, 7);
		rooms.push(new_room);
		data.room = new_room;
		socket.emit('kd-updatechat', 'SERVER', 'Your room is ready, invite someone using this ID:' + new_room);
		socket.emit('kd-roomcreated', data);
	});

	socket.on('kd-sendchat', (data) => {
		io.sockets.in(socket.room).emit('kd-updatechat', socket.username, data);
	});

	socket.on('kd-disconnect', () => {
		delete usernames[socket.username];
		io.sockets.emit('kd-updateusers', usernames);
		if (socket.username !== undefined) {
			socket.broadcast.emit('kd-updatechat', 'SERVER', socket.username + ' has disconnected');
			socket.leave(socket.room);
		}
	});
});