import {Weapon} from './Guns';
import {PowerUp} from './PowerUp';
import { RectangularObject } from './RectangularObject';
import * as constants from '../shared/constants';

export enum DropType {
  WEAPON = 'Weapon',
  POWER_UP = 'PowerUp'
}

export class Drop extends RectangularObject {
  item!: Weapon|PowerUp;
  location!: XY;
  type!: DropType;
  id: number;

  constructor(item: Weapon|PowerUp, location: XY, id: number) {
    super(location, constants.POWERUP_WIDTH, constants.POWERUP_HEIGHT);

    this.id = id;
    this.item = item;
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