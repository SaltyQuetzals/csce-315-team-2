const GAME_VIEW_WIDTH = 800;
const GAME_VIEW_HEIGHT = 600;
const config = {
  type: Phaser.AUTO,
  width: GAME_VIEW_WIDTH,
  height: GAME_VIEW_HEIGHT,
  physics: {
    default: "arcade",
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
const DIR = {
  UP: 0,
  LEFT: 1,
  DOWN: 2,
  RIGHT: 3
};
const game = new Phaser.Game(config);

function preload() {
  this.load.image("zombieUp", "../assets/ZombieUp.png");
  this.load.image("bg", "../assets/bg.png");
  this.load.spritesheet("zombie_1", "../assets/ZombieSpriteSheet.png", {
    frameWidth: 35,
    frameHeight: 36
  });
}

var bg;
var zombie;
var cursors;
var wasd;

function create() {
  bg = this.add.tileSprite(
    GAME_VIEW_WIDTH / 2,
    GAME_VIEW_HEIGHT / 2,
    GAME_VIEW_WIDTH,
    GAME_VIEW_HEIGHT,
    "bg"
  );

  this.zombie = this.physics.add.sprite(100, 100, "zombie_1");
  this.zombie.setCollideWorldBounds(true);

  //Anims
  this.anims.create({
    key: "down",
    frames: this.anims.generateFrameNumbers("zombie_1", { start: 0, end: 2 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("zombie_1", { start: 3, end: 5 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "up",
    frames: this.anims.generateFrameNumbers("zombie_1", { start: 6, end: 8 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("zombie_1", { start: 9, end: 11 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "idle",
    frames: this.anims.generateFrameNumbers("zombie_1", { start: 12, end: 14 }),
    frameRate: 10,
    repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();
  cursors = [cursors.up, cursors.left, cursors.down, cursors.right];
  wasd = [
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  ];
}
const socket = io.connect("http://localhost:3000/");

function startGame() {
  socket.emit("start game", { room: roomCode });
}

const splitUrl = location.href.split("/");
const roomCode = splitUrl[splitUrl.length - 1];

socket.emit("join room", { room: roomCode });

socket.on("start game", data => {
  console.log(JSON.stringify(data, null, 3));
});

socket.on("new player", () => {
  console.log("Another player has joined the room!");
});

socket.on("err", ({ message }) => {
  console.error(message);
});

socket.on("room full", () => {
  const errorDialog = document.getElementById("room-full-dialog");
  console.log(errorDialog);
  if (errorDialog) {
    errorDialog.style.display = "block";
  }
});

function update() {
  const origZombieX = Number(this.zombie.x);
  const origZombieY = Number(this.zombie.y);

  let eventShouldBeEmitted = false;
  if (cursors[DIR.LEFT].isDown) {
    this.zombie.x -= 2;
    if (!cursors[DIR.DOWN].isDown) {
      this.zombie.anims.play("left", true);
    }
    eventShouldBeEmitted = true;
  } else if (cursors[DIR.RIGHT].isDown) {
    this.zombie.x += 2;
    if (!cursors[DIR.DOWN].isDown) {
      this.zombie.anims.play("right", true);
    }
    eventShouldBeEmitted = true;
  }

  if (cursors[DIR.UP].isDown) {
    this.zombie.y -= 2;
    if (!(cursors[DIR.LEFT].isDown || cursors[DIR.RIGHT].isDown)) {
      this.zombie.anims.play("up", true);
    }
    eventShouldBeEmitted = true;
  } else if (cursors[DIR.DOWN].isDown) {
    this.zombie.y += 2;
    this.zombie.anims.play("down", true);
    eventShouldBeEmitted = true;
  }

  if (wasd[DIR.UP].isDown) {
    this.zombie.y -= 2;
    eventShouldBeEmitted = true;
  } else if (wasd[DIR.DOWN].isDown) {
    this.zombie.y += 2;
    eventShouldBeEmitted = true;
  }

  if (wasd[DIR.RIGHT].isDown) {
    this.zombie.x += 2;
    eventShouldBeEmitted = true;
  } else if (wasd[DIR.LEFT].isDown) {
    this.zombie.x -= 2;
    eventShouldBeEmitted = true;
  }

  if (
    cursors.reduce((a, c) => a || c.isDown, false) +
      wasd.reduce((a, c) => a || c.isDown, false) ==
    0
  ) {
    // No keys pressed - stop animations
    this.zombie.anims.stop();
    //this.zombie.anims.play('idle');
  }

  if (eventShouldBeEmitted) {
    socket.emit("move", {
      room: roomCode,
      movementDelta: {
        xDelta: this.zombie.x - origZombieX,
        yDelta: this.zombie.y - origZombieY
      }
    });
  }
}

socket.on('player moved', (eventData) => {
    console.log(JSON.stringify(eventData, null, 3));
});

function render() {
  this.debug.spriteInfo(zombie, 20, 32);
}

function movementHandler() {}

function createAnim() {}
