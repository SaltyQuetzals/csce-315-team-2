import {Drop} from '../../models/Drop';

import {CustomPlayer, CustomSprite} from './game-classes';
import {game} from './main';
import {AutomaticRifle, Revolver, SawnOffShotgun} from './models/Guns';
import {switchGun} from './weapon-functs';

export function pickupDrop(character: CustomSprite, dropSprite: CustomSprite) {
  const drop: Drop = game.drops[dropSprite.id];
  dropSprite.destroy();

  const player = game.localPlayer;

  if (!player.isZombie) {
    if (drop.type === 'Weapon') {
      // console.log(drop.item.type);
      game.socket.sendSwitchGun(drop.item.type);
      switch (drop.item.type) {
        case 'revolver':
          switchGun(player.gun, new Revolver());
          break;
        case 'shotgun':
          switchGun(player.gun, new SawnOffShotgun());
          break;
        case 'automatic rifle':
          switchGun(player.gun, new AutomaticRifle());
          break;
        default:
          break;
      }

    } else {
      const type = drop.item.type;
      // console.log(type);
      game.socket.sendActivateDrop(drop.id);
      switch (type) {
        case 'WeirdFlex':
          player.gun.damage += 10;
          break;
        case 'Grit':
          player.health += 100;
          game.socket.sendChangeHealth(100);
          break;
        case 'Hammertime':
          player.speed = 300;
          break;
        case 'Jackpot':
          player.gun.ammo += player.gun.clipSize;
          break;
        default:
          break;
      }
    }
  }
}

export function killBulletTest(bullet: Phaser.Sprite, obstacle: CustomSprite) {
  bullet.kill();
}

export function killBullet(bullet: Phaser.Sprite, obstacle: CustomSprite) {
  const player = game.players[obstacle.id];
  if (player !== undefined) {
    if (bullet.data.bulletManager === player.gun.pGun) {
      return;
    }
  }
  bullet.kill();
}

export function bulletHitHandler(bullet: Phaser.Sprite, enemy: CustomSprite) {
  /// Currently just kills sprites... need to implement health here

  game.socket.sendHit(enemy.id, game.localPlayer.gun.damage);
  bullet.kill();
  if (game.localPlayer.gun.damage >= game.players[enemy.id].health) {
    enemy.kill();
  } else {
    game.players[enemy.id].health -= game.localPlayer.gun.damage;
    // animate HIT
    const target = game.players[enemy.id];
    target.character.animating = true;
    target.character.animations.play('hurt', 20, false);
  }
}

export function melee(player: CustomPlayer) {
  game.game.physics.arcade.overlap(
      player.hitbox, game.targets, meleeHit, undefined, game);
}

export function meleeHit(hitbox: Phaser.Graphics, enemy: CustomSprite) {
  const meleeDamage = 100;

  game.socket.sendHit(enemy.id, meleeDamage);

  if (meleeDamage >= game.players[enemy.id].health) {
    enemy.kill();
  } else {
    game.players[enemy.id].health -= meleeDamage;
  }
}