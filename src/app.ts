import express = require('express');
import path = require('path');
import * as socketio from 'socket.io';
import http = require('http');
import * as session from 'express-session';
import {random} from './shared/functions';
import bodyParser = require('body-parser');

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

app.post(
    '/rooms',
    (req, res, next) => {
      console.log(req.body);
      next();
    },
    (req, res) => {
      const roomCode = random(ROOM_CODE_LENGTH);
      const {name} = req.body;
      if (req.session) {
        req.session.username = name;
        res.redirect(`/rooms/${roomCode}`);
      } else {
        res.redirect('/');
      }
    });

app.get('/rooms/:roomCode', (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, '/html/room.html'));
});


const server = new http.Server(app);
const io = socketio(server);

server.listen(3000, () => {
  console.log('Listening on port 3000');
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request, next);
});

io.on('connection', (socket) => {
  socket.on('join room', (data) => {
    const {username} = socket.request.session;
    const {room} = data;
    socket.disconnect();

    socket.broadcast.to(data.room).emit('new player', {});
  });
});