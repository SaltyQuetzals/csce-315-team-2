const GAME_VIEW_WIDTH = 800;
const GAME_VIEW_HEIGHT = 600;
const config = {
    type: Phaser.AUTO,
    width: GAME_VIEW_WIDTH,
    height: GAME_VIEW_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update,
        render
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('zombieUp', '/assets/ZombieUp.png');
    this.load.image('bg', '/assets/bg.png');
}

var bg;
var zombie;
var cursors;
var wasd;

function create() {
    bg = this.add.tileSprite(GAME_VIEW_WIDTH / 2, GAME_VIEW_HEIGHT / 2, GAME_VIEW_WIDTH, GAME_VIEW_HEIGHT, 'bg');

    zombie = this.physics.add.sprite(100, 100, 'zombieUp');
    zombie.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();

    wasd = {
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
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
    let moveDelta = {
        x: 0,
        y: 0
    };
    
    if (cursors.left.isDown) {
        moveDelta.x -= 8;
        zombie.x -= 8;
        socket.emit('move', moveDelta);
    }
    else if (cursors.right.isDown) {
        zombie.x += 8;
        moveDelta.x += 8;
        socket.emit('move', moveDelta);
    }

    if (cursors.up.isDown) {
        zombie.y -= 8;
        moveDelta.y -= 8;
        socket.emit('move', moveDelta);
    }
    else if (cursors.down.isDown) {
        zombie.y += 8;
        moveDelta.y += 8;
        socket.emit('move', moveDelta);
    }
    else if (wasd.up.isDown) {
        zombie.y -= 8;
        moveDelta.y -= 8;
        socket.emit('move', moveDelta);
    }
    else if (wasd.down.isDown) {
        zombie.y += 8;
        moveDelta.y += 8;
        socket.emit('move', moveDelta);
    }
    else if (wasd.right.isDown) {
        zombie.x += 8;
        moveDelta.x += 8;
        socket.emit('move', moveDelta);
    }
    else if (wasd.left.isDown) {
        zombie.x -= 8;
        moveDelta.x -= 8;
        socket.emit('move', moveDelta);
    }

}

function render() {
    this.debug.spriteInfo(zombie, 20, 32);
}

