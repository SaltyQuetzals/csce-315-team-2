import {CustomSprite} from '../public/js/game-classes';
import {Weapon} from '../public/js/models/Guns';
import * as constants from '../shared/constants';

import {PowerUp} from './PowerUp';
import {RectangularObject} from './RectangularObject';

export enum DropType {
  WEAPON = 'Weapon',
  POWER_UP = 'PowerUp'
}

export class Drop extends RectangularObject {
  item!: Weapon|PowerUp;
  location!: XY;
  type!: DropType;
  id: number;
  sprite!: CustomSprite;

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