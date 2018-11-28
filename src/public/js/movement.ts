import {CustomPlayer, CustomSprite, Gun} from './classes/game-classes';
import {DIRECTIONS, FACING} from './helper/game-constants';
import {orientGun} from './helper/weapon-functs';
import {room} from './main';


// function any(dict: {[key: string]: number}) {
//     return Object.keys(dict).reduce((acc, cur) => acc + dict[cur], 0);
// }
// keys index changed, making this invalid

export function shiftHitbox(player: CustomPlayer) {
  if (player.hitbox) {
    if (player.facing.x !== 0) {
      if (player.facing.x === DIRECTIONS.EAST) {
        player.hitbox.centerX = player.character.width;
      } else {
        player.hitbox.centerX = 0;
      }
    } else {
      player.hitbox.centerX = player.character.width / 2;
    }

    if (player.facing.y !== 0) {
      if (player.facing.y === DIRECTIONS.SOUTH) {
        player.hitbox.centerY = player.character.height;
      } else {
        player.hitbox.centerY = 0;
      }
    } else {
      player.hitbox.centerY = player.character.height / 2;
    }
  }
}

export function animateAvatar(
  avatar: CustomSprite, gun?: Gun) {
  const dx = avatar.body.velocity.x;
  const dy = avatar.body.velocity.y;
  if (!avatar.animating) {
    if (dy === 0 && dx === 0) {
      avatar.animations.stop();
    }
    // Up-Down Anim Precedence
    else if (dy !== 0) {
      if (dy > 0) {
        avatar.animations.play('down', 10, false);
        if (gun) {
          orientGun(gun, 'down');
        }
      } else {
        avatar.animations.play('up', 10, false);
        if (gun) {
          orientGun(gun, 'up');
        }
      }
    } else {
      if (dx > 0) {
        avatar.animations.play('right', 10, false);
        if (gun) {
          orientGun(gun, 'right');
        }
      } else {
        avatar.animations.play('left', 10, false);
        if (gun) {
          orientGun(gun, 'left');
        }
      }
    }
  }
}

export function movementHandler(
    player: CustomPlayer, gun: Gun, keys: {[key: string]: boolean}) {
  const avatar = player.character;
  let eventShouldBeEmitted = false;
  if (player.isDead) {
    avatar.body.velocity.x = 0;
    avatar.body.velocity.y = 0;
    return;
  }
  if (!avatar.animating) {
    if (keys['left'] || keys['a']) {
      player.facing.x = DIRECTIONS.WEST;
      avatar.body.velocity.x = -player.speed;
      if (!(keys['down'] || keys['s'])) {
        avatar.animations.play('left', 10, true);
        orientGun(gun, 'left');
      }
      eventShouldBeEmitted = true;
    } else if (keys['right'] || keys['d']) {
      player.facing.x = DIRECTIONS.EAST;
      avatar.body.velocity.x = player.speed;
      if (!(keys['down'] || keys['s'])) {
        avatar.animations.play('right', 10, true);
        orientGun(gun, 'right');
      }
      eventShouldBeEmitted = true;
    } else {
      avatar.body.velocity.x = 0;
      if (keys['up'] || keys['w'] || keys['down'] || keys['s']) {
        player.facing.x = 0;
      }
    }

    if (keys['up'] || keys['w']) {
      player.facing.y = DIRECTIONS.NORTH;
      avatar.body.velocity.y = -player.speed;
      if (!(keys['left'] || keys['a'] || keys['right'] || keys['d'])) {
        avatar.animations.play('up', 10, true);
        orientGun(gun, 'up');
      }
      eventShouldBeEmitted = true;
    } else if (keys['down'] || keys['s']) {
      player.facing.y = DIRECTIONS.SOUTH;
      avatar.body.velocity.y = player.speed;
      avatar.animations.play('down', 10, true);
      orientGun(gun, 'down');
      eventShouldBeEmitted = true;
    } else {
      avatar.body.velocity.y = 0;
      if (keys['left'] || keys['a'] || keys['right'] || keys['d']) {
        player.facing.y = 0;
      }
    }
  }

  let keyPressed = false;
  for (const key of Object.keys(keys)) {
    if (keys[key]) {
      keyPressed = true;
    }
  }
  if (!keyPressed) {
    // No keys pressed - stop animations
    if (!avatar.animating) {
      avatar.animations.stop();
    }
    avatar.body.velocity.x = 0;
    avatar.body.velocity.y = 0;
    // zombie.anims.play('idle');
  }
  if (eventShouldBeEmitted || player.moving) {
    if (!player.moving) {
      player.moving = true;
    } else if (!eventShouldBeEmitted) {
      player.moving = false;
    }
    const location = { x: Number(avatar.body.x), y: Number(avatar.body.y) };
    const velocity = { x: Number(avatar.body.velocity.x), y: Number(avatar.body.velocity.y) };
    room.game.socket.sendMove(location, velocity, player.facing);
    if (player.isZombie) {
      shiftHitbox(player);
    }
  }
}