import * as gameConstants from './game-constants';
import * as sharedConstants from '../../shared/constants';
import { isNumber } from 'util';

// let gameStarted = false;

const splitUrl = location.href.split("/");
const roomId = splitUrl[splitUrl.length - 1];

const KEYS_DOWN: {[keyCode: number]: boolean} = {};
for (const keyCode in gameConstants.Controls) {
    if (isNumber(keyCode)) {
        KEYS_DOWN[keyCode] = false;
    }
}