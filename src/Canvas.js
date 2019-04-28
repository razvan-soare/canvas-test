import React from "react";
import _ from "lodash";
import circleGroup from "./circleGroup";
import randomNumberBetween from "./helpers/RandomNumberBetween";
import build_rgba from "./helpers/BuildRgba";

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

// Represents a circle on the canvas
const Circle = function(start_position, end_position, canvas, canvas_config) {
  // remember all params
  this.start_position = start_position;
  this.end_position = end_position;
  this.canvas = canvas;
  this.canvas_config = canvas_config;
  this.color = "rgba(0, 0, 255, 1)";

  // set current position
  this.position = new Coordinates(start_position.x, start_position.y);

  // make end position relative to image dimensions
  this.make_end_position_relative = function(
    canvas_width,
    canvas_height,
    image_width,
    image_height
  ) {
    this.end_position.x =
      canvas_width / 2 - image_width / 2 + this.end_position.x;
    this.end_position.y =
      canvas_height / 2 - image_height / 2 + this.end_position.y;
  };

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

  // calculates the circle colour based on the distance as percentage
  this.get_colour = function(distance_as_percentage) {
    return build_rgba(
      this.canvas_config.circle_colour[0],
      this.canvas_config.circle_colour[1],
      this.canvas_config.circle_colour[2],
      this.canvas_config.circle_colour[3]
    );
  };

  // draw the circle on the canvas
  this.draw = function(last_circle, distance_as_percentage, noise_x, noise_y) {
    if (
      typeof this.position === "undefined" ||
      isNaN(this.position.x) ||
      isNaN(this.position.y)
    )
      throw "Circle position undefined or NaN";

    if (typeof noise_x === "undefined") noise_x = 0;
    if (typeof noise_y === "undefined") noise_y = 0;

    // if position is end, add some noise
    if (distance_as_percentage === 0) {
      const draw_position_noise_x = randomNumberBetween(0, noise_x, true);
      const draw_position_noise_y = randomNumberBetween(0, noise_y, true);
      this.position = new Coordinates(
        draw_position_noise_x + this.position.x,
        draw_position_noise_y + this.position.y
      );
    }

    // draw the circle

    const colour = this.get_colour(distance_as_percentage);
    this.canvas.draw_circle(
      this.position,
      this.canvas_config.circle_radius,
      colour
    );

    // draw connecting lines
    if (last_circle != null) {
      this.canvas.draw_line(last_circle.position, this.position, colour);
    }
  };
};

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

  this.circle_json = circleGroup;
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

Canvas.prototype.parseCircleJsonIntoCircles = function(number_of_duplicates) {
  // number_of_duplicates default
  if (typeof number_of_duplicates === "undefined") number_of_duplicates = 3;

  // clear existing circles
  this.circle_groups = [];

  // circles in the same array will be connected by a line
  const context = this;
  for (let i = 0; i < number_of_duplicates; i++) {
    this.circle_json.map((coordinate_group, index) => {
      const group = [];
      coordinate_group.map((coordinates, index) => {
        // calculate circle start and end positions
        const rand_x = randomNumberBetween(
          0 - context.config.start_position_off_canvas_limit_x,
          context.canvas_width +
            context.config.start_position_off_canvas_limit_x * 2
        );
        const rand_y = randomNumberBetween(
          0 - context.config.start_position_off_canvas_limit_y,
          context.canvas_height +
            context.config.start_position_off_canvas_limit_y * 2
        );
        const start_position = new Coordinates(rand_x, rand_y);
        const end_position = new Coordinates(coordinates.x, coordinates.y);

        // create circle
        const circle = new Circle(
          start_position,
          end_position,
          context,
          context.config
        );

        // make circle end position relative to the canvas dimensions
        circle.make_end_position_relative(
          context.canvas_width,
          context.canvas_height,
          context.config.image_width,
          context.config.image_height
        );

        // save circle
        group.push(circle);
      });
      context.circle_groups.push(group);
    });
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
  this.config.canvas_element.setAttribute("width", document.body.clientWidth);
  this.config.canvas_element.setAttribute("height", this.config.canvas_height);
  this.canvas_width = document.body.clientWidth;
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

  // // calculate line width
  // this.calculate_line_width();

  // redraw circles
  var context = this;

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

  // // calculate text alpha
  // this.calculate_text_alpha();

  // // draw text line 1
  // this.config.ctx.fillStyle = window.cocept.build_rgba(
  //   this.config.text_colour[0],
  //   this.config.text_colour[1],
  //   this.config.text_colour[2],
  //   this.text_alpha
  // );
  // this.config.ctx.textBaseline = "middle";
  // this.config.ctx.textAlign = "center";

  // this.config.ctx.font =
  //   this.config.text_line_1_size() + "px " + this.config.text_font;
  // this.config.ctx.fillText(
  //   this.config.text_line_1,
  //   this.canvas_width / 2,
  //   this.canvas_height / 2
  // );

  // // draw text line 2
  // this.config.ctx.font =
  //   this.config.text_line_2_size() + "px " + this.config.text_font;
  // this.config.ctx.fillText(
  //   this.config.text_line_2,
  //   this.canvas_width / 2,
  //   this.canvas_height / 2 +
  //     this.config.text_line_1_size() +
  //     this.config.text_line_2_margin_top
  // );
};

Canvas.prototype.stop = function() {
  clearInterval(this.interval_id);
};

class CanvasClass extends React.Component {
  constructor(props) {
    super(props);
    this.myCanvas = React.createRef();
  }

  componentDidMount() {
    // get canvas element
    const canvas = this.myCanvas.current;

    // create configuration
    const canvas_config = {
      // CANVAS //
      ctx: canvas.getContext("2d"), // canvas 2d context
      canvas_element: canvas,
      canvas_height: 440,

      // WORKINGS //
      framerate: 25,
      target_element_selector: ".test-element", // the element the mouse must be on to reveal the image
      image_width: 645,
      image_height: 400,
      max_distance_as_percentage: 75, // the highest value for distance as percentage

      // MOUSE //
      min_mouse_distance: 250,
      target_distance_leniency: 40, // mouse can be this far away from target element and still be considered "on it"

      // CIRCLES //
      circle_colour: [255, 0, 0, 1],
      // circles_json_path: "/data/circles.json",
      circle_radius: 5,
      start_position_off_canvas_limit_x: 50, // how far the circle start positions can be off the canvas
      start_position_off_canvas_limit_y: 50,
      circle_movement_speed: 0.075, // the speed modifier for circles. 0.05 is a smooth and medium speed value
      noise_x: 2, // amount of random movement on the x axis to add when circle is in the end_position
      noise_y: 2,

      // TEXT //
      text_colour: [255, 255, 255], // array with 3 ints - rgb
      text_font: "Droid Sans",
      text_line_1_size: function() {
        if (document.body.clientWidth <= 380) return 20;
        else if (document.body.clientWidth <= 768) return 30;
        else return 50;
      },
      text_line_2_size: function() {
        if (document.body.clientWidth <= 380) return 12;
        else if (document.body.clientWidth <= 768) return 20;
        else return 35;
      },
      text_line_2_margin_top: 15,
      text_line_1: "Text Line 1",
      text_line_2: "Text Line 2",
      text_alpha_delta: 0.05 // the amount of alpha to or add each frame
    };

    window.myObject = {};
    window.myObject.canvas = new Canvas();
    window.myObject.canvas.init(canvas_config);
  }

  render() {
    return (
      <div className="dot-experiment">
        <canvas ref={this.myCanvas} height="480" width="1300">
          Fall back if the canvas is no working
        </canvas>

        <div
          className="test-element"
          style={{ background: "red", height: 300, width: 300 }}
        />
      </div>
    );
  }
}

export default CanvasClass;
