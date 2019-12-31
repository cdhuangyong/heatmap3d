export default (function() {
  function Texture(gl, params) {
    var _ref, _ref1;
    this.gl = gl;
    if (params == null) {
      params = {};
    }
    this.channels = this.gl[((_ref = params.channels) != null ? _ref : 'rgba').toUpperCase()];
    if (typeof params.type === 'number') {
      this.type = params.type;
    } else {
      this.type = this.gl[((_ref1 = params.type) != null ? _ref1 : 'unsigned_byte').toUpperCase()];
    }
    switch (this.channels) {
      case this.gl.RGBA:
        this.chancount = 4;
        break;
      case this.gl.RGB:
        this.chancount = 3;
        break;
      case this.gl.LUMINANCE_ALPHA:
        this.chancount = 2;
        break;
      default:
        this.chancount = 1;
    }
    this.target = this.gl.TEXTURE_2D;
    this.handle = this.gl.createTexture();
  }

  Texture.prototype.destroy = function() {
    return this.gl.deleteTexture(this.handle);
  };

  Texture.prototype.bind = function(unit) {
    if (unit == null) {
      unit = 0;
    }
    if (unit > 15) {
      throw 'Texture unit too large: ' + unit;
    }
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.target, this.handle);
    return this;
  };

  Texture.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
    this.gl.texImage2D(this.target, 0, this.channels, this.width, this.height, 0, this.channels, this.type, null);
    return this;
  };

  Texture.prototype.upload = function(data) {
    this.width = data.width;
    this.height = data.height;
    this.gl.texImage2D(this.target, 0, this.channels, this.channels, this.type, data);
    return this;
  };

  Texture.prototype.linear = function() {
    this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    return this;
  };

  Texture.prototype.nearest = function() {
    this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    return this;
  };

  Texture.prototype.clampToEdge = function() {
    this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    return this;
  };

  Texture.prototype.repeat = function() {
    this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    return this;
  };

  return Texture;

})();