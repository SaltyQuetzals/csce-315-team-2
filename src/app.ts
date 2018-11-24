import express = require('express');
import path = require('path');
import * as socketio from 'socket.io';
import http = require('http');
import * as session from 'express-session';
import {random, delay} from './shared/functions';
import bodyParser = require('body-parser');
import {RoomController} from './controllers/RoomController';

import * as winston from 'winston';

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

app.get('/rooms/:roomCode', (req, res) => {
  const {roomCode} = req.params;
  const {username} = req.query;

  if (roomController.roomExists(roomCode)) {
    console.log('test');
    if (roomController.getRoom(roomCode).gameInProgress) {
      console.log('test2');
      res.redirect('/');
    } else {
      if (!username || username === '') {
        res.redirect(`/username?roomcode=${roomCode}`);
      } else {
        res.sendFile(path.join(STATIC_DIR, '/html/room.html'));
      }
    }
  } else {
    if (!username || username === '') {
      res.redirect(`/username?roomcode=${roomCode}`);
    } else {
      res.sendFile(path.join(STATIC_DIR, '/html/room.html'));
    }
  }
});

app.get('/username', (req, res) => {
  const {roomcode} = req.query;
  if (!roomcode || roomcode === '') {
    res.redirect('/');
  } else {
    res.sendFile(path.join(STATIC_DIR, '/html/username.html'));
  }
});

app.post('/rooms', (req, res) => {
  const {username} = req.body;
  const roomCode = random(ROOM_CODE_LENGTH);
  if (!username || username === '') {
    res.redirect(`/username?roomcode=${roomCode}`);
  } else {
    res.redirect(`/rooms/${roomCode}?username=${username}`);
  }
});

const server = new http.Server(app);
const io = socketio(server);

const roomController = new RoomController();

const logger = winston.createLogger({
  format: winston.format.combine(
      winston.format.timestamp(), winston.format.prettyPrint(),
      winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({filename: 'log/user-interactions.log'})
  ]
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${process.env.PORT || 3000}`);
});

io.on('connection', socket => {
  const {roomId, username} = socket.handshake.query;
  socket.join(roomId);
  logger.info(`Player joined room`, {socketId: socket.id, roomId, username});
  roomController.addPlayerToRoom(roomId, socket.id, username);
  const players = roomController.getNames(roomId);
  const roomHost = roomController.getRoomHost(roomId);
  io.in(roomId).emit('new player', {
    roomHost,
    newPlayerId: socket.id,
    playerNames: players,
    leaderBoard: roomController.getRoom(roomId).leaderboard
  });

  socket.on('start game', data => {
    const {roomId} = data;

    try {
      const room = roomController.getRoom(roomId);
      if (!room.gameInProgress) {
        const players = roomController.getNames(roomId);
        const initialState = roomController.startGame(roomId);
        logger.info('Start game', {roomId, initialState});
        io.in(roomId).emit('start game', { initialState, playerNames: players });
        roomController.startTimer().then(() => {
          if (room.gameInProgress) {
            room.gameInProgress = false;
            io.in(roomId).emit('end game', {
              zombies: false,
              survivors: true,
              leaderBoard: room.leaderboard,
              playerNames: players
            });
          }
        });
      } else {
        console.log('Game already started');
      }
    } catch (err) {
      logger.error('Start game', {roomId, socketId: socket.id, err});
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('end game', data => {
    const {zombies, survivors, roomId} = data;

    logger.info('Game over', {roomId});
    const room = roomController.getRoom(roomId);
    const players = roomController.getNames(roomId);
    if (room.gameInProgress) {
      room.gameInProgress = false;
      io.in(roomId).emit('end game', {
        zombies,
        survivors,
        leaderBoard: room.leaderboard,
        playerNames: players
      });
    }
  });

  socket.on('move', data => {
    const {roomId, location, facing} = data;

    const loggerMeta = {
      roomId,
      location,
      facing,
      socketId: socket.id,
    };
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        logger.info('move', loggerMeta);
        socket.to(roomId).emit(
            'player moved', {id: socket.id, location, facing});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      logger.error('move', {...loggerMeta, err});
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('fire', data => {
    const {roomId, fireAngle} = data;

    const loggerMeta = {roomId, fireAngle, socketId: socket.id};
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        logger.info('fire', loggerMeta);
        socket.to(roomId).emit('weapon fired', {id: socket.id, fireAngle});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      logger.error('fire', {...loggerMeta, err});
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('died', data => {
    // Player id will come from socket id
    const {roomId, killerId} = data;
    const loggerMeta = {roomId, killerId, victimId: socket.id};
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        logger.info('died', loggerMeta);
        socket.emit('died', {id: socket.id});

        room.leaderboard.playerKilled(killerId, socket.id).then(() => {
          logger.info('respawn', {respawnedId: socket.id});
          io.in(roomId).emit('respawned', {id: socket.id});
        });
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      logger.error('died', {...loggerMeta, err});
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('hit', data => {
    const {roomId, id, damage} = data;
    const loggerMeta = {roomId, victimId: id, shooterId: socket.id, damage};
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        logger.info('hit', loggerMeta);
        socket.to(roomId).emit(
            'player hit', {victimId: id, killerId: socket.id, damage});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      logger.error('hit', {...loggerMeta, err});
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('switch gun', data => {
    const {roomId, gun} = data;
    const loggerMeta = {roomId, gun, playerId: socket.id};
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        logger.info('switch gun', loggerMeta);
        socket.to(roomId).emit('switch gun', {id: socket.id, gun});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      logger.error('switch gun', {...loggerMeta, err});
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('zombie attack', (data) => {
    const {roomId} = data;
    const loggerMeta = {roomId, playerId: socket.id};
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        logger.info('zombie attack', loggerMeta);
        socket.to(roomId).emit('zombie attack', {zombieId: socket.id});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      logger.error('zombie attack', {...loggerMeta, err});
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('disconnect', () => {
    const loggerMeta = {leaverId: socket.id};
    try {
      roomController.removePlayerFromRooms(socket.id);
      const playerNames = roomController.getNames(roomId);
      const roomHost = roomController.getRoomHost(roomId);
      logger.info('disconnect', loggerMeta);
      socket.to(roomId).emit('player left', {
        roomHost,
        playerNames,
        leaderBoard: roomController.getRoom(roomId).leaderboard
      });
    } catch (err) {
      logger.error('disconnect', {...loggerMeta, err});
      console.error('disconnect', err);
    }
  });

  socket.on('activate', (data) => {
    // Remove PowerUp from gameboard, and activate it on the specific Player.
    const {roomId, id, type} = data;
    const loggerMeta = {roomId, playerId: socket.id, dropId: id, dropType: type};
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        logger.info('activate', loggerMeta);
        socket.to(roomId).emit('activated drop', { id });
        room.leaderboard.dropCollected(type).then(() => {
          socket.emit('deactivate drop', { type });
        });
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      logger.error('activate', {...loggerMeta, err});
      socket.emit('err', err);
    }
  });

  socket.on('change health', (data) => {
    // Remove PowerUp from gameboard, and activate it on the specific Player.
    const {roomId, change} = data;
    const loggerMeta = {roomId, playerId: socket.id, change};
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        logger.info('change health', loggerMeta);
        socket.to(roomId).emit('change health', {id: socket.id, change});
      } else {
        console.log('Game not started');
      }
    } catch (err) {
      logger.error('change health', {...loggerMeta, err});
      socket.emit('err', err);
    }
  });

  socket.on('weapon pickup', data => {
    const {roomId, weaponId} = data;
    const loggerMeta = {roomId, weaponId, playerId: socket.id};
    console.log(JSON.stringify(data, null, 3));
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        if (room.leaderboard.players[socket.id].stats.isHuman) {
          logger.info('weapon pickup', loggerMeta);
          socket.emit(
              'player pickup weapon', {id: socket.id, weapon: weaponId});
        }
      }
    } catch (err) {
      logger.error('weapon pickup', {...loggerMeta, err});
      socket.emit('err', {message: err.message});
    }
  });

  socket.on('weapon fired', data => {
    const {roomId} = data;
    const loggerMeta = {roomId, playerId: socket.id};
    console.log(JSON.stringify(data, null, 3));
    try {
      const room = roomController.getRoom(roomId);
      if (room.gameInProgress) {
        if (room.leaderboard.players[socket.id].stats.isHuman) {
          logger.info('weapon fired', loggerMeta);
          socket.emit('player fired weapon', {id: socket.id});
        }
      }
    } catch (err) {
      logger.error('weapon fired', {...loggerMeta, err});
      socket.emit('err', {message: err.message});
    }
  });
});
