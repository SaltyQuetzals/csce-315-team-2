import { PLAYER_SPEED } from "./game-constants";



export class Gun {
  pGun!: Phaser.Weapon;
  ammo!: number; 
  clipSize!: number;
  damage!: number;
  name!: string;
  handle!: Phaser.Sprite;

  shoot() {
    if (this.pGun.fire()) {
        this.handle.animations.play(this.name);
        return true;
    }
    return false;
  }
}

export class CustomSprite extends Phaser.Sprite{
  animating!: boolean;
  id!: string;
  frame!: number;
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
  facing!: {
    x: number;
    y: number;
  };
  hitbox!: Phaser.Graphics;

  constructor() {
    this.speed = PLAYER_SPEED;
  }
}