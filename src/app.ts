import express = require("express");
import path = require("path");
import * as socketio from "socket.io";
import http = require("http");
import * as session from "express-session";
import { random } from "./shared/functions";
import bodyParser = require("body-parser");
import { Game } from "./models/Game";
import { Player } from "./models/Player";
import { stringify } from "querystring";

type RoomState = {
  roomLeader: string,
  game: Game,
  gameInProgress: boolean,
  names: { [socketid: string]: string }
};

const ROOM_CODE_LENGTH = 5;

const STATIC_DIR = path.join(__dirname, "public");

const sessionMiddleware = session({
  resave: true,
  saveUninitialized: true,
  secret: "baboon"
});

const app = express();

app.use(express.static(STATIC_DIR));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionMiddleware);

app.get("/", (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, "index.html"));
});

app.post("/rooms", (req, res) => {
  const roomCode = random(ROOM_CODE_LENGTH);
  res.redirect(`/rooms/${roomCode}`);
});

app.get("/rooms/:roomCode", (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, "/html/room.html"));
});

const server = new http.Server(app);
const io = socketio(server);

const rooms: { [roomCode: string]: RoomState } = {};

server.listen(3000, () => {
  console.log("Listening on port 3000");
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request, next);
});

io.on("connection", socket => {
  socket.on("join room", data => {
    const { room, name } = data;  // TODO: Use name as key in `names` field
    if (!(room in rooms)) {
      console.log(`Creating new room named: ${room}`);
      const names: { [socketid: string]: string } = {};
      names[socket.id] = socket.id; // TODO: Replace value with user-provided name.
      rooms[room] = {
        roomLeader: socket.id,
        game: new Game(1000, 1000),
        gameInProgress: false,
        names
      };
    } else {
      rooms[room].names[socket.id] = socket.id; // TODO: Replace value with user-provided name
    }
    socket.join(room);
    if (Object.keys(rooms[room].names).length === 11) { // Room is full
      socket.leave(room).emit("room full", {
        message: "The room you have requested is full. Try again later."
      });
      delete rooms[room].names[socket.id];  // TODO: Replace value with user-provided name
    } else if (rooms[room].gameInProgress) {
      socket.leave(room).emit("game started", {
        message: "The room you are trying to enter has already started their game. Try again later."
      });
      delete rooms[room].names[socket.id];
    } else {
      const eventData = {
        id: socket.id
      }
      socket.broadcast.to(data.room).emit("new player", eventData);
    }
  });

  socket.on("start game", data => {
    const { room } = data;
    console.log("start game request received for", room);
    if (rooms[room].gameInProgress) {
      console.log(`Room "${room}"'s game has already started. Ignoring request.`);
    } else if (socket.id !== rooms[room].roomLeader) {
      console.log(`A player that wasn't the leader tried to start a game for ${room}. Ignoring.`);
    } else {
      rooms[room].gameInProgress = true;
      const playerData: Array<{ name: string }> = [];
      for (const socketid of Object.keys(rooms[room].names)) {
        playerData.push({ name: rooms[room].names[socketid] });
      }

      rooms[room].game.generatePlayers(playerData);
      io.in(data.room).emit("start game", rooms[room].game);
    }
  });

  socket.on("move", data => {
    const { room, movementDelta } = data;

    if (rooms[room]) {// && rooms[room].gameInProgress) {
      //const game = rooms[room].game;
      // rooms[room].game.movePlayer(socket.id, movementDelta);          // ERROR
      const eventData = {
        playerId: socket.id,
        movementDelta: movementDelta
        // newPos: game.getPlayer(socket.id).avatar.position            // ERROR
      };
      
      socket.to(room).emit("player moved", eventData);
    }

  });

  socket.on('disconnect', () => {
    for (const roomId of Object.keys(rooms)) {
      if (rooms[roomId].roomLeader === socket.id) {
        console.log(`The room leader of room ${roomId} is disconnecting. Killing room.`);
        io.of('/').clients((err: Error, socketIds: string[]) => {
          if (err) {
            throw err;
          }
          socketIds.forEach(socketId => io.sockets.sockets[socketId].disconnect());
        });
        delete rooms[roomId];
        console.log(`Room ${roomId} killed.`);
      }
    }
  });
});
