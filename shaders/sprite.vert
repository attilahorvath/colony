uniform mat4 projection;
uniform mat4 view;

attribute vec3 vertex0Position;
attribute vec2 vertex1Size;
attribute vec4 vertex2TexCoord;

varying vec2 size;
varying vec4 texCoord;

void main() {
  gl_Position = projection * view * vec4(vertex0Position, 1.0);
  gl_PointSize = max(vertex1Size.x, vertex1Size.y);

  size = vertex1Size;
  texCoord = vertex2TexCoord;
}
