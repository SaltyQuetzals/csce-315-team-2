import * as socket from 'socket.io-client';

import {Drop} from '../../../models/Drop';
import {Obstacle} from '../../../models/Obstacle';
import {Player} from '../../../models/Player';
import {CustomPlayer, Gun} from '../game-classes';
import {PLAYER_HEALTH} from '../game-constants';
import {initAvatar, initDrops, initObstacles, initPlayer} from '../init-helpers';
import {GameController} from '../models/Game';
import {AutomaticRifle, Revolver, SawnOffShotgun, Weapon} from '../models/Guns';
import {animateAvatar} from '../movement';
import {MovementParams, NewPlayerParams, Players, Socket, StartGameParams} from '../socket-classes';
import * as waiting from '../waiting';
import {switchGun} from '../weapon-functs';

export class SocketController {
  socket: Socket;
  private gameController: GameController;
  private roomId: string;
  private username: string;
  constructor(
      roomId: string, username: string, gameController: GameController) {
    this.socket = io.connect('/', {
      // query: `roomId=${roomId}`,
      query: {roomId, username}
    });

    this.roomId = roomId;
    this.username = username;
    this.gameController = gameController;

    this.socket.on('connect', () => {
      this.gameController.localPlayer.id = this.socket.id;
      this.gameController.localPlayer.character.id = this.socket.id;
      this.gameController.localPlayer.username = this.username;
      this.gameController.localPlayer.character.usernameText.setText(this.username);
      this.gameController.players[this.socket.id] =
          this.gameController.localPlayer;
      waiting.updateAccessCodeBox();

      // console.log(this.gameController.localPlayer.id);
      console.log('Connected successfully.');

      this.socket.on('start game', (message: StartGameParams) => {
        console.log('Received start game event');
        const {obstacles, drops, players} = message;
        this.startGame(obstacles, drops, players);
      });

      this.socket.on('new player', (message: NewPlayerParams) => {
        const {roomHost, id, username, players} = message;
        this.initNewPlayer(roomHost, id, username, players);
      });

      this.socket.on('player moved', (message: MovementParams) => {
        // console.log(game.players);
        const player = this.gameController.players[message.id]
        const avatar = player.character;
        const {x, y} = avatar;
        avatar.x = message.location.x;
        avatar.y = message.location.y;
        const dx = avatar.x - x;
        const dy = avatar.y - y;
        animateAvatar(avatar, dx, dy, player.gun);
        // console.log(avatar.id, dx, dy);
      });

      this.socket.on(
          'weapon fired', (message: {id: string, fireAngle: number}) => {
            const {id, fireAngle} = message;
            const gun = gameController.players[id].gun;
            gun.pGun.fireAngle = fireAngle;
            gun.shoot();
          });

      this.socket.on(
          'player hit',
          (message: {victimId: string, killerId: string, damage: number}) => {
            const {victimId, killerId, damage} = message;
            this.playerHit(victimId, killerId, damage);
          });

      this.socket.on('respawned', (message: {id: string}) => {
        const {id} = message;
        this.respawnPlayer(id);
      });

      this.socket.on('activated drop', (message: {id: string}) => {
        const {id} = message;

        const drop = this.gameController.drops[id];
        drop.sprite.destroy();
      });

      this.socket.on(
          'change health', (message: {id: string, change: number}) => {
            const {id, change} = message;
            const player = this.gameController.players[id];
            player.health += change;
          });

      this.socket.on(
          'powerup expired',
          (message: {}) => {
              // Reset stats
          });

      this.socket.on('switch gun', (message: {id: string, gun: string}) => {
        const {id, gun} = message;
        const player = gameController.players[id];
        switch (gun) {
          case 'revolver':
            switchGun(player.gun, new Revolver());
            break;
          case 'shotgun':
            switchGun(player.gun, new SawnOffShotgun());
            break;
          case 'automatic rifle':
            switchGun(player.gun, new AutomaticRifle());
            break;
          default:
            break;
        }
      });


      this.socket.on(
          'player left', (message: {id: string, roomHost: string}) => {
            const {id} = message;
            delete gameController.players[id];
            waiting.updatePlayerList(this.gameController.players);
            // if (message.roomHost === gameController.localPlayer.id)
            // startGamebutton.style.display = 'block';
          });

      this.socket.on('err', (message: {}) => {
        console.error(message);
      });

      this.socket.on('room full', () => {
        const errorDialog = document.getElementById('room-full-dialog');
        console.log(errorDialog);
        if (errorDialog) {
          errorDialog.style.display = 'block';
        }
      });

      this.socket.on(
          'end game', (data: {zombies: boolean, survivors: boolean}) => {
            const {zombies, survivors} = data;
            if (zombies) {
              gameController.endGame.setText('Zombies win!');
              console.log('ZOMBIES WIN');
            } else {
              gameController.endGame.setText('Survivors win!');
              console.log('SURVIVORS WIN');
            }
          });
    });
  }

  sendStartGame(): void {
    this.socket.emit('start game', {roomId: this.roomId});
  }

  sendMove(location: {x: number, y: number}): void {
    this.socket.emit('move', {roomId: this.roomId, location});
  }

  sendChangeHealth(change: number): void {
    this.socket.emit('change health', {roomId: this.roomId, change});
  }

  sendActivateDrop(id: number): void {
    this.socket.emit('activate', {roomId: this.roomId, id});
  }

  sendFireGun(fireAngle: number): void {
    this.socket.emit('fire', {roomId: this.roomId, fireAngle});
  }

  sendSwitchGun(gun: string): void {
    this.socket.emit('switch gun', {roomId: this.roomId, gun});
  }

  sendHit(id: string, damage: number): void {
    this.socket.emit('hit', {roomId: this.roomId, id, damage});
  }

  sendPlayerDied(killerId: string): void {
    this.socket.emit('died', {roomId: this.roomId, killerId});
  }

  sendGameEnded(): void {
    this.socket.emit('end game', {
      zombies: true,
      survivors: false,
      roomId: this.roomId,
    });
  }

  initNewPlayer(
      roomHost: string, playerId: string, username: string,
      players: {[playerId: string]: string}): void {
    let newPlayer = null;
    const startGameButton = document.getElementById('start');
    if (roomHost === this.gameController.localPlayer.id) {
      startGameButton!.style.display = 'block';
    }
    // console.log(JSON.stringify(Object.keys(this.gameController.players),
    // null, 3));
    if (playerId === this.gameController.localPlayer.id) {
      this.gameController.localPlayer.username = username;
      // create all preexisting players
      for (const id in players) {
        if (id && id) {
          this.gameController.numSurvivors++;
          if (id !== this.gameController.localPlayer.id) {
            newPlayer = initPlayer(id, players[id]);
            this.gameController.players[id] = newPlayer;
          }
        }
      }
    } else {
      // create only new player
      // console.log('Another player has joined the room!');
      newPlayer = initPlayer(playerId, players[playerId]);
      this.gameController.players[playerId] = newPlayer;
      this.gameController.numSurvivors++;
      // console.log(newPlayer.id);
    }
    waiting.updatePlayerList(this.gameController.players);
  }

  startGame(obstacles: [Obstacle], drops: [Drop], players: Players): void {
    initObstacles(obstacles);
    initDrops(drops);
    const socketPlayers: Players = players;

    // HACK(SaltyQuetzals): Kills player that's supposed to be the zombie for
    // starting the game.
    for (const socketId in socketPlayers) {
      if (socketPlayers[socketId].player.avatar.type === 'zombie') {
        const {avatar} = socketPlayers[socketId].player;
        const player = this.gameController.players[socketId];
        this.gameController.numSurvivors--;
        player.isZombie = true;
        const x = player.character.x;
        const y = player.character.y;
        player.character.destroy();
        player.character = initAvatar(player, 'zombie_1', x, y);
        if (player.id === this.gameController.localPlayer.id) {
          this.gameController.localPlayer = player;
        }
      }
    }
    for (const playerKey of Object.keys(socketPlayers)) {
      const avatar = this.gameController.players[playerKey].character;
      // avatar.x = socketPlayers[playerKey].player.avatar.location[0];
      // avatar.y = socketPlayers[playerKey].player.avatar.location[1];
      if (playerKey === this.gameController.localPlayer.id) {
        this.gameController.localPlayer.character = avatar;
      }
    }

    this.gameController.GAME_STARTED = true;
    const overlay: HTMLElement|null =
        document.getElementById('waiting-room-overlay');
    overlay!.style.display = 'none';
    const background: HTMLElement|null = document!.getElementById('background');
    background!.style.display = 'none';
  }

  playerHit(victimId: string, killerId: string, damage: number): void {
    const player = this.gameController.players[victimId];
    if (player.health <= damage) {
      player.health = 0;
      if (victimId === this.gameController.localPlayer.id) {
        // Movement is disabled
        player.isDead = true;
        this.sendPlayerDied(killerId);
        this.gameController.HUD.healthbar.width = 1.5 * player.health;
      }
      player.character.destroy();
    } else {
      player.health -= damage;
      // animate HIT
      player.character.animating = true;
      player.character.animations.play('hurt', 20, false);
      if (player.id === this.gameController.localPlayer.id) {
        this.gameController.HUD.healthbar.width = 1.5 * player.health;
      }
    }
  }

  respawnPlayer(playerId: string): void {
    // Redraw zombie sprite and reset health
    const player = this.gameController.players[playerId];

    player.health = PLAYER_HEALTH;

    if (player.isZombie) {
      const x = player.character.x;
      const y = player.character.y;
      player.character = initAvatar(player, 'zombie_1', x, y);
    } else {
      this.gameController.numSurvivors--;
      player.isZombie = true;
      const x = player.character.x;
      const y = player.character.y;
      player.character.destroy();
      player.character = initAvatar(player, 'zombie_1', x, y);
      if (this.gameController.numSurvivors === 0) {
        this.sendGameEnded();
      }
    }
    player.isDead = false;
    if (player.id === this.gameController.localPlayer.id) {
      this.gameController.HUD.healthbar.width = 1.5 * player.health;
      this.gameController.localPlayer = player;
    }
  }
}