import * as waiting from '../waiting';
import {Revolver, SawnOffShotgun, AutomaticRifle, Weapon} from '../models/Guns'; 
import {GameController} from '../models/Game';
import {initObstacles, initDrops, initAvatar, initPlayer} from '../init-helpers';
import * as socket from 'socket.io-client';
import { Obstacle } from '../../../models/Obstacle';
import { Drop } from '../../../models/Drop';
import {Player} from '../../../models/Player';
import {PLAYER_HEALTH} from '../game-constants';
import {CustomPlayer} from '../game-classes';
import {Socket, Players, NewPlayerParams, StartGameParams, MovementParams} from '../socket-classes';

class SocketController{
    private socket: Socket;  
    private gameController: GameController;
    private GAME_STARTED: boolean = false;
    private roomId: string;
    constructor(roomId: string, gameController: GameController){
        this.socket = io.connect("/", {
            query: `roomId=${roomId}`
        });
        this.roomId = roomId;
        this.gameController = gameController;

        this.socket.on('connect', () => {
            console.log('Connected successfully.');
            gameController.localPlayer.id = this.socket.id;
            gameController.players[gameController.localPlayer.id] = gameController.localPlayer;

            this.socket.on('start game', (message: StartGameParams) => {
                console.log('Received start game event');
                const {obstacles, drops, players} = message;
                this.startGame(obstacles, drops, players);
            });

            this.socket.on('new player', (message: NewPlayerParams) => {
                const {roomHost, id, players} = message;
                this.initNewPlayer(roomHost, id, players);
            });

            this.socket.on('player moved', (message: MovementParams) => {
                // console.log(game.players);
                const avatar = this.gameController.players[message.id].character;
                avatar.x = message.location.x;
                avatar.y = message.location.y;
            });

            this.socket.on('weapon fired', (message: {id: string, fireAngle: number}) => {
                const {
                    id,
                    fireAngle
                } = message;
                const gun = gameController.players[id].gun;
                //gun.fireAngle = fireAngle;
                gun.shoot();
            });

            this.socket.on('player hit', (message: {id: string, damage: number}) => {
                const {id, damage} = message;
                this.playerHit(id, damage);
            });

            this.socket.on('respawned', (message: {id: string}) => {
                const {id} = message;
                this.respawnPlayer(id);
            });

            this.socket.on('activated drop', (message: {id: string}) => {
                const {
                    id
                } = message;

                const drop = this.gameController.drops[id];
                drop.sprite.destroy();
            });

            this.socket.on('change health', (message: {id: string, change: number}) => {
                const {id, change} = message;
                const player = this.gameController.players[id];
                player.health += change;
            });

            this.socket.on('powerup expired', (message: {}) => {
                // Reset stats
            });

            /* Still unclear how to do this
            this.socket.on('switch gun', (message: {id: string, gun: string}) => {
                const {
                    id,
                    gun
                } = message;
                let player = gameController.players[id];
                switch (gun) {
                    case 'revolver':
                        player.gun = new Revolver();
                        switchGun(player.gun, Revolver);
                        break;
                    case 'shotgun':
                        switchGun(player.gun, SawnOffShotgun);
                        break;
                    case 'automatic rifle':
                        switchGun(player.gun, AutomaticRifle);
                        break;
                }
            });
            */

            this.socket.on('player left', (message: {id: string, roomHost: string}) => {
                const {
                    id
                } = message;
                delete gameController.players[id];
                waiting.updatePlayerList(gameController.players);
                //if (message.roomHost === gameController.localPlayer.id) startGameButton.style.display = 'block';
            })

            this.socket.on("err", (message: {}) => {
                console.error(message);
            });

            this.socket.on("room full", () => {
                const errorDialog = document.getElementById("room-full-dialog");
                console.log(errorDialog);
                if (errorDialog) {
                    errorDialog.style.display = "block";
                }
            });

            this.socket.on("end game", (data: {zombies: {}, survivors: {}}) => {
                let {
                    zombies,
                    survivors
                } = data;
                if (zombies) {
                    gameController.endGame.setText("Zombies win!");
                    console.log("ZOMBIES WIN");
                } else {
                    gameController.endGame.setText("Survivors win!");
                    console.log("SURVIVORS WIN");
                }
            });
        });
    }

    sendPlayerDied(): void{
        this.socket.emit('died', {
            roomId: this.roomId
        });
    }

    sendGameEnded(): void{
        this.socket.emit('end game',{
            zombies: true,
            survivors: false,
            roomId: this.roomId,
        });
    }

    initNewPlayer(roomHost: string, playerId: string, players: {}): void{
        let newPlayer = null;
        //if (roomHost === this.gameController.localPlayer.id) startGameButton.style.display = 'block';
        console.log(JSON.stringify(Object.keys(this.gameController.players), null, 3));
        if (playerId === this.gameController.localPlayer.id) {
            // create all preexisting players
            for (let id in players) {
                if (id && id){
                    this.gameController.numSurvivors++;
                    if (id !== this.gameController.localPlayer.id) {
                        newPlayer = initPlayer(id);
                        this.gameController.players[id] = newPlayer;

                    }
                }
            }
        } else {
            // create only new player
            console.log('Another player has joined the room!');
            newPlayer = initPlayer(playerId);
            this.gameController.players[playerId] = newPlayer;
            this.gameController.numSurvivors++;
            console.log(newPlayer.id);
        }
        waiting.updatePlayerList(this.gameController.players);
    }

    startGame(obstacles: [Obstacle], drops: [Drop], players: Players): void{
        initObstacles(obstacles);
        initDrops(drops);
        const socketPlayers: Players = players;

        // HACK(SaltyQuetzals): Kills player that's supposed to be the zombie for starting the game.
        for (const socketId in socketPlayers) {
            if (socketPlayers[socketId].player.avatar.type === 'zombie') {
                const {avatar} = socketPlayers[socketId].player;
                const player = this.gameController.players[socketId];
                this.gameController.numSurvivors--;
                player.isZombie = true;
                const x = player.facing.x;
                const y = player.facing.y;
                player.character.destroy();
                player.character = initAvatar(player, 'zombie_1', x, y);
                if (player.id === this.gameController.localPlayer.id) {
                    this.gameController.localPlayer = player;
                }
            }
        }
        this.GAME_STARTED = true;
        //document.getElementById('waiting-room-overlay').style.display = "none";
        //document.getElementById('background').style.display = "none";
    }

    playerHit(playerId: string, damage: number): void{
        const player = this.gameController.players[playerId];
        if (player.health <= damage) {
            player.health = 0;
            if (playerId === this.gameController.localPlayer.id) {
                // Movement is disabled
                player.isDead = true;
                this.sendPlayerDied();
            }
            player.character.destroy();
        } else {
            player.health -= damage;
            // animate HIT
            player.character.animating = true;
            player.character.animations.play('hurt', 20, false);
        }
    }

    respawnPlayer(playerId: string): void{
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
            if(this.gameController.numSurvivors === 0){
                this.sendGameEnded();
            }
        }
        player.isDead = false;
    }
}