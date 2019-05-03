import Circle from "./Circle";
import { BuildRgba } from "./helpers";

// Represents the canvas itself and provides functions for setup and drawing etc
const Canvas = function() {};

Canvas.prototype.draw_circle = function(x, y, radius, color) {
  this.config.ctx.beginPath();
  this.config.ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  this.config.ctx.fillStyle = BuildRgba(color.r, color.g, color.b, color.a);
  this.config.ctx.fill();
  this.config.ctx.closePath();
};

Canvas.prototype.draw_line = function(
  start_x,
  start_y,
  end_x,
  end_y,
  color,
  width
) {
  this.config.ctx.beginPath();
  this.config.ctx.moveTo(start_x, start_y);
  this.config.ctx.lineTo(end_x, end_y);
  this.config.ctx.strokeStyle = BuildRgba(color.r, color.g, color.b, color.a);
  this.config.ctx.lineWidth = width;
  this.config.ctx.stroke();
};

Canvas.prototype.init = function(config) {
  // remember options and dimensions
  this.config = config;
  this.nrCircles = 20;
  this.mouse_x = config.canvas_width / 2;
  this.mouse_y = config.canvas_height / 2;
  this.lastMouse_x = this.mouse_x;
  this.lastMouse_y = this.mouse_y;
  this.setDimensions();
  this.generatePoints();

  window.addEventListener("mousemove", e => {
    this.mouse_x = e.clientX;
    this.mouse_y = e.clientY;
  });

  // draw every N frames
  this.interval_id = setInterval(this.draw.bind(this), this.config.framerate);
};

Canvas.prototype.generatePoints = function() {
  // clear existing circles
  this.circles = [];

  const context = this;
  const { canvas_width, canvas_height } = context;

  // Create the actuall circles
  for (let i = 0; i < this.nrCircles; i++) {
    const rand_x = canvas_width / 2;
    const rand_y = canvas_height / 2;

    const circle = new Circle(rand_x, rand_y, context, context.config);
    this.circles.push(circle);
  }
};

Canvas.prototype.clear = function() {
  // this.config.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);

  // One way of creating a trailing effect
  this.config.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  this.config.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
};

Canvas.prototype.setDimensions = function() {
  // set and save canvas dimensions - width = window width
  this.config.canvas_element.setAttribute("width", this.config.canvas_width);
  this.config.canvas_element.setAttribute("height", this.config.canvas_height);
  this.canvas_width = this.config.canvas_width;
  this.canvas_height = this.config.canvas_height;
};

Canvas.prototype.draw = function() {
  // this.setDimensions();

  // clear existing drawings
  this.clear();

  this.lastMouse_x = (this.mouse_x - this.lastMouse_x) * 0.05;
  this.lastMouse_y = (this.mouse_y - this.lastMouse_y) * 0.05;

  // Update circle position
  this.circles.forEach(circle => {
    circle.update_position(this.mouse_x, this.mouse_y);
  });
  // draw circle
  this.circles.forEach(circle => {
    circle.draw();
  });
};

Canvas.prototype.stop = function() {
  clearInterval(this.interval_id);
};

export default Canvas;
