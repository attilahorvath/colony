import Ground from './tiles/Ground';
import Water from './tiles/Water';

export default class {
  constructor(spriteSheet, width, height) {
    this.width = width;
    this.height = height;

    this.tiles = [...Array(height)].map((_y, y) => {
      return [...Array(width)].map((_x, x) => {
        if (Math.random() < 0.7) {
          return new Ground(x, y, spriteSheet);
        } else {
          return new Water(x, y, spriteSheet);
        }
      });
    });
  }

  tileAt(x, y) {
    return this.tiles[Math.floor(y / 25)][Math.floor(x / 25)];
  }

  search(start, finish) {
    this.tiles.forEach((row) => row.forEach((tile) => tile.reset()));

    const openSet = new Set();
    const closedSet = new Set();

    start.gScore = 0;
    openSet.add(start);

    while (openSet.size > 0) {
      let current = null;

      for (const node of openSet.values()) {
        if (!current || node.fScore(finish) < current.fScore(finish)) {
          current = node;
        }
      }

      if (current === finish) {
        const route = [];
        let n = finish;
        while (n) {
          route.push(n);
          n = n.parent;
        }
        return route.reverse();
      }

      openSet.delete(current);
      closedSet.add(current);

      for (let y = current.y - 1; y <= current.y + 1; y++) {
        for (let x = current.x - 1; x <= current.x + 1; x++) {
          if (y < 0 || x < 0 || y >= this.height - 1 || x >= this.width - 1
            || (x === 0 && y === 0)) {
            continue;
          }

          const node = this.tiles[y][x];

          if (closedSet.has(node) || !node.passable) {
            continue;
          }

          const score = current.gScore + current.distance(node);

          if (score < node.gScore) {
            node.parent = current;
            node.gScore = score;
            openSet.add(node);
          }
        }
      }
    }

    return false;
  }
}
