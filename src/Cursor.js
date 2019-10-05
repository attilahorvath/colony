export default class {
  constructor(canvas, spriteSheet) {
    this.sprite = spriteSheet.spawn(0, 0, 12, 25, 25, 0, 49, 24);

    const canvasRect = canvas.getBoundingClientRect();

    addEventListener('mousemove', (event) => {
      this.x = event.clientX - canvasRect.left;
      this.y = event.clientY - canvasRect.top;
    });
  }

  update() {
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}
