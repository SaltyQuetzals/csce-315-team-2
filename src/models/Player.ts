import {delay} from '../shared/functions';

import {Avatar, Human, Zombie} from './Avatar';

const RESPAWN_RATE = 1000;


export class Player {
  private _canMove!: boolean;

  constructor(readonly id: string, public avatar: Avatar) {
    this._canMove = true;
  }

  async died(): Promise<void> {
    const deathLocation = this.avatar.position;
    this._canMove = false;
    if (this.avatar instanceof Human) {
      this.avatar = new Zombie(deathLocation);
    } else {
      await delay(RESPAWN_RATE);
    }
    else{
      await delay(RESPAWN_RATE);
    }
    this._canMove = true;
  }
}