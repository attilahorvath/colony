import Renderer from './Renderer';
import SpriteSheet from './SpriteSheet';
import TileMap from './TileMap';
import Cursor from './Cursor';
import Settler from './Settler';

export default class {
  constructor() {
    this.width = 500;
    this.height = 500;

    this.renderer = new Renderer(this.width, this.height);
    this.spriteSheet = new SpriteSheet(this.renderer);

    this.map = new TileMap(this.spriteSheet, 10, 10);

    this.settlers = [
      new Settler(this.spriteSheet, this.map, 35, 35),
      new Settler(this.spriteSheet, this.map, 100, 10),
      new Settler(this.spriteSheet, this.map, 53, 210),
      new Settler(this.spriteSheet, this.map, 220, 150),
    ];

    this.cursor = new Cursor(this.renderer.canvas, this.spriteSheet);

    this.lastTime = 0;
    this.running = true;
  }

  run() {
    requestAnimationFrame((timestamp) => this.update(timestamp));
  }

  update(time) {
    if (this.running) {
      requestAnimationFrame((timestamp) => this.update(timestamp));
    }

    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.settlers.forEach((settler) => settler.update(deltaTime));

    this.cursor.update();

    this.draw();
  }

  draw() {
    this.renderer.clear();

    this.spriteSheet.draw();
  }
}
