import Tile from './Tile';

export default class extends Tile {
  constructor(x, y, spriteSheet) {
    const sprite = spriteSheet.spawn(x * 25, y * 25, 25, 25, 50, 0, 74, 24);

    super(x, y, sprite, false);
  }
}
