precision highp float;

uniform sampler2D tex;
uniform vec2 texBounds;

varying vec2 size;
varying vec4 texCoord;

void main() {
  vec2 correction = size.x < size.y ? vec2(size.y / size.x, 1.0)
                                    : vec2(1.0, size.x / size.y);

  vec2 spriteCoord = (gl_PointCoord - 0.5) * correction + 0.5;

  if (spriteCoord.x < 0.0 || spriteCoord.y < 0.0 ||
      spriteCoord.x > 1.0 || spriteCoord.y > 1.0) {
    discard;
  }

  vec2 uv = mix(texCoord.xy / texBounds, texCoord.zw / texBounds, spriteCoord);

  gl_FragColor = texture2D(tex, uv);
}
