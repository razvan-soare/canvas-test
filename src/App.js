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
    const maxHeight = document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

    // create configuration
    const canvas_config = {
      // CANVAS //
      ctx: canvas.getContext("2d"), // canvas 2d context
      canvas_element: canvas,
      canvas_height: 450,
      canvas_width: 1300,

      // WORKINGS //
      framerate: 25,

      // Scroll //
      scroll_intervals: [
        { start: 0, stop: 500 },
        { start: 900, stop: 1400 },
        { start: 2000, stop: maxHeight }
      ],

      // CIRCLES //
      circle_radius: 5,
      circle_size: { w: 25, h: 25 },
      circle_movement_speed: 0.1, // the speed modifier for circles. 0.05 is a smooth and medium speed value
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
      </div>
    );
  }
}

export default CanvasClass;
