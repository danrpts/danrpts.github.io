/**
 * Author: Daniel Peterson
 * CruzID: darpeter@ucsc.edu (old)
 * Email: danrpts@gmail.com
 * Project: Mandelbulb
 * June 4th 2015
 * Updated July 17th 2018
 */
var canvas,
  gl,
  positions = [],
  total = 0;
window.onload = function() {
  canvas = document.getElementById("canvas");
  if (!(gl = canvas.getContext("webgl"))) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    gl = null;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  if (!(program = initShaders(gl, "#vertex-shader", "#fragment-shader"))) {
    alert("Unable to initialize shaders. See console.");
    program = null;
  } else {
    gl.useProgram(program);

    gl.uniform1f(gl.getUniformLocation(program, "width"), canvas.width);

    gl.uniform1f(gl.getUniformLocation(program, "height"), canvas.height);

    gl.uniform1f(
      gl.getUniformLocation(program, "bulbOrder"),
      $("#bulbOrder").val()
    );

    gl.uniform1i(
      gl.getUniformLocation(program, "bulbDepth"),
      $("#bulbDepth").val()
    );

    gl.uniform1f(
      gl.getUniformLocation(program, "bulbFineness"),
      $("#bulbFineness").val()
    );

    gl.uniform3fv(
      gl.getUniformLocation(program, "lightXYZ"),
      new Float32Array([
        $("#lightX").val(),
        $("#lightY").val(),
        $("#lightZ").val()
      ])
    );

    gl.uniform4fv(
      gl.getUniformLocation(program, "eyeXYZF"),
      new Float32Array([
        $("#eyeX").val(),
        $("#eyeY").val(),
        $("#eyeZ").val(),
        $("#eyeF").val()
      ])
    );

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "rotXYZ"),
      gl.FALSE,
      rotate($("#rotX").val(), $("#rotY").val(), $("#rotZ").val())
    );

    $("#bulbOrder").on("input change", function() {
      gl.uniform1f(
        gl.getUniformLocation(program, "bulbOrder"),
        $("#bulbOrder").val()
      );
      render();
    });

    $("#bulbDepth").on("input change", function() {
      gl.uniform1i(
        gl.getUniformLocation(program, "bulbDepth"),
        $("#bulbDepth").val()
      );
      render();
    });

    $("#bulbFineness").on("input change", function() {
      gl.uniform1f(
        gl.getUniformLocation(program, "bulbFineness"),
        $("#bulbFineness").val()
      );
      render();
    });

    $("#eyeX,#eyeY,#eyeZ,#eyeF").on("input change", function() {
      gl.uniform4fv(
        gl.getUniformLocation(program, "eyeXYZF"),
        new Float32Array([
          $("#eyeX").val(),
          $("#eyeY").val(),
          $("#eyeZ").val(),
          $("#eyeF").val()
        ])
      );
      render();
    });

    $("#lightX,#lightY,#lightZ").on("input change", function() {
      gl.uniform3fv(
        gl.getUniformLocation(program, "lightXYZ"),
        new Float32Array([
          $("#lightX").val(),
          $("#lightY").val(),
          $("#lightZ").val()
        ])
      );
      render();
    });

    $("#rotX,#rotY,#rotZ").on("input change", function() {
      gl.uniformMatrix4fv(
        gl.getUniformLocation(program, "rotXYZ"),
        gl.FALSE,
        rotate($("#rotX").val(), $("#rotY").val(), $("#rotZ").val())
      );
      render();
    });

    // rotation matrix
    function rotate(x, y, z) {
      var r = Math.PI / 180.0,
        c = Math.cos,
        s = Math.sin,
        xrad = x * r,
        cx = c(xrad),
        sx = s(xrad),
        yrad = y * r,
        cy = c(yrad),
        sy = s(yrad),
        zrad = z * r,
        cz = c(zrad),
        sz = s(zrad);
      return [
        cy * cz,
        -cy * sz,
        sy,
        0,
        sx * sy * cz + cx * sz,
        -sx * sy * sz + cx * cz,
        -sx * cy,
        0,
        -cx * sy * cz + sx * sz,
        cx * sy * sz + sx * cz,
        cx * cy,
        0,
        0,
        0,
        0,
        1
      ];
    }

    // the only polygon
    var square = [-1, -1, -1, 1, 1, -1, 1, 1];

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      gl.getAttribLocation(program, "vertex"),
      2,
      gl.FLOAT,
      false,
      8,
      0
    );
    gl.enableVertexAttribArray(gl.getAttribLocation(program, "vertex"));
    total = 4;
    render();
  }
};
