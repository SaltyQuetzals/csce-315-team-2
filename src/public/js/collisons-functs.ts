import { Drop } from "../../models/Drop";
import { game } from "./main";
import { switchGun } from "./weapon-functs";
import { Revolver, SawnOffShotgun, AutomaticRifle } from "./models/Guns";
import { CustomSprite, CustomPlayer } from "./game-classes";

export function pickupDrop(character: CustomSprite, dropSprite: Drop) {
    const drop: Drop = game.drops[dropSprite.id];
    dropSprite.sprite.destroy();

    const player = game.localPlayer;

    if (drop.type === 'Weapon') {
        console.log(drop.item.type);
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
        console.log(type);
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

export function killBullet(bullet: Phaser.Sprite, obstacle: CustomSprite) {
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
        //animate HIT
        const target = game.players[enemy.id];
        target.character.animating = true;
        target.character.animations.play('hurt', 20, false);
    }
}

export function melee(player: CustomPlayer) {
    game.game.physics.arcade.overlap(player.hitbox, game.targets, meleeHit, undefined, game);
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