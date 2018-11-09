import {Player, GameController, CustomSprite} from './models/Game';
import * as gameConstants from './game-constants';
import { Loader, Image } from 'phaser-ce';


function initPlayer(id: string) {

    const newPlayer = new Player();
    newPlayer.id = id;
    // newPlayer.character = initAvatar(id, 'zombie_1');
    newPlayer.character = initAvatar(newPlayer, 'survivor_1');
    newPlayer.gun = initGun(newPlayer.character);
    newPlayer.health = gameConstants.PLAYER_HEALTH;
    newPlayer.isZombie = false;
    newPlayer.isDead = false;
    newPlayer.character.animating = false; //Added for anim priority
    return newPlayer;
}

function initAvatar(this: GameController, player: Player, spriteSheet: string, x = gameConstants.GAME_VIEW_WIDTH / 2 - 200, y = gameConstants.GAME_VIEW_HEIGHT / 2 - 200) {
    const avatar = new CustomSprite(this.game, x, y, spriteSheet);
    // avatar = this.game.add.avatar(x, y, spriteSheet);
    avatar.frame = 1;
    avatar.id = player.id;
    this.game.physics.arcade.enable(avatar);
    avatar.body.collideWorldBounds = true;
    if (avatar.id !== this.localPlayer.id) {
        this.targets.add(avatar);
    } else {
        // Local player attributes
        player.facing = {
            x: 0,
            y: 0
        }
        if (player.isZombie) {
            player.hitbox = initHitbox(avatar);
        }
    }

    avatar.animations.add(
        'down',
        [0, 1, 2, 3],
        10,
        false
    );
    avatar.animations.add(
        'right',
        [5, 6, 7, 8],
        10,
        false
    );
    avatar.animations.add(
        'up',
        [10, 11, 12, 13],
        10,
        false
    );
    avatar.animations.add(
        'left',
        [15, 16, 17, 18],
        10,
        false
    );
    avatar.animations.add(
        'idle',
        [20],
        10,
        false
    );
    const hurt = avatar.animations.add(
        'hurt',
        [20, 21, 22, 23, 24],
        10,
        false
    );
    avatar.animations.currentAnim.onComplete.add(() => {
        avatar.animating = false;
    }, this);
    avatar.animations.add(
        'attack',
        [14, 19, 4, 9]
    );
    return avatar;
}

function initHitbox(this: GameController, character: Phaser.Sprite) {
    const hitbox = this.game.add.graphics(0, 0);
    // hitbox.lineStyle(2, 0x5ff0000, 1);
    hitbox.drawRect(0, 0, character.width, character.height);
    hitbox.boundsPadding = 0;

    this.game.physics.arcade.enable(hitbox);

    character.addChild(hitbox);

    return hitbox;
}

function initObstacles(this: GameController, obstacles: []) {

    for (let i = 0; i < obstacles.length; ++i) {

        const obstacle = this.game.add.graphics(obstacles[i].location[0], obstacles[i].location[1]);
        obstacle.lineStyle(2, 0x5b5b5b, 1);
        obstacle.beginFill(0x5b5b5b, 1);
        obstacle.drawRect(0, 0,
            obstacles[i].width, obstacles[i].height);
        obstacle.endFill();
        obstacle.boundsPadding = 0;

        game.physics.arcade.enable(obstacle);
        obstacle.body.immovable = true;

        game.obstacles.add(obstacle);
    }
}

function initDrops(drops) {
    for (var key in drops) {
        if (drops.hasOwnProperty(key)) {
            var drop = drops[key];
        }

        var image;
        if (drop.type == "Weapon") {
            image = DROPIMAGES[drop.item.type];
        } else {
            image = DROPIMAGES[drop.item.type];
        }


        drop.sprite = game.add.sprite(drop.location[0], drop.location[1], image);
        drop.sprite.id = drop.id;

        game.physics.arcade.enable(drop.sprite);

        game.drops[drop.id] = drop;
        game.dropSprites.add(drop.sprite);
    }
}