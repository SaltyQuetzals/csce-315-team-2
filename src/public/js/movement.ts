import {CustomPlayer, CustomSprite, Gun} from './game-classes';
import {DIRECTIONS} from './game-constants';
import {game} from './main';
import {orientGun} from './weapon-functs';


// function any(dict: {[key: string]: number}) {
//     return Object.keys(dict).reduce((acc, cur) => acc + dict[cur], 0);
// }
// keys index changed, making this invalid

function shiftHitbox(player: CustomPlayer) {
  if (player.facing.x !== 0) {
    if (player.facing.x === DIRECTIONS.EAST) {
      player.hitbox.x = player.character.width;
    } else {
      player.hitbox.x = -player.character.width;
    }
  } else {
    player.hitbox.x = 0;
  }

  if (player.facing.y !== 0) {
    if (player.facing.y === DIRECTIONS.SOUTH) {
      player.hitbox.y = player.character.height;
    } else {
      player.hitbox.y = -player.character.height;
    }
  } else {
    player.hitbox.y = 0;
  }
}

export function animateAvatar(avatar: CustomSprite, dx: Number, dy: Number){
    if(!avatar.animating){
        //Up-Down Anim Precedence
        if(dy != 0){
            if(dy > 0)
                avatar.animations.play('down', 10, false);
            else
                avatar.animations.play('up', 10, false);
        }
        else{
            if(dx > 0)
                avatar.animations.play('right', 10, false);
            else
                avatar.animations.play('left', 10, false);
        }
    }
}

export function movementHandler(
    player: CustomPlayer, gun: Gun, keys: {[key: string]: boolean}) {
  const avatar = player.character;
  let eventShouldBeEmitted = false;
  if (player.isDead) {
    return;
  }
  if (!avatar.animating) {
    if (keys['left']) {
      player.facing.x = DIRECTIONS.WEST;
      avatar.body.velocity.x = -player.speed;
      if (!(keys['down'])) {
        avatar.animations.play('left', 10, true);
        orientGun(gun, 'left');
      }
      eventShouldBeEmitted = true;
    } else if (keys['right']) {
      player.facing.x = DIRECTIONS.EAST;
      avatar.body.velocity.x = player.speed;
      if (!(keys['down'])) {
        avatar.animations.play('right', 10, true);
        orientGun(gun, 'right');
      }
      eventShouldBeEmitted = true;
    } else {
      avatar.body.velocity.x = 0;
      if (keys['up'] || keys['down']) {
        player.facing.x = 0;
      }
    }

    if (keys['up']) {
      player.facing.y = DIRECTIONS.NORTH;
      avatar.body.velocity.y = -player.speed;
      if (!(keys['left'] || keys['right'])) {
        avatar.animations.play('up', 10, true);
        orientGun(gun, 'up');
      }
      eventShouldBeEmitted = true;
    } else if (keys['down']) {
      player.facing.y = DIRECTIONS.SOUTH;
      avatar.body.velocity.y = player.speed;
      avatar.animations.play('down', 10, true);
      orientGun(gun, 'down');
      eventShouldBeEmitted = true;
    } else {
      avatar.body.velocity.y = 0;
      if (keys['left'] || keys['right']) {
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
  if (eventShouldBeEmitted) {
    const location = {x: Number(avatar.body.x), y: Number(avatar.body.y)};
    game.socket.sendMove(location);
    if (player.isZombie) {
      shiftHitbox(player);
    }
  }
}