import React from "react";
import Canvas from "./Canvas";
import _ from "lodash";

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
      canvas_height: window.innerHeight,
      canvas_width: window.innerWidth,

      // WORKINGS //
      framerate: 25,

      // CIRCLES //
      circle_radius: 4,
      proximity: 100,
      circle_movement_speed: 2 // the speed modifier for circles. 0.05 is a smooth and medium speed value
    };

    window.myObject = {};
    window.myObject.canvas = new Canvas();
    window.myObject.canvas.init(canvas_config);

    window.addEventListener(
      "resize",
      _.throttle(() => {
        canvas_config.canvas_height = window.innerHeight;
        canvas_config.canvas_width = window.innerWidth;
      })
    );
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
