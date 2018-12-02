import * as socket from 'socket.io-client';

import {Drop} from '../../../models/Drop';
import {Obstacle} from '../../../models/Obstacle';
import {Player} from '../../../models/Player';
import {delay} from '../../../shared/functions';
import {CustomPlayer, Gun, LeaderBoard} from '../classes/game-classes';
import {MovementParams, NewPlayerParams, Players, Socket, StartGameParams} from '../classes/socket-classes';
import {deactivateDrop, melee, meleeAnim} from '../helper/collisons-functs';
import {PLAYER_HEALTH} from '../helper/game-constants';
import {initAvatar, initDrops, initObstacles, initPlayer} from '../helper/init-helpers';
import {switchGun} from '../helper/weapon-functs';
import {togglePowerup, updateHUDText} from '../HUD';
import {room} from '../main';
import {GameController} from '../models/Game';
import {AutomaticRifle, Revolver, SawnOffShotgun, Weapon} from '../models/Guns';
import {animateAvatar, shiftHitbox} from '../movement';
import { isUndefined } from 'util';

export class SocketController {
  socket: Socket;
  gameController!: GameController;
  private roomId: string;
  private username: string;
  private roomHost!: string;
  constructor(roomId: string, username: string) {
    this.socket = io.connect('/', {
      // query: `roomId=${roomId}`,
      query: {roomId, username}
    });

    this.roomId = roomId;
    this.username = username;

    this.socket.on('connect', () => {
      room.updateAccessCodeBox();

      // console.log(this.gameController.localPlayer.id);
      console.log('Connected successfully.');

      this.socket.on('new player', (message: NewPlayerParams) => {
        const {roomHost, newPlayerId, playerNames, leaderBoard} = message;
        this.roomHost = roomHost;
        if (newPlayerId === this.socket.id) {
          this.username = username;
        }
        this.playerJoined(playerNames, leaderBoard);
      });

      this.socket.on('countdown', async () => {
        const countdownLabel = document.getElementById('countdown');
        if (countdownLabel) {
          for (let i = 5; i >= 0; i--) {
            countdownLabel.innerHTML = `${i}`;
            await delay(1000);
          }
          countdownLabel.innerHTML = ``;
        }
      });

      this.socket.on('start game', (message: StartGameParams) => {
        console.log('Received start game event');
        // console.log(message);
        const {initialState, playerNames} = message;
        // const { roomHost, id, username, players } = message;

        this.gameController.localPlayer.id = this.socket.id;
        this.gameController.localPlayer.character.id = this.socket.id;
        this.gameController.localPlayer.username = this.username;
        this.gameController.localPlayer.character.usernameText.setText(
            this.username);
        this.gameController.players[this.socket.id] =
            this.gameController.localPlayer;


        this.initNewPlayers(playerNames);
        this.startGame(
            initialState.obstacles, initialState.drops, initialState.players);
      });

      this.socket.on('player moved', (message: MovementParams) => {
        // const pairs: Array<[string, string]> = [];
        // for (const socketId of Object.keys(this.gameController.players)) {
        //   pairs.push(
        //       [socketId, this.gameController.players[socketId].username]);
        // }
        // console.log(JSON.stringify(pairs, null, 3));
        const player = this.gameController.players[message.id];
        player.facing = message.facing;
        shiftHitbox(player);
        const avatar = player.character;
        // console.log(message);
        avatar.x = message.location.x;
        avatar.y = message.location.y;
        avatar.body.velocity.x = message.velocity.x;
        avatar.body.velocity.y = message.velocity.y;
        animateAvatar(avatar, player.gun);
        // console.log(avatar.id, dx, dy);
      });

      this.socket.on(
          'weapon fired', (message: {id: string, fireAngle: number}) => {
            const {id, fireAngle} = message;
            const shooter = this.gameController.players[id];
            const gun = shooter.gun;
            gun.pGun.fireAngle = fireAngle;
            if (gun.shoot()) {
              const dx = shooter.character.x -
                  this.gameController.localPlayer.character.x;
              const dy = shooter.character.y -
                  this.gameController.localPlayer.character.y;
              const volume = this.gameController.soundGauger(dx, dy);
              shooter.customSounds.shoot.play(undefined, undefined, volume);
            }
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

      this.socket.on('deactivate drop', (message: {type: string}) => {
        const {type} = message;
        deactivateDrop(type);
      });

      this.socket.on('switch gun', (message: {id: string, gun: string}) => {
        const {id, gun} = message;
        const player = this.gameController.players[id];
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
          'change gun damage', (message: {id: string, damage: number}) => {
            const {id, damage} = message;
            const player = this.gameController.players[id];
            player.gun.damage = damage;
          });

      this.socket.on('zombie attack', (message: {zombieId: string}) => {
        const {zombieId} = message;
        const player = this.gameController.players[zombieId];
        meleeAnim(player);
      });

      this.socket.on('player left', (message: {
                                      leaverId: string,
                                      roomHost: string,
                                      playerNames: {[socketId: string]: string},
                                      leaderBoard: LeaderBoard
                                    }) => {
        const {leaverId, roomHost, playerNames, leaderBoard} = message;
        console.log(message);
        if (!isUndefined(this.gameController.players[leaverId])) {
          delete this.gameController.players[leaverId];
        }
        this.roomHost = roomHost;
        room.updatePlayerList(playerNames, leaderBoard);
        if (this.roomHost === this.socket.id) {
          document.getElementById('start')!.style.display = 'block';
        }
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

      this.socket.on('end game', (data: {
                                   zombies: boolean,
                                   survivors: boolean,
                                   leaderBoard: {},
                                   playerNames: {}
                                 }) => {
        const {zombies, survivors, leaderBoard, playerNames} = data;
        console.log(leaderBoard);
        this.gameController.timer.pause();
        if (zombies) {
          this.gameController.endGame.setText('Zombies win!');
          console.log('ZOMBIES WIN');
        } else {
          this.gameController.endGame.setText('Survivors win!');
          console.log('SURVIVORS WIN');
        }

        // Only play winning music if localplayer is human
        room.game.customSounds.gameBg.stop();
        if (room.game.localPlayer.isZombie) {
          room.game.customSounds.loss.play(
              undefined, undefined, undefined, true);
        } else {
          room.game.customSounds.win.play(
              undefined, undefined, undefined, true);
        }

        delay(8000).then(() => {
          const restart = room.restartGame.bind(room);
          setTimeout(restart(playerNames, leaderBoard), 5000);
          if (this.roomHost === this.socket.id) {
            document.getElementById('start')!.style.display = 'inherit';
          }
        });
      });
    });
  }

  sendStartGame(): void {
    this.socket.emit('start game', {roomId: this.roomId});
  }

  sendMove(location: { x: number, y: number }, velocity: { x: number, y: number }, facing: {x: number, y: number}):
      void {
    this.socket.emit('move', {roomId: this.roomId, location, velocity, facing});
  }

  sendChangeHealth(change: number): void {
    this.socket.emit('change health', {roomId: this.roomId, change});
  }

  sendActivateDrop(id: number, type: string): void {
    this.socket.emit('activate', {roomId: this.roomId, id, type});
  }

  sendFireGun(fireAngle: number): void {
    this.socket.emit('fire', {roomId: this.roomId, fireAngle});
  }

  sendSwitchGun(gun: string): void {
    this.socket.emit('switch gun', {roomId: this.roomId, gun});
  }

  sendChangeGunDamage(damage: number): void {
    this.socket.emit('change gun damage', {roomId: this.roomId, damage});
  }

  sendZombieAttack(): void {
    this.socket.emit('zombie attack', {roomId: this.roomId});
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

  playerJoined(players: {[socketId: string]: string}, leaderBoard: LeaderBoard):
      void {
    const startGameButton = document.getElementById('start');
    if (this.roomHost === this.socket.id) {
      startGameButton!.style.display = 'block';
    } else {
      startGameButton!.style.display = 'none';
    }
    room.updatePlayerList(players, leaderBoard);
  }

  initNewPlayers(
      // roomHost: string, playerId: string, username: string,
      players: {[playerId: string]: string}): void {
    let newPlayer = null;
    console.log(players);

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
    updateHUDText();
  }

  startGame(
      obstacles: Obstacle[], drops: {[dropId: number]: Drop;},
      players: Players): void {
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
        this.gameController.numZombies++;
        updateHUDText();
        player.isZombie = true;
        const x = player.character.x;
        const y = player.character.y;
        player.character.destroy();
        player.character = initAvatar(player, 'zombie_1', x, y);
        if (player.id === this.gameController.localPlayer.id) {
          this.gameController.localPlayer = player;
          this.gameController.HUD.ammo.graphic.kill();
          this.gameController.HUD.ammo.text.kill();
        }
      }
    }
    for (const playerKey of Object.keys(socketPlayers)) {
      const avatar = this.gameController.players[playerKey].character;
      avatar.x = socketPlayers[playerKey].player.avatar.location[0];
      avatar.y = socketPlayers[playerKey].player.avatar.location[1];
      if (playerKey === this.gameController.localPlayer.id) {
        this.gameController.localPlayer.character = avatar;
      }
    }

    this.gameController.GAME_STARTED = true;
    this.gameController.timer.start();
    this.gameController.customSounds.gameBg.play(
        undefined, undefined, undefined, true);
    const overlay: HTMLElement|null =
        document.getElementById('waiting-room-overlay');
    overlay!.style.display = 'none';
    const background: HTMLElement|null = document!.getElementById('background');
    background!.style.display = 'none';
  }

  async playerHit(victimId: string, killerId: string, damage: number) {
    // console.log(`victim: ${victimId}, killer: ${killerId}, dmg: ${damage}`);
    const player = this.gameController.players[victimId];
    if (player.health <= damage) {
      if (!player.isDead) {
        player.health = 0;
        player.character.body.velocity.x = 0;
        player.character.body.velocity.y = 0;
        if (victimId === this.gameController.localPlayer.id) {
          // Movement is disabled
          player.isDead = true;
          this.sendPlayerDied(killerId);
          this.gameController.HUD.healthbar.width = 1.5 * player.health;
          this.gameController.deaths += 1;
          updateHUDText();
        }
        player.character.animations.play('die', 15, false);
      }
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
      player.character.destroy();
      player.character = initAvatar(player, 'zombie_1', x, y);
    } else {
      this.gameController.numZombies++;
      this.gameController.numSurvivors--;
      updateHUDText();
      if (playerId === this.socket.id) {
        this.gameController.HUD.ammo.graphic.kill();
        this.gameController.HUD.ammo.text.kill();
      }
      player.isZombie = true;
      const x = player.character.x;
      const y = player.character.y;
      player.character.destroy();
      player.character = initAvatar(player, 'zombie_1', x, y);
      if (this.gameController.numSurvivors === 0) {
        this.sendGameEnded();
      }
    }
    player.character.animations.play('revive', 15, false).onComplete.add(() => {
      player.isDead = false;
    }, this);
    // player.isDead = false;
    if (player.id === this.gameController.localPlayer.id) {
      this.gameController.HUD.healthbar.width = 1.5 * player.health;
      this.gameController.localPlayer = player;
    }
  }
}