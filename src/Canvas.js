import Circle from "./Circle";
import { GetRandom } from "./helpers";

// Represents the canvas itself and provides functions for setup and drawing etc
const Canvas = function() {};

Canvas.prototype.draw_circle = function(x, y, radius, color) {
  this.config.ctx.beginPath();
  this.config.ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  this.config.ctx.fillStyle = color;
  this.config.ctx.fill();
  this.config.ctx.closePath();
};

Canvas.prototype.draw_line = function(start_x, start_y, end_x, end_y) {
  this.config.ctx.beginPath();
  this.config.ctx.moveTo(start_x, start_y);
  this.config.ctx.lineTo(end_x, end_y);
  this.config.ctx.strokeStyle = "rgba(255,255,255,0.5)";
  this.config.ctx.lineWidth = this.line_width;
  this.config.ctx.stroke();
};

Canvas.prototype.init = function(config) {
  // remember options and dimensions
  this.config = config;
  this.line_width = 1;
  this.nrCircles = 100;
  this.threshold = 50;
  this.mouse_position = { x: 0, y: 0 };
  this.setDimensions();
  this.generatePoints();

  window.addEventListener(
    "mousemove",
    e => (this.mouse_position = { x: e.pageX, y: e.pageY })
  );

  window.addEventListener("click", e => {
    for (var i = 0; i < 4; i++) {
      const context = this;

      const circle = new Circle(e.clientX, e.clientY, context, context.config);
      this.circles.push(circle);
    }
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
    const rand_x = GetRandom(0, canvas_width);
    const rand_y = GetRandom(0, canvas_height);

    const circle = new Circle(rand_x, rand_y, context, context.config);
    this.circles.push(circle);
  }
};

Canvas.prototype.clear = function() {
  this.config.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
};

Canvas.prototype.setDimensions = function() {
  // set and save canvas dimensions - width = window width
  this.config.canvas_element.setAttribute("width", this.config.canvas_width);
  this.config.canvas_element.setAttribute("height", this.config.canvas_height);
  this.canvas_width = this.config.canvas_width;
  this.canvas_height = this.config.canvas_height;
};

Canvas.prototype.draw = function() {
  this.setDimensions();

  // clear existing drawings
  this.clear();

  if (this.nrCircles + this.threshold < this.circles.length) {
    this.circles.splice(0, 1);
  }

  const mouseCircle = new Circle(
    this.mouse_position.x,
    this.mouse_position.y,
    this,
    this.config,
    false
  );
  this.circles.push(mouseCircle);

  // update circle positions
  this.circles.map(circle => circle.update_position());
  const circles = this.circles;
  // draw circle
  const n = this.circles.length;
  for (var i = 0; i < n; i++) {
    circles[i].draw();
    for (var j = i + 1; j < n; j++) {
      if (circles[i].isInProximity(circles[j])) {
        this.draw_line(circles[i].x, circles[i].y, circles[j].x, circles[j].y);
      }
    }
  }
  this.circles.pop();
};

Canvas.prototype.stop = function() {
  clearInterval(this.interval_id);
};

export default Canvas;
