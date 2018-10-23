"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Direction;
(function (Direction) {
    Direction[Direction["North"] = 1] = "North";
    Direction[Direction["South"] = 2] = "South";
    Direction[Direction["West"] = 3] = "West";
    Direction[Direction["East"] = 4] = "East";
})(Direction = exports.Direction || (exports.Direction = {}));
class Avatar {
    constructor(movementSpeed, facingDirection, position) {
        this.movementSpeed = movementSpeed;
        this.facingDirection = facingDirection;
        this.position = position;
    }
    move(x, y) { }
}
exports.Avatar = Avatar;
class Zombie extends Avatar {
    constructor() {
        super(...arguments);
        this.movementSpeed = 3;
        this.facingDirection = Direction.South;
    }
    attack() { }
}
exports.Zombie = Zombie;
class Human extends Avatar {
    constructor(position) {
        super(1, Direction.South, position);
        this.movementSpeed = 1;
        this.facingDirection = Direction.South;
        this.heldWeapon = null;
    }
    attack() { }
    pickUp(newWeapon) {
        const tempWeapon = this.heldWeapon;
        this.heldWeapon = newWeapon;
        return tempWeapon;
    }
}
exports.Human = Human;
//# sourceMappingURL=Avatar.js.map