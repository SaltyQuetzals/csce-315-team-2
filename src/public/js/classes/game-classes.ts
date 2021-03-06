import {Bullet, Weapon} from 'phaser-ce';

import {PLAYER_SPEED} from '../helper/game-constants';


export class Gun {
  pGun!: Phaser.Weapon;
  ammo!: number;
  damageBonus: number;
  clipSize!: number;
  damage!: number;
  name!: string;
  handle!: Phaser.Sprite;

  constructor() {
    this.damageBonus = 0;
  }

  shoot() {
    if (this.pGun.fire()) {
      this.handle.animations.play(this.name);
      return true;
    }
    return false;
  }
}

export class CustomSprite extends Phaser.Sprite {
  animating!: boolean;
  id!: string;
  frame!: number;
  usernameText!: Phaser.Text;
}

export class CustomPlayer {
  id!: string;
  username!: string;
  character!: CustomSprite;
  cameraSprite!: Phaser.Sprite;
  keyboard!: {[key: string]: boolean};
  health!: number;
  speed!: number;
  gun!: Gun;
  isZombie!: boolean;
  isDead!: boolean;
  facing!: {x: number; y: number;};
  hitbox!: Phaser.Graphics;
  moving!: boolean;
  dbZombieAttack!: boolean;
  customSounds!: {
    shoot: Phaser.Sound; bite: Phaser.Sound; death: Phaser.Sound;
    hit: Phaser.Sound;
  };

  constructor() {
    this.speed = PLAYER_SPEED;
  }
}

export interface LeaderBoard {
  players: {
    [playerId: string]: {name: string, stats: {kills: number, deaths: number}}
  };
}