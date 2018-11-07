import express = require('express');
import path = require('path');
import * as socketio from 'socket.io';
import http = require('http');
import * as session from 'express-session';
import {random} from './shared/functions';
import bodyParser = require('body-parser');
import {RoomController} from './controllers/RoomController';
import {Human} from './models/Avatar';

const ROOM_CODE_LENGTH = 5;

const STATIC_DIR = path.join(__dirname, 'public');

const sessionMiddleware =
    session({resave: true, saveUninitialized: true, secret: 'baboon'});

const app = express();

app.use(express.static(STATIC_DIR));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(sessionMiddleware);

app.get('/', (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.get('/rooms/:roomCode', (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, '/html/room.html'));
});

app.post('/rooms', (req, res) => {
  const {username} = req.body;
  const roomCode = random(ROOM_CODE_LENGTH);
  res.redirect(`/rooms/${roomCode}?username=${username}`);
});

const server = new http.Server(app);
const io = socketio(server);

const roomController = new RoomController();

server.listen(3000, () => {
  console.log('Listening on port 3000');
});

io.on('connection', socket => {
  const {roomId, username} = socket.handshake.query;
  socket.join(roomId);
  // console.log(JSON.stringify(io.sockets.adapter.rooms[roomId], null, 3));
  roomController.addPlayerToRoom(roomId, socket.id, username);
  const players = roomController.getNames(roomId);
  const roomHost = roomController.getRoomHost(roomId);
  io.in(roomId).emit('new player', {id: socket.id, players, roomHost});

  socket.on('start game', data => {
    const {roomId} = data;
    console.log('Received request to start game');
    try {
      const room = roomController.getRoom(roomId);
      if (!room.gameInProgress) {
        const initialState = roomController.startGame(roomId);
        const game = roomController.getGame(roomId);
        io.in(roomId).emit('start game', initialState);
      } else {
        console.log('Game already started');
      }
    } catch (err) {
      console.error('start game', err);
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('end game', data => {
    const {zombies, survivors, roomId} = data;
    const room = roomController.getRoom(roomId);
    if (room.gameInProgress) {
      room.gameInProgress = false;
      io.in(roomId).emit('end game', {zombies, survivors});
    }
  });

  socket.on('move', data => {
    const {roomId, location} = data;
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        const game = roomController.getGame(roomId);
        // game.movePlayer(socket.id, location);
        socket.to(roomId).emit('player moved', {id: socket.id, location});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      console.error('move', err);
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('fire', data => {
    const {roomId, fireAngle} = data;
    // console.log(JSON.stringify(data, null, 3));
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        socket.to(roomId).emit('weapon fired', {id: socket.id, fireAngle});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      console.error('fire', err);
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('died', data => {
    const {roomId} = data;
    console.log(JSON.stringify(data, null, 3));
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        const game = roomController.getGame(roomId);
        socket.emit('died', {id: socket.id});
        game.playerDied(socket.id).then(() => {
          io.in(roomId).emit('respawned', {id: socket.id});
          // socket.emit('respawn', {id: socket.id});
        });
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      console.error('fire', err);
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('hit', data => {
    const {roomId, id, damage} = data;
    // console.log(JSON.stringify(id, null, 3));
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        socket.to(roomId).emit('player hit', {id, damage});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      console.error('hit', err);
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('switch gun', data => {
    const {roomId, gun} = data;
    // console.log(JSON.stringify(id, null, 3));
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        socket.to(roomId).emit('switch gun', {id: socket.id, gun});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      console.error('switch gun', err);
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('disconnect', (data) => {
    try {
      roomController.removePlayerFromRooms(socket.id);
      socket.to(roomId).emit('player left', {id: socket.id});
    } catch (err) {
      console.error('disconnect', err);
    }
  });

  socket.on('activate', (data) => {
    // Remove PowerUp from gameboard, and activate it on the specific Player.
    const {roomId, id} = data;
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        socket.to(roomId).emit('activated drop', {id});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      console.error('activate', err);
      socket.emit('err', err);
    }
  });

  socket.on('change health', (data) => {
    // Remove PowerUp from gameboard, and activate it on the specific Player.
    const {roomId, change} = data;
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        socket.to(roomId).emit('change health', {id: socket.id, change});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      console.error('change health', err);
      socket.emit('err', err);
    }
  });

  socket.on('weapon pickup', data => {
    const {roomId, weaponId} = data;
    console.log(JSON.stringify(data, null, 3));
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        const game = roomController.getGame(roomId);
        const player = game.getPlayer(socket.id);
        if (player.avatar instanceof Human) {
          game.pickupWeapon(socket.id, weaponId);
          socket.emit(
              'player pickup weapon', {id: socket.id, weapon: weaponId});
        }
      }
    } catch (err) {
      console.error('weapon pickup', err);
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('weapon fired', data => {
    const {roomId} = data;
    console.log(JSON.stringify(data, null, 3));
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        const game = roomController.getGame(roomId);
        const player = game.getPlayer(socket.id);
        if (player.avatar instanceof Human && player.avatar.heldWeapon) {
          player.avatar.heldWeapon.fire();
          socket.emit('player fired weapon', {id: socket.id});
        }
      }
    } catch (err) {
      console.error(err, {message: err});
      socket.emit('err', {message: err.message});
    }
  });
});
