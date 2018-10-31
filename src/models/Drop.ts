import {Weapon} from './Guns';
import {PowerUp} from './PowerUp';

export enum DropType {
  WEAPON = 'Weapon',
  POWER_UP = 'PowerUp'
}

export class Drop {
  item!: Weapon|PowerUp;
  position!: XY;
  type!: DropType;

  constructor(item: Weapon|PowerUp, position: XY) {
    this.item = item;
    this.position = position;
    if (this.item instanceof Weapon) {
      this.type = DropType.WEAPON;
    } else if (this.item instanceof PowerUp) {
      this.type = DropType.POWER_UP;
    } else {
      throw Error(
          'Invalid item provided to Drop. Valid types are Weapon, PowerUp');
    }
  }
}