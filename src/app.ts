import express = require('express');
import path = require('path');
import * as socketio from 'socket.io';
import http = require('http');



const app = express();
const server = new http.Server(app);
const io = socketio(server);


server.listen(3000, () => {
  console.log('Listening on port 3000');
});


const STATIC_DIR = path.join(__dirname, 'public');
app.use(express.static(STATIC_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Client connected!');
  socket.on('disconnect', () => {
    console.log('Client disconnected.');
  });

  socket.on('room', (room) => {
    console.log(`A request to join room ${room} has occurred.`);
    socket.join(room);
  });
});