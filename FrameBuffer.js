export default (function() {
  function Framebuffer(gl) {
    this.gl = gl;
    this.buffer = this.gl.createFramebuffer();
  }

  Framebuffer.prototype.destroy = function() {
    return this.gl.deleteFRamebuffer(this.buffer);
  };

  Framebuffer.prototype.bind = function() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
    return this;
  };

  Framebuffer.prototype.unbind = function() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    return this;
  };

  Framebuffer.prototype.check = function() {
    var result;
    result = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
    switch (result) {
      case this.gl.FRAMEBUFFER_UNSUPPORTED:
        throw 'Framebuffer is unsupported';
        break;
      case this.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
        throw 'Framebuffer incomplete attachment';
        break;
      case this.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
        throw 'Framebuffer incomplete dimensions';
        break;
      case this.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
        throw 'Framebuffer incomplete missing attachment';
    }
    return this;
  };

  Framebuffer.prototype.color = function(texture) {
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, texture.target, texture.handle, 0);
    this.check();
    return this;
  };

  Framebuffer.prototype.depth = function(buffer) {
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, buffer.id);
    this.check();
    return this;
  };

  Framebuffer.prototype.destroy = function() {
    return this.gl.deleteFramebuffer(this.buffer);
  };

  return Framebuffer;

})();