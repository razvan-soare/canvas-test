import Coordinates from "./Coordinates";

// Represents a circle on the canvas
const Circle = function(
  start_position,
  end_position,
  canvas,
  canvas_config,
  color
) {
  // remember all params
  this.start_position = start_position;
  this.end_position = end_position;
  this.canvas = canvas;
  this.canvas_config = canvas_config;
  this.color = color;

  // set current position
  this.position = new Coordinates(start_position.x, start_position.y);

  // lerp function - move gradually frame by frame
  this.lerp = function(target_position) {
    this.position.x +=
      (target_position.x - this.position.x) *
      this.canvas_config.circle_movement_speed;
    this.position.y +=
      (target_position.y - this.position.y) *
      this.canvas_config.circle_movement_speed;
  };

  // update this.position according to how far towards the end position the circle should be
  this.update_position = function(distance_as_percentage) {
    if (distance_as_percentage > 100 || distance_as_percentage < 0)
      throw "distance_as_percentage must be between 0 and 100";
    if (isNaN(distance_as_percentage))
      throw "distance_as_percentage must be a number";

    distance_as_percentage /= 100;
    this.lerp(
      this.start_position
        .minus(this.end_position)
        .times(distance_as_percentage)
        .plus(this.end_position)
    );
    return this;
  };

  // draw the circle on the canvas
  this.draw = function(last_circle, distance_as_percentage, noise_x, noise_y) {
    if (
      typeof this.position === "undefined" ||
      isNaN(this.position.x) ||
      isNaN(this.position.y)
    )
      throw "Circle position undefined or NaN";

    // draw the circle
    this.canvas.draw_circle(
      this.position,
      this.canvas_config.circle_radius,
      this.color
    );
  };
};

export default Circle;
