import * as waiting from '../waiting';
import * as GUNS from '../models/Guns'; 
import {Game} from '../models/Game';
import * as socket from 'socket.io-client';

type StartGameParams = {
    obstacles: {},
    drops: {},
    players: {}
};

type MovementParams = {
    id: string,
    location: {
        x: number,
        y: number
    }
};

interface NewPlayerParams {
    roomHost: string;
    id: string;
    players: {
        [playerId: string]: string
    };
}

interface Players {
    [socketId: string]: {
        avatar: {},
        player: {}
    };
}

class SocketController{
    private socket: socket.Socket;  
    private game: Game;
    private roomId: string;
    constructor(roomId: string, game: Game){
        this.socket = io.connect("/", {
            query: `roomId=${roomId}`
        });
        this.roomId = roomId;
        this.game = game;

        this.socket.on('connect', () => {
            console.log('Connected successfully.');
            game.localPlayer.id = this.socket.id;
            game.players[game.localPlayer.id] = game.localPlayer;

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
                const avatar = this.game.players[message.id].character;
                avatar.x = message.location.x;
                avatar.y = message.location.y;
            });

            this.socket.on('weapon fired', (message: {id: string, fireAngle: number}) => {
                const {
                    id,
                    fireAngle
                } = message;
                const gun = game.players[id].gun;
                gun.fireAngle = fireAngle;
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

                const drop = this.game.drops[id];
                drop.sprite.destroy();
            });

            this.socket.on('change health', (message: {id: string, change: number}) => {
                const {id, change} = message;
                const player = this.game.players[id];
                player.health += change;
            });

            this.socket.on('powerup expired', (message: {}) => {
                // Reset stats
            });

            this.socket.on('switch gun', (message: {id: string, gun: Gun}) => {
                const {
                    id,
                    gun
                } = message;
                player = game.players[id];
                switch (gun) {
                    case 'revolver':
                        switchGun(player.gun, revolver);
                        break;
                    case 'shotgun':
                        switchGun(player.gun, shotgun);
                        break;
                    case 'automatic rifle':
                        switchGun(player.gun, ar);
                        break;
                }
            });

            this.socket.on('player left', (message) => {
                const {
                    id
                } = message;
                delete game.players[id];
                waiting.updatePlayerList(game.players);
                if (message.roomHost === game.localPlayer.id) startGameButton.style.display = 'block';
            })

            this.socket.on("err", ({
                message
            }) => {
                console.error(message);
            });

            this.socket.on("room full", () => {
                const errorDialog = document.getElementById("room-full-dialog");
                console.log(errorDialog);
                if (errorDialog) {
                    errorDialog.style.display = "block";
                }
            });

            this.socket.on("end game", data => {
                let {
                    zombies,
                    survivors
                } = data;
                if (zombies) {
                    game.EndGame.setText("Zombies win!");
                    console.log("ZOMBIES WIN");
                } else {
                    game.EndGame.setText("Survivors win!");
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
        if (roomHost === this.game.localPlayer.id) startGameButton.style.display = 'block';
        console.log(JSON.stringify(Object.keys(this.game.players), null, 3));
        if (playerId === this.game.localPlayer.id) {
            // create all preexisting players
            for (let id in players) {
                if (id && id){
                    this.game.numSurvivors++;
                    if (id !== this.game.localPlayer.id) {
                        newPlayer = this.game.initPlayer(id);
                        this.game.players[id] = newPlayer;

                    }
                }
            }
        } else {
            // create only new player
            console.log('Another player has joined the room!');
            newPlayer = this.game.initPlayer(playerId);
            this.game.players[playerId] = newPlayer;
            this.game.numSurvivors++;
            console.log(newPlayer.id);
        }
        waiting.updatePlayerList(this.game.players);
    }

    startGame(obstacles: {}, drops: {}, players: Players): void{
        this.game.initObstacles(obstacles);
        this.game.initDrops(drops);
        const socketPlayers: {[socketId: string]: {avatar: {}}} = players;

        // HACK(SaltyQuetzals): Kills player that's supposed to be the zombie for starting the game.
        for (const socketId in socketPlayers) {
            if (socketPlayers[socketId].player.avatar.type === 'zombie') {
                const {avatar} = socketPlayers[socketId];
                const player = this.game.players[socketId];
                this.game.numSurvivors--;
                player.isZombie = true;
                const x = player.x;
                const y = player.y;
                player.character.destroy();
                player.character = this.game.initAvatar(player, 'zombie_1', x, y);
                if (player.id === this.game.localPlayer.id) {
                    this.game.localPlayer = player;
                }
            }
        }
        this.game.GAME_STARTED = true;
        document.getElementById('waiting-room-overlay').style.display = "none";
        document.getElementById('background').style.display = "none";
    }

    playerHit(playerId: string, damage: number): void{
        const player = this.game.players[playerId];
        if (player.health <= damage) {
            player.health = 0;
            if (playerId === this.game.localPlayer.id) {
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
        const player = this.game.players[playerId];

        player.health = PLAYER_HEALTH;

        if (player.isZombie) {
            const x = player.character.x;
            const y = player.character.y;
            player.character = this.game.initAvatar(player, 'zombie_1', x, y);
        } else {
            this.game.numSurvivors--;
            player.isZombie = true;
            const x = player.character.x;
            const y = player.character.y;
            player.character.destroy();
            player.character = this.game.initAvatar(player, 'zombie_1', x, y);
            if(this.game.numSurvivors === 0){
                this.sendGameEnded();
            }
        }
        player.isDead = false;
    }
}