import {Drop} from '../../../models/Drop';
import {Player} from '../../../models/Player';
import {delay} from '../../../shared/functions';
import {CustomPlayer, CustomSprite} from '../classes/game-classes';
import {updateHUDText, togglePowerup} from '../HUD';
import {room} from '../main';
import {AutomaticRifle, Revolver, SawnOffShotgun} from '../models/Guns';

import {ZOMBIE_ATTACK_DEBOUNCE, PLAYER_SPEED} from './game-constants';
import {switchGun} from './weapon-functs';

export function deactivateDrop(type: string) {
  const player = room.game.localPlayer;
  switch (type) {
    case 'WeirdFlex':
      player.gun.damage -= player.gun.damageBonus;
      player.gun.damageBonus = 0;
      togglePowerup("WeirdFlex", false);
      break;
    case 'Hammertime':
      player.speed = PLAYER_SPEED;
      togglePowerup("Hammertime", false);
      break;
    default:
      break;
  }
}

export function pickupDrop(character: CustomSprite, dropSprite: CustomSprite) {
  const drop: Drop = room.game.drops[dropSprite.id];
  dropSprite.destroy();

  const player = room.game.localPlayer;

  if (!player.isZombie) {
    if (drop.type === 'Weapon') {
      // console.log(drop.item.type);
      room.game.socket.sendSwitchGun(drop.item.type);
      const bonus = player.gun.damageBonus;
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
      player.gun.damageBonus = bonus;
      player.gun.damage += bonus;
      updateHUDText();
    } else {
      const type = drop.item.type;
      // console.log(type);
      room.game.socket.sendActivateDrop(drop.id, drop.item.type);
      switch (type) {
        case 'WeirdFlex':
          player.gun.damageBonus += 10;
          player.gun.damage += player.gun.damageBonus;
          togglePowerup("WeirdFlex", true);
          break;
        case 'Grit':
          player.health += 100;
          room.game.HUD.healthbar.width = 1.5 * player.health;
          room.game.socket.sendChangeHealth(100);
          break;
        case 'Hammertime':
          player.speed = 1.5*PLAYER_SPEED;
          togglePowerup("Hammertime", true);
          break;
        case 'Jackpot':
          player.gun.ammo += player.gun.clipSize;
          updateHUDText();
          break;
        default:
          break;
      }
    }
  }
}

export function killBullet(bullet: Phaser.Sprite, obstacle: CustomSprite) {
  const player = room.game.players[obstacle.id];

  if (player !== undefined) {
    if (bullet.data.bulletManager === player.gun.pGun) {
      return;
    }
  }
  const x = bullet.x;
  const y = bullet.y;
  const lookVector = bullet.body.velocity;
  let lookVectorX = Math.abs(lookVector.x)/ lookVector.x;
  lookVectorX = lookVectorX ? lookVectorX : 0;
  let lookVectorY = Math.abs(lookVector.y)/ lookVector.y;
  lookVectorY = lookVectorY ? lookVectorY : 0;

  bullet.kill();
  const impactX = x - bullet.width/2 + lookVectorX*bullet.width*0.75;
  const impactY = y - bullet.height/2 + lookVectorY*bullet.height/2;
  
  const impact = room.game.game.add.sprite(impactX, impactY, 'weapons');
  impact.animations.add('hit', [25, 26, 27, 28, 29], 20, false);
  impact.play('hit', 20, false, true);
}

export function bulletHitHandler(bullet: Phaser.Sprite, enemy: CustomSprite) {
  /// Currently just kills sprites... need to implement health here

  if (enemy.id === room.game.localPlayer.id || enemy.id === '0') {
    return;
  }
  const target = room.game.players[enemy.id];
  if (target.isDead){
    return;
  }
  room.game.socket.sendHit(enemy.id, room.game.localPlayer.gun.damage);
  if (room.game.localPlayer.gun.damage >= target.health) {
    killBullet(bullet, enemy);
    target.isDead = true;
    enemy.animations.play('die', 15, false);
    room.game.score += 100;
  } else {
    target.health -= room.game.localPlayer.gun.damage;
    // animate HIT
    target.character.animating = true;
    target.character.animations.play('hurt', 20, false);
    room.game.score += 20;
  }
  updateHUDText();
}

export async function melee(player: CustomPlayer) {
  if (!player.dbZombieAttack) {
    player.dbZombieAttack = true;
    room.game.game.physics.arcade.overlap(
        player.hitbox, room.game.targets, meleeHit, undefined, room.game);

    const x = player.character.x + player.hitbox.x;
    const y = player.character.y + player.hitbox.y;
    // Emit
    room.game.socket.sendZombieAttack();
    // Instantiate bite anim
    meleeAnim(player);
    await delay(ZOMBIE_ATTACK_DEBOUNCE);
    player.dbZombieAttack = false;
  }
}

export function meleeAnim(player: CustomPlayer) {
  const biteAnim = room.game.game.add.sprite(0, 0, 'weapons', 20);
  player.hitbox.addChild(biteAnim);
  biteAnim.width = player.hitbox.width;
  biteAnim.height = player.hitbox.height;
  biteAnim.animations.add('Bite', [20, 21, 22, 23, 24], 30, false);

  biteAnim.animations.play('Bite', 30, false, true);

  const dx = room.game.localPlayer.character.x - player.character.x;
  const dy = room.game.localPlayer.character.y - player.character.y;
  const volume = room.game.soundGauger(dx, dy);
  player.customSounds.bite.play(undefined, undefined, volume, false);
}

export function meleeHit(hitbox: Phaser.Graphics, enemy: CustomSprite) {
  const meleeDamage = 100;
  const target = room.game.players[enemy.id];
  if (enemy.id === room.game.localPlayer.id || enemy.id === '0') {
    return;
  }
  if (target.isDead){
    return;
  }
  room.game.socket.sendHit(enemy.id, meleeDamage);

  if (meleeDamage >= target.health) {
    target.isDead = true;
    enemy.animations.play('die', 15, false);
    room.game.score += 100;
  } else {
    room.game.players[enemy.id].health -= meleeDamage;
  }
}