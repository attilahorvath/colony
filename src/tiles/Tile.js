export default class {
  constructor(x, y, sprite, passable) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.passable = passable;

    this.parent = null;
    this.gScore = Number.MAX_SAFE_INTEGER;
  }

  reset() {
    this.parent = null;
    this.gScore = Number.MAX_SAFE_INTEGER;
  }

  fScore(t) {
    return this.gScore + this.hScore(t);
  }

  hScore(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y);
  }

  distance(t) {
    return Math.sqrt((this.x - t.x) * (this.x - t.x)
                   + (this.y - t.y) * (this.y - t.y));
  }
}
