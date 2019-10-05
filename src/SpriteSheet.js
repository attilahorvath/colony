import Sprite from './Sprite';

const MAX_SPRITES = 1000;

export default class {
  constructor(renderer) {
    this.renderer = renderer;

    this.sprites = [...Array(MAX_SPRITES)].map(() => new Sprite());

    this.vertices = new Float32Array(this.sprites.length
      * this.renderer.spriteShader.size);

    this.vertexBuffer = this.renderer.createVertexBuffer(this.vertices);

    this.texture = this.renderer.loadTexture('assets/sprites.png');
    this.textureBounds = new Float32Array([128.0, 128.0]);
  }

  spawn(x, y, width, height, u1, v1, u2, v2) {
    const i = this.sprites.findIndex((sprite) => !sprite.active);

    if (i === -1) {
      return false;
    }

    this.sprites[i].init(x, y, width, height, u1, v1, u2, v2);

    return this.sprites[i];
  }

  draw() {
    let i = 0;

    for (const sprite of this.sprites) {
      if (!sprite.active) {
        continue;
      }

      this.vertices[i++] = sprite.x + sprite.width / 2.0;
      this.vertices[i++] = sprite.y + sprite.height / 2.0;
      this.vertices[i++] = 0.0;

      this.vertices[i++] = sprite.width;
      this.vertices[i++] = sprite.height;

      this.vertices[i++] = sprite.u1;
      this.vertices[i++] = sprite.v1;
      this.vertices[i++] = sprite.u2;
      this.vertices[i++] = sprite.v2;
    }

    this.renderer.updateVertexBuffer(this.vertexBuffer, this.vertices);

    this.renderer.applyTexture(this.texture);
    this.renderer.spriteShader.texBounds = this.textureBounds;

    this.renderer.draw(this.renderer.spriteShader, this.vertexBuffer,
      i / this.renderer.spriteShader.size);
  }
}
