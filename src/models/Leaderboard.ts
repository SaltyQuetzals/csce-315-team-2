export type PlayerStats = {
  kills: number, deaths: number, isHuman: boolean;
};

export class Leaderboard {
  playerStats: {[socketId: string]: PlayerStats} = {};

  /**
   * Adds a player to the leaderboard to be tracked.
   * @param socketId The unique socket identifier of the player.
   */
  addPlayer(socketId: SocketId) {
    this.playerStats[socketId] = {kills: 0, deaths: 0, isHuman: true};
  }

  /**
   * Removes a player from the leaderboard.
   * @param socketId The unique socket identifier of the player.
   */
  removePlayer(socketId: SocketId): void {
    delete this.playerStats[socketId];
  }

  /**
   * Increments the killer's number of kills, and the victim's number of deaths.
   * @param killerId The killer's unique socket identifier
   * @param victimId The victim's unique socket identifier
   */
  playerKilled(killerId: SocketId, victimId: SocketId): void {
    if (!(killerId in this.playerStats)) {
      throw Error(`The killerId provided (${killerId}) was not found.`);
    }
    if (!(victimId in this.playerStats)) {
      throw Error(`The victimId provided (${victimId}) was not found.`);
    }
    this.playerStats[killerId].kills++;
    this.playerStats[victimId].deaths++;
    this.playerStats[victimId].isHuman = false;
  }


  get humansRemaining(): number {
    let humans = 0;
    for (const socketId in this.playerStats) {
      if (this.playerStats[socketId].isHuman) {
        humans++;
      }
    }
    return humans;
  }
}