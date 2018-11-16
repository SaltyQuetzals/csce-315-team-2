import { game } from "./main";
import * as gameConstants from "./game-constants";
import { GAME_LENGTH } from "../../shared/constants";
import { CustomPlayer } from "./game-classes";
import { isUndefined } from "util";

export function updateHUDText(): void {

    game.HUD.survivors.text.setText('' + game.numSurvivors);
    game.HUD.zombies.text.setText('' + game.numZombies);
    if (!game.localPlayer.isZombie) {
        game.HUD.ammo.text.setText('' + game.localPlayer.gun.ammo);
    }
    game.HUD.score.setText('' + game.score);
}

export function updateHUD(): void {

    const players = game.players;
    let currentPlayer: CustomPlayer;
    let currentDot: Phaser.Graphics;
    let color = 0xffffff;

    Object.keys(players).map((playerId) => {
        // console.log(playerId);
        currentPlayer = players[playerId];
        color = 0x5b5b5b;
        if (playerId === game.localPlayer.id) {
            color = 0xffffff;
        }
        else if (game.localPlayer.isZombie && !currentPlayer.isZombie) {
                color = 0xaf0000;
        }
        else {
            if (currentPlayer.isZombie) {
                color = 0xaf0000;
            }
        }
        
        if (isUndefined(game.HUD.radar.dots[playerId])) {
            currentDot = game.game.add.graphics(0,0);

            currentDot.beginFill(color, 1);
            currentDot.drawCircle(currentPlayer.character.world.x / 20, currentPlayer.character.world.y / 20, 8);
            currentDot.endFill();
            currentDot.boundsPadding = 0;
            currentDot.centerX = currentPlayer.character.world.x / 20;
            currentDot.centerY = currentPlayer.character.world.y / 20;
            game.HUD.radar.dots[playerId] = currentDot;

            game.HUD.radar.overlay.addChild(currentDot);
            game.game.world.bringToTop(game.HUD.radar.overlay);
        }
        else {
            currentDot = game.HUD.radar.dots[playerId];
            currentDot.centerX = currentPlayer.character.world.x / 20;
            currentDot.centerY = currentPlayer.character.world.y / 20;
        }

    });
}

export function createHUD(): void {
    game.HUD = Object();
    const HUD = game.HUD;

    HUD.ammo = Object();
    HUD.survivors = Object();
    HUD.zombies = Object();
    HUD.radar = Object();
    HUD.radar.dots = {};

    const healthbarBackground = game.game.add.graphics(10, 10);
    healthbarBackground.lineStyle(2, 0x5b5b5b, 1);
    healthbarBackground.beginFill(0x5b5b5b, 1);
    healthbarBackground.drawRect(0, 0, 150, 20);
    healthbarBackground.endFill();
    healthbarBackground.alpha = .5;

    HUD.healthbar = game.game.add.graphics(10, 10);
    HUD.healthbar.lineStyle(2, 0xaf0000, 1);
    HUD.healthbar.beginFill(0xaf0000, 1);
    HUD.healthbar.drawRect(0, 0, 150, 20);
    HUD.healthbar.endFill();
    // HUD.healthbar.alpha = .5;

    HUD.ammo.graphic = game.game.add.sprite(10, 40, 'HUDammo');
    // HUD.ammo.graphic.alpha = .5;
    HUD.ammo.text =
        game.game.add.text(10 + HUD.ammo.graphic.width + 10, 35, '', {
            font: 'bold 40px Annie Use Your Telescope',
            fill: '#ffffff',
            align: 'center'
        });

    HUD.survivors.graphic = game.game.add.sprite(
        gameConstants.GAME_VIEW_WIDTH - 200, 
        gameConstants.GAME_VIEW_HEIGHT - 100, 'survivor_1');
    HUD.survivors.graphic.scale.setTo(.5, .5);
    // HUD.survivors.graphic.tint = 0x5b5b5b;
    // HUD.survivors.graphic.alpha = .5;
    HUD.survivors.text = game.game.add.text(
        HUD.survivors.graphic.x + 2 +
        HUD.survivors.graphic.width,
        HUD.survivors.graphic.y, '', {
            font: 'bold 30px Annie Use Your Telescope',
            fill: '#ffffff',
            align: 'center'
        });

    HUD.zombies.graphic = game.game.add.sprite(
        HUD.survivors.graphic.x, HUD.survivors.graphic.y + HUD.survivors.graphic.height + 10, 'zombie_1');
    HUD.zombies.graphic.scale.setTo(.5, .5);
    // HUD.zombies.graphic.tint = 0x5b5b5b;
    // HUD.zombies.graphic.alpha = .5;
    HUD.zombies.text = game.game.add.text(
        HUD.zombies.graphic.x + 2 +
        HUD.zombies.graphic.width,
        HUD.zombies.graphic.y, '', {
            font: 'bold 30px Annie Use Your Telescope',
            fill: '#ffffff',
            align: 'center'
        });

    HUD.score = game.game.add.text(
        gameConstants.GAME_VIEW_WIDTH -10 ,
        50, '', {
            font: 'bold 40px Annie Use Your Telescope',
            fill: '#ffffff',
            boundsAlignH: 'right'
        });
    HUD.score.anchor.setTo(1);

    HUD.timer =
        game.game.add.text(gameConstants.GAME_VIEW_WIDTH / 2, 30, '' + (GAME_LENGTH - game.timer.seconds), {
            font: 'bold 30px Annie Use Your Telescope',
            fill: '#ffffff',
            boundsAlignH: 'center'
        });
    HUD.timer.anchor.setTo(.5);

    HUD.radar.overlay = game.game.add.graphics(
        gameConstants.GAME_VIEW_WIDTH - 140, gameConstants.GAME_VIEW_HEIGHT - 110);
    HUD.radar.overlay.lineStyle(2, 0x5b5b5b, 1);
    // HUD.radar.beginFill(0x5b5b5b, 1);
    HUD.radar.overlay.drawRect(0, 0, 126, 94);
    // HUD.radar.endFill();
    HUD.radar.overlay.boundsPadding = 0;

    HUD.ammo.text.fixedToCamera = true;
    HUD.ammo.graphic.fixedToCamera = true;
    HUD.survivors.text.fixedToCamera = true;
    HUD.survivors.graphic.fixedToCamera = true;
    HUD.zombies.text.fixedToCamera = true;
    HUD.zombies.graphic.fixedToCamera = true;
    HUD.healthbar.fixedToCamera = true;
    healthbarBackground.fixedToCamera = true;
    HUD.timer.fixedToCamera = true;
    HUD.score.fixedToCamera = true;
    HUD.radar.overlay.fixedToCamera = true;

    game.game.world.bringToTop(game.shadowTexture);
    game.game.world.bringToTop(game.lightSprite);

    game.game.world.bringToTop(healthbarBackground);
    game.game.world.bringToTop(HUD.healthbar);
    game.game.world.bringToTop(HUD.survivors.graphic);
    game.game.world.bringToTop(HUD.survivors.text);
    game.game.world.bringToTop(HUD.zombies.graphic);
    game.game.world.bringToTop(HUD.zombies.text);
    game.game.world.bringToTop(HUD.ammo.text);
    game.game.world.bringToTop(HUD.ammo.graphic);
    game.game.world.bringToTop(HUD.timer);
    HUD.score.bringToTop();
    game.game.world.bringToTop(HUD.radar.overlay);
    game.game.world.bringToTop(game.endGame);

    return;
}