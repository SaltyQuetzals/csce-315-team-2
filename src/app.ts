import express = require('express');
import path = require('path');
import * as socketio from 'socket.io';
import http = require('http');

const ROOM_CODE_LENGTH = 5;

function random(len: number) {
  return Math.random().toString(36).substr(2, len);
}


const app = express();

const STATIC_DIR = path.join(__dirname, 'public');
app.use(express.static(STATIC_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});


const server = new http.Server(app);
const io = socketio(server);

server.listen(3000, () => {
  console.log('Listening on port 3000');
});

io.on('connection', (socket) => {

  // Create a new room and notify creator
  socket.on('create', (data) => {
    const roomCode = random(ROOM_CODE_LENGTH);
    socket.join(`room-${roomCode}`);
  });

  socket.on('joinGame', (data) => {
    const room = io.nsps['/'].adapter.rooms[data.room];
    if (!room) {
      socket.emit('err', {message: 'The room you requested does not exist.'});
    } else {
      if (room.length > 10) {
        socket.emit('err', {message: 'The room you requested is full. Please try again later.'});
      } else {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit('new player', {});
      }
    }
  });
});