import {delay} from '../shared/functions';

export abstract class PowerUp {
  active = false;
  constructor(public duration: number, public type: PowerUpType) {}

  async activate(): Promise<void> {
    this.active = true;
    await delay(this.duration);
    this.active = false;
  }
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