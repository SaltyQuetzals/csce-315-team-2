const waiting = require('./waiting.js');
const GUNS = require("../../models/Guns.js")


const GAME_VIEW_WIDTH = 800;
const GAME_VIEW_HEIGHT = 600;
const GAME_WIDTH = 2400;
const GAME_HEIGHT = 1800;
const PLAYER_HEALTH = Number(100);
const ar = new GUNS.AutomaticRifle();
const revolver = new GUNS.Revolver();
const shotgun = new GUNS.SawnOffShotgun();

var ZOMBIE_SPEED = 200;

const playerList = document.getElementById('player-list');

var GAME_STARTED;
var gun;
var socket;
var roomHost;

const splitUrl = location.href.split("/");
const roomId = splitUrl[splitUrl.length - 1];
waiting.updateAccessCodeBox();

const KEYBOARD = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'spacebar'
}

const PLR_KEYBOARD = {
    up: false,
    left: false,
    down: false,
    right: false,
    spacebar: false
}

const DIRECTION = {

    NORTH: -1,
    EAST: 1,
    SOUTH: 1,
    WEST: -1

}

const DROPIMAGES = {
    'automatic rifle': 'Automatic Rifle',
    'revolver': 'Revolver',
    'shotgun': 'Shotgun',
    'WeirdFlex': 'p1',
    'Grit': 'p2',
    'Hammertime': 'p3',
    'Jackpot': 'p4'
}

const game = new Phaser.Game(
    GAME_VIEW_WIDTH,
    GAME_VIEW_HEIGHT,
    Phaser.CANVAS,
    '', {
        init: init,
        preload: preload,
        create: create,
        update: update,
        render: render
    }
);

function init() {
    game.stage.disableVisibilityChange = true;
    GAME_STARTED = false;
}

function preload() {
    console.log("preloading");
    game.load.image('bg', '../assets/bg.png');
    game.load.image('bullet', '../assets/bullet.png');
    game.load.image('Automatic Rifle', '../assets/AutomaticRifle.png');
    game.load.image('Revolver', '../assets/Revolver.png');
    game.load.image('Shotgun', '../assets/Shotgun.png');
    game.load.image('p1', '../assets/WeirdFlex.png');
    game.load.image('p2', '../assets/Grit.png');
    game.load.image('p3', '../assets/Hammertime.png');
    game.load.image('p4', '../assets/Jackpot.png');
    game.load.spritesheet('weapons',
        '../assets/WeaponsSpriteSheet.png',
        64, // frame width
        64, // frame height
    );
    game.load.spritesheet('zombie_1',
        '../assets/ZombieWalkingSpriteSheet2.png',
        64, // frame width
        64, // frame height
    );
    game.load.spritesheet('survivor_1',
        '../assets/SurvivorWalkingSpriteSheet.png',
        64, // frame width
        64, // frame height
    );
    game.load.image('field_of_view', '../assets/FieldOfView.png');
}


function create() {

    console.log("Creating");
    game.physics.startSystem(Phaser.Physics.Arcade);
    game.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg = game.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg');

    game.players = {};
    game.drops = {};

    game.targets = game.add.group();
    game.physics.arcade.enable(game.targets);

    game.obstacles = game.add.group();
    game.physics.arcade.enable(game.obstacles);

    game.dropSprites = game.add.group();
    game.physics.arcade.enable(game.dropSprites);

    game.localPlayer = {};
    game.localPlayer.id = 0;
    game.localPlayer = initPlayer(0);
    game.camera.follow(game.localPlayer.character);

    game.numSurvivors = 0;

    //Field of View
    // game.localPlayer.fov = game.add.sprite(0, 0, 'field_of_view');
    // game.localPlayer.fov.scale.setTo(.1, .1);
    // game.localPlayer.fov.anchor.setTo(0.5, 0.5);
    // game.localPlayer.fov.offset.setTo(character.width/2, character.height/2)
    // game.localPlayer.character.addChild(game.localPlayer.fov);

    //Controls
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


    //Keyboard Events
    game.localPlayer.keyboard = {
        ...PLR_KEYBOARD
    };
    game.input.keyboard.onDownCallback = function (event) {
        if (GAME_STARTED && KEYBOARD[event.keyCode] &&
            !game.localPlayer.keyboard[KEYBOARD[event.keyCode]]) {
            game.localPlayer.keyboard[KEYBOARD[event.keyCode]] = true;
        }
        // //Alternate Guns for testing purposes
        // if (event.keyCode == Phaser.Keyboard.Z){
        //     switchGun(game.localPlayer.gun, shotgun);
        // }
        // if (event.keyCode == Phaser.Keyboard.X){
        //     switchGun(game.localPlayer.gun, ar);
        // }
        // if (event.keyCode == Phaser.Keyboard.C){
        //     switchGun(game.localPlayer.gun, revolver);
        // }
    }
    game.input.keyboard.onUpCallback = function (event) {
        if (GAME_STARTED && KEYBOARD[event.keyCode] &&
            game.localPlayer.keyboard[KEYBOARD[event.keyCode]]) {
            game.localPlayer.keyboard[KEYBOARD[event.keyCode]] = false;
        }
    }

    socket = io.connect("/", {
        query: `roomId=${roomId}`
    });

    socket.on('connect', () => {
        console.log('Connected successfully.');
        game.localPlayer.id = socket.id;
        game.players[game.localPlayer.id] = game.localPlayer;

        socket.on('start game', (message) => {
            console.log('Received start game event');
            initObstacles(message._obstacles);
            initDrops(message.drops);

            const {
                players: socketPlayers
            } = message;

            // HACK(SaltyQuetzals): Kills player that's supposed to be the zombie for starting the game.
            for (const socketId in socketPlayers) {
                if (socketPlayers[socketId].avatar.type === 'zombie') {
                    const {
                        avatar
                    } = socketPlayers[socketId];
                    const player = game.players[socketId];
                    game.numSurvivors--;
                    player.isZombie = true;
                    const [x, y] = avatar._position;
                    player.character.destroy();
                    player.character = initAvatar(player, 'zombie_1', x, y);
                }
            }
            GAME_STARTED = true;
            document.getElementById('waiting-room-overlay').style.display = "none";
            document.getElementById('background').style.display = "none";
        })

        socket.on('new player', (message) => {
            if (message.roomHost === game.localPlayer.id) startGameButton.style.display = 'block';
            console.log(JSON.stringify(Object.keys(game.players), null, 3));
            if (message.id === game.localPlayer.id) {
                // create all preexisting players
                for (var id in message.players) {
                    game.numSurvivors++;
                    if (id != game.localPlayer.id) {
                        newPlayer = initPlayer(id);
                        game.players[id] = newPlayer;

                    }
                }
            } else {
                // create only new player
                console.log('Another player has joined the room!');
                newPlayer = initPlayer(message.id);
                game.players[message.id] = newPlayer;
                game.numSurvivors++;
                console.log(newPlayer.id);
            }
            waiting.updatePlayerList(game.players);
        })

        socket.on('player moved', (message) => {
            // console.log(game.players);
            avatar = game.players[message.id].character;
            avatar.x = message.location.x;
            avatar.y = message.location.y;
        })

        socket.on('weapon fired', (message) => {
            const {
                id,
                fireAngle
            } = message;
            let gun = game.players[id].gun;
            gun.fireAngle = fireAngle;
            gun.shoot();
        })

        socket.on('player hit', (message) => {
            const {
                id,
                damage
            } = message;
            let player = game.players[id];
            if (player.health <= damage) {
                player.health = 0;
                if (id === game.localPlayer.id) {
                    // Movement is disabled
                    player.isDead = true;
                    socket.emit('died', {
                        roomId
                    })
                }
                player.character.kill();
            } else {
                player.health -= damage;
                // animate HIT
                player.character.animating = true;
                player.character.animations.play('hurt', 20, false);
            }
        })

        socket.on('respawned', (message) => {
            // Redraw zombie sprite and reset health
            const {
                id
            } = message;
            player = game.players[id];

            player.health = PLAYER_HEALTH;

            if (player.isZombie) {
                player.character.revive();
            } else {
                game.numSurvivors--;
                player.isZombie = true;
                const x = player.character.x;
                const y = player.character.y;
                player.character.destroy();
                player.character = initAvatar(player, 'zombie_1', x, y);
                if (game.numSurvivors === 0) {
                    socket.emit('end game', {
                        zombies: true,
                        survivors: false,
                        roomId: roomId,
                    });
                }
            }
            player.isDead = false;
        })

        socket.on('activated drop', (message) => {
            const {
                id
            } = message;

            drop = game.drops[id];
            drop.sprite.destroy();
        })

        socket.on('change health', (message) => {
            const {
                id,
                change
            } = message;
            player = game.players[id];
            player.health += change;
        })

        socket.on('powerup expired', (message) => {
            // Reset stats
        })

        socket.on('switch gun', (message) => {
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

        socket.on('player left', (message) => {
            const {
                id
            } = message;
            delete game.players[id];
            waiting.updatePlayerList(game.players);
            if (message.roomHost === game.localPlayer.id) startGameButton.style.display = 'block';
        })

        socket.on("err", ({
            message
        }) => {
            console.error(message);
        });

        socket.on("room full", () => {
            const errorDialog = document.getElementById("room-full-dialog");
            console.log(errorDialog);
            if (errorDialog) {
                errorDialog.style.display = "block";
            }
        });

        socket.on("end game", data => {
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

    game.HUD = {};
    game.HUD.ammo = game.add.text(10, GAME_VIEW_HEIGHT - 50, "Ammo: ", {
        font: "bold 24px Arial",
        fill: "#004887",
        align: "center"
    });
    game.HUD.health = game.add.text(GAME_VIEW_WIDTH / 2 - 100, GAME_VIEW_HEIGHT - 50, "Health: ", {
        font: "bold 24px Arial",
        fill: "#af0000",
        align: "center"
    });
    game.HUD.survivors = game.add.text(GAME_VIEW_WIDTH - 200, GAME_VIEW_HEIGHT - 50, "Survivors: ", {
        font: "bold 24px Arial",
        fill: "#004887",
        align: "center"
    });

    game.HUD.ammo.fixedToCamera = true;
    game.HUD.health.fixedToCamera = true;
    game.HUD.survivors.fixedToCamera = true;


    game.EndGame = game.add.text(GAME_VIEW_WIDTH / 2, GAME_VIEW_HEIGHT / 2, "", {
        font: "bold 24px Arial",
        fill: "#af0000",
        align: "center"
    });
    game.EndGame.fixedToCamera = true;
}


const startGameButton = document.getElementById('start');
startGameButton.style.display = "none";

function startGame() {
    document.getElementById('waiting-room-overlay').style.display = "none";
    document.getElementById('background').style.display = "none";
    socket.emit("start game", {
        roomId
    });
}


if (startGameButton) {
    startGameButton.addEventListener('click', startGame);
}

function update() {
    //LocalPlayer
    movementHandler(game.localPlayer, game.localPlayer.gun, game.localPlayer.keyboard);
    //Loop through players (move non-LocalPlayer)
    if (game.localPlayer.keyboard['spacebar']) {
        if (game.localPlayer.isZombie) {
            melee(game.localPlayer);
        } else {
            fireGun();
        }
    }

    // Check collisions
    game.physics.arcade.overlap(game.localPlayer.gun.bullets, game.targets, bulletHitHandler, null, game);
    game.physics.arcade.collide(game.localPlayer.character, game.obstacles, null, null, game);
    game.physics.arcade.collide(game.localPlayer.gun.bullets, game.obstacles, killBullet, null, game);
    game.physics.arcade.collide(game.localPlayer.character, game.dropSprites, pickupDrop, null, game);
}

function render() {
    // game.debug.spriteInfo(game.localPlayer.character, 20, 32);
    // game.localPlayer.gun.debug(20, 128);

    game.HUD.ammo.setText("Ammo: " + game.localPlayer.gun.ammo);
    game.HUD.health.setText("Health: " + game.localPlayer.health);
    game.HUD.survivors.setText("Survivors: " + game.numSurvivors);

}

function collide(character, drop) {
    console.log("collide");
    drop.kill();
}

function pickupDrop(character, dropSprite) {
    drop = game.drops[dropSprite.id];
    dropSprite.destroy();

    let player = game.localPlayer;

    if (drop.type == 'Weapon') {
        console.log(drop.item.type);
        switch (drop.item.type) {
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
        socket.emit('switch gun', {
            roomId,
            gun: drop.item.type
        })
    } else {
        let type = drop.item.type;
        console.log(type);
        switch (type) {
            case 'WeirdFlex':
                player.gun.damage += 10;
                break;
            case 'Grit':
                player.health += 100;
                socket.emit('change health', {
                    roomId,
                    change: 100
                })
                break;
            case 'Hammertime':
                ZOMBIE_SPEED = 300;
                break;
            case 'Jackpot':
                player.gun.ammo += player.gun.clipSize;
                break;
        }
    }
    socket.emit('activate', {
        roomId,
        id: drop.id
    });
}

function killBullet(bullet, obstacle) {
    bullet.kill();
}

function bulletHitHandler(bullet, enemy) {
    /// Currently just kills sprites... need to implement health here

    socket.emit('hit', {
        roomId,
        id: enemy.id,
        damage: game.localPlayer.gun.damage
    });
    bullet.kill();
    if (game.localPlayer.gun.damage >= game.players[enemy.id].health) {
        enemy.kill();
    } else {
        game.players[enemy.id].health -= game.localPlayer.gun.damage;
        //animate HIT
        let target = game.players[enemy.id];
        target.character.animating = true;
        target.character.animations.play('hurt', 20, false);
    }
}

function movementHandler(player, gun, keys, /*pos = {x: false,y: false}*/ ) {
    let avatar = player.character;
    let eventShouldBeEmitted = false;

    if (player.isDead) {
        return;
    }
    if (!avatar.animating) {
        if (keys['left']) {
            player.facing.x = DIRECTION.WEST;
            avatar.body.velocity.x = -ZOMBIE_SPEED;

            if (!(keys['down'])) {
                avatar.animations.play('left', true);
                orientGun(gun, 'left');
            }
            eventShouldBeEmitted = true;
        } else if (keys['right']) {
            player.facing.x = DIRECTION.EAST;
            avatar.body.velocity.x = ZOMBIE_SPEED;
            if (!(keys['down'])) {
                avatar.animations.play('right', true);
                orientGun(gun, 'right');
            }
            eventShouldBeEmitted = true;
        } else {
            avatar.body.velocity.x = 0;
            if (keys['up'] || keys['down']) {
                player.facing.x = 0;
            }
        }

        if (keys['up']) {
            player.facing.y = DIRECTION.NORTH;
            avatar.body.velocity.y = -ZOMBIE_SPEED;
            if (!(keys['left'] || keys['right'])) {
                avatar.animations.play('up', true);
                orientGun(gun, 'up');
            }
            eventShouldBeEmitted = true;
        } else if (keys['down']) {
            player.facing.y = DIRECTION.SOUTH
            avatar.body.velocity.y = ZOMBIE_SPEED;
            avatar.animations.play('down', true);
            orientGun(gun, 'down');
            eventShouldBeEmitted = true;
        } else {
            avatar.body.velocity.y = 0;
            if (keys['left'] || keys['right']) {
                player.facing.y = 0;
            }
        }
    }

    if (any(keys) + any(keys) == 0) {
        // No keys pressed - stop animations
        if (!avatar.animating)
            avatar.animations.stop();
        avatar.body.velocity.x = 0;
        avatar.body.velocity.y = 0;
        //zombie.anims.play('idle');
    }
    if (eventShouldBeEmitted) {
        socket.emit("move", {
            roomId,
            location: {
                x: Number(avatar.body.x),
                y: Number(avatar.body.y)
            }
        });
        if (player.isZombie) {
            shiftHitbox(player);
        }
    }
}

function melee(player) {
    game.physics.arcade.overlap(player.hitbox, game.targets, meleeHit, null, game);
}

function meleeHit(hitbox, enemy) {
    const meleeDamage = 100;

    socket.emit('hit', {
        roomId,
        id: enemy.id,
        damage: meleeDamage
    });
    if (meleeDamage >= game.players[enemy.id].health) {
        enemy.kill();
    } else {
        game.players[enemy.id].health -= meleeDamage;
    }
}

function initGun(character, weapon = revolver) {
    let gun = game.add.weapon(30, 'weapons');
    gun.name = weapon.constructor.name;

    //Create bullets
    gun.addBulletAnimation(name = "bullet",
        frames = [15, 16, 17, 18, 19],
        frameRate = 60,
        loop = true
    );
    gun.bulletAnimation = 'bullet';

    //Create handles
    gun.handle = game.add.sprite(0, 0, 'weapons');
    gun.handle.animations.add(
        'Revolver',
        [0, 1, 2, 3, 4],
        30,
        false
    )
    gun.handle.animations.add(
        'SawnOffShotgun',
        [5, 6, 7, 8, 9],
        30,
        false
    )
    gun.handle.animations.add(
        'AutomaticRifle',
        [10, 11, 12, 13, 14],
        30,
        false
    )
    gun.handle.frame = 0;
    gun.handle.anchor.setTo(-0.5, 0);
    character.addChild(gun.handle);

    gun.ammo = revolver._clipSize;
    gun.clipSize = revolver._clipSize;
    gun.damage = Number(revolver._damage);
    gun.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    gun.bulletAngleOffset = 0;
    gun.fireAngle = Phaser.ANGLE_RIGHT;
    gun.bulletSpeed = 1000;
    gun.fireRate = weapon.fireRateMillis;
    gun.trackSprite(gun.handle, character.width / 2, character.height / 2);

    gun.shoot = function () {
        if (gun.fire()) {
            gun.handle.animations.play(gun.name);
            return true;
        }
        return false;
    }
    return gun;
}

function fireGun() {
    if (game.localPlayer.gun.ammo > 0) {
        if (game.localPlayer.gun.shoot()) {
            --game.localPlayer.gun.ammo;
            socket.emit('fire', {
                roomId,
                fireAngle: game.localPlayer.gun.fireAngle
            });
        }
    }
}

function switchGun(gun, type) {
    gun.name = type.constructor.name;
    gun.fireRate = type.fireRateMillis;
    gun.ammo = type._clipSize;
    gun.clipSize = type._clipSize;
    gun.damage = Number(type._damage);
    switch (gun.name) {
        case 'Revolver':
            gun.handle.frame = 0;
            break;
        case 'SawnOffShotgun':
            gun.handle.frame = 5;
            break;
        case 'AutomaticRifle':
            gun.handle.frame = 10;
    }
    return gun;
}

function orientGun(gun, direction) {
    switch (direction) {
        case 'left':
            gun.fireAngle = Phaser.ANGLE_LEFT;
            gun.handle.angle = 0;
            gun.handle.scale.x = -1;
            gun.handle.scale.y = 1;
            gun.handle.anchor.setTo(0.5, 0);
            break;
        case 'right':
            gun.fireAngle = Phaser.ANGLE_RIGHT;
            gun.handle.angle = 0;
            gun.handle.scale.x = 1;
            gun.handle.scale.y = 1;
            gun.handle.anchor.setTo(-0.5, 0);
            break;
        case 'up':
            gun.fireAngle = Phaser.ANGLE_UP;
            gun.handle.angle = 90;
            gun.handle.scale.x = -1;
            gun.handle.scale.y = 1;
            gun.handle.anchor.setTo(.9, .8);
            break;
        case 'down':
            gun.fireAngle = Phaser.ANGLE_DOWN;
            gun.handle.angle = 90;
            gun.handle.scale.x = 1;
            gun.handle.scale.y = 1;
            gun.handle.anchor.setTo(-0.4, 1.3);
            break;
    }
}

function initPlayer(id) {

    var newPlayer = {};
    newPlayer.id = id;
    // newPlayer.character = initAvatar(id, 'zombie_1');
    newPlayer.character = initAvatar(newPlayer, 'survivor_1');
    newPlayer.gun = initGun(newPlayer.character);
    newPlayer.health = PLAYER_HEALTH;
    newPlayer.isZombie = false;
    newPlayer.isDead = false;
    newPlayer.character.animating = false; //Added for anim priority
    return newPlayer;
}

function initAvatar(player, spriteSheet, x = GAME_VIEW_WIDTH / 2 - 200, y = GAME_VIEW_HEIGHT / 2 - 200) {
    let avatar = game.add.sprite(x, y, spriteSheet);
    avatar.frame = 1;
    avatar.id = player.id;
    game.physics.arcade.enable(avatar);
    avatar.body.collideWorldBounds = true;
    if (avatar.id != game.localPlayer.id) {
        game.targets.add(avatar);
    } else {
        // Local player attributes
        player.facing = {
            x: 0,
            y: 0
        }
        if (player.isZombie) {
            player.hitbox = initHitbox(avatar);
        }
    }

    avatar.animations.add(
        'down',
        [0, 1, 2, 3],
        10,
        false
    );
    avatar.animations.add(
        'right',
        [5, 6, 7, 8],
        10,
        false
    );
    avatar.animations.add(
        'up',
        [10, 11, 12, 13],
        10,
        false
    );
    avatar.animations.add(
        'left',
        [15, 16, 17, 18],
        10,
        false
    );
    avatar.animations.add(
        'idle',
        [20],
        10,
        false
    );
    let hurt = avatar.animations.add(
        'hurt',
        [20, 21, 22, 23, 24],
        10,
        false
    );
    avatar.animations.currentAnim.onComplete.add(() => {
        avatar.animating = false;
    }, this);
    avatar.animations.add(
        'attack',
        [14, 19, 4, 9]
    );
    return avatar;
}

function initHitbox(character) {
    let hitbox = game.add.graphics(0, 0);
    // hitbox.lineStyle(2, 0x5ff0000, 1);
    hitbox.drawRect(0, 0, character.width, character.height);
    hitbox.boundsPadding = 0;

    game.physics.arcade.enable(hitbox);

    character.addChild(hitbox);

    return hitbox;
}

function shiftHitbox(player) {

    if (player.facing.x != 0) {
        if (player.facing.x == DIRECTION.EAST) {
            player.hitbox.x = player.character.width;
        } else {
            player.hitbox.x = -player.character.width;
        }
    } else {
        player.hitbox.x = 0;
    }

    if (player.facing.y != 0) {
        if (player.facing.y == DIRECTION.SOUTH) {
            player.hitbox.y = player.character.height;
        } else {
            player.hitbox.y = -player.character.height;
        }
    } else {
        player.hitbox.y = 0;
    }
}

function initObstacles(obstacles) {

    for (var i = 0; i < obstacles.length; ++i) {

        let obstacle = game.add.graphics(obstacles[i].position[0], obstacles[i].position[1]);
        obstacle.lineStyle(2, 0x5b5b5b, 1);
        obstacle.beginFill(0x5b5b5b, 1);
        obstacle.drawRect(0, 0,
            obstacles[i].width, obstacles[i].height);
        obstacle.endFill();
        obstacle.boundsPadding = 0;

        game.physics.arcade.enable(obstacle);
        obstacle.body.immovable = true;

        game.obstacles.add(obstacle);
    }
}

function initDrops(drops) {
    for (var key in drops) {
        if (drops.hasOwnProperty(key)) {
            var drop = drops[key];
        }

        var image;
        if (drop.type == "Weapon") {
            image = DROPIMAGES[drop.item.type];
        } else {
            image = DROPIMAGES[drop.item.type];
        }


        drop.sprite = game.add.sprite(drop.position[0], drop.position[1], image);
        drop.sprite.id = drop.id;

        game.physics.arcade.enable(drop.sprite);

        game.drops[drop.id] = drop;
        game.dropSprites.add(drop.sprite);
    }
}

function any(dict) {
    return Object.keys(dict).reduce((acc, cur) => acc + dict[cur], 0);
}