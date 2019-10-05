import glsl from 'rollup-plugin-glsl';
import { terser } from 'rollup-plugin-terser';

const release = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'iife'
  },
  plugins: [
    glsl({
      include: 'shaders/**/*.{vert,frag}'
    }),
    release && terser()
  ]
}
