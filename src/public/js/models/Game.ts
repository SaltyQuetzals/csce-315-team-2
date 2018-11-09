import * as gameConstants from "../game-constants";

export class Gun extends Phaser.Weapon{
  ammo!: number; 
}

export class CustomSprite extends Phaser.Sprite{
  animating!: boolean;
  id!: string;
  frame!: number;
}

export class Player {
  id!: string;
  character!: CustomSprite;
  cameraSprite!: Phaser.Sprite;
  keyboard!: {[key: string]: boolean};
  health!: number;
  gun!: Gun;
  isZombie!: boolean;
  isDead!: boolean;
  facing!: {
    x: number;
    y: number;
  };
  hitbox!: Phaser.Sprite;
}

export class GameController {
  game!: Phaser.Game;
  players!: {[key: string]: {}};
  drops!: {[key: string]: {}};
  targets!: Phaser.Group;
  obstacles!: Phaser.Group;
  dropSprites!: Phaser.Group;
  localPlayer!: Player;
  numSurvivors!: number;
  HUD!: {
    survivors: Phaser.Text;
    ammo: Phaser.Text;
    health: Phaser.Text;
  };
  endGame!: Phaser.Text;
  constructor() {
    this.game = new Phaser.Game(
      gameConstants.GAME_VIEW_WIDTH,
      gameConstants.GAME_VIEW_HEIGHT,
      Phaser.CANVAS,
      {
        preload: this.preload,
        create: this.create,
        update: this.update,
        render: this.render
      }
    );
  }

  preload(): void {
    this.game.load.image("bg", "../assets/bg.png");
    this.game.load.image("bullet", "../assets/bullet.png");
    this.game.load.image("Automatic Rifle", "../assets/AutomaticRifle.png");
    this.game.load.image("Revolver", "../assets/Revolver.png");
    this.game.load.image("Shotgun", "../assets/Shotgun.png");
    this.game.load.image("p1", "../assets/WeirdFlex.png");
    this.game.load.image("p2", "../assets/Grit.png");
    this.game.load.image("p3", "../assets/Hammertime.png");
    this.game.load.image("p4", "../assets/Jackpot.png");
    this.game.load.spritesheet(
      "weapons",
      "../assets/WeaponsSpriteSheet.png",
      64, // frame width
      64 // frame height
    );
    this.game.load.spritesheet(
      "zombie_1",
      "../assets/ZombieWalkingSpriteSheet2.png",
      64, // frame width
      64 // frame height
    );
    this.game.load.spritesheet(
      "survivor_1",
      "../assets/SurvivorWalkingSpriteSheet.png",
      64, // frame width
      64 // frame height
    );
    this.game.load.image("field_of_view", "../assets/FieldOfView.png");
  }

  create(): void {

      console.log("Creating");
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      this.game.world.setBounds(0, 0, gameConstants.BOARD_WIDTH, gameConstants.BOARD_HEIGHT);
      this.game.add.tileSprite(0, 0, gameConstants.BOARD_WIDTH, gameConstants.BOARD_HEIGHT, 'bg');
  
      this.players = {};
      this.drops = {};
  
      this.targets = this.game.add.group();
      this.game.physics.arcade.enable(this.targets);
  
      this.obstacles = this.game.add.group();
      this.game.physics.arcade.enable(this.obstacles);
  
      this.dropSprites = this.game.add.group();
      this.game.physics.arcade.enable(this.dropSprites);
  
      this.localPlayer.id = '0';
      this.localPlayer = initPlayer(0).bind(this);
      this.localPlayer.cameraSprite = this.game.add.sprite(this.localPlayer.character.x, this.localPlayer.character.y);
  
      this.game.camera.follow(this.localPlayer.cameraSprite);
  
      this.numSurvivors = 0;
  
      //Controls
      this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  
  
      //Keyboard Events
      this.localPlayer.keyboard = {
          ...gameConstants.keysPressed
      };
      this.game.input.keyboard.onDownCallback = (event: KeyboardEvent) => {
          if (gameConstants.GAME_STARTED && gameConstants.KEYCODES[event.keyCode] &&
              !this.localPlayer.keyboard[gameConstants.KEYCODES[event.keyCode]]) {
              this.localPlayer.keyboard[gameConstants.KEYCODES[event.keyCode]] = true;
          }
          // //Alternate Guns for testing purposes
          // if (event.keyCode == Phaser.Keyboard.Z){
          //     switchGun(this.game.localPlayer.gun, shotgun);
          // }
          // if (event.keyCode == Phaser.Keyboard.X){
          //     switchGun(this.game.localPlayer.gun, ar);
          // }
          // if (event.keyCode == Phaser.Keyboard.C){
          //     switchGun(this.game.localPlayer.gun, revolver);
          // }
      };
      this.game.input.keyboard.onUpCallback = (event: KeyboardEvent) => {
          if (gameConstants.GAME_STARTED && gameConstants.KEYCODES[event.keyCode] &&
              this.localPlayer.keyboard[gameConstants.KEYCODES[event.keyCode]]) {
              this.localPlayer.keyboard[gameConstants.KEYCODES[event.keyCode]] = false;
          }
      };
  
      this.HUD.ammo = this.game.add.text(10, gameConstants.GAME_VIEW_HEIGHT - 50, "Ammo: ", {
          font: "bold 24px Arial",
          fill: "#004887",
          align: "center"
      });
      this.HUD.health = this.game.add.text(gameConstants.GAME_VIEW_WIDTH / 2 - 100, gameConstants.GAME_VIEW_HEIGHT - 50, "Health: ", {
          font: "bold 24px Arial",
          fill: "#af0000",
          align: "center"
      });
      this.HUD.survivors = this.game.add.text(gameConstants.GAME_VIEW_WIDTH - 200, gameConstants.GAME_VIEW_HEIGHT - 50, "Survivors: ", {
          font: "bold 24px Arial",
          fill: "#004887",
          align: "center"
      });
  
      this.HUD.ammo.fixedToCamera = true;
      this.HUD.health.fixedToCamera = true;
      this.HUD.survivors.fixedToCamera = true;
  
  
      this.endGame = this.game.add.text(gameConstants.GAME_VIEW_WIDTH / 2, gameConstants.GAME_VIEW_HEIGHT / 2, "", {
          font: "bold 24px Arial",
          fill: "#af0000",
          align: "center"
      });
      this.endGame.fixedToCamera = true;

  }

  update(): void {
     //LocalPlayer
     movementHandler(this.localPlayer, this.localPlayer.gun, this.localPlayer.keyboard);
     //Loop through players (move non-LocalPlayer)
     if (this.localPlayer.keyboard['spacebar']) {
         if (this.localPlayer.isZombie) {
             melee(this.localPlayer);
         } else {
             fireGun();
         }
     }
 
     this.localPlayer.cameraSprite.x = this.localPlayer.character.x;
     this.localPlayer.cameraSprite.y = this.localPlayer.character.y;
 
     // Check collisions
     this.game.physics.arcade.overlap(this.localPlayer.gun.bullets, this.targets, bulletHitHandler, undefined, this);
     this.game.physics.arcade.collide(this.localPlayer.character, this.obstacles, undefined, undefined, this);
     this.game.physics.arcade.collide(this.localPlayer.gun.bullets, this.obstacles, killBullet, undefined, this);
     this.game.physics.arcade.collide(this.localPlayer.character, this.dropSprites, pickupDrop, undefined, this);
 }

  render(): void {
    // game.debug.spriteInfo(game.localPlayer.character, 20, 32);
    // game.localPlayer.gun.debug(20, 128);

    this.HUD.ammo.setText("Ammo: " + this.localPlayer.gun.ammo);
    this.HUD.health.setText("Health: " + this.localPlayer.health);
    this.HUD.survivors.setText("Survivors: " + this.numSurvivors);
 
  }
}
