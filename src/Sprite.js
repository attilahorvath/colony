export default class {
  constructor() {
    this.active = false;
  }

  init(x, y, width, height, u1, v1, u2, v2) {
    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.u1 = u1;
    this.v1 = v1;
    this.u2 = u2;
    this.v2 = v2;

    this.active = true;
  }
}
