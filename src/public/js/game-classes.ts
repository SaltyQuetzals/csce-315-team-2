


export class Gun {
  gun!: Phaser.Weapon;
  ammo!: number; 
  clipSize!: number;
  damage!: number;
  name!: string;
  handle!: Phaser.Sprite;

  shoot() {
    if (this.gun.fire()) {
        this.handle.animations.play(this.name);
        return true;
    }
    return false;
  }
}

export class CustomSprite extends Phaser.Sprite{
  animating!: boolean;
  id!: string|number;
  frame!: number;
}

export class Player {
  id!: string|number;
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
  hitbox!: Phaser.Graphics;
}