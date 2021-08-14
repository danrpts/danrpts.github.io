// The MIT License (MIT)
//
// Copyright (c) 2017 Daniel Peterson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

(function() {
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
  // MIT license
  var lastTime = 0;
  var vendors = ["ms", "moz", "webkit", "o"];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[vendors[x] + "CancelAnimationFrame"] ||
      window[vendors[x] + "CancelRequestAnimationFrame"];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
})();

(function() {
  // MDN
  // https://developer.mozilla.org/en-US/docs/Web/Events/resize
  var throttle = function(type, name, obj) {
    obj = obj || window;
    var running = false;
    var func = function() {
      if (running) {
        return;
      }
      running = true;
      requestAnimationFrame(function() {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  };

  /* init - you can init any event */
  throttle("resize", "optimizedResize");
})();

(function() {
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  const QUANTITY = 128;
  const FPS = 30;
  const SPEED = 0.25;
  const COLORS = [["255, 255, 255"], ["255, 233, 196"], ["212, 251, 255"]];
  const COLORS_LENGTH = 3;

  window.Starfield = function Starfield(canvasId, sizeId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas.getContext) return false;
    this.ctx = this.canvas.getContext("2d");

    this.size = document.getElementById(sizeId);
    if (!this.size) return false;

    const that = this;
    function resize() {
      that.canvas.width = that.size.clientWidth;
      that.canvas.height = that.size.clientHeight;
      that.x0 = Math.round(that.canvas.width / 2);
      that.y0 = Math.round(that.canvas.height / 2);
      that.z0 = Math.max(that.x0, that.y0);
    }
    resize();
    window.addEventListener("optimizedResize", resize);

    this.stars = new Array(QUANTITY);
    for (var i = 0; i < QUANTITY; i++) {
      this.stars[i] = new Array(4);
      this.stars[i][0] = getRandomInt(-this.x0, this.x0);
      this.stars[i][1] = getRandomInt(-this.y0, this.y0);
      this.stars[i][2] = getRandomInt(0, this.z0);
      this.stars[i][4] = getRandomInt(0, COLORS_LENGTH);
    }

    return this;
  };

  function animate() {
    // clear canvas hack
    // https://www.html5rocks.com/en/tutorials/canvas/performance/#toc-clear-canvas
    this.canvas.width = this.canvas.width;

    for (var i = QUANTITY - 1; i >= 0; i--) {
      // 3d to 2d perspective projection
      // https://en.wikipedia.org/wiki/3D_projection
      const star = this.stars[i];
      const scale = this.z0 / star[2] / 2;
      const px = star[0] * scale + this.x0;
      const py = star[1] * scale + this.y0;
      star[2] -= SPEED;

      // reset star
      if (star[2] < 0) {
        star[2] = this.z0;
      }

      if (
        px > 0 &&
        px <= this.canvas.width &&
        py > 0 &&
        py <= this.canvas.height
      ) {
        // interpolate alpha
        const a = Math.abs(1 - star[2] / this.z0);
        this.ctx.strokeStyle = "rgba(" + COLORS[star[4]].join(",") + "," + a + ")";
        this.ctx.strokeRect(px, py, 1, 1);
      }
    }
  }

  Starfield.prototype.render = function() {
    // limit fps
    // http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
    var now;
    var then = Date.now();
    const interval = 1000 / FPS;
    var delta;
    const ctx = this.ctx;
    const that = this;

    function step() {
      window.requestAnimationFrame(step);

      now = Date.now();
      delta = now - then;

      if (delta < interval) {
        return;
      }

      then = now - (delta % interval);

      animate.call(that);
    }

    step();
  };
})();
