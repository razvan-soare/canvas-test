import Coordinates from "./Coordinates";
import Circle from "./Circle";
import { shuffle, build_rgba } from "./helpers";
import _ from "lodash";

// Represents the canvas itself and provides functions for setup and drawing etc
const Canvas = function() {};

Canvas.prototype.draw_line = function(start_position, end_position, colour) {
  this.config.ctx.beginPath();
  this.config.ctx.moveTo(start_position.x, start_position.y);
  this.config.ctx.lineTo(end_position.x, end_position.y);
  this.config.ctx.strokeStyle = colour;
  this.config.ctx.lineWidth = this.line_width;
  this.config.ctx.stroke();
};

Canvas.prototype.draw_circle = function(position, radius, colour) {
  this.config.ctx.beginPath();
  this.config.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2, true);
  this.config.ctx.fillStyle = colour;
  this.config.ctx.fill();
  this.config.ctx.closePath();
};

Canvas.prototype.init = function(config) {
  // remember options and dimensions
  this.config = config;
  this.setDimensions();
  this.text_alpha = 1;

  var context = this;

  this.parseCircleJsonIntoCircles();

  // on mouse move, save mouse position
  window.addEventListener(
    "mousemove",
    _.throttle(e => {
      context.mouse_position = new Coordinates(e.pageX, e.pageY);
    }, 150)
  );

  // draw every N frames
  // this.draw.bind(this);
  this.interval_id = setInterval(this.draw.bind(this), this.config.framerate);
};

Canvas.prototype.parseCircleJsonIntoCircles = function() {
  // clear existing circles
  this.circle_groups = [];
  const shuffledArray = [];
  const initialPositions = [];

  // circles in the same array will be connected by a line
  const context = this;
  const {
    config: { circle_size, circle_radius },
    canvas_width,
    canvas_height
  } = context;

  const n = canvas_width / circle_size.w;
  const m = canvas_height / circle_size.h;

  // Create the initial points and set the initial position
  for (let i = 0; i < n; i++) {
    const group = [];
    for (let j = 0; j < m; j++) {
      const start_position = new Coordinates(
        i * circle_size.w + circle_size.w / 2 - circle_radius / 2,
        j * circle_size.h + circle_size.h / 2 - circle_radius / 2
      );

      group.push(start_position);
      shuffledArray.push(start_position);
    }
    initialPositions.push(group);
  }

  // Shuffle the array
  shuffle(shuffledArray);

  // Create the actuall point
  let shuffledIndex = 0;
  for (let i = 0; i < n; i++) {
    const group = [];
    for (let j = 0; j < m; j++) {
      const start_position = initialPositions[i][j];
      const final_position = shuffledArray[shuffledIndex++];
      const circle = new Circle(
        start_position,
        final_position,
        context,
        context.config,
        build_rgba(255 - j * 20, 200, 0, 1)
      );
      group.push(circle);
    }
    this.circle_groups.push(group);
  }
};

Canvas.prototype.calculateDistanceFromMouseToElement = function(element) {
  if (typeof this.mouse_position === "undefined") return null;
  return Math.floor(
    Math.sqrt(
      Math.pow(
        this.mouse_position.x - (element.offsetLeft + element.offsetWidth / 2),
        2
      ) +
        Math.pow(
          this.mouse_position.y -
            (element.offsetTop + element.offsetHeight / 2),
          2
        )
    )
  );
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

//set distance_as_percentage variable and trigger related events
Canvas.prototype.setDistanceAsPercentage = function(new_value) {
  if (new_value > this.config.max_distance_as_percentage)
    new_value = this.config.max_distance_as_percentage;

  this._old_distance_as_percentage = this.distance_as_percentage;
  this.distance_as_percentage = new_value;
};

Canvas.prototype.draw = function() {
  // check if canvas exists?
  // TODO Come back and check for canvas:visible

  this.setDimensions();

  // clear existing drawings
  this.clear();

  // calculate mouse distance to element
  this.distance = this.calculateDistanceFromMouseToElement(
    document.querySelector(this.config.target_element_selector)
  );

  if (this.distance != null) {
    this.setDistanceAsPercentage(
      Math.max(
        (this.distance / this.config.min_mouse_distance) * 100 -
          this.config.target_distance_leniency,
        0
      )
    );
  } else {
    this.setDistanceAsPercentage(100);
  }

  // update circle positions
  var context = this;

  this.circle_groups.map(circle_group =>
    circle_group.map(circle => {
      if (context.distance_as_percentage > 100) {
        context.setDistanceAsPercentage(100);
      }
      return circle.update_position(context.distance_as_percentage);
    })
  );

  this.circle_groups.map(circle_group => {
    var last_circle = null;

    circle_group.map(circle => {
      // draw circle
      circle.draw(
        last_circle,
        context.distance_as_percentage,
        context.config.noise_x,
        context.config.noise_y
      );
      last_circle = circle;
    });
  });
};

Canvas.prototype.stop = function() {
  clearInterval(this.interval_id);
};

export default Canvas;
