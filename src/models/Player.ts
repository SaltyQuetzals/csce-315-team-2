import {delay} from '../shared/functions';

import {Avatar, Human, Zombie} from './Avatar';

const RESPAWN_RATE = 1000;


export class Player {
  private _canMove!: boolean;

  constructor(readonly name: string, public avatar: Avatar) {
    this._canMove = true;
  }

  async kill(): Promise<void> {
    const deathLocation = this.avatar.position;
    this._canMove = false;
    await delay(RESPAWN_RATE);
    if (this.avatar instanceof Human) {
      this.avatar = new Zombie(deathLocation);
    }
    this._canMove = true;
  }
}