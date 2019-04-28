import React, { useEffect } from "react";

import BuildRgba from "./helpers/BuildRgba";
import RandomNumberBetween from "./helpers/RandomNumberBetween";

function App() {
  useEffect(() => {
    const canvas_config = {
      // CANVAS //
      ctx: $("canvas")[0].getContext("2d"), // canvas 2d context
      canvas_element: $("canvas"),
      canvas_height: 440,

      // WORKINGS //
      framerate: 25,
      target_element_selector: ".nav-desktop #logo__container img", // the element the mouse must be on to reveal the image
      image_width: 645,
      image_height: 400,
      max_distance_as_percentage: 75, // the highest value for distance as percentage

      // MOUSE //
      min_mouse_distance: 250,
      target_distance_leniency: 40, // mouse can be this far away from target element and still be considered "on it"

      // CIRCLES //
      circle_colour: [255, 255, 255, 0.1],
      circles_json_path: "/data/circles.json",
      circle_radius: 5,
      start_position_off_canvas_limit_x: 50, // how far the circle start positions can be off the canvas
      start_position_off_canvas_limit_y: 50,
      circle_movement_speed: 0.075, // the speed modifier for circles. 0.05 is a smooth and medium speed value
      noise_x: 2, // amount of random movement on the x axis to add when circle is in the end_position
      noise_y: 2,
      line_width_max: 6, // the maximum line width - used when mouse is on target element
      line_width_min: 1,

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

    window.cocept.canvas = new Canvas();
    window.cocept.canvas.init(canvas_config);
  }, []);

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
      if (coordinates.x == this.x && coordinates.y == this.y) return true;
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
      return window.cocept.build_rgba(
        this.canvas_config.circle_colour[0],
        this.canvas_config.circle_colour[1],
        this.canvas_config.circle_colour[2],
        this.canvas_config.circle_colour[3]
      );
    };

    // draw the circle on the canvas
    this.draw = function(
      last_circle,
      distance_as_percentage,
      noise_x,
      noise_y
    ) {
      if (
        typeof this.position === "undefined" ||
        isNaN(this.position.x) ||
        isNaN(this.position.y)
      )
        throw "Circle position undefined or NaN";

      if (typeof noise_x === "undefined") noise_x = 0;
      if (typeof noise_y === "undefined") noise_y = 0;

      // if position is end, add some noise
      if (distance_as_percentage == 0) {
        const draw_position_noise_x = window.cocept.randomNumberBetween(
          0,
          noise_x,
          true
        );
        const draw_position_noise_y = window.cocept.randomNumberBetween(
          0,
          noise_y,
          true
        );
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

  Canvas.prototype.init = function(config) {
    // remember options and dimensions
    this.config = config;
    this.setDimensions();
    this.text_alpha = 1;

    // get circles json
    $.ajax({
      url: this.config.circles_json_path,
      dataType: "text",
      context: this,
      success: function(data) {
        // minify json to remove comments before parsing
        this.circle_json = JSON.parse(JSON.minify(data));
        this.parseCircleJsonIntoCircles();
      },
      fail: function() {
        console.log("There was a problem loading the circles");
      }
    });

    // on window resize, get new canvas width and reparse circles
    var context = this;
    $(window).resize(function() {
      context.parseCircleJsonIntoCircles();
    });

    // on mouse move, save mouse position
    $(document).mousemove(function(e) {
      context.mouse_position = new Coordinates(e.pageX, e.pageY);
    });

    // draw every N frames
    this.interval_id = setInterval(this.draw.bind(this), this.config.framerate);
  };

  



  

  Canvas.prototype.calculate_line_width = function() {
    // calculate target line width
    var target_line_width =
      this.config.line_width_max *
      Math.pow((100 - this.distance_as_percentage) / 100, 2);

    // lerp line width
    if (typeof this.line_width != "undefined") {
      var difference = target_line_width - this.line_width;
      this.line_width += difference * 0.1;
    } else {
      this.line_width = target_line_width;
    }

    // enforce minimum line width
    this.line_width = Math.max(this.line_width, this.config.line_width_min);

    return this.line_width;
  };

  // updates the canvas text alpha depending on the distance as percentage
  Canvas.prototype.calculate_text_alpha = function() {
    if (this.distance_as_percentage == 0 && this.text_alpha > 0)
      this.text_alpha -= this.config.text_alpha_delta;
    else if (this.distance_as_percentage != 0 && this.text_alpha < 1)
      this.text_alpha += this.config.text_alpha_delta;
  };


  Canvas.prototype.stop = function() {
    clearInterval(this.interval_id);
  };

  return <div className="dot-experiment">Hi</div>;
}

export default App;
