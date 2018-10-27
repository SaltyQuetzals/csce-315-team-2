// import {AutomaticRifle} from '../../models/Guns';

const GAME_VIEW_WIDTH = 800;
const GAME_VIEW_HEIGHT = 600;
const ZOMBIE_SPEED = 4;

const DIR = {
    UP: 0,
    LEFT: 1,
    DOWN: 2,
    RIGHT: 3,
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
        '../assets/ZombieSpriteSheet.png',
        35, // frame width
        36, // frame height
    );
}

var bg;
var zombie;
var cursors;
var wasd;
var assaultRifle;

function create() {

    console.log("Creating");
    game.physics.startSystem(Phaser.Physics.Arcade);
    bg = game.add.tileSprite(0, 0, GAME_VIEW_WIDTH, GAME_VIEW_HEIGHT, 'bg');

    zombie = game.add.sprite(100, 100, 'zombie_1');
    zombie.frame = 1;
    game.physics.arcade.enable(zombie);
    zombie.body.collideWorldBounds = true;
    
    //Anims
    zombie.animations.add(
        'down', 
        [0, 1, 2],
        10,
        false
    );
    zombie.animations.add(
        'right',
        [3, 4, 5],
        10,
        false
    );
    zombie.animations.add(
        'up',
        [6, 7, 8],
        10,
        false
    );            
    zombie.animations.add(
        'left',
        [9, 10, 11],
        10,
        false
    );
    zombie.animations.add(
        'idle',
        [12, 13, 14],
        10,
        false
    );

    cursors = game.input.keyboard.createCursorKeys();
    console.log(cursors);
    cursors = [
        cursors.up,
        cursors.left,
        cursors.down,
        cursors.right,
    ];
    console.log(cursors);
    wasd = [
        game.input.keyboard.addKey(Phaser.Keyboard.W),
        game.input.keyboard.addKey(Phaser.Keyboard.A),
        game.input.keyboard.addKey(Phaser.Keyboard.S),
        game.input.keyboard.addKey(Phaser.Keyboard.D),
    ];
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    assaultRifle = game.add.weapon(30, 'bullet');
    assaultRifle.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    assaultRifle.bulletAngleOffset = 0;
    assaultRifle.fireAngle = Phaser.ANGLE_RIGHT;
    assaultRifle.bulletSpeed = 400;
    assaultRifle.fireRate = 60;
    assaultRifle.trackSprite(zombie, 14, 14);

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
    if (cursors[DIR.LEFT].isDown)
    {
        zombie.x -= ZOMBIE_SPEED;
        if (!(cursors[DIR.DOWN].isDown)) {
            zombie.animations.play('left', true);
        }
    }
    else if (cursors[DIR.RIGHT].isDown)
    {
        zombie.x += ZOMBIE_SPEED;
        if (!(cursors[DIR.DOWN].isDown)) {
            zombie.animations.play('right', true);
        }
    }

    if (cursors[DIR.UP].isDown)
    {
        zombie.y -= ZOMBIE_SPEED;
        if (!(cursors[DIR.LEFT].isDown || cursors[DIR.RIGHT].isDown)) {
            zombie.animations.play('up', true);
        }
    }
    else if (cursors[DIR.DOWN].isDown)
    {
        zombie.y += ZOMBIE_SPEED;
        zombie.animations.play('down', true);
    }
    
    if (wasd[DIR.UP].isDown)
    {
        assaultRifle.fireAngle = Phaser.ANGLE_UP;
    }
    else if (wasd[DIR.DOWN].isDown)
    {
        assaultRifle.fireAngle = Phaser.ANGLE_DOWN;
    }
    else if (wasd[DIR.RIGHT].isDown)
    {
        assaultRifle.fireAngle = Phaser.ANGLE_RIGHT;
    }
    else if (wasd[DIR.LEFT].isDown)
    {
        assaultRifle.fireAngle = Phaser.ANGLE_LEFT;
    }
    
    if(cursors.reduce((a,c)=>a||c.isDown, false) + wasd.reduce((a,c)=>a||c.isDown, false)  == 0){
        // No keys pressed - stop animations
        zombie.animations.stop();
        //zombie.anims.play('idle');

    }

    if (spacebar.isDown) {
        assaultRifle.fire();
    }
}

function render() {
    game.debug.spriteInfo(zombie, 20, 32);
}

function movementHandler(){

}

function createAnim(){
    
}