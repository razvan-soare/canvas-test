// represents x and y coordinates
const Coordinates = function(x, y) {
  this.x = x;
  this.y = y;

  this.copy = function() {
    return new Coordinates(this.x, this.y);
  };

  this.minus = function(coordinates) {
    const this_new = this.copy();
    this_new.x -= coordinates.x;
    this_new.y -= coordinates.y;
    return this_new;
  };

  this.plus = function(coordinates) {
    const this_new = this.copy();
    this_new.x += coordinates.x;
    this_new.y += coordinates.y;
    return this_new;
  };

  this.times = function(amount) {
    const this_new = this.copy();
    this_new.x *= amount;
    this_new.y *= amount;
    return this_new;
  };

  this.equals = function(coordinates) {
    if (coordinates.x === this.x && coordinates.y === this.y) return true;
    else return false;
  };

  this.toString = function() {
    return "x: " + this.x + ", y: " + this.y;
  };
};

export default Coordinates;
