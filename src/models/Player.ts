import {delay} from '../shared/functions';

import {Avatar, Human, Zombie} from './Avatar';

const RESPAWN_RATE = 1000;


export class Player {
  private _canMove!: boolean;
  private respawnFactor!: number;

  constructor(readonly id: string, public avatar: Avatar) {
    this._canMove = true;
    this.respawnFactor = 0;
  }

  async died(): Promise<void> {
    const deathLocation = this.avatar.location;
    this._canMove = false;
    if (this.avatar instanceof Human) {
      this.avatar = new Zombie(deathLocation);
    } else {
      if (Zombie.numZombies && this.respawnFactor) {
        this.respawnFactor *= 2;
        if (this.respawnFactor > 5) {
          this.respawnFactor = 5;
        }
      }
      else {
        this.respawnFactor = 1;
      }
      await delay(this.respawnFactor * RESPAWN_RATE);
    }
    this._canMove = true;
  }
}
