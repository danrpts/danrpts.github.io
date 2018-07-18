function initShaders(gl, vertId, fragId) {
  var vertShader = null,
    fragShader = null,
    program = null;

  vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, $(vertId).text());
  gl.compileShader(vertShader);
  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    console.warn(
      "Vertex shader failed to compile. The error log is: %s.",
      gl.getShaderInfoLog(vertShader)
    );
    gl.deleteShader(vertShader);
    vertShader = null;
    return false;
  }

  fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, $(fragId).text());
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.warn(
      "Fragment shader failed to compile. The error log is: %s.",
      gl.getShaderInfoLog(fragShader)
    );
    gl.deleteShader(fragShader);
    fragShader = null;
    return false;
  }

  program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(
      "Shader program failed to link. The error log is: %s.",
      gl.getProgramInfoLog(program)
    );
    gl.detachShader(program, vertShader);
    gl.detachShader(program, fragShader);
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    gl.deleteProgram(program);
    return false;
  }

  return program;
}
