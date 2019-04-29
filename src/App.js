import React from "react";
import Canvas from "./Canvas";

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
      canvas_width: 1300,

      // WORKINGS //
      framerate: 25,
      target_element_selector: ".test-element", // the element the mouse must be on to reveal the image
      image_width: 645,
      image_height: 400,
      max_distance_as_percentage: 100, // the highest value for distance as percentage

      // MOUSE //
      min_mouse_distance: 250,
      target_distance_leniency: 40, // mouse can be this far away from target element and still be considered "on it"

      // CIRCLES //
      circle_radius: 5,
      circle_size: { w: 50, h: 50 },
      start_position_off_canvas_limit_x: 50, // how far the circle start positions can be off the canvas
      start_position_off_canvas_limit_y: 50,
      circle_movement_speed: 0.075, // the speed modifier for circles. 0.05 is a smooth and medium speed value
      noise_x: 2, // amount of random movement on the x axis to add when circle is in the end_position
      noise_y: 2
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
