export default class {
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
