import { GetRandom, BuildRgba } from "./helpers";

// Represents a circle on the canvas
const Circle = function(x, y, canvas, canvas_config, move = true) {
  this.x = x;
  this.y = y;
  this.radius = move ? GetRandom(1, canvas_config.circle_radius) : 1;
  const movement = move ? canvas_config.circle_movement_speed : 0;

  this.x_dir = GetRandom(-movement, movement);
  this.y_dir = GetRandom(-movement, movement);

  // remember all params
  this.canvas = canvas;
  this.canvas_config = canvas_config;
  const r = GetRandom(0, 255);
  const g = GetRandom(0, 255);
  const b = GetRandom(0, 255);
  this.color = BuildRgba(r, g, b, 1);

  // Handle movement
  this.update_position = function() {
    this.x += this.x_dir;
    this.y += this.y_dir;
  };

  this.isInProximity = function(other) {
    const dist = Math.sqrt(
      Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2)
    );

    return dist < this.radius + other.radius + this.canvas_config.proximity;
  };

  // draw the circle on the canvas
  this.draw = function() {
    if (isNaN(this.x) || isNaN(this.y))
      throw "Circle position undefined or NaN";

    if (this.x < 0) {
      this.x_dir = GetRandom(0, movement);
      this.y_dir = GetRandom(-movement, movement);
    } else if (this.x > canvas_config.canvas_width) {
      this.x_dir = GetRandom(-movement, 0);
      this.y_dir = GetRandom(-movement, movement);
    } else if (this.y < 0) {
      this.x_dir = GetRandom(-movement, movement);
      this.y_dir = GetRandom(0, movement);
    } else if (this.y > canvas_config.canvas_height) {
      this.x_dir = GetRandom(-movement, movement);
      this.y_dir = GetRandom(-movement, -1);
    }

    if (this.x_dir === 0 && move) this.x_dir++;
    if (this.y_dir === 0 && move) this.y_dir++;

    // draw the circle
    this.canvas.draw_circle(this.x, this.y, this.radius, this.color);
  };
};

export default Circle;
