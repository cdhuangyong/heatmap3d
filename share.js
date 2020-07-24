/**
 * 透视矩阵
 * @author hy
 * @DateTime 2020-03-03
 * @param    {array}   out    输出
 * @param    {number}   fovy   视野夹角
 * @param    {number}   aspect 视野长宽比
 * @param    {number}   near   近点
 * @param    {number}   far    远点
 * @return   {array}          输出
 */
function perspective(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
      nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }

  return out;
}

/**
 * 4x4矩阵平移
 * @author hy
 * @DateTime 2020-03-03
 * @param    {array}   out 输出
 * @param    {array}   a   矩阵
 * @param    {array}   v   平移向量
 * @return   {array}       输出
 */
function translate(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }

  return out;
}
/**
 * 4x4矩阵缩放
 * @author hy
 * @DateTime 2020-03-03
 * @param    {array}   out 输出
 * @param    {array}   a   矩阵
 * @param    {array}   v   缩放向量
 * @return   {array}       输出
 */
function scale(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * 4x4矩阵X方向旋转
 * @author hy
 * @DateTime 2020-03-03
 * @param    {array}   out 输出
 * @param    {array}   a   矩阵
 * @param    {array}   rad   旋转向量
 * @return   {array}       输出
 */
function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
/**
 * 4x4矩阵Z方向旋转
 * @author hy
 * @DateTime 2020-03-03
 * @param    {array}   out 输出
 * @param    {array}   a   矩阵
 * @param    {array}   rad   旋转向量
 * @return   {array}       输出
 */
function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
/**
 * 计算地图mvp矩阵
 * @author hy
 * @DateTime 2020-03-03
 * @param    {number}   width  宽度
 * @param    {number}   height 高度
 * @param    {number}   ratio  比例
 * @return   {array}           矩阵
 */
function getProjMatrix(width,height,ratio){
    var _pitch = 0;// this._pitch;
    var angle = 0;// this.angle;
    var cameraToCenterDistance = 0.5 / Math.tan(this._fov / 2) * height;
    var halfFov = this._fov / 2;
    var groundAngle = Math.PI / 2 + _pitch;
    var topHalfSurfaceDistance = Math.sin(halfFov) * cameraToCenterDistance / Math.sin(Math.PI - groundAngle - halfFov);
    var point = this.point;
    var x = point.x, y = point.y;
    var furthestDistance = Math.cos(Math.PI / 2 - _pitch) * topHalfSurfaceDistance + cameraToCenterDistance;
    var nearZ = height / 50;
    var farZ = furthestDistance * 1.01;
    var m = new Float64Array(16);
    perspective(m, this._fov, width / height, nearZ, farZ);
    scale(m, m, [1, -1, 1]);
    translate(m, m, [0, 0, -this.cameraToCenterDistance]);
    rotateX(m, m, _pitch);
    rotateZ(m, m, angle);
    translate(m, m, [-x / ratio, -y / ratio, 0]);
    //var worldSize = this.tileSize * this.scale;
    return scale([], m, [this.worldSize / ratio, this.worldSize / ratio, this.worldSize / ratio]);
}

export default {
	scale,
	perspective,
	translate,
	rotateX,
	rotateZ,
	getProjMatrix
}
