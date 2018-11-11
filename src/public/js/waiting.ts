import { CustomPlayer } from "./game-classes";

export interface Players {
  [key: string]: {username: string};
}

export function getAccessCode(): string {
  const pathName = window.location.pathname;
  const splitPathName = pathName.split('/');
  return splitPathName[2];
}

export function updateAccessCodeBox(): void {
  const accessCodeBox = document.getElementById('accessCode');
  const accessCode = getAccessCode();
  if (accessCodeBox) accessCodeBox.innerHTML = accessCode;
}

export function updatePlayerList(players: {[key: string]: CustomPlayer;}): void {
  const playerList = document.getElementById('player-list');
  // console.log('Players', players);
  const newPlayerList = Object.keys(players).map((playerId) => {
    // console.log(playerId);
    return '<li>' + players[playerId].username + '</li>';
  });
  if (playerList) playerList.innerHTML = newPlayerList.join('');
}

export function getUserName(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  if (username) {
    return username;
  } else {
    return '';
  }
}