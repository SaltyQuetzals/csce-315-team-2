import {Gun} from '../classes/game-classes';
import {updateHUDText} from '../HUD';
import {room} from '../main';
import {Weapon} from '../models/Guns';

export function fireGun() {
  if (room.game.localPlayer.gun.ammo > 0) {
    if (room.game.localPlayer.gun.shoot()) {
      --room.game.localPlayer.gun.ammo;
      room.game.socket.sendFireGun(room.game.localPlayer.gun.pGun.fireAngle);
      updateHUDText();
    }
  }
}

export function switchGun(gun: Gun, type: Weapon) {
  gun.name = type.constructor.name;
  gun.pGun.fireRate = type.fireRateMillis;
  gun.ammo = type._clipSize;
  gun.clipSize = type._clipSize;
  gun.damage = Number(type._damage);
  switch (gun.name) {
    case 'Revolver':
      gun.handle.frame = 0;
      break;
    case 'SawnOffShotgun':
      gun.handle.frame = 5;
      break;
    case 'AutomaticRifle':
      gun.handle.frame = 10;
      break;
    default:
      break;
  }
  return gun;
}

export function orientGun(gun: Gun, direction: string) {
  switch (direction) {
    case 'left':
      gun.pGun.fireAngle = Phaser.ANGLE_LEFT;
      gun.handle.angle = 0;
      gun.handle.scale.x = -1;
      gun.handle.scale.y = 1;
      gun.handle.anchor.setTo(0.5, 0);
      break;
    case 'right':
      gun.pGun.fireAngle = Phaser.ANGLE_RIGHT;
      gun.handle.angle = 0;
      gun.handle.scale.x = 1;
      gun.handle.scale.y = 1;
      gun.handle.anchor.setTo(-0.5, 0);
      break;
    case 'up':
      gun.pGun.fireAngle = Phaser.ANGLE_UP;
      gun.handle.angle = 90;
      gun.handle.scale.x = -1;
      gun.handle.scale.y = 1;
      gun.handle.anchor.setTo(.9, .8);
      break;
    case 'down':
      gun.pGun.fireAngle = Phaser.ANGLE_DOWN;
      gun.handle.angle = 90;
      gun.handle.scale.x = 1;
      gun.handle.scale.y = 1;
      gun.handle.anchor.setTo(-0.4, 1.3);
      break;
    default:
      break;
  }
}