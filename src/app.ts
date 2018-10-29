import express = require('express');
import path = require('path');
import * as socketio from 'socket.io';
import http = require('http');
import * as session from 'express-session';
import {random} from './shared/functions';
import bodyParser = require('body-parser');
import {Game} from './models/Game';

const USER_ID_LENGTH = 32;
const ROOM_CODE_LENGTH = 5;

const STATIC_DIR = path.join(__dirname, 'public');

const sessionMiddleware =
    session({resave: true, saveUninitialized: true, secret: 'baboon'});

const app = express();

app.use(express.static(STATIC_DIR));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(sessionMiddleware);

app.use((req, _res, next) => {
  if (req.session && !req.session.userid) {
    req.session.userid = random(USER_ID_LENGTH);
  }
  next();
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.post('/rooms', (req, res) => {
  const roomCode = random(ROOM_CODE_LENGTH);
  res.redirect(`/rooms/${roomCode}`);
});

app.get('/rooms/:roomCode', (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, '/html/room.html'));
});


const server = new http.Server(app);
const io = socketio(server);
const defaultNamespace = io.nsps['/'].adapter;

server.listen(3000, () => {
  console.log('Listening on port 3000');
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request, next);
});

io.on('connection', (socket) => {
  socket.on('join room', (data) => {
    const {room} = data;
    socket.join(room);
    if (defaultNamespace.rooms[room].length === 11) {
      socket.leave(room).emit(
          'room full',
          {message: 'The room you have requested is full. Try again later.'});
    } else {
      socket.broadcast.to(data.room).emit('new player', {});
    }
    console.log(JSON.stringify(io.nsps['/'].adapter.rooms[room], null, 3));
  });

  socket.on('start game', (data) => {
    socket.broadcast.to(data.room).emit(
        'start game', {game: new Game(1000, 1000)});
  });

  socket.on('move', (data) => {
    const game: Game = data.game;
    const {room, movementDelta} = data;
    console.log(socket.request.session.userid, 'is moving');
    console.log(JSON.stringify(movementDelta, null, 3));
    game.movePlayer(socket.request.session.userid, movementDelta);

    socket.broadcast.to(data.room).emit('player moved', {game});
  });
});