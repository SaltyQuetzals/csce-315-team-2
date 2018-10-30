import express = require('express');
import path = require('path');
import * as socketio from 'socket.io';
import http = require('http');
import * as session from 'express-session';
import {random} from './shared/functions';
import bodyParser = require('body-parser');
import {Game} from './models/Game';
import {RoomController} from './controllers/RoomController';
import { Human } from './models/Avatar';
import { Player } from './models/Player';

type RoomState = {
  roomLeader: string,
  game: Game,
  gameInProgress: boolean,
  names: {[socketid: string]: string}
};

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

app.post('/rooms', (req, res) => {
  const roomCode = random(ROOM_CODE_LENGTH);
  res.redirect(`/rooms/${roomCode}`);
});

app.get('/rooms/:roomCode', (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, '/html/room.html'));
});

const server = new http.Server(app);
const io = socketio(server);

const roomController = new RoomController();

server.listen(3000, () => {
  console.log('Listening on port 3000');
});

io.on('connection', socket => {
  socket.on('join room', data => {
    const {roomId, name} = data;  // TODO: Use name as key in `names` field
    socket.join(roomId);
    roomController.addPlayerToRoom(roomId, socket.id, socket.id);
    const game = roomController.getGame(roomId);
    io.to(roomId).emit('new player', {id: socket.id, game});
  });

  socket.on('start game', data => {
    const {roomId} = data;
    console.log('Received request to start game');
    try {
      const room = roomController.getRoom(roomId);
      if (!room.gameInProgress) {
        roomController.startGame(roomId);
        const game = roomController.getGame(roomId);
        io.to(roomId).emit('start game', game);
      } else {
        console.log('Game already started');
      }
    } catch (err) {
      console.error('start game', err);
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('move', data => {
    const {roomId, movementDelta} = data;
    console.log(JSON.stringify(data, null, 3));
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        const game = roomController.getGame(roomId);
        game.movePlayer(socket.id, movementDelta);
        socket.to(roomId).emit('player moved', {id: socket.id, movementDelta});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      console.error('move', err);
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('disconnect', (data) => {
    try {
      roomController.removePlayerFromRooms(socket.id);
    } catch (err) {
      console.error('disconnect', err);
    }
  });

  socket.on('weapon pickup', data => {
    const {roomId, weaponId} = data;
    console.log(JSON.stringify(data, null, 3));
    try{
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress){
        const game = roomController.getGame(roomId);
        const player = game.getPlayer(socket.id);
        if (player.avatar instanceof Human){
          game.pickupWeapon(socket.id, weaponId);
          socket.emit('player pickup weapon', {id: socket.id, weapon: weaponId});
        }
      }
    }
    catch(err){
      console.error('weapon pickup', err);
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('weapon fired', data => {
    const {roomId} = data;
    console.log(JSON.stringify(data, null, 3));
    try{
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress){
        const game = roomController.getGame(roomId);
        const player = game.getPlayer(socket.id);
        if (player.avatar instanceof Human && player.avatar.heldWeapon){
          player.avatar.heldWeapon.fire();
          socket.emit('player fired weapon', {id: socket.id});
        }
      }
    }
    catch(err){
      console.error(err, {message: err});
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('killed', data => {
    const {roomId, killedPlayerId} = data;
    console.log(JSON.stringify(data, null, 3));
    try{
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress){
        const game = roomController.getGame(roomId);
        game.playerKilled(socket.id, killedPlayerId);
        socket.emit('player killed', {id: socket.id, killedPlayerId: killedPlayerId});
      }
    }
    catch(err){
      console.error(err, {message: err});
      socket.emit('err', {message: err.message});
    }
  });

  
});
