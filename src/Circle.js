import Coordinates from "./Coordinates";

// Represents a circle on the canvas
const Circle = function(intervals, canvas, canvas_config, color) {
  // remember all params
  this.intervals = intervals;
  this.canvas = canvas;
  this.canvas_config = canvas_config;
  this.color = color;

  // set current position
  this.position = new Coordinates(intervals[0].x, intervals[0].y);

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
  this.update_position = function(startIndex, distance_as_percentage) {
    if (distance_as_percentage > 100 || distance_as_percentage < 0)
      throw "distance_as_percentage must be between 0 and 100";
    if (isNaN(distance_as_percentage))
      throw "distance_as_percentage must be a number";

    distance_as_percentage /= 100;

    let start_position = this.intervals[startIndex];
    let end_position = this.intervals[startIndex];

    if (startIndex !== this.intervals.length - 1) {
      start_position = this.intervals[startIndex];
      end_position = this.intervals[startIndex + 1];
    }
    

    this.lerp(
      end_position
        .minus(start_position)
        .times(distance_as_percentage)
        .plus(start_position)
    );

    return this;
  };

  // draw the circle on the canvas
  this.draw = function() {
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
