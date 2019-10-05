export default class {
  constructor(spriteSheet, map, x, y) {
    this.x = x;
    this.y = y;

    this.sprite = spriteSheet.spawn(this.x, this.y, 10, 10, 25, 0, 49, 24);
    this.map = map;

    this.tile = null;
    this.target = null;
    this.waypoints = null;
    this.waypointIndex = null;
  }

  update(deltaTime) {
    this.tile = this.map.tileAt(this.x + 5, this.y + 5);

    if (!this.target) {
      this.target = this.map.tiles[4][7];
      this.waypoints = this.map.search(this.tile, this.target);
      this.waypointIndex = 0;

      if (!this.waypoints) {
        this.target = null;
        this.waypointIndex = null;
      }
    }

    if (this.target) {
      if (this.tile === this.target) {
        this.target = null;
        this.waypoints = null;
        this.waypointIndex = null;
      } else {
        if (this.tile === this.waypoints[this.waypointIndex + 1]) {
          this.waypointIndex++;
        }

        const nextWaypoint = this.waypoints[this.waypointIndex + 1];

        let dx = 0;
        let dy = 0;

        if (nextWaypoint.sprite.x < this.x) {
          if (this.tile.passable || this.x + 5 > nextWaypoint.sprite.x + 23) {
            dx--;
          }
        } else if (nextWaypoint.sprite.x > this.x) {
          if (this.tile.passable || this.x + 5 < nextWaypoint.sprite.x + 2) {
            dx++;
          }
        }

        if (nextWaypoint.sprite.y < this.y) {
          if (this.tile.passable || this.y + 5 > nextWaypoint.sprite.y + 23) {
            dy--;
          }
        } else if (nextWaypoint.sprite.y > this.y) {
          if (this.tile.passable || this.y + 5 < nextWaypoint.sprite.y + 2) {
            dy++;
          }
        }

        const d = Math.sqrt(dx * dx + dy * dy);

        dx /= d;
        dy /= d;

        this.x += dx * deltaTime * 0.05;
        this.y += dy * deltaTime * 0.05;
      }
    }

    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}
