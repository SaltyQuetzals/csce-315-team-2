const GUNS = require("../../models/Guns.js")


const GAME_VIEW_WIDTH = 800;
const GAME_VIEW_HEIGHT = 600;
const ZOMBIE_SPEED = 4;
// const ar = GUNS.AutomaticRifle;
const revolver = new GUNS.Revolver();
// const shotgun = GUNS.SawnOffShotgun;

const KEYBOARD = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
}
const PLR_KEYBOARD = {
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
const game = new Phaser.Game(
    GAME_VIEW_WIDTH,
    GAME_VIEW_HEIGHT,
    Phaser.AUTO,
    '',
    {
        init: init,
        preload: preload,
        create: create,
        update: update,
        render: render
    }
);

function init() {
    game.stage.visibilityChange = true;
}

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
    game.localPlayer = {}
    game.localPlayer.character = initAvatar('zombie_1', 100, 100, true);
    game.players.push( game.localPlayer);
    game.localPlayer.id = 0;

    //game.players.push( {'character': initAvatar('zombie_1', 300, 100) });
    //////game.players.push( initAvatar('zombie_1'));


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
    gun.bulletSpeed = 1000;
    gun.fireRate = revolver.fireRateMillis;
    gun.trackSprite(game.localPlayer.character, 14, 14);


    //Keyboard Events
    game.localPlayer.keyboard = {...PLR_KEYBOARD};
    game.input.keyboard.onDownCallback = function(event){
        if(KEYBOARD[event.keyCode] && ! game.localPlayer.keyboard.movement[ KEYBOARD[event.keyCode] ]){
            game.localPlayer.keyboard.movement[ KEYBOARD[event.keyCode] ] = 1;
            socket.emit('move',{...game.localPlayer.keyboard.movement,
                                x: game.localPlayer.character.x,
                                y: game.localPlayer.character.y}
            );
        }
    }
    game.input.keyboard.onUpCallback = function(event){
        if(KEYBOARD[event.keyCode] && game.localPlayer.keyboard.movement[ KEYBOARD[event.keyCode] ]){
            game.localPlayer.keyboard.movement[ KEYBOARD[event.keyCode] ] = 0;
            socket.emit('move',{...game.localPlayer.keyboard.movement,
                x: game.localPlayer.character.x,
                y: game.localPlayer.character.y}
            );
        }
    }
}

const socket = io.connect('http://localhost:3000/');

const splitUrl = location.href.split('/');
const roomCode = splitUrl[splitUrl.length - 1];

socket.emit('join room', {room: roomCode});

socket.on('new player', (message) => {
    console.log('Another player has joined the room!');
    let newPlayer = {'character': initAvatar('zombie_1') };
    newPlayer.id = message.id;
    game.players.push(newPlayer);
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
    //LocalPlayer
    movementHandler(game.localPlayer.character, game.localPlayer.keyboard.movement, game.localPlayer.keyboard.aim);
    //Loop through players (move non-LocalPlayer)
    for(let i = 0; i < game.players.length; i++){
        let player = game.players[i];
        if (player.id && player.keyboard && (any(player.keyboard.movement) || any(player.keyboard.aim))){
            console.log(`Moving ${player.id}`);
        }
    }
    if (spacebar.isDown) {
        gun.fire();
    }
}

function render() {
    game.debug.spriteInfo(game.localPlayer.character, 20, 32);
    gun.debug(20, 128);
}

function movementHandler(avatar, cursors, wasd, pos={x:false, y:false}){
    if(pos && (pos.x || pos.y) ){
        if(pos.x)
            avatar.x = pos.x;
        if(pos.y)
            avatar.y = pos.y;
    }

    if (cursors['left'])
    {
        avatar.x -= ZOMBIE_SPEED;
        if (!(cursors['down'])) {
            avatar.animations.play('left', true);
        }
    }
    else if (cursors['right'])
    {
        avatar.x += ZOMBIE_SPEED;
        if (!(cursors['down'])) {
            avatar.animations.play('right', true);
        }
    }

    if (cursors['up'])
    {
        avatar.y -= ZOMBIE_SPEED;
        if (!(cursors['left'] || cursors['right'])) {
            avatar.animations.play('up', true);
        }
    }
    else if (cursors['down'])
    {
        avatar.y += ZOMBIE_SPEED;
        avatar.animations.play('down', true);
    }

    if (wasd['up'])
    {
        if (wasd['right']) {
            gun.fireAngle = Phaser.ANGLE_NORTH_EAST;
        }
        else if (wasd['left']) {
            gun.fireAngle = Phaser.ANGLE_NORTH_WEST;
        }
        else {
            gun.fireAngle = Phaser.ANGLE_UP;
        }
    }
    else if (wasd['down'])
    {
        if (wasd['right']) {
            gun.fireAngle = Phaser.ANGLE_SOUTH_EAST;
        }
        else if (wasd['left']) {
            gun.fireAngle = Phaser.ANGLE_SOUTH_WEST;
        }
        else {
            gun.fireAngle = Phaser.ANGLE_DOWN;
        }    
    }
    else if (wasd['right'])
    {
        gun.fireAngle = Phaser.ANGLE_RIGHT;
    }
    else if (wasd['left'])
    {
        gun.fireAngle = Phaser.ANGLE_LEFT;
    }

    if(any(cursors) + any(wasd) == 0){
        // No keys pressed - stop animations
        avatar.animations.stop();
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

function any(dict){
    return Object.keys(dict).reduce( (acc, cur)=>acc+dict[cur], 0);
}

