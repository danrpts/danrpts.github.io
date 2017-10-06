// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// MDN
// https://developer.mozilla.org/en-US/docs/Web/Events/resize
(function() {
    var throttle = function(type, name, obj) {
        obj = obj || window;
        var running = false;
        var func = function() {
            if (running) { return; }
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
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  var hyperspace = false;
  var speed = NaN;
  var colors = ["255, 255, 255", "255, 233, 196", "212, 251, 255"];

  window.Starfield = function Starfield (opts) {

    this.canvasId = opts.canvasId;
    this.warpId = opts.warpId;
    this.quantity = opts.quantity || 512;
    this.fps = opts.fps || 30;
    const minSpeed = opts.minSpeed || 3;
    const maxSpeed = opts.maxSpeed || 12;
    speed = minSpeed;

  	this.canvas = document.getElementById(this.canvasId);
    this.warp = document.getElementById(this.warpid);
    if (!this.canvas.getContext) return false;
    this.ctx = this.canvas.getContext("2d");

    var that = this;
    function resize () {
      that.canvas.width = window.innerWidth;
      that.canvas.height = that.canvas.width / 4;
      that.x0 = Math.round(that.canvas.width / 2);
      that.y0 = Math.round(that.canvas.height / 2);
      that.z0 = that.x0 + that.y0;
    }
    resize();
    window.addEventListener("optimizedResize", resize);

    var warp = document.getElementById(this.warpId);

    warp.addEventListener("mouseenter", function () {
      hyperspace = true;
      var speedUp = setInterval(function () {
        if (speed === maxSpeed) {
          clearInterval(speedUp);
        } else {
          speed += 1;
        }
      }, 1000 / this.fps);
    });

    warp.addEventListener("mouseleave", function () {
      var slowDown = setInterval(function () {
        if (speed === minSpeed) {
          clearInterval(slowDown);
          hyperspace = false;
        } else {
          speed -= 1;
        }
      }, 1000 / this.fps);
    });

    this.stars = new Array(this.quantity);
    for (var i = 0; i < this.quantity; i++) {
       this.stars[i] = new Array(6);
       this.stars[i][0] = getRandomInt(-this.x0, this.x0);
       this.stars[i][1] = getRandomInt(-this.y0, this.y0);
       this.stars[i][2] = getRandomInt(0, this.z0);
       this.stars[i][3] = 0;
       this.stars[i][4] = 0;
       this.stars[i][5] = getRandomInt(0, colors.length);
  	}

    return this;

  }

  function animate () {

    // clear canvas hack
    // https://www.html5rocks.com/en/tutorials/canvas/performance/#toc-clear-canvas
    this.canvas.width = this.canvas.width;

    for (var i = this.stars.length - 1; i >= 0; i--) {

      // 3d to 2d perspective projection
      // https://en.wikipedia.org/wiki/3D_projection
      var star = this.stars[i];
      var scale = this.z0 / star[2] / 2;
  		var px = star[0] * scale + this.x0;
  		var py = star[1] * scale + this.y0;
      star[2] -= speed;

      // set new star
      if (star[2] < 0) {
        star[2] = getRandomInt(0, this.z0);
        star[3] = 0;
        star[4] = 0;
      }

      if (star[3] > 0 && star[3] <= this.canvas.width
       && star[4] > 0 && star[4] <= this.canvas.height) {

        // hack
        var a = Math.abs(1 - (star[2] / this.z0));
        var r = a * 2;

        if (hyperspace) {

          this.ctx.lineWidth = r;
          this.ctx.strokeStyle = "rgba(" + colors[star[5]] + "," + a +")";
          this.ctx.beginPath();
          this.ctx.moveTo(star[3], star[4]);
          this.ctx.lineTo(px, py);
          this.ctx.stroke();
          this.ctx.closePath();

        } else {

          this.ctx.beginPath();
          this.ctx.fillStyle = "rgba(" + colors[star[5]] + "," + a +")";
          this.ctx.arc(px, py, r, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.closePath();

        }

      }

      star[3] = px;
      star[4] = py;

    }

  }

  Starfield.prototype.render = function () {

    // limit fps
    // http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
    var now;
    var then = Date.now();
    var interval = 1000 / this.fps;
    var delta;
    var ctx = this.ctx;
    var that = this;

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

  }

})();
