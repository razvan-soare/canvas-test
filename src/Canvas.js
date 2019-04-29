import Coordinates from "./Coordinates";
import Circle from "./Circle";
import { shuffle, build_rgba } from "./helpers";
import _ from "lodash";

// Represents the canvas itself and provides functions for setup and drawing etc
const Canvas = function() {};

Canvas.prototype.draw_circle = function(position, radius, color) {
  this.config.ctx.beginPath();
  this.config.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2, true);
  this.config.ctx.fillStyle = color;
  this.config.ctx.fill();
  this.config.ctx.closePath();
};

Canvas.prototype.init = function(config) {
  // remember options and dimensions
  this.config = config;
  this.setDimensions();
  this.text_alpha = 1;

  var context = this;
  this.generatePoints();

  // on scroll move, save scroll position
  context.scroll_position = window.scrollY;
  window.addEventListener(
    "scroll",
    _.throttle(e => {
      context.scroll_position = window.scrollY;
    }, 150)
  );

  // draw every N frames
  this.interval_id = setInterval(this.draw.bind(this), this.config.framerate);
};

Canvas.prototype.generatePoints = function() {
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

  // Create the actuall circles
  let shuffledIndex = 0;
  for (let i = 0; i < n; i++) {
    const group = [];
    for (let j = 0; j < m; j++) {
      const start_position = shuffledArray[shuffledIndex++];
      const final_position = initialPositions[i][j];
      const circle = new Circle(
        start_position,
        final_position,
        context,
        context.config,
        build_rgba(255 - j * 15, j * 10, j * 30, 1)
      );
      group.push(circle);
    }
    this.circle_groups.push(group);
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

//set distance_as_percentage variable and trigger related events
Canvas.prototype.setDistanceAsPercentage = function(new_value) {
  if (new_value > this.config.max_distance_as_percentage)
    new_value = this.config.max_distance_as_percentage;

  this.distance_as_percentage = new_value;
};

Canvas.prototype.draw = function() {
  this.setDimensions();

  // clear existing drawings
  this.clear();

  // calculate distance from origin
  this.distance = this.scroll_position || 0;

  if (this.distance !== null) {
    this.setDistanceAsPercentage(
      Math.max(
        (this.distance / this.config.min_distance) * 100 -
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
    circle_group.map(circle => {
      // draw circle
      circle.draw(context.distance_as_percentage);
    });
  });
};

Canvas.prototype.stop = function() {
  clearInterval(this.interval_id);
};

export default Canvas;
