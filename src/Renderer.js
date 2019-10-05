import spriteVertexShader from '../shaders/sprite.vert';
import spriteFragmentShader from '../shaders/sprite.frag';

import Shader from './Shader';

export default class {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style['cursor'] = 'none';

    document.body.appendChild(this.canvas);

    this.gl = this.canvas.getContext('webgl', { antialias: false });

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.spriteShader = new Shader(this.gl, spriteVertexShader,
      spriteFragmentShader);

    this.projection = new Float32Array([
      2.0 / this.width, 0.0, 0.0, 0.0,
      0.0, -2.0 / this.height, 0.0, 0.0,
      0.0, 0.0, -1.0, 0.0,
      -1.0, 1.0, 0.0, 1.0,
    ]);

    this.view = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0,
    ]);
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  createVertexBuffer(vertices) {
    const vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    return vertexBuffer;
  }

  updateVertexBuffer(vertexBuffer, vertices) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
  }

  loadTexture(path) {
    const texture = this.gl.createTexture();

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0,
                       this.gl.RGBA, this.gl.UNSIGNED_BYTE,
                       new Uint8Array([0, 0, 255, 255]));

    this.setUpTexture();

    const image = new Image();

    image.addEventListener('load', () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,
                         this.gl.UNSIGNED_BYTE, image);

      this.setUpTexture();
    });

    image.crossOrigin = '';
    image.src = path;

    return texture;
  }

  setUpTexture() {
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S,
                          this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T,
                          this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER,
                          this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER,
                          this.gl.NEAREST);
  }

  applyTexture(texture) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  }

  draw(shader, vertexBuffer, count) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);

    shader.projection = this.projection;
    shader.view = this.view;

    shader.use(this.gl);

    this.gl.drawArrays(this.gl.POINTS, 0, count);
  }
}
