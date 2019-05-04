import image2base64 from "image-to-base64";
import { TweenMax, Elastic } from "gsap/TweenMax";

// Represents the canvas itself and provides functions for setup and drawing etc
const Canvas = function() {};

Canvas.prototype.init = async function(config) {
  this.config = config;
  this.circles = [];
  this.canvas_width = config.canvas_width;
  this.canvas_height = config.canvas_height;

  const imageBase64 = await image2base64("./logo.png");
  this.image = new Image();
  this.image.onload = this.draw;
  this.image.src = imageBase64;

  // remember options and dimensions
  this.setDimensions();

  // draw every N frames
  // this.interval_id = setInterval(this.draw.bind(this), this.config.framerate);
};

Canvas.prototype.clear = function() {
  this.config.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
  this.particles = [];
  this.drawScene();
};

Canvas.prototype.setDimensions = function() {
  // set and save canvas dimensions - width = window width
  this.config.canvas_element.setAttribute("width", this.config.canvas_width);
  this.config.canvas_element.setAttribute("height", this.config.canvas_height);
  this.canvas_width = this.config.canvas_width;
  this.canvas_height = this.config.canvas_height;
};

Canvas.prototype.draw = function() {
  const ctx = this.config.ctx;
  // clear existing drawings
  this.clear();

  // Draw image
  ctx.drawImage(this.image, 0, 0);

  var my_gradient = ctx.createLinearGradient(0, 170, 170, 0);
  my_gradient.addColorStop(0, "red");
  my_gradient.addColorStop(0.3, "orange");
  my_gradient.addColorStop(0.5, "yellow");
  my_gradient.addColorStop(0.7, "green");
  my_gradient.addColorStop(0.9, "blue");
  ctx.fillStyle = my_gradient;
  my_gradient.addColorStop(1, "purple");

  ctx.fillStyle = my_gradient;

  const data = ctx.getImageData(0, 0, this.image.width, this.image.height);
  ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);

  for (var y = 0, y2 = data.height; y < y2; y++) {
    for (var x = 0, x2 = data.width; x < x2; x++) {
      var p = y * 4 * data.width + x * 4;
      if (data.data[p + 3] > 129) {
        var particle = {
          x0: x,
          y0: y,
          x1: this.image.width / 2,
          y1: this.image.height / 2,
          speed: Math.random() * 4 + 2,
          color:
            "rgb(" +
            data.data[p] +
            "," +
            data.data[p + 1] +
            "," +
            data.data[p + 2] +
            ")"
        };
        TweenMax.to(particle, particle.speed, {
          x1: particle.x0,
          y1: particle.y0,
          delay: y / 30,
          ease: Elastic.easeOut
        });
        this.particles.push(particle);
      }
    }
  }
};

Canvas.prototype.stop = function() {
  clearInterval(this.interval_id);
};

export default Canvas;
