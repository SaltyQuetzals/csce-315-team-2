import {Image, Loader, Sprite, Weapon} from 'phaser-ce';
import {isUndefined} from 'util';

import {Drop} from '../../../models/Drop';
import {Obstacle} from '../../../models/Obstacle';
import {delay} from '../../../shared/functions';
import {CustomPlayer, CustomSprite, Gun} from '../classes/game-classes';
import {room} from '../main';
import {GameController} from '../models/Game';
import * as GUNS from '../models/Guns';

import * as gameConstants from './game-constants';

export function initHitbox(character: Phaser.Sprite): Phaser.Graphics {
  const hitbox = room.game.game.add.graphics(0, 0);
  // hitbox.lineStyle(2, 0x5ff0000, 1);
  hitbox.drawRect(0, 0, character.width / 2, character.height / 2);
  hitbox.boundsPadding = 0;

  room.game.game.physics.arcade.enable(hitbox);

  character.addChild(hitbox);

  return hitbox;
}

export function initGun(
    character: CustomSprite, weapon: GUNS.Weapon = new GUNS.Revolver()) {
  const newGun = new Gun();
  newGun.pGun = room.game.game.add.weapon(30, 'weapons');
  newGun.name = weapon.constructor.name;

  room.game.game.physics.arcade.enable(newGun.pGun.bullets);
  room.game.bullets.add(newGun.pGun.bullets);

  // Create bullets
  newGun.pGun.addBulletAnimation('bullet', [15, 16, 17, 18, 19], 60, true);
  newGun.pGun.bulletAnimation = 'bullet';

  // Create handles
  newGun.handle = room.game.game.add.sprite(0, 0, 'weapons');
  newGun.handle.animations.add('Revolver', [0, 1, 2, 3, 4], 30, false);
  newGun.handle.animations.add('SawnOffShotgun', [5, 6, 7, 8, 9], 30, false);
  newGun.handle.animations.add(
      'AutomaticRifle', [10, 11, 12, 13, 14], 30, false);
  newGun.handle.frame = 0;
  newGun.handle.anchor.setTo(-0.5, 0);
  character.addChild(newGun.handle);

  newGun.ammo = weapon._clipSize;
  newGun.clipSize = weapon._clipSize;
  newGun.damage = Number(weapon._damage);
  newGun.pGun.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
  newGun.pGun.bulletAngleOffset = 0;
  newGun.pGun.fireAngle = Phaser.ANGLE_RIGHT;
  newGun.pGun.bulletSpeed = 1000;
  newGun.pGun.fireRate = weapon.fireRateMillis;
  newGun.pGun.trackSprite(
      newGun.handle, character.width / 2, character.height / 2);

  return newGun;
}

export function initAvatar(
    player: CustomPlayer, spriteSheet: string,
    x = gameConstants.GAME_VIEW_WIDTH / 2 - 200,
    y = gameConstants.GAME_VIEW_HEIGHT / 2 - 200): CustomSprite {
  // const avatar = new CustomSprite(game.game, x, y, spriteSheet);
  const avatar: CustomSprite =
      room.game.game.add.sprite(x, y, spriteSheet) as CustomSprite;
  // avatar = this.game.add.avatar(x, y, spriteSheet);
  avatar.frame = 1;
  avatar.id = player.id;
  room.game.game.physics.arcade.enable(avatar);
  room.game.targets.add(avatar);
  avatar.body.collideWorldBounds = true;

  avatar.usernameText =
      room.game.game.add.text(avatar.width / 2, -28, player.username, {
        font: 'bold 16px Annie Use Your Telescope',
        fill: '#ffffff',
        align: 'center'
      });
  avatar.usernameText.anchor.setTo(.5);
  avatar.addChild(avatar.usernameText);
  if (player.isZombie) {
    player.hitbox = initHitbox(avatar);
  }

  if (room.game.localPlayer && (avatar.id !== room.game.localPlayer.id) &&
      (player.id !== '0')) {
    // game.bulletTargets.push(avatar);
    // console.log(game.bulletTargets);
    // game.targets.add(avatar);
  } else {
    // Local player attributes

    let color: string;
    let colorNum: number;
    if (player.isZombie) {
      color = '#7CCB91';
      colorNum = 0x7CCB91;
    } else {
      color = '#EDD297';
      colorNum = 0xEDD297;
    }

    avatar.usernameText.setStyle({
      font: 'bold 16px Annie Use Your Telescope',
      fill: color,
      align: 'center'
    });

    const userIndicator = room.game.game.add.graphics(0, 0);
    userIndicator.lineStyle(2, colorNum, 1);
    userIndicator.beginFill(colorNum, 1);
    userIndicator.drawTriangle(
        [
          new Phaser.Point(avatar.width / 2 - 10, -15),
          new Phaser.Point(avatar.width / 2 + 10, -15),
          new Phaser.Point(avatar.width / 2, -10)
        ],
        false);
    userIndicator.endFill();
    avatar.addChild(userIndicator);

    player.facing = {x: 0, y: 0};
  }

  avatar.animations.add('down', [0, 1, 2, 3], 10, false);
  avatar.animations.add('right', [5, 6, 7, 8], 10, false);
  avatar.animations.add('up', [10, 11, 12, 13], 10, false);
  avatar.animations.add('left', [15, 16, 17, 18], 10, false);
  avatar.animations.add('idle', [20], 10, false);
  const hurt = avatar.animations.add('hurt', [20, 21, 22, 23, 24], 10, false);
  avatar.animations.currentAnim.onComplete.add(() => {
    avatar.animating = false;
  }, room.game);
  avatar.animations.add('attack', [14, 19, 4, 9]);
  avatar.animations.add('die', [25, 26, 27, 28, 29]);
  avatar.animations.add('revive', [30, 31, 32, 33, 34]);
  return avatar;
}

export function initPlayer(id: string, username: string) {
  const newPlayer = new CustomPlayer();
  newPlayer.id = id;
  newPlayer.username = username;
  // newPlayer.character = initAvatar(id, 'zombie_1');
  newPlayer.character = initAvatar(newPlayer, 'survivor_1');
  newPlayer.gun = initGun(newPlayer.character);
  newPlayer.health = gameConstants.PLAYER_HEALTH;
  newPlayer.isZombie = false;
  newPlayer.isDead = false;
  newPlayer.character.animating = false;  // Added for anim priority
  newPlayer.customSounds = {
    shoot: room.game.game.add.audio('shoot'),
    bite: room.game.game.add.audio('bite'),
    death: room.game.game.add.audio('death'),
    hit: room.game.game.add.audio('hit'),
  }

  return newPlayer;
}

export function initObstacles(obstacles: Obstacle[]) {
  for (let i = 0; i < obstacles.length; ++i) {
    const brickWall = room.game.game.add.tileSprite(
      obstacles[i].location[0], obstacles[i].location[1],
      obstacles[i].width, obstacles[i].height, 'brick');
    room.game.game.physics.arcade.enable(brickWall);
    brickWall.body.immovable = true;
    room.game.obstacles.add(brickWall);
  }
}

export function initDrops(drops: {[key: number]: Drop}) {
  let drop: Drop;

  for (const key of Object.keys(drops)) {
    if (drops.hasOwnProperty(key)) {
      drop = drops[Number(key)];

      let image: string;
      if (drop.type === 'Weapon') {
        image = gameConstants.DROPIMAGES[drop.item.type];
      } else {
        image = gameConstants.DROPIMAGES[drop.item.type];
      }

      const sprite =
          room.game.game.add.sprite(drop.location[0], drop.location[1], image);
      drop.sprite = sprite as CustomSprite;
      drop.sprite.id = String(drop.id);

      room.game.game.physics.arcade.enable(drop.sprite);

      room.game.drops[drop.id] = drop;
      room.game.dropSprites.add(drop.sprite);
    }
  }
}