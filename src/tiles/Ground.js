import Tile from './Tile';

export default class extends Tile {
  constructor(x, y, spriteSheet) {
    const sprite = spriteSheet.spawn(x * 25, y * 25, 25, 25, 0, 0, 24, 24);

    super(x, y, sprite, true);
  }
}
