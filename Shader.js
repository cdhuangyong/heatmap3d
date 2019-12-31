/**
 * shader类
 */
export default (function() {
  function Shader(gl, _arg) {
    var fragment, vertex;
    this.gl = gl;
    vertex = _arg.vertex, fragment = _arg.fragment;
    this.program = this.gl.createProgram();
    this.vs = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.attachShader(this.program, this.vs);
    this.gl.attachShader(this.program, this.fs);
    this.compileShader(this.vs, vertex);
    this.compileShader(this.fs, fragment);
    this.link();
    this.value_cache = {};
    this.uniform_cache = {};
    this.attribCache = {};
  }

  Shader.prototype.attribLocation = function(name) {
    var location;
    location = this.attribCache[name];
    if (location === void 0) {
      location = this.attribCache[name] = this.gl.getAttribLocation(this.program, name);
    }
    return location;
  };

  Shader.prototype.compileShader = function(shader, source) {
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw "Shader Compile Error: " + (this.gl.getShaderInfoLog(shader));
    }
  };

  Shader.prototype.link = function() {
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw "Shader Link Error: " + (this.gl.getProgramInfoLog(this.program));
    }
  };

  Shader.prototype.use = function() {
    this.gl.useProgram(this.program);
    return this;
  };

  Shader.prototype.uniformLoc = function(name) {
    var location;
    location = this.uniform_cache[name];
    if (location === void 0) {
      location = this.uniform_cache[name] = this.gl.getUniformLocation(this.program, name);
    }
    return location;
  };

  Shader.prototype.int = function(name, value) {
    var cached, loc;
    cached = this.value_cache[name];
    if (cached !== value) {
      this.value_cache[name] = value;
      loc = this.uniformLoc(name);
      if (loc) {
        this.gl.uniform1i(loc, value);
      }
    }
    return this;
  };

  Shader.prototype.vec2 = function(name, a, b) {
    var loc;
    loc = this.uniformLoc(name);
    if (loc) {
      this.gl.uniform2f(loc, a, b);
    }
    return this;
  };

  Shader.prototype.float = function(name, value) {
    var cached, loc;
    cached = this.value_cache[name];
    if (cached !== value) {
      this.value_cache[name] = value;
      loc = this.uniformLoc(name);
      if (loc) {
        this.gl.uniform1f(loc, value);
      }
    }
    return this;
  };

  return Shader;

})();