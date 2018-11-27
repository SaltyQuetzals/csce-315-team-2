import {isUndefined} from 'util';

import {CustomPlayer} from './classes/game-classes';
import * as gameConstants from './helper/game-constants';
import { room } from './main';
import { GAME_LENGTH, GAME_BOARD_WIDTH, GAME_BOARD_HEIGHT } from '../../shared/constants';
import { Graphics, GraphicsData } from 'phaser-ce';

export function togglePowerup(type: string, activate: boolean): void {
    let sprite: Phaser.Sprite;
    if (type === "Hammertime") {
        sprite = room.game.HUD.powerups.hammertime;
    }
    else {
        sprite = room.game.HUD.powerups.weirdFlex;
    }

    if (activate) {
        sprite.revive();
    }
    else {
        sprite.kill();
    }
}

export function updateHUDText(): void {
  room.game.HUD.survivors.text.setText('' + room.game.numSurvivors);
  room.game.HUD.zombies.text.setText('' + room.game.numZombies);
  if (!room.game.localPlayer.isZombie) {
    room.game.HUD.ammo.text.setText('' + room.game.localPlayer.gun.ammo);
  }
  room.game.HUD.kills.text.setText('' + room.game.kills);
  room.game.HUD.deaths.text.setText('' + room.game.deaths);
}

export function updateRadar(): void {

    const players = room.game.players;
    let currentPlayer: CustomPlayer;
    let currentDot: Phaser.Graphics;
    let color = 0xffffff;

    Object.keys(players).map((playerId) => {
        // console.log(playerId);
        currentPlayer = players[playerId];
        color = 0x5b5b5b;
        if (playerId === room.game.localPlayer.id) {
            color = 0xffffff;
        }
        else if (room.game.localPlayer.isZombie !== currentPlayer.isZombie) {
            color = 0xaf0000;
        }
        else {
            color = 0x5b5b5b;
        }
        
        if (!isUndefined(room.game.HUD.radar.dots[playerId])) {
            currentDot = room.game.HUD.radar.dots[playerId];
            currentDot.destroy();
        }
        currentDot = room.game.game.add.graphics();

        currentDot.beginFill(color, 1);
        currentDot.drawCircle(6, 6, 8);
        currentDot.endFill();
        currentDot.boundsPadding = 0;
        currentDot.x = currentPlayer.character.x / 20;
        currentDot.y = currentPlayer.character.y / 20;
        room.game.HUD.radar.dots[playerId] = currentDot;
        room.game.HUD.radar.overlay.addChild(currentDot);
        room.game.game.world.bringToTop(room.game.HUD.radar.overlay);
    });
}

export function createHUD(): void {
    room.game.HUD = Object();
    const HUD = room.game.HUD;

    HUD.ammo = Object();
    HUD.kills = Object();
    HUD.deaths = Object();
    HUD.powerups = Object();
    HUD.survivors = Object();
    HUD.zombies = Object();
    HUD.radar = Object();
    HUD.radar.dots = {};

    const healthbarBackground = room.game.game.add.graphics(10, 10);
    healthbarBackground.lineStyle(2, 0x5b5b5b, 1);
    healthbarBackground.beginFill(0x5b5b5b, 1);
    healthbarBackground.drawRect(0, 0, 150, 20);
    healthbarBackground.endFill();
    healthbarBackground.alpha = .5;

    HUD.healthbar = room.game.game.add.graphics(10, 10);
    HUD.healthbar.lineStyle(2, 0xaf0000, 1);
    HUD.healthbar.beginFill(0xaf0000, 1);
    HUD.healthbar.drawRect(0, 0, 150, 20);
    HUD.healthbar.endFill();
    // HUD.healthbar.alpha = .5;

    HUD.ammo.graphic = room.game.game.add.sprite(10, 40, 'HUDammo');
    // HUD.ammo.graphic.alpha = .5;
    HUD.ammo.text =
        room.game.game.add.text(10 + HUD.ammo.graphic.width + 10, 35, '', {
            font: 'bold 40px Annie Use Your Telescope',
            fill: '#ffffff',
            align: 'center'
        });
    
    // Kills template
    HUD.kills.graphic = room.game.game.add.sprite(
        10, HUD.ammo.graphic.y + HUD.ammo.graphic.height + 10,
        'crosshairs');
    HUD.kills.graphic.scale.setTo(.4);
    // HUD.survivors.graphic.tint = 0x5b5b5b;
    // HUD.survivors.graphic.alpha = .5;
    HUD.kills.text = room.game.game.add.text(
        HUD.kills.graphic.x + 4 +
        HUD.kills.graphic.width,
        HUD.kills.graphic.y - 4, '0', {
            font: 'bold 30px Annie Use Your Telescope',
            fill: '#ffffff',
            align: 'center'
        });
    
    // Deaths template
    HUD.deaths.graphic = room.game.game.add.sprite(
        HUD.kills.text.x + HUD.kills.text.width + 5,
        HUD.kills.graphic.y - 5, 'survivor_1');
    HUD.deaths.graphic.frame = 29;
    HUD.deaths.graphic.scale.setTo(.5);
    // HUD.survivors.graphic.tint = 0x5b5b5b;
    // HUD.survivors.graphic.alpha = .5;
    HUD.deaths.text = room.game.game.add.text(
        HUD.deaths.graphic.x - 3 +
        HUD.deaths.graphic.width,
        HUD.deaths.graphic.y, '0', {
            font: 'bold 30px Annie Use Your Telescope',
            fill: '#ffffff',
            align: 'center'
        });
    
    HUD.powerups.hammertime = room.game.game.add.sprite(
        10, HUD.kills.graphic.y + HUD.kills.graphic.height + 10, 'p3');
    HUD.powerups.hammertime.scale.setTo(.5);
    HUD.powerups.hammertime.kill();
        
    HUD.powerups.weirdFlex = room.game.game.add.sprite(
        HUD.powerups.hammertime.x + HUD.powerups.hammertime.width + 10,
        HUD.powerups.hammertime.y, 'p1');
    HUD.powerups.weirdFlex.scale.setTo(.5);
    HUD.powerups.weirdFlex.kill();

    HUD.survivors.graphic = room.game.game.add.sprite(
        gameConstants.GAME_VIEW_WIDTH - 200, 
        gameConstants.GAME_VIEW_HEIGHT - 100, 'survivor_1');
    HUD.survivors.graphic.scale.setTo(.5, .5);
    // HUD.survivors.graphic.tint = 0x5b5b5b;
    // HUD.survivors.graphic.alpha = .5;
    HUD.survivors.text = room.game.game.add.text(
        HUD.survivors.graphic.x + 2 +
        HUD.survivors.graphic.width,
        HUD.survivors.graphic.y, '', {
            font: 'bold 30px Annie Use Your Telescope',
            fill: '#ffffff',
            align: 'center'
        });

    HUD.zombies.graphic = room.game.game.add.sprite(
        HUD.survivors.graphic.x,
        HUD.survivors.graphic.y + HUD.survivors.graphic.height + 10,
        'zombie_1');
    HUD.zombies.graphic.scale.setTo(.5, .5);
    // HUD.zombies.graphic.tint = 0x5b5b5b;
    // HUD.zombies.graphic.alpha = .5;
    HUD.zombies.text = room.game.game.add.text(
        HUD.zombies.graphic.x + 2 +
        HUD.zombies.graphic.width,
        HUD.zombies.graphic.y, '', {
            font: 'bold 30px Annie Use Your Telescope',
            fill: '#ffffff',
            align: 'center'
        });

    HUD.timer =
        room.game.game.add.text(gameConstants.GAME_VIEW_WIDTH / 2, 30,
        '' + (GAME_LENGTH - room.game.timer.seconds),
        {
            font: 'bold 30px Annie Use Your Telescope',
            fill: '#ffffff',
            boundsAlignH: 'center'
        });
    HUD.timer.anchor.setTo(.5);

    HUD.radar.overlay = room.game.game.add.graphics(
        gameConstants.GAME_VIEW_WIDTH - GAME_BOARD_WIDTH / 20 - 18,
        gameConstants.GAME_VIEW_HEIGHT - GAME_BOARD_HEIGHT / 20 - 18);
    HUD.radar.overlay.lineStyle(2, 0x5b5b5b, 1);
    // HUD.radar.beginFill(0x5b5b5b, 1);
    HUD.radar.overlay.drawRect(0, 0, GAME_BOARD_WIDTH/20 + 8, GAME_BOARD_HEIGHT/20 + 8);
    // HUD.radar.endFill();
    HUD.radar.overlay.boundsPadding = 0;

    HUD.ammo.text.fixedToCamera = true;
    HUD.ammo.graphic.fixedToCamera = true;
    HUD.kills.text.fixedToCamera = true;
    HUD.kills.graphic.fixedToCamera = true;
    HUD.deaths.text.fixedToCamera = true;
    HUD.deaths.graphic.fixedToCamera = true;
    HUD.powerups.hammertime.fixedToCamera = true;
    HUD.powerups.weirdFlex.fixedToCamera = true;
    HUD.survivors.text.fixedToCamera = true;
    HUD.survivors.graphic.fixedToCamera = true;
    HUD.zombies.text.fixedToCamera = true;
    HUD.zombies.graphic.fixedToCamera = true;
    HUD.healthbar.fixedToCamera = true;
    healthbarBackground.fixedToCamera = true;
    HUD.timer.fixedToCamera = true;
    HUD.radar.overlay.fixedToCamera = true;

    room.game.game.world.bringToTop(room.game.shadowTexture);
    room.game.game.world.bringToTop(room.game.lightSprite);

    room.game.game.world.bringToTop(healthbarBackground);
    room.game.game.world.bringToTop(HUD.healthbar);
    room.game.game.world.bringToTop(HUD.survivors.graphic);
    room.game.game.world.bringToTop(HUD.survivors.text);
    room.game.game.world.bringToTop(HUD.zombies.graphic);
    room.game.game.world.bringToTop(HUD.zombies.text);
    room.game.game.world.bringToTop(HUD.ammo.text);
    room.game.game.world.bringToTop(HUD.ammo.graphic);
    room.game.game.world.bringToTop(HUD.kills.graphic);
    room.game.game.world.bringToTop(HUD.kills.text);
    room.game.game.world.bringToTop(HUD.deaths.graphic);
    room.game.game.world.bringToTop(HUD.deaths.text);
    room.game.game.world.bringToTop(HUD.powerups.hammertime);
    room.game.game.world.bringToTop(HUD.powerups.weirdFlex);
    room.game.game.world.bringToTop(HUD.timer);
    room.game.game.world.bringToTop(HUD.radar.overlay);
    room.game.game.world.bringToTop(room.game.endGame);

    return;
}