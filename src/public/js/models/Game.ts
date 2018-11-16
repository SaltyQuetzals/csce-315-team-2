import {Drop} from '../../../models/Drop';
import {GAME_BOARD_HEIGHT, GAME_BOARD_WIDTH, GAME_LENGTH} from '../../../shared/constants';
import {bulletHitHandler, killBullet, melee, pickupDrop} from '../collisons-functs';
import {SocketController} from '../controllers/SocketController';
import * as gameClasses from '../game-classes';
import * as gameConstants from '../game-constants';
import {initPlayer} from '../init-helpers';
import {movementHandler} from '../movement';
import {fireGun} from '../weapon-functs';
import { createHUD, updateHUD } from '../HUD';

export class GameController {
  GAME_STARTED = false;
  shadowTexture!: Phaser.BitmapData;
  lightSprite!: Phaser.Image;
  layer!: Phaser.TilemapLayer;
  map!: Phaser.Tilemap;
  game!: Phaser.Game;
  socket: SocketController;
  roomId!: string;
  players!: {[key: string]: gameClasses.CustomPlayer};
  drops!: {[key: string]: Drop};
  targets!: Phaser.Group;
  bullets!: Phaser.Group;
  obstacles!: Phaser.Group;
    dropSprites!: Phaser.Group;
    localPlayer!: gameClasses.CustomPlayer;
    score!: number;
  username!: string;
    numSurvivors!: number;  
    numZombies!: number;
    timer!: Phaser.Timer;
  HUD!: {
    ammo: {text: Phaser.Text; graphic: Phaser.Sprite, health: Phaser.Text};
      survivors: { text: Phaser.Text; graphic: Phaser.Sprite; }
      zombies: { text: Phaser.Text; graphic: Phaser.Sprite; }
    healthbar: Phaser.Graphics;
      timer: Phaser.Text;
      score: Phaser.Text;
      radar: { overlay: Phaser.Graphics; dots: { [id: string]: Phaser.Graphics } };
  };
  endGame!: Phaser.Text;
  constructor(roomId: string, username: string, socketController: SocketController) {
    this.roomId = roomId;
    this.username = username;
    this.game = new Phaser.Game(
        gameConstants.GAME_VIEW_WIDTH, gameConstants.GAME_VIEW_HEIGHT,
        Phaser.CANVAS, '', {
          preload: this.preload,
          create: this.create,
          update: this.update,
          render: this.render
          });
      this.socket = socketController;
      this.socket.gameController = this;
  }

  //  The Google WebFont Loader will look for this object, so create it before
  //  loading the script.
  webFontConfig = {
    google: {families: ['Annie Use Your Telescope']}

  };

  preload = ():
      void => {
        console.log('Preloading');
        this.game.load.script(
            'Annie Use Your Telescope',
            '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        this.game.stage.disableVisibilityChange = true;
        this.game.load.image('tiles', '../assets/0x72_DungeonTilesetII_v1.png');
        this.game.load.tilemap(
            'map', '../assets/zombie.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('bullet', '../assets/bullet.png');
        this.game.load.image('Automatic Rifle', '../assets/AutomaticRifle.png');
        this.game.load.image('Revolver', '../assets/Revolver.png');
        this.game.load.image('Shotgun', '../assets/Shotgun.png');
        this.game.load.image('p1', '../assets/WeirdFlex.png');
        this.game.load.image('p2', '../assets/Grit.png');
        this.game.load.image('p3', '../assets/Hammertime.png');
        this.game.load.image('p4', '../assets/Jackpot.png');
        this.game.load.image('HUDammo', '../assets/HUDammo.png');
        this.game.load.spritesheet(
            'weapons', '../assets/WeaponsSpriteSheet.png',
            64,  // frame width
            64   // frame height
        );
        this.game.load.spritesheet(
            'zombie_1', '../assets/ZombieWalkingSpriteSheet2.png',
            64,  // frame width
            64   // frame height
        );
        this.game.load.spritesheet(
            'survivor_1', '../assets/SurvivorWalkingSpriteSheet.png',
            64,  // frame width
            64   // frame height
        );
        this.game.load.image('field_of_view', '../assets/FieldOfView.png');

        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // this.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
      }

  create = ():
      void => {
        console.log('Creating');
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('0x72_DungeonTilesetII_v1', 'tiles');

      this.layer = this.map.createLayer('Tile Layer 1');
      this.layer.scale.setTo(3);

      this.game.world.setBounds(0, 0, GAME_BOARD_WIDTH, GAME_BOARD_HEIGHT);


        this.shadowTexture =
            this.game.add.bitmapData(this.game.width, this.game.height);

        this.lightSprite = this.game.add.image(
            this.game.camera.x, this.game.camera.y, this.shadowTexture);

        this.lightSprite.blendMode = Phaser.blendModes.MULTIPLY;

        this.players = {};
        this.drops = {};

        this.targets = this.game.add.group();
        this.game.physics.arcade.enable(this.targets);

        this.bullets = this.game.add.group();
        this.game.physics.arcade.enable(this.bullets);

        this.obstacles = this.game.add.group();
        this.game.physics.arcade.enable(this.obstacles);

        this.dropSprites = this.game.add.group();
        this.game.physics.arcade.enable(this.dropSprites);

        this.localPlayer = new gameClasses.CustomPlayer();
        this.localPlayer = initPlayer('0', 'local');
        this.localPlayer.id = '0';
        //   this.bullets.remove(this.localPlayer.gun.pGun);

      this.timer = this.game.time.create(true);
      this.timer.loop(5000, (): void => { if (!this.localPlayer.isZombie) this.score += 25; });
      this.timer.loop(3000, updateHUD);
      

        this.localPlayer.cameraSprite = this.game.add.sprite(
            this.localPlayer.character.x, this.localPlayer.character.y);

        this.game.camera.follow(this.localPlayer.cameraSprite);

      this.score = 0;
      this.numSurvivors = 0;
      this.numZombies = 0;

        // Controls
        this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


        // Keyboard Events
        this.localPlayer.keyboard = {...gameConstants.keysPressed};
        this.game.input.keyboard.onDownCallback = (event: KeyboardEvent) => {
            if (this.GAME_STARTED && gameConstants.KEYCODES[event.keyCode] &&
              !this.localPlayer
                   .keyboard[gameConstants.KEYCODES[event.keyCode]]) {
            this.localPlayer.keyboard[gameConstants.KEYCODES[event.keyCode]] =
                true;
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
          if (this.GAME_STARTED && gameConstants.KEYCODES[event.keyCode] &&
              this.localPlayer
                  .keyboard[gameConstants.KEYCODES[event.keyCode]]) {
            this.localPlayer.keyboard[gameConstants.KEYCODES[event.keyCode]] =
                false;
          }
        };

      this.endGame = this.game.add.text(
          gameConstants.GAME_VIEW_WIDTH / 2,
          gameConstants.GAME_VIEW_HEIGHT / 2, '', {
              font: 'bold 100px Annie Use Your Telescope',
              fill: '#af0000',
              boundsAlignH: 'center',
              boundsAlignV: 'middle'
          });
      this.endGame.anchor.setTo(.5);
      this.endGame.fixedToCamera = true;

      
      createHUD();

      }



  update = ():
      void => {
        // LocalPlayer
        movementHandler(
            this.localPlayer, this.localPlayer.gun, this.localPlayer.keyboard);
        // Loop through players (move non-LocalPlayer)
        if (this.localPlayer.keyboard['spacebar']) {
          if (this.localPlayer.isZombie) {
            melee(this.localPlayer);
          } else {
            fireGun();
          }
        }

        this.localPlayer.cameraSprite.x = this.localPlayer.character.x;
        this.localPlayer.cameraSprite.y = this.localPlayer.character.y;

        this.lightSprite.reset(this.game.camera.x, this.game.camera.y);
        this.updateShadowTexture();

        // Check collisions
        // Local Player shoots target
        this.game.physics.arcade.overlap(
            this.localPlayer.gun.pGun.bullets, this.targets, bulletHitHandler,
            undefined, this);

        // Local Player runs into obstacle
        this.game.physics.arcade.collide(
            this.localPlayer.character, this.obstacles, undefined, undefined,
            this);

        // Bullet hits obstacle
        this.game.physics.arcade.overlap(
            this.bullets, this.obstacles, killBullet, undefined, this);

        // Any bullet hits target
        this.game.physics.arcade.overlap(
            this.bullets, this.targets, killBullet, undefined, this);

        // Player picks up powerup or gun
        this.game.physics.arcade.overlap(
            this.localPlayer.character, this.dropSprites, pickupDrop, undefined,
            this);
      }

  render = ():
      void => {
        // game.debug.spriteInfo(game.localPlayer.character, 20, 32);
        // game.localPlayer.gun.debug(20, 128);

        this.HUD.ammo.text.setText('' + this.localPlayer.gun.ammo);
        this.HUD.survivors.text.setText('' + this.numSurvivors);
        this.HUD.zombies.text.setText('' + this.numZombies);

        this.HUD.timer.setText('' + (GAME_LENGTH - Math.floor(this.timer.seconds)));
        this.HUD.score.setText('' + this.score);
      }

  updateShadowTexture() {
    this.shadowTexture.fill(0, 0, 0, 1);
    this.shadowTexture.context.fillRect(
        -500, -500, GAME_BOARD_WIDTH, GAME_BOARD_HEIGHT);

    // this.game.world.bringToTop(this.HUD.ammo.health);

    let radius: number;

    if (this.localPlayer.isZombie) {
      radius = 400;
    } else {
      radius = 250;
    }

    const heroX = this.localPlayer.character.x - this.game.camera.x + 30;
    const heroY = this.localPlayer.character.y - this.game.camera.y + 30;

    const gradient = this.shadowTexture.context.createRadialGradient(
        heroX, heroY, 100 * 0.75, heroX, heroY, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    this.shadowTexture.context.beginPath();
    this.shadowTexture.context.fillStyle = gradient;
    this.shadowTexture.context.arc(heroX, heroY, radius, 0, Math.PI * 2, false);
    this.shadowTexture.context.fill();

    this.shadowTexture.dirty = true;
  }
}
