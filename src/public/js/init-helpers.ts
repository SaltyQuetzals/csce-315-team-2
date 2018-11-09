import {GameController} from './models/Game';
import {Player, CustomSprite, Gun} from './game-classes';
import * as gameConstants from './game-constants';
import { Loader, Image, Weapon } from 'phaser-ce';
import {Obstacle} from '../../models/Obstacle';
import { Drop } from '../../models/Drop';
import * as GUNS from './models/Guns';

export function initHitbox(controller: GameController, character: Phaser.Sprite): Phaser.Graphics {
    const hitbox = controller.game.add.graphics(0, 0);
    // hitbox.lineStyle(2, 0x5ff0000, 1);
    hitbox.drawRect(0, 0, character.width, character.height);
    hitbox.boundsPadding = 0;

    controller.game.physics.arcade.enable(hitbox);

    character.addChild(hitbox);

    return hitbox;
}

export function initGun(controller: GameController, character: Phaser.Sprite, weapon: GUNS.Weapon = new GUNS.Revolver()) {
    const newGun = new Gun();
    newGun.gun = controller.game.add.weapon(30, 'weapons');
    newGun.name = weapon.constructor.name;

    //Create bullets
    newGun.gun.addBulletAnimation("bullet",
        [15, 16, 17, 18, 19],
        60,
        true
    );
    newGun.gun.bulletAnimation = 'bullet';

    //Create handles
    newGun.handle = controller.game.add.sprite(0, 0, 'weapons');
    newGun.handle.animations.add(
        'Revolver',
        [0, 1, 2, 3, 4],
        30,
        false
    );
    newGun.handle.animations.add(
        'SawnOffShotgun',
        [5, 6, 7, 8, 9],
        30,
        false
    );
    newGun.handle.animations.add(
        'AutomaticRifle',
        [10, 11, 12, 13, 14],
        30,
        false
    );
    newGun.handle.frame = 0;
    newGun.handle.anchor.setTo(-0.5, 0);
    character.addChild(newGun.handle);

    newGun.ammo = weapon._clipSize;
    newGun.clipSize = weapon._clipSize;
    newGun.damage = Number(weapon._damage);
    newGun.gun.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    newGun.gun.bulletAngleOffset = 0;
    newGun.gun.fireAngle = Phaser.ANGLE_RIGHT;
    newGun.gun.bulletSpeed = 1000;
    newGun.gun.fireRate = weapon.fireRateMillis;
    newGun.gun.trackSprite(newGun.handle, character.width / 2, character.height / 2);


    return newGun;
}

export function initAvatar(controller: GameController, player: Player,
    spriteSheet: string,
    x = gameConstants.GAME_VIEW_WIDTH / 2 - 200,
    y = gameConstants.GAME_VIEW_HEIGHT / 2 - 200): CustomSprite {
    const avatar = new CustomSprite(controller.game, x, y, spriteSheet);
    // avatar = this.game.add.avatar(x, y, spriteSheet);
    avatar.frame = 1;
    avatar.id = player.id;
    controller.game.physics.arcade.enable(avatar);
    avatar.body.collideWorldBounds = true;
    if (avatar.id !== controller.localPlayer.id) {
        controller.targets.add(avatar);
    } else {
        // Local player attributes
        player.facing = {
            x: 0,
            y: 0
        };
        if (player.isZombie) {
            player.hitbox = initHitbox(controller, avatar);
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
    }, controller);
    avatar.animations.add(
        'attack',
        [14, 19, 4, 9]
    );
    return avatar;
}

export function initPlayer(controller: GameController, id: string) {

    const newPlayer = new Player();
    newPlayer.id = id;
    // newPlayer.character = initAvatar(id, 'zombie_1');
    newPlayer.character = initAvatar(controller, newPlayer, 'survivor_1');
    newPlayer.gun = initGun(controller, newPlayer.character);
    newPlayer.health = gameConstants.PLAYER_HEALTH;
    newPlayer.isZombie = false;
    newPlayer.isDead = false;
    newPlayer.character.animating = false; //Added for anim priority
    return newPlayer;
}

export function initObstacles(controller: GameController, obstacles: [Obstacle]) {

    for (let i = 0; i < obstacles.length; ++i) {

        const obstacle = controller.game.add.graphics(obstacles[i].location[0], obstacles[i].location[1]);
        obstacle.lineStyle(2, 0x5b5b5b, 1);
        obstacle.beginFill(0x5b5b5b, 1);
        obstacle.drawRect(0, 0,
            obstacles[i].width, obstacles[i].height);
        obstacle.endFill();
        obstacle.boundsPadding = 0;

        controller.game.physics.arcade.enable(obstacle);
        obstacle.body.immovable = true;

        controller.obstacles.add(obstacle);
    }
}

function initDrops(controller: GameController, drops: {[key: number]: Drop}) {
    let drop: Drop;

    for (const key of Object.keys(drops)) {
        if (drops.hasOwnProperty(key)) {
            drop = drops[key as unknown as number];

            let image: string;
            if (drop.type === "Weapon") {
                image = gameConstants.DROPIMAGES[drop.item.type];
            } else {
                image = gameConstants.DROPIMAGES[drop.item.type];
            }


            drop.sprite = new CustomSprite(controller.game, drop.location[0], drop.location[1], image);
            drop.sprite.id = drop.id;

            controller.game.physics.arcade.enable(drop.sprite);

            controller.drops[drop.id] = drop;
            controller.dropSprites.add(drop.sprite);
    }
    }
}