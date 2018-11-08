import * as gameConstants from "../game-constants";
export class GameController {
  game!: Phaser.Game;
  constructor() {
    this.game = new Phaser.Game(
      gameConstants.GAME_VIEW_WIDTH,
      gameConstants.GAME_VIEW_HEIGHT,
      Phaser.CANVAS,
      {
        preload: this.preload,
        create: this.create,
        update: this.update,
        render: this.render
      }
    );
  }

  preload(): void {
    this.game.load.image("bg", "../assets/bg.png");
    this.game.load.image("bullet", "../assets/bullet.png");
    this.game.load.image("Automatic Rifle", "../assets/AutomaticRifle.png");
    this.game.load.image("Revolver", "../assets/Revolver.png");
    this.game.load.image("Shotgun", "../assets/Shotgun.png");
    this.game.load.image("p1", "../assets/WeirdFlex.png");
    this.game.load.image("p2", "../assets/Grit.png");
    this.game.load.image("p3", "../assets/Hammertime.png");
    this.game.load.image("p4", "../assets/Jackpot.png");
    this.game.load.spritesheet(
      "weapons",
      "../assets/WeaponsSpriteSheet.png",
      64, // frame width
      64 // frame height
    );
    this.game.load.spritesheet(
      "zombie_1",
      "../assets/ZombieWalkingSpriteSheet2.png",
      64, // frame width
      64 // frame height
    );
    this.game.load.spritesheet(
      "survivor_1",
      "../assets/SurvivorWalkingSpriteSheet.png",
      64, // frame width
      64 // frame height
    );
    this.game.load.image("field_of_view", "../assets/FieldOfView.png");
  }

  create(): void {}

  update(): void {}

  render(): void {}
}
