import { GetRandom, BuildRgba } from "./helpers";

// Represents a circle on the canvas
const Circle = function(x, y, canvas, canvas_config) {
  this.x = x;
  this.y = y;
  this.history = [];
  this.initialX = x;
  this.initialY = y;

  this.radius = 2;
  this.velocity = -0.06;
  this.radians = Math.random() * Math.PI * 2;
  this.distance = GetRandom(10, 50);
  this.lastPosition = {
    x: 0,
    y: 0
  };
  // remember all params
  this.canvas = canvas;
  this.canvas_config = canvas_config;

  // Generate a random color
  const r = GetRandom(0, 255);
  const g = GetRandom(0, 255);
  const b = GetRandom(0, 255);
  const a = 1;
  this.color = { r, g, b, a };

  // Handle movement
  this.update_position = function(x, y) {
    this.initialX = x;
    this.initialY = y;
    
    this.lastPosition = {
      x: this.x,
      y: this.y
    };

    this.history.push(this.lastPosition);
    if (this.history.length > 10) this.history.splice(0, 1);
    
    this.radians += this.velocity;
    this.x = this.initialX + Math.sin(this.radians) * this.distance;
    this.y = this.initialY + Math.cos(this.radians) * this.distance;
  };

  // draw the circle on the canvas
  this.draw = function() {
    if (isNaN(this.x) || isNaN(this.y))
      throw "Circle position undefined or NaN";

    this.canvas.draw_line(
      this.x,
      this.y,
      this.lastPosition.x,
      this.lastPosition.y,
      this.color,
      this.radius * 2
    );

    // this.canvas.draw_circle(this.x, this.y, this.radius, this.color);
    this.history.forEach((his, index) => {
      // if (this.history[index + 1]) {
      //   this.canvas.draw_line(
      //     his.x,
      //     his.y,
      //     this.history[index + 1].x,
      //     this.history[index + 1].y,
      //     this.color,
      //     this.radius * 2 - 2
      //   );
      // }
      // this.canvas.draw_circle(his.x, his.y, this.radius, this.color);
    });
  };
};

export default Circle;
