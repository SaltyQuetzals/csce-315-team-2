const config = {
    type: Phaser.AUTO,
    width: $(window).width(),
    height: $(window).height(),
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

function preload ()
{    
    this.load.image('zombieUp', 'assets/ZombieUp.png');
    this.load.image('bg', 'assets/bg.png');
}

var bg;
var zombie;
var cursors;
var wasd;

function create ()
{
    bg = this.add.tileSprite($(window).width()/2, $(window).height()/2, $(window).width(), $(window).height(), 'bg');

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


function update() {
    if (cursors.left.isDown)
    {
        zombie.x -= 8;
    }
    else if (cursors.right.isDown)
    {
        zombie.x += 8;
    }

    if (cursors.up.isDown)
    {
        zombie.y -= 8;
    }
    else if (cursors.down.isDown)
    {
        zombie.y += 8;
    }
    else if (wasd.up.isDown)
    {
        zombie.y -= 8;
    }
    else if (wasd.down.isDown)
    {
        zombie.y += 8;
    }
    else if (wasd.right.isDown)
    {
        zombie.x += 8;
    }
    else if (wasd.left.isDown)
    {
        zombie.x -= 8;
    }

}

function render() {
    this.debug.spriteInfo(zombie, 20, 32);
}
