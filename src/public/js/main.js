const GUNS = require("../../models/Guns.js")


const GAME_VIEW_WIDTH = 800;
const GAME_VIEW_HEIGHT = 600;
const ZOMBIE_SPEED = 4;
// const ar = GUNS.AutomaticRifle;
const revolver = new GUNS.Revolver();
// const shotgun = GUNS.SawnOffShotgun;

const DIR = {
    UP: 0,
    LEFT: 1,
    DOWN: 2,
    RIGHT: 3,
}
const KEYBOARD = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
}
const game = new Phaser.Game(
    GAME_VIEW_WIDTH,
    GAME_VIEW_HEIGHT,
    Phaser.AUTO,
    '',
    {
        preload: preload,
        create: create,
        update: update,
        render: render
    }
);

function preload ()
{    
    console.log("preloading");
    game.load.image('bg', '../assets/bg.png');
    game.load.image('bullet', '../assets/bullet.png');
    game.load.spritesheet('zombie_1',
        '../assets/ZombieWalkingSpriteSheet2.png',
        64, // frame width
        64, // frame height
    );
}

var bg;
var zombie;
var cursors;
var wasd;
var gun;

function create() {

    console.log("Creating");
    game.physics.startSystem(Phaser.Physics.Arcade);
    bg = game.add.tileSprite(0, 0, GAME_VIEW_WIDTH, GAME_VIEW_HEIGHT, 'bg');

    game.players = [];
    game.players.push( initAvatar('zombie_1', 300, 100));
    game.players.push( initAvatar('zombie_1'));
    game.localPlayer = initAvatar('zombie_1', 100, 100, true);
    game.players.push( game.localPlayer);

    //Controls
    cursors = game.input.keyboard.createCursorKeys();
    cursors = [
        cursors.up,
        cursors.left,
        cursors.down,
        cursors.right,
    ];
    wasd = [
        game.input.keyboard.addKey(Phaser.Keyboard.W),
        game.input.keyboard.addKey(Phaser.Keyboard.A),
        game.input.keyboard.addKey(Phaser.Keyboard.S),
        game.input.keyboard.addKey(Phaser.Keyboard.D),
    ];
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    

    //Gun
    gun = game.add.weapon(revolver._clipSize, 'bullet');
    gun.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    gun.bulletAngleOffset = 0;
    gun.fireAngle = Phaser.ANGLE_RIGHT;
    gun.bulletSpeed = 200;
    gun.fireRate = revolver.fireRateMillis;
    gun.trackSprite(zombie, 14, 14);


    //Keyboard Events
    game.localPlayer.keyboard = {
        movement: {
            up: 0,
            left: 0,
            down: 0,
            right: 0,
        },
        aim: {
            up: 0,
            left: 0,
            down: 0,
            right: 0,
        }
    }
    game.input.keyboard.onDownCallback = function(event){
        if(KEYBOARD[event.keyCode] && ! game.localPlayer.keyboard.movement[ KEYBOARD[event.keyCode] ]){
            game.localPlayer.keyboard.movement[ KEYBOARD[event.keyCode] ] = 1;
            socket.emit('move',{...game.localPlayer.keyboard.movement,
                                x: game.localPlayer.x,
                                y: game.localPlayer.y}
            );
        }
    }
    game.input.keyboard.onUpCallback = function(event){
        if(KEYBOARD[event.keyCode] && game.localPlayer.keyboard.movement[ KEYBOARD[event.keyCode] ]){
            game.localPlayer.keyboard.movement[ KEYBOARD[event.keyCode] ] = 0;
            socket.emit('move',{...game.localPlayer.keyboard.movement,
                x: game.localPlayer.x,
                y: game.localPlayer.y}
            );
        }
    }
}

const socket = io.connect('http://localhost:3000/');

const splitUrl = location.href.split('/');
const roomCode = splitUrl[splitUrl.length - 1];

socket.emit('join room', {room: roomCode});

socket.on('new player', () => {
    console.log('Another player has joined the room!');
});

socket.on('err', ({message}) => {
    console.error(message);
});

socket.on('room full', () => {
    const errorDialog = document.getElementById('room-full-dialog');
    console.log(errorDialog);
    if (errorDialog) {
        errorDialog.style.display = 'block';
    }
});


function update() {
    movementHandler();

    if (spacebar.isDown) {
        gun.fire();
    }
}

function render() {
    game.debug.spriteInfo(game.localPlayer, 20, 32);
}

function movementHandler(){
    if (cursors[DIR.LEFT].isDown)
    {
        game.localPlayer.x -= ZOMBIE_SPEED;
        if (!(cursors[DIR.DOWN].isDown)) {
            game.localPlayer.animations.play('left', true);
        }
    }
    else if (cursors[DIR.RIGHT].isDown)
    {
        game.localPlayer.x += ZOMBIE_SPEED;
        if (!(cursors[DIR.DOWN].isDown)) {
            game.localPlayer.animations.play('right', true);
        }
    }

    if (cursors[DIR.UP].isDown)
    {
        game.localPlayer.y -= ZOMBIE_SPEED;
        if (!(cursors[DIR.LEFT].isDown || cursors[DIR.RIGHT].isDown)) {
            game.localPlayer.animations.play('up', true);
        }
    }
    else if (cursors[DIR.DOWN].isDown)
    {
        game.localPlayer.y += ZOMBIE_SPEED;
        game.localPlayer.animations.play('down', true);
    }

    if (wasd[DIR.UP].isDown)
    {
        if (wasd[DIR.RIGHT].isDown) {
            gun.fireAngle = Phaser.ANGLE_NORTH_EAST;
        }
        else if (wasd[DIR.LEFT].isDown) {
            gun.fireAngle = Phaser.ANGLE_NORTH_WEST;
        }
        else {
            gun.fireAngle = Phaser.ANGLE_UP;
        }
    }
    else if (wasd[DIR.DOWN].isDown)
    {
        if (wasd[DIR.RIGHT].isDown) {
            gun.fireAngle = Phaser.ANGLE_SOUTH_EAST;
        }
        else if (wasd[DIR.LEFT].isDown) {
            gun.fireAngle = Phaser.ANGLE_SOUTH_WEST;
        }
        else {
            gun.fireAngle = Phaser.ANGLE_DOWN;
        }    
    }
    else if (wasd[DIR.RIGHT].isDown)
    {
        gun.fireAngle = Phaser.ANGLE_RIGHT;
    }
    else if (wasd[DIR.LEFT].isDown)
    {
        gun.fireAngle = Phaser.ANGLE_LEFT;
    }

    if(cursors.reduce((a,c)=>a||c.isDown, false) + wasd.reduce((a,c)=>a||c.isDown, false)  == 0){
        // No keys pressed - stop animations
        game.localPlayer.animations.stop();
        //zombie.anims.play('idle');
    }
}

function initAvatar(spriteSheet, x=100, y=100){
    avatar = game.add.sprite(x, y, spriteSheet);
    avatar.frame = 1;
    game.physics.arcade.enable(avatar);
    avatar.body.collideWorldBounds = true;
    
    avatar.animations.add(
        'down', 
        [0, 1, 2, 3],
        10,
        false
    );
    avatar.animations.add(
        'right',
        [4, 5, 6, 7],
        10,
        false
    );
    avatar.animations.add(
        'up',
        [8, 9, 10, 11],
        10,
        false
    );            
    avatar.animations.add(
        'left',
        [12, 13, 14, 15],
        10,
        false
    );
    avatar.animations.add(
        'idle',
        [16, 17, 18, 19],
        10,
        false
    );
    return avatar;
}
