const GUNS = require("../../models/Guns.js")

const GAME_VIEW_WIDTH = 800;
const GAME_VIEW_HEIGHT = 600;
const GAME_WIDTH = 2400;
const GAME_HEIGHT = 1800;
const ZOMBIE_SPEED = 300;
const PLAYER_HEALTH = Number(100);
const ar = new GUNS.AutomaticRifle();
const revolver = new GUNS.Revolver();
const shotgun = new GUNS.SawnOffShotgun();
var GAME_STARTED;
var gun;
var socket;

const splitUrl = location.href.split("/");
const roomId = splitUrl[splitUrl.length - 1];

const KEYBOARD = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    87: 'W',
    65: 'A',
    83: 'S',
    68: 'D',
    32: 'spacebar'
}
const PLR_KEYBOARD = {
    up: false,
    left: false,
    down: false,
    right: false,
    W: false,
    A: false,
    S: false,
    D: false,
    spacebar: false
}

const DIRECTION = {

    NORTH: -1,
    EAST: 1,
    SOUTH: 1,
    WEST: -1

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
}


function create() {

    console.log("Creating");
    game.physics.startSystem(Phaser.Physics.Arcade);
    game.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg = game.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg');

    game.players = {};

    game.targets = game.add.group();
    game.physics.arcade.enable(game.targets);

    game.obstacles = game.add.group();
    game.physics.arcade.enable(game.obstacles);

    game.localPlayer = {}
    game.localPlayer.id = 0;
    game.localPlayer.character = initAvatar(0, 'survivor_1', GAME_VIEW_WIDTH/2 - 200, GAME_VIEW_HEIGHT/2 - 200, true);
    game.localPlayer.gun = initGun(game.localPlayer.character);
    game.localPlayer.facing = {
        x: 0,
        y: 0
    }
    game.localPlayer.hitbox = initHitbox(game.localPlayer.character);
    game.localPlayer.health = PLAYER_HEALTH;
    game.localPlayer.isZombie = false;
    game.camera.follow(game.localPlayer.character);


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
        //Alternate Guns for testing purposes
        if (event.keyCode == Phaser.Keyboard.Z){
            alternateGuns(game.localPlayer, shotgun);
        }
    }
    game.input.keyboard.onUpCallback = function (event) {
        if (GAME_STARTED && KEYBOARD[event.keyCode] && 
            game.localPlayer.keyboard[KEYBOARD[event.keyCode]]) {
            game.localPlayer.keyboard[KEYBOARD[event.keyCode]] = false;
        }
    }

    socket = io.connect("http://localhost:3000/", {
        query: `roomId=${roomId}`
    });

    socket.on('connect', () => {
        console.log('Connected successfully.');
        game.localPlayer.id = socket.id;
        game.players[game.localPlayer.id] = game.localPlayer;
        socket.on('start game', (message) => {
            console.log('Received start game event');
            initObstacles(message._obstacles);

            GAME_STARTED = true;
        })
    
        socket.on('new player', (message) => {
            // console.log(JSON.stringify(Object.keys(game.players), null, 3));
            if (message.id === game.localPlayer.id) {
                // create all preexisting players
                for (var id in message.players) {
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
                console.log(newPlayer.id);
            }
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
            gun = game.players[id].gun;
            gun.fireAngle = fireAngle;
            gun.shoot();
        })
    
        socket.on('player hit', (message) => {
            const { id, damage } = message;
            player = game.players[id];
            if (player.health <= damage) {
                if (id === game.localPlayer.id) {
                    // Disable movement
                    socket.emit('died', {
                        roomId
                    })
                }
                player.character.kill();
            }
            else {
                player.health -= damage;
                // animate HIT
            }
        })
    
        socket.on('respawn', (message) => {
            // Redraw zombie sprite and reset health
        })
        
        socket.on('switch gun', (message) => {
            const { id, gun } = message;
            player = game.players[id];
            switchGun(player.gun, gun);
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
    });
}

const startGameButton = document.getElementById('start');

function startGame() {
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
        }
        else {
            fireGun();
        }
    }

    // Check collisions
    game.physics.arcade.overlap(game.localPlayer.gun.bullets, game.targets, bulletHitHandler, null, game);
    game.physics.arcade.collide(game.localPlayer.character, game.obstacles, null, null, game);
    game.physics.arcade.collide(game.localPlayer.gun.bullets, game.obstacles, killBullet, null, game);
}

function collide () {
    console.log("collide");
}

function killBullet(bullet, obstacle) {
    bullet.kill();
}

function render() {
    game.debug.spriteInfo(game.localPlayer.character, 20, 32);
    game.localPlayer.gun.debug(20, 128);
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
    }
    else {
        game.players[enemy.id].health -= game.localPlayer.gun.damage;
    }
}

function movementHandler(player, gun, keys, /*pos = {x: false,y: false}*/ ) {
    let avatar = player.character;
    let eventShouldBeEmitted = false;

    if (keys['left']) {
        player.facing.x = DIRECTION.WEST;
        avatar.body.velocity.x = -ZOMBIE_SPEED;
        
        if (!(keys['down'])) {
            avatar.animations.play('left', true);
        }
        eventShouldBeEmitted = true;
    } else if (keys['right']) {
        player.facing.x = DIRECTION.EAST;
        avatar.body.velocity.x = ZOMBIE_SPEED;
        if (!(keys['down'])) {
            avatar.animations.play('right', true);
        }
        eventShouldBeEmitted = true;
    }
    else {
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
        }
        eventShouldBeEmitted = true;
    } else if (keys['down']) {
        player.facing.y = DIRECTION.SOUTH
        avatar.body.velocity.y = ZOMBIE_SPEED;
        avatar.animations.play('down', true);
        eventShouldBeEmitted = true;
    }
    else {
        avatar.body.velocity.y = 0;
        if (keys['left'] || keys['right']) {
            player.facing.y = 0;
        }
    }


    if (keys['W']) {
        if (keys['D']) {
            gun.fireAngle = Phaser.ANGLE_NORTH_EAST;
        } else if (keys['A']) {
            gun.fireAngle = Phaser.ANGLE_NORTH_WEST;
        } else {
            gun.fireAngle = Phaser.ANGLE_UP;
            switchGun(game.localPlayer.gun, ar);
            socket.emit('switch gun', {
                roomId,
                gun: ar
            })
        }
    } else if (keys['S']) {
        if (keys['D']) {
            gun.fireAngle = Phaser.ANGLE_SOUTH_EAST;
        } else if (keys['A']) {
            gun.fireAngle = Phaser.ANGLE_SOUTH_WEST;
        } else {
            gun.fireAngle = Phaser.ANGLE_DOWN;
            switchGun(game.localPlayer.gun, revolver);
            socket.emit('switch gun', {
                roomId,
                gun: revolver
            })
        }
    } else if (keys['D']) {
        gun.fireAngle = Phaser.ANGLE_RIGHT;
    } else if (keys['A']) {
        gun.fireAngle = Phaser.ANGLE_LEFT;
        switchGun(game.localPlayer.gun, shotgun);
        socket.emit('switch gun', {
            roomId,
            gun: shotgun
        })
    }

    if (any(keys) + any(keys) == 0) {
        // No keys pressed - stop animations
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
        shiftHitbox(player);
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
    }
    else {
        game.players[enemy.id].health -= meleeDamage;
    }
}

function initGun(character, weapon=revolver) {
    let baseFrame = 0;
    console.log(weapon.constructor.name);
    console.log('kaba');
    switch(weapon.constructor.name){
        case 'Revolver':
            baseFrame = 0;
            break;
        case 'SawnOffShotgun':
            baseFrame = 5;
            break;
        case 'AutomaticRifle':
            baseFrame = 10;
            break;
    }
    console.log(baseFrame);
    gun = game.add.weapon(30, 'weapons');
    gun.addBulletAnimation(name = "bullet", 
        frames = [15, 16, 17, 18, 19],
        frameRate = 60,
        loop = true
    );
    gun.handle = game.add.sprite(32, 32, 'weapons');
    gun.handle.animations.add(
        'fire',
        [baseFrame, baseFrame + 1, baseFrame + 2, baseFrame + 3, baseFrame + 4],
        10,
        false
    )
    gun.handle.frame = 0;
    gun.handle.anchor.setTo(0, 0.5);
    character.addChild(gun.handle);
    gun.bulletAnimation = 'bullet';
    gun.ammo = revolver._clipSize;
    gun.damage = Number(revolver._damage);
    gun.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    gun.bulletAngleOffset = 0;
    gun.fireAngle = Phaser.ANGLE_RIGHT;
    gun.bulletSpeed = 1000;
    gun.fireRate = weapon.fireRateMillis;
    gun.trackSprite(gun.handle, gun.handle.width / 2, -gun.handle.height / 2);

    gun.shoot = function(){
        if (gun.fire()){
            gun.handle.animations.play('fire');
            return true;
        }
        return false;
    }
    return gun;
}

function fireGun() {
    if (game.localPlayer.gun.ammo > 0) {
        if (game.localPlayer.gun.fire()) {
            --game.localPlayer.gun.ammo;
            socket.emit('fire', {
                roomId,
                fireAngle: game.localPlayer.gun.fireAngle
            });
        }
    }
}

function switchGun(gun, type) {
    gun.fireRate = type.fireRateMillis;
    gun.ammo = type._clipSize;
    gun.damage = Number(type._damage);
    return gun;
}

function alternateGuns(player, type){
    switch(type.constructor.name){
        case 'Revolver':
            player.gun.destroy();
            initGun(player.character, SawnOffShotgun);
            break;
        case 'SawnOffShotgun':
            player.gun.destroy();
            initGun(player.character, AutomaticRifle);
            break;
        case 'AutomaticRifle':
            player.gun.destroy();
            initGun(player.character, Revolver);
            break;
    }
}
function initPlayer(id) {

    var newPlayer = {};
    // newPlayer.character = initAvatar(id, 'zombie_1');
    newPlayer.character = initAvatar(id, 'survivor_1');
    newPlayer.id = id;
    newPlayer.gun = initGun(newPlayer.character);
    newPlayer.health = PLAYER_HEALTH;
    newPlayer.isZombie = false;

    return newPlayer;
}

function initAvatar(id, spriteSheet, x = GAME_VIEW_WIDTH/2 - 200, y = GAME_VIEW_HEIGHT/2 - 200) {
    avatar = game.add.sprite(x, y, spriteSheet);
    avatar.frame = 1;
    avatar.id = id;
    game.physics.arcade.enable(avatar);
    avatar.body.collideWorldBounds = true;
    if (avatar.id != 0) {
        game.targets.add(avatar);
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
    avatar.animations.add(
        'hurt',
        [20, 21, 22, 23, 24],
        10,
        false
    );
    avatar.animations.add(
        'attack',
        [14, 19, 4, 9]
    )
    return avatar;
}

function initHitbox(character) {
    let hitbox = game.add.graphics(0, 0);
    hitbox.lineStyle(2, 0x5ff0000, 1);
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
        }
        else {
            player.hitbox.x = -player.character.width;
        }
    }
    else {
        player.hitbox.x = 0;
    }

    if (player.facing.y != 0) {
        if (player.facing.y == DIRECTION.SOUTH) {
            player.hitbox.y = player.character.height;
        }
        else  {
            player.hitbox.y = -player.character.height;
        }
    }
    else {
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

function any(dict) {
    return Object.keys(dict).reduce((acc, cur) => acc + dict[cur], 0);
}