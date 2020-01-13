
/**
 * 描述：heatmapGL.js
 * 责任人：huangyong
 * 创建日期：2019-12-06 09:39:29
 */


import Texture from './Texture.js'
import Node from './Node.js'
import Framebuffer from './Framebuffer'
import Shader from './Shader.js'
import matrix_set from './share.js'

var  Heights, WebGLHeatmap;

/**
 * 灰度图渲染类
 * @author hy
 * @DateTime 2019-12-31
 */
Heights = (function() {
  function Heights(heatmap, gl, width, height) {
    var i, _i, _ref;
    this.heatmap = heatmap;
    this.gl = gl;
    this.width = width * 4.5;
    this.height = height * 4.5;
    //this.pixels = new Float32Array(this.width * this.height * 4);
    this.shader = new Shader(this.gl, {
      vertex: `
        const float PI = 3.14159265;
        attribute vec4 position, intensity;\n
        varying vec2 off, dim;\n
        varying float vIntensity;\n
        uniform vec2  viewport;\n\n
        uniform float resolution;
        uniform vec4 extent;
        uniform mat4 view_matrix;

        float mercatorXfromLng(float lng ) {
            return (180.0 + lng) / 360.0;
        }

        float mercatorYfromLat(float lat) { 
          return (180.0 - (180.0 / PI * log(tan(PI / 4.0 + lat * PI / 360.0)))) / 360.0;
        }

        float linearScale(float x, float start , float end){
          return (x - start) / (end - start);
        }

        void main(){\n
          vec2 zw = position.zw;   
          dim = abs(zw);\n    
          off = zw;\n    

          vec2 pos = position.xy + zw * resolution;

          pos.x = mercatorXfromLng(pos.x);
          pos.y = mercatorYfromLat(pos.y);

          float x1 = mercatorXfromLng(extent.x);
          float y1 = mercatorYfromLat(extent.y);
          float x2 = mercatorXfromLng(extent.z);
          float y2 = mercatorYfromLat(extent.w);
  
          vec4 newPosition = view_matrix * vec4( pos , 0.0,  1.0);\n 

         
          vIntensity = intensity.x;\n 
          gl_Position = newPosition;\n
          
        }`,
      fragment: `
        #ifdef GL_FRAGMENT_PRECISION_HIGH\n    
        precision highp int;\n    
        precision highp float;\n
        #else\n    
        precision mediump int;\n    
        precision mediump float;\n
        #endif\n
        varying vec2 off, dim;\n
        varying float vIntensity;\n
        void main(){\n    
          float falloff = (1.0 - smoothstep(0.0, 1.0, length(off/dim)));\n    
          float intensity = falloff*vIntensity;\n    
          gl_FragColor = vec4(intensity,intensity,intensity,intensity);\n
        }`
    });

    this.nodeFront = new Node(this.gl, this.width, this.height);
    this.vertexBuffer = this.gl.createBuffer();
    this.vertexSize = 8;
    this.maxPointCount = 1024 * 10;
    this.vertexBufferData = new Float32Array(); //new Float32Array(this.maxPointCount * this.vertexSize * 6);
    this.vertexBufferViews = [];
    /*for (i = _i = 0, _ref = this.maxPointCount; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      this.vertexBufferViews.push(new Float32Array(this.vertexBufferData.buffer, 0, i * this.vertexSize * 6));
    }*/
    this.bufferIndex = 0;
    this.pointCount = 0;
  }
  /**
   * 调整大小
   * @author hy
   * @DateTime 2019-12-31
   * @param    {number}   width  宽度
   * @param    {number}   height 高度       
   */
  Heights.prototype.resize = function(width, height) {
    this.width = width * 4.5;
    this.height = height * 4.5;
    //this.pixels = new Float32Array(this.width * this.height * 4);
    return this.nodeFront.resize(this.width, this.height);
  };
  /**
   * 更新灰度图像
   * @author hy
   * @DateTime 2019-12-31
   * @param    {array}    matrix      变换矩阵
   * @param    {number}   resolution 分辨率
   * @param    {array}   extent     范围
   */
  Heights.prototype.update = function(matrix, resolution, extent) {
    this.clear();
    var intensityLoc, positionLoc;
    //if (this.pointCount > 0) {
    this.gl.enable(this.gl.BLEND);
    //this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.nodeFront.use();

    this.gl.viewport(0, 0, this.width, this.height);
    //this.shader.use();
    this.gl.enable(this.gl.DEPTH_TEST);
    //this.gl.depthFunc(this.gl.ALWAYS);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexBufferData /*this.vertexBufferViews[this.pointCount]*/ , this.gl.STREAM_DRAW);
    positionLoc = this.shader.attribLocation('position');
    intensityLoc = this.shader.attribLocation('intensity');
    this.gl.enableVertexAttribArray(1);
    this.gl.vertexAttribPointer(positionLoc, 4, this.gl.FLOAT, false, 8 * 4, 0 * 4);
    this.gl.vertexAttribPointer(intensityLoc, 4, this.gl.FLOAT, false, 8 * 4, 4 * 4);
    this.shader.use();//.vec2('viewport', this.width, this.height);

    this.gl.uniformMatrix4fv(this.shader.uniformLoc("view_matrix"), false, matrix);
    this.gl.uniform1f(this.shader.uniformLoc("resolution"), resolution);
    this.gl.uniform4fv(this.shader.uniformLoc("extent"), extent);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.pointCount * 6);

    this.gl.disableVertexAttribArray(1);

    this.nodeFront.end();

  };
  /**
   * 清除
   * @author hy
   * @DateTime 2019-12-31
   */
  Heights.prototype.clear = function() {
    this.nodeFront.use();
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    return this.nodeFront.end();
  };
  /**
   * 添加顶点
   * @author hy
   * @DateTime 2019-12-31
   * @param    {number}   x         经度
   * @param    {number}   y         纬度
   * @param    {number}   xs        x半径
   * @param    {number}   ys        y半径
   * @param    {number}   intensity 强度
   */
  Heights.prototype.addVertex = function(x, y, xs, ys, intensity) {
    this.vertexBufferData[this.bufferIndex++] = x;
    this.vertexBufferData[this.bufferIndex++] = y;
    this.vertexBufferData[this.bufferIndex++] = xs;
    this.vertexBufferData[this.bufferIndex++] = ys;
    this.vertexBufferData[this.bufferIndex++] = intensity;
    this.vertexBufferData[this.bufferIndex++] = intensity;
    this.vertexBufferData[this.bufferIndex++] = intensity;
    return this.vertexBufferData[this.bufferIndex++] = intensity;
  };
  /**
   * 添加一个热点
   * @author hy
   * @DateTime 2019-12-31
   * @param    {number}   x         经度
   * @param    {number}   y         纬度
   * @param    {number}   size      半径
   * @param    {number}   intensity 强度
   */
  Heights.prototype.addPoint = function(x, y, size, intensity) {
    var s;
    if (size == null) {
      size = 50;
    }
    if (intensity == null) {
      intensity = 0.2;
    }
    if (this.pointCount >= this.maxPointCount - 1) {
      this.update();
    }

    s = size;
    this.addVertex(x, y, -s, -s, intensity);
    this.addVertex(x, y, +s, -s, intensity);
    this.addVertex(x, y, -s, +s, intensity);
    this.addVertex(x, y, -s, +s, intensity);
    this.addVertex(x, y, +s, -s, intensity);
    this.addVertex(x, y, +s, +s, intensity);
    return this.pointCount += 1;
  };

  return Heights;

})();
/**
 * 热力图组件基类
 * @author hy
 * @DateTime 2019-12-31
 * @param {object} _arg 配置项
 */
WebGLHeatmap = (function() {
  function WebGLHeatmap(_arg) {
    var alphaEnd, alphaRange, alphaStart, error, getColorFun, gradientTexture, image, intensityToAlpha, 
    output, quad, textureGradient, _ref, _ref1,useGradienTexture;
    _ref = _arg != null ? _arg : {}, this.gl = _ref.gl, this.canvas = _ref.canvas, this.width = _ref.width, this.height = _ref.height,
       intensityToAlpha = _ref.intensityToAlpha,useGradienTexture = _ref.useGradienTexture, 
       gradientTexture = _ref.gradientTexture, alphaRange = _ref.alphaRange;
    this.heigtCache = {};
    if (!this.canvas && !this.gl) {
      this.canvas = document.createElement('canvas');
    }
    try {
      if (!this.gl) {
        this.gl = this.canvas.getContext('experimental-webgl', {
          depth: false,
          antialias: false
        });
        if (this.gl === null) {
          this.gl = this.canvas.getContext('webgl', {
            depth: false,
            antialias: false
          });
          if (this.gl === null) {
            throw 'WebGL not supported';
          }
        }
      }

    } catch (_error) {
      error = _error;
      throw 'WebGL not supported';
    }
    if (window.WebGLDebugUtils != null) {
      console.log('debugging mode');
      this.gl = WebGLDebugUtils.makeDebugContext(this.gl, function(err, funcName, args) {
        throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
      });
    }
    this.gl.enableVertexAttribArray(0);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    if (useGradienTexture) {
      textureGradient = this.gradientTexture = new Texture(this.gl, {
        channels: 'rgba'
      }).bind(0).setSize(200, 50).nearest().clampToEdge();
      getColorFun = `
          uniform sampler2D gradientTexture;\n
          vec3 getColor(float intensity){\n    
            return texture2D(gradientTexture, vec2(intensity, 0.0)).rgb;\n
          }`;
    } else {
      textureGradient = null;
      getColorFun = `
        vec3 getColor(float intensity){\n    
          vec3 blue = vec3(0.0, 0.0, 1.0);\n    
          vec3 cyan = vec3(0.0, 1.0, 1.0);\n    
          vec3 green = vec3(0.0, 1.0, 0.0);\n    
          vec3 yellow = vec3(1.0, 1.0, 0.0);\n    
          vec3 red = vec3(1.0, 0.0, 0.0);\n\n    
          vec3 color = (\n        
            fade(-0.25, 0.25, intensity)*blue +\n        
            fade(0.0, 0.5, intensity)*cyan +\n        
            fade(0.25, 0.75, intensity)*green +\n        
            fade(0.5, 1.0, intensity)*yellow +\n        
            smoothstep(0.75, 1.0, intensity)*red\n    
            );\n    
          return color;\n
        }`;
    }
    if (intensityToAlpha == null) {
      intensityToAlpha = true;
    }
    if (intensityToAlpha) {
      _ref1 = alphaRange != null ? alphaRange : [0, 1], alphaStart = _ref1[0], alphaEnd = _ref1[1];
      output = "vec4 alphaFun(vec3 color, float intensity){\n    float alpha = smoothstep(" + (alphaStart.toFixed(8)) + ", " + (alphaEnd.toFixed(8)) + ", intensity);\n    return vec4(color*alpha, alpha);\n}";
    } else {
      output = 'vec4 alphaFun(vec3 color, float intensity){\n    return vec4(color, 1.0);\n}';
    }
    this.shader = new Shader(this.gl, {
      vertex: `
          const float PI = 3.14159265;
          attribute vec4 position; \n
          varying float v_height;
          uniform sampler2D grayTexture;
          uniform vec4  extent; \n
          uniform mat4  view_matrix;\n
          uniform mat4  half_matrix;\n
          uniform float maxHeight;
          float mercatorXfromLng(float lng ) {
            return (180.0 + lng) / 360.0;
          }
          float mercatorYfromLat(float lat) { 
              return (180.0 - (180.0 / PI * log(tan(PI / 4.0 + lat * PI / 360.0)))) / 360.0;
          }
          float linearScale(float x, float start , float end){
            return (x - start) / (end - start);
          }
          void main(){\n   

            float x1 = mercatorXfromLng(extent.x);
            float y1 = mercatorYfromLat(extent.y);
            float x2 = mercatorXfromLng(extent.z);
            float y2 = mercatorYfromLat(extent.w);

            float x = mercatorXfromLng( extent.x + (extent.z - extent.x) * position.x  );
            float y = mercatorYfromLat( extent.w + (extent.y - extent.w) * position.y  );

            vec4 uv4 = half_matrix * vec4(x,y,0.0,1.0);

            vec2 uv = uv4.xy / uv4.w / 4.5;

            uv.x = (uv.x + 1.0) / 2.0;
            uv.y = (uv.y + 1.0) / 2.0;

            vec4  grayColor = texture2D(grayTexture,uv);
            float height = grayColor.r;

            float newHeight = height > 1.0 ? 1.0 - height : height;
            vec4 newPosition = view_matrix * vec4(x,y,newHeight * maxHeight / 20037508.3427892,1.0);
            v_height = newHeight;
            gl_Position = newPosition;

        }`,
      fragment: (
        `
          #ifdef GL_FRAGMENT_PRECISION_HIGH\n    
          precision highp int;\n    
          precision highp float;\n
          #else\n    
          precision mediump int;\n    
          precision mediump float;\n
          #endif\n
          uniform sampler2D source;\n
          uniform float opacity;\n
          float linstep(float low, float high, float value){\n    
            return clamp((value-low)/(high-low), 0.0, 1.0);\n
          }\n\n
          float fade(float low, float high, float value){\n    
            float mid = (low+high)*0.5;\n    
            float range = (high-low)*0.5;\n    
            float x = 1.0 - clamp(abs(mid-value)/range, 0.0, 1.0);\n    
            return smoothstep(0.0, 1.0, x);\n}\n\n` +
        getColorFun + "\n" + output +
        `\n\n
           varying float v_height; 
           void main(){\n    
            float intensity = smoothstep(0.0, 1.0, v_height);\n    
            vec4 color = alphaFun(getColor(intensity),intensity);\n
            color.a *= opacity;
            gl_FragColor = color;
            //gl_FragColor =  vec4(1.0,0.0,0.0,1.0);
          }`)
    });

    if (this.width == null) {
      this.width = this.canvas ? (this.canvas.offsetWidth || 2) : this.gl.drawingBufferWidth;
    }
    if (this.height == null) {
      this.height = this.canvas ? (this.canvas.offsetHeight || 2) : this.gl.drawingBufferHeight;
    }
    if (this.canvas) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }

    this.quadLoc = this.gl.getAttribLocation(this.shader.program, "position");
    this.heightLoc = this.gl.getAttribLocation(this.shader.program, "height");
    this.grayTextureLoc = this.gl.getUniformLocation(this.shader.program,"grayTexture");

    this.depthRange = [0, 1];

    //var num = this.quadNum = 256; // Math.min(this.width, this.height);

    var gridy = this.gridy = 800;
    var gridx = this.gridx = 800; //Math.floor(gridy / (this.height / this.width));

    this.quadBufferArrayData = new Float32Array(gridx * gridy * 6 * 4);

    this.fillData(gridx,gridy);

    this.gl.viewport(0, 0, this.width, this.height);

    //贴图面
    this.quad = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.quadBufferArrayData, this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    this.pixels = new Float32Array(4);

    this.heights = new Heights(this, this.gl, this.width, this.height);
  }
  /**
   * 填充网格面数据
   * @author hy
   * @DateTime 2019-12-31
   * @param    {number}   gridx 网格x数量
   * @param    {number}   gridy 网格y数量
   */
  WebGLHeatmap.prototype.fillData = function(gridx,gridy) {
    var i, j, i1, j1, vx, vy, vx1, vy1,count = 0;

    outer: for (i = 0; i < gridy; i++) {
      i1 = i + 1;
      if (i1 > gridy) {
        continue outer;
      }
      inner: for (j = 0; j < gridx; j++) {
        j1 = j + 1;
        if (j1 > gridx) {
          continue inner;
        }
        this.fillQuad(i, j, i1, j1, count, gridy, gridx);
        count += 24;
      }
    }
  };
  /**
   * 填充网格面三角顶点数据
   * @author hy
   * @DateTime 2019-12-31
   * @param    {number}   i     网格x
   * @param    {number}   j     网格y
   * @param    {number}   i1    网格x+1
   * @param    {number}   j1    网格y+1
   * @param    {number}   count 顶点位置计数
   * @param    {number}   gridy 网格y数量
   * @param    {number}   gridx 网格x数量
   */
  WebGLHeatmap.prototype.fillQuad = function(i, j, i1, j1, count, gridy, gridx) {
    var quadBufferArrayData = this.quadBufferArrayData;
    var vx, vy, vx1, vy1;

    vx = j / gridx;
    vy = i / gridy;
    vx1 = j1 / gridx;
    vy1 = i1 / gridy;

    quadBufferArrayData[count] = vx;
    quadBufferArrayData[count + 1] = vy1;
    quadBufferArrayData[count + 2] = 0;
    quadBufferArrayData[count + 3] = 1;

    quadBufferArrayData[count + 4] = vx1;
    quadBufferArrayData[count + 1 + 4] = vy1;
    quadBufferArrayData[count + 2 + 4] = 0;
    quadBufferArrayData[count + 3 + 4] = 1;

    quadBufferArrayData[count + 2 * 4] = vx;
    quadBufferArrayData[count + 1 + 2 * 4] = vy;
    quadBufferArrayData[count + 2 + 2 * 4] = 0;
    quadBufferArrayData[count + 3 + 2 * 4] = 1;

    quadBufferArrayData[count + 3 * 4] = vx;
    quadBufferArrayData[count + 1 + 3 * 4] = vy;
    quadBufferArrayData[count + 2 + 3 * 4] = 0;
    quadBufferArrayData[count + 3 + 3 * 4] = 1;

    quadBufferArrayData[count + 4 * 4] = vx1;
    quadBufferArrayData[count + 1 + 4 * 4] = vy1;
    quadBufferArrayData[count + 2 + 4 * 4] = 0;
    quadBufferArrayData[count + 3 + 4 * 4] = 1;

    quadBufferArrayData[count + 5 * 4] = vx1;
    quadBufferArrayData[count + 1 + 5 * 4] = vy;
    quadBufferArrayData[count + 2 + 5 * 4] = 0;
    quadBufferArrayData[count + 3 + 5 * 4] = 1;
  };
  /**
   * 大小重计算
   * @author hy
   * @DateTime 2019-12-31
   */
  WebGLHeatmap.prototype.adjustSize = function() {
    var canvasHeight, canvasWidth;
    canvasWidth = this.canvas ? (this.canvas.offsetWidth || 2) : this.gl.drawingBufferWidth;
    canvasHeight = this.canvas ? (this.canvas.offsetHeight || 2) : this.gl.drawingBufferHeight;
    if (this.width !== canvasWidth || this.height !== canvasHeight) {
      this.gl.viewport(0, 0, canvasWidth, canvasHeight);
      if (this.canvas) {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
      }

      this.width = canvasWidth;
      this.height = canvasHeight;
      return this.heights.resize(this.width, this.height);
    }
  };
  /**
   * 呈现灰度图
   * @author hy
   * @DateTime 2019-12-31
   * @param    {array}   matrix 变换矩阵
   * @param    {array}   extent 范围
   */
  WebGLHeatmap.prototype.display = function(view_matrix,half_matrix, extent) {

    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad);
    this.gl.enableVertexAttribArray(this.quadLoc);
    this.gl.vertexAttribPointer(this.quadLoc, 4, this.gl.FLOAT, false, 0, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    this.heights.nodeFront.bind(0);
    if (this.gradientTexture) {
      this.gradientTexture.bind(1);
    }

    this.shader.use().int('source', 0).int('gradientTexture', 1);

    this.gl.uniformMatrix4fv(this.shader.uniformLoc("view_matrix"), false, view_matrix);
    this.gl.uniformMatrix4fv(this.shader.uniformLoc("half_matrix"), false, half_matrix);
    this.gl.uniform4fv(this.shader.uniformLoc("extent"), extent);
    this.gl.uniform1f(this.shader.uniformLoc("opacity"), this.config.opacity);
    this.gl.uniform1f(this.shader.uniformLoc("maxHeight"), this.config.maxHeight);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.quadBufferArrayData.length / 4);

  };
  /**
   * 更新灰度图
   * @author hy
   * @DateTime 2019-12-31
   * @param    {array}   matrix       变换矩阵
   * @param    {number}   resolution  分辨率
   * @param    {array}   extent       范围
   */
  WebGLHeatmap.prototype.update = function(matrix, resolution, extent) {
    return this.heights.update(matrix, resolution, extent);
  };
  /**
   * 清除灰度图
   * @author hy
   * @DateTime 2019-12-31
   */
  WebGLHeatmap.prototype.clear = function() {
    return this.heights.clear();
  };
  /**
   * 添加一个热点
   * @author hy
   * @DateTime 2019-12-31
   * @param    {number}   x         经度
   * @param    {number}   y         纬度
   * @param    {number}   size      半径
   * @param    {number}   intensity 强度
   */
  WebGLHeatmap.prototype.addPoint = function(x, y, size, intensity) {
    return this.heights.addPoint(x, y, size, intensity);
  };
  /**
   * 添加一组热点
   * @author hy
   * @DateTime 2019-12-31
   * @param    {array}   items      
   */
  WebGLHeatmap.prototype.addPoints = function(items) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      _results.push(this.addPoint(item.x, item.y, item.size, item.intensity));
    }
    return _results;
  };
  /**
   * 更新热力渐变纹理
   * @author hy
   * @DateTime 2019-12-31
   * @param    {object}   texture 纹理
   */
  WebGLHeatmap.prototype.uploadGradientTexture = function (texture) {
    var textureGradient = this.gradientTexture;
    if (typeof texture === 'string') {
      var image = new Image();
      image.onload = function() {
        return textureGradient.bind().upload(image);
      };
      image.src = texture;
    } else {
      if (texture.width > 0 && texture.height > 0) {
        textureGradient.bind().upload(texture);
      } else {
        texture.onload = function() {
          return textureGradient.bind().upload(texture);
        };
      }
    }
  }
  return WebGLHeatmap;

})();

/**
 * webgl 3d热力组件类
 */

export class HeatmapGL extends WebGLHeatmap {
  constructor(options) {
    super({
      gl: options.gl,
      intensityToAlpha: true,
      useGradienTexture:true
    });
    var _this = this;
    this.visible = true;
    this.features = [];
    this.map = options.map;
    this.config = {
      blur: 33,
      colors:["#2F65B3", "#0ff", "#37EF37", "#EBEB3C", "#E43838"],
      field: "objectid",
      opacity: 1,
      maxHeight:0,
      radius: 35
    };
    this.setStyle(options.style);
    this._resize = function(){
      _this.adjustSize();
    };
    this.map.on("resize",this._resize);
  }

  /**
   * 渲染
   * @author hy
   * @DateTime 2019-12-06
   */
  render(gl,view_matrix){

    var matrix_gray = matrix_set.getProjMatrix.call(this.map.transform,this.heights.width,this.heights.height,4.5);
    var matrix_display = matrix_set.getProjMatrix.call(this.map.transform,this.heights.width,this.heights.height,1);

    var resolution = 1.4062500000000002 / Math.pow(2,this.map.getZoom());

    var bounds = this.map.getBounds().toArray();
    var extent = bounds[0].concat(bounds[1]);

    var padding = resolution * 200;

    extent[0] -= padding;
    extent[1] -= padding;
    extent[2] += padding;
    extent[3] += padding;

    extent[0] = extent[0] < -180 ? -180 : extent[0];
    extent[1] = extent[1] < -85 ?  -85  : extent[1];
    extent[2] = extent[2] > 180 ? 180 : extent[2];
    extent[3] = extent[3] > 85 ? 85 : extent[3];
    this.matrix = view_matrix;
    this.resolution = resolution;
    this.extent = extent;
    if(this.visible){
      this.update(matrix_gray,resolution,extent);
      this.display(view_matrix,matrix_display,extent);
    }
  }
  /**
   * 设置热力数据
   * @author hy
   * @DateTime 2019-12-06
   */
  setSource(data){
    this.clearSource();
    if(data && data.features){
      this.features = data.features;
      var features = data.features,len = data.features.length;
      var items = [];
      var coords,type,i,j,properties; 
      var field = this.config.field;
      var radius = 0;
      var maxRadius = this.config.radius;
      var intensity = (this.config.blur / 50) || 0;
      for (i = 0; i < len; i++) {
        coords = features[i].geometry.coordinates;
        type = features[i].geometry.type;
        if(features[i] && field){
          properties = features[i].properties;
          if(field in properties){
            radius = maxRadius * properties[field + "_rat"];
          }
        }else{
          radius = maxRadius;
        }
        if(type == "MultiPoint"){
          for (j = coords.length - 1; j >= 0 ; j --) {
            items.push({
              x:coords[j][0],
              y:coords[j][1],
              size:radius,
              intensity:intensity || 0
            });
          }
        }else{
          items.push({
            x:coords[0],
            y:coords[1],
            size:radius,
            intensity:intensity || 0
          });
        }
      }
      var buffLen = items.length * 6 * 8;
      this.heights.vertexBufferData = new Float32Array(buffLen);
      this.addPoints(items);
      this.map.triggerRepaint();
    }
  }
  /**
   * 清除数据
   * @author hy
   * @DateTime 2019-12-06
   */
  clearSource(){
    this.heights.vertexBufferData = new Float32Array();
    this.heights.pointCount = 0;
    this.heights.bufferIndex = 0;
    this.map.triggerRepaint();
    //this.render(this.gl,this.matrix);
  }
  /**
   * 销毁热力图
   * @author hy
   * @DateTime 2019-12-09
   */
  destroy(){
    this.clearSource();
    this.map.off("resize",this._resize);
    this.heights.pixels = null;
  }
  /**
   * 设置热力显示隐藏
   * @author hy
   * @DateTime 2019-12-09
   * @param    {boolean}   visible 显示隐藏
   */
  setVisible(visible){
    this.visible = visible;
    this.map.triggerRepaint();
  }
  /**
   * 更新字段
   * @author hy
   * @DateTime 2019-12-09
   */
  setField(style){
    var type = style.type;
    var field = style.field;
    if(type == "weight" && field && field != '权重字段'){
      this.config.field = field;
    }else{
      this.config.field = "";
    }
  }
  /**
   * 设置热力样式
   * @author hy
   * @DateTime 2019-12-09
   */
  setStyle(style){
    this.setField(style);
    this.setRadius(style.radius);
    this.setBlur(style.blur);
    this.setOpacity(style.opacity);
    this.setGradient(style.colors);
    this.setMaxHeight(style.height);
  }
  /**
   * 设置高度
   * @author hy
   * @DateTime 2019-12-30
   */
  setMaxHeight(height){
    this.config.maxHeight = (height || 0) * 1000;
    this.map.triggerRepaint();
  }
  /**
   * 设置热力渐变色
   * @author hy
   * @DateTime 2019-12-30
   */
  setGradient(colors){
    this.config.colors = colors || this.config.colors;
    var canvas = document.createElement("canvas"),width = 200,height=50;
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext("2d");
    var linearGradient = context.createLinearGradient(0,0,width,0);
    var gradientColors = ["rgba(255,255,255,0)"];
    gradientColors = gradientColors.concat(this.config.colors);
    linearGradient.addColorStop(0  , gradientColors[0]);
    var i = 1, len = gradientColors.length;
    for (i = 1; i < len; i++) {
      linearGradient.addColorStop(i / (len - 1), gradientColors[i]);
    }
    context.fillStyle = linearGradient;
    context.fillRect(0,0,width,height);
    this.uploadGradientTexture(canvas);
  }
  /**
   * 设置半径
   * @author hy
   * @DateTime 2019-12-09
   * @param    {number}   radius 热力半径
   */
  setRadius(radius){
    var field = this.config.field;
    //if(this.config.radius == radius && !field)return;
    var buff = this.heights.vertexBufferData,i = 0,findex;
    var features = this.features,properties,s1,s2,n;
    this.config.radius = radius;
    var maxRadius = radius;
    while(true){
      if(typeof buff[i] === "undefined"){
        break;
      }
      findex = Math.floor(i / 48);
      if(features[findex] && field){
        properties = features[findex].properties;
        if(field in properties){
          radius = maxRadius * properties[field + "_rat"];
        }
      }else{
        radius = maxRadius;
      }

      n = i % 48;
      if( n == 0 ){
        s1 = -1;s2 = -1;
      }else if(n % 40 == 0){
        s1 = 1;s2 = 1;
      }else if(n % 32 == 0){
        s1 = 1;s2 = -1;
      }else if(n % 24 == 0){
        s1 = -1;s2 = 1;
      }else if(n % 16 == 0){
        s1 = -1;s2 = 1;
      }else if(n % 8 == 0){
        s1 = 1;s2 = -1;
      }

      buff[i + 2] = s1 * radius;
      buff[i + 3] = s2 * radius;

      i += 8;
    }
    
    this.map.triggerRepaint();
  }
  /**
   * 密度
   * @author hy
   * @DateTime 2019-12-09
   */
  setBlur(blur){
    if(this.config.blur == blur)return;
    var intensity = blur / 50;
    var buff = this.heights.vertexBufferData,i = 0;
    while(true){
      if(typeof buff[i] === "undefined"){
        break;
      }
      buff[i + 4] = intensity;
      buff[i + 5] = intensity;
      buff[i + 6] = intensity;
      buff[i + 7] = intensity;
      i += 8;
    }
    this.config.blur = blur;
    this.map.triggerRepaint();
  }
  /**
   * 透明度
   * @author hy
   * @DateTime 2019-12-09
   * @param {number} opacity 透明度
   */
  setOpacity(opacity){
    if(this.config.opacity == opacity)return;
    this.config.opacity = Number(opacity);
    this.map.triggerRepaint();
  }
}