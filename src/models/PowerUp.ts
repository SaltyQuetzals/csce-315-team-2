export abstract class PowerUp {
  constructor(public duration: number, public type: PowerUpType) {}
}

export enum PowerUpType {
  WEIRD_FLEX = 'WeirdFlex',
  GRIT = 'Grit',
  HAMMERTIME = 'Hammertime',
  JACKPOT = 'Jackpot'
}

export class WeirdFlex extends PowerUp {
  constructor() {
    super(10000, PowerUpType.WEIRD_FLEX);
  }
}

export class Grit extends PowerUp {
  constructor() {
    super(10000, PowerUpType.GRIT);
  }
}

export class Hammertime extends PowerUp {
  constructor() {
    super(10000, PowerUpType.HAMMERTIME);
  }
}

export class Jackpot extends PowerUp {
  constructor() {
    super(0, PowerUpType.JACKPOT);
  }
}