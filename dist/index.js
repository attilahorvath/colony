(function () {
  'use strict';

  var spriteVertexShader = "uniform mat4 projection;uniform mat4 view;attribute vec3 vertex0Position;attribute vec2 vertex1Size;attribute vec4 vertex2TexCoord;varying vec2 size;varying vec4 texCoord;void main(){gl_Position=projection*view*vec4(vertex0Position,1.0);gl_PointSize=max(vertex1Size.x,vertex1Size.y);size=vertex1Size;texCoord=vertex2TexCoord;}";

  var spriteFragmentShader = "precision highp float;uniform sampler2D tex;uniform vec2 texBounds;varying vec2 size;varying vec4 texCoord;void main(){vec2 correction=size.x<size.y ? vec2(size.y/size.x,1.0): vec2(1.0,size.x/size.y);vec2 spriteCoord=(gl_PointCoord-0.5)*correction+0.5;if(spriteCoord.x<0.0||spriteCoord.y<0.0||spriteCoord.x>1.0||spriteCoord.y>1.0){discard;}vec2 uv=mix(texCoord.xy/texBounds,texCoord.zw/texBounds,spriteCoord);gl_FragColor=texture2D(tex,uv);}";

  class Shader {
    constructor(gl, vertexShaderSource, fragmentShaderSource) {
      this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(this.vertexShader, vertexShaderSource);
      gl.compileShader(this.vertexShader);

      this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(this.fragmentShader, fragmentShaderSource);
      gl.compileShader(this.fragmentShader);

      this.program = gl.createProgram();
      gl.attachShader(this.program, this.vertexShader);
      gl.attachShader(this.program, this.fragmentShader);
      gl.linkProgram(this.program);

      this.uniforms = this.loadUniforms(gl);
      this.attributes = this.loadAttributes(gl);

      this.size = this.attributes.reduce((sum, a) => sum + a.size, 0);
      this.stride = this.size * Float32Array.BYTES_PER_ELEMENT;
    }

    loadUniforms(gl) {
      const numUniforms = gl.getProgramParameter(this.program,
        gl.ACTIVE_UNIFORMS);

      return [...Array(numUniforms)].map((_, i) => {
        const uniform = gl.getActiveUniform(this.program, i);
        const location = gl.getUniformLocation(this.program, uniform.name);

        this[uniform.name] = null;

        return { type: uniform.type, name: uniform.name, location };
      });
    }

    loadAttributes(gl) {
      const numAttributes = gl.getProgramParameter(this.program,
        gl.ACTIVE_ATTRIBUTES);

      return [...Array(numAttributes)].map((_, i) => {
        const attribute = gl.getActiveAttrib(this.program, i);
        const location = gl.getAttribLocation(this.program, attribute.name);
        const size = this.constructor.attributeSize(gl, attribute.type);

        return { name: attribute.name, location, size };
      }).sort((a, b) => a.name.localeCompare(b.name));
    }

    use(gl) {
      gl.useProgram(this.program);

      this.useAttributes(gl);
      this.useUniforms(gl);
    }

    useAttributes(gl) {
      let offset = 0;

      this.attributes.forEach((attribute) => {
        gl.enableVertexAttribArray(attribute.location);
        gl.vertexAttribPointer(attribute.location, attribute.size, gl.FLOAT,
          false, this.stride, offset);

        offset += attribute.size * Float32Array.BYTES_PER_ELEMENT;
      });
    }

    useUniforms(gl) {
      this.uniforms.forEach((uniform) => {
        switch (uniform.type) {
          case gl.FLOAT:
            gl.uniform1f(uniform.location, this[uniform.name]);
            break;
          case gl.FLOAT_VEC2:
            gl.uniform2fv(uniform.location, this[uniform.name]);
            break;
          case gl.FLOAT_VEC3:
            gl.uniform3fv(uniform.location, this[uniform.name]);
            break;
          case gl.FLOAT_VEC4:
            gl.uniform4fv(uniform.location, this[uniform.name]);
            break;
          case gl.FLOAT_MAT2:
            gl.uniformMatrix2fv(uniform.location, false, this[uniform.name]);
            break;
          case gl.FLOAT_MAT3:
            gl.uniformMatrix3fv(uniform.location, false, this[uniform.name]);
            break;
          case gl.FLOAT_MAT4:
            gl.uniformMatrix4fv(uniform.location, false, this[uniform.name]);
            break;
          default:
            break;
        }
      });
    }

    static attributeSize(gl, type) {
      switch (type) {
        case gl.FLOAT:
          return 1;
        case gl.FLOAT_VEC2:
          return 2;
        case gl.FLOAT_VEC3:
          return 3;
        case gl.FLOAT_VEC4:
          return 4;
        case gl.FLOAT_MAT2:
          return 4;
        case gl.FLOAT_MAT3:
          return 9;
        case gl.FLOAT_MAT4:
          return 16;
        default:
          return 0;
      }
    }
  }

  class Renderer {
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

  class Sprite {
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

  const MAX_SPRITES = 1000;

  class SpriteSheet {
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

  class Tile {
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

  class Ground extends Tile {
    constructor(x, y, spriteSheet) {
      const sprite = spriteSheet.spawn(x * 25, y * 25, 25, 25, 0, 0, 24, 24);

      super(x, y, sprite, true);
    }
  }

  class Water extends Tile {
    constructor(x, y, spriteSheet) {
      const sprite = spriteSheet.spawn(x * 25, y * 25, 25, 25, 50, 0, 74, 24);

      super(x, y, sprite, false);
    }
  }

  class TileMap {
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

  class Cursor {
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

  class Settler {
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

  class Game {
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

  window.game = new Game();
  window.game.run();

}());
