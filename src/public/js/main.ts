import * as gameConstants from './game-constants';
import * as sharedConstants from '../../shared/constants';
import { isNumber } from 'util';

// let gameStarted = false;

const splitUrl = location.href.split("/");
const roomId = splitUrl[splitUrl.length - 1];

