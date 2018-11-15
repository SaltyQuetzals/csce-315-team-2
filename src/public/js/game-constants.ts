export const GAME_VIEW_WIDTH = window.innerWidth;
export const GAME_VIEW_HEIGHT = window.innerHeight;
// REMOVE LATER?
export const BOARD_WIDTH = 2400;
export const BOARD_HEIGHT = 1800;
export let GAME_STARTED = false;

export const PLAYER_HEALTH = 100;

export const PLAYER_SPEED = 200;

export const KEYCODES: {[key: number]: string} = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  87: 'w',
  65: 'a',
  83: 's',
  68: 'd',
  32: 'spacebar',
};

export const keysPressed: {[key: string]: boolean} = {
  up: false,
  left: false,
  down: false,
  right: false,
  w: false,
  a: false,
  s: false,
  d: false,
  spacebar: false,
};

export const DIRECTIONS = {
  NORTH: -1,
  EAST: 1,
  SOUTH: 1,
  WEST: -1
};

export const DROPIMAGES: {[key: string]: string} = {
  'automatic rifle': 'Automatic Rifle',
  'revolver': 'Revolver',
  'shotgun': 'Shotgun',
  'WeirdFlex': 'p1',
  'Grit': 'p2',
  'Hammertime': 'p3',
  'Jackpot': 'p4'
};
