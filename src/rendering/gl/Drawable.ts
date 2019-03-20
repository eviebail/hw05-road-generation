import {gl} from '../../globals';

abstract class Drawable {
  count: number = 0;

  bufIdx: WebGLBuffer;
  bufPos: WebGLBuffer;
  bufNor: WebGLBuffer;
  bufTranslate: WebGLBuffer;
  bufCol: WebGLBuffer;
  bufUV: WebGLBuffer;
  bufR1: WebGLBuffer;
  bufR2 : WebGLBuffer;
  bufR3 : WebGLBuffer;
  bufScale : WebGLBuffer;

  idxGenerated: boolean = false;
  posGenerated: boolean = false;
  norGenerated: boolean = false;
  colGenerated: boolean = false;
  translateGenerated: boolean = false;
  uvGenerated: boolean = false;
  r1Generated: boolean = false;
  r2Generated : boolean = false;
  r3Generated : boolean = false;
  scaleGenerated : boolean = false;

  numInstances: number = 0; // How many instances of this Drawable the shader program should draw

  abstract create() : void;

  destory() {
    gl.deleteBuffer(this.bufIdx);
    gl.deleteBuffer(this.bufPos);
    gl.deleteBuffer(this.bufNor);
    gl.deleteBuffer(this.bufCol);
    gl.deleteBuffer(this.bufTranslate);
    gl.deleteBuffer(this.bufUV);
    gl.deleteBuffer(this.bufR1);
    gl.deleteBuffer(this.bufR2);
    gl.deleteBuffer(this.bufR3);
    gl.deleteBuffer(this.bufScale);
  }

  generateIdx() {
    this.idxGenerated = true;
    this.bufIdx = gl.createBuffer();
  }

  generatePos() {
    this.posGenerated = true;
    this.bufPos = gl.createBuffer();
  }

  generateNor() {
    this.norGenerated = true;
    this.bufNor = gl.createBuffer();
  }

  generateCol() {
    this.colGenerated = true;
    this.bufCol = gl.createBuffer();
  }

  generateTranslate() {
    this.translateGenerated = true;
    this.bufTranslate = gl.createBuffer();
  }

  generateUV() {
    this.uvGenerated = true;
    this.bufUV = gl.createBuffer();
  }

  generateR1() {
    this.r1Generated = true;
    this.bufR1 = gl.createBuffer();
  }

  generateR2() {
    this.r2Generated = true;
    this.bufR2 = gl.createBuffer();
  }

  generateR3() {
    this.r3Generated = true;
    this.bufR3 = gl.createBuffer();
  }

  generateScale() {
    this.scaleGenerated = true;
    this.bufScale = gl.createBuffer();
  }

  bindIdx(): boolean {
    if (this.idxGenerated) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    }
    return this.idxGenerated;
  }

  bindPos(): boolean {
    if (this.posGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    }
    return this.posGenerated;
  }

  bindNor(): boolean {
    if (this.norGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    }
    return this.norGenerated;
  }

  bindCol(): boolean {
    if (this.colGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    }
    return this.colGenerated;
  }

  bindTranslate(): boolean {
    if (this.translateGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    }
    return this.translateGenerated;
  }

  bindUV(): boolean {
    if (this.uvGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    }
    return this.uvGenerated;
  }

  bindR1(): boolean {
    if (this.r1Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufR1);
    }
    return this.r1Generated;
  }

  bindR2(): boolean {
    if (this.r2Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufR2);
    }
    return this.r2Generated;
  }

  bindR3(): boolean {
    if (this.r3Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufR3);
    }
    return this.r3Generated;
  }

  bindScale(): boolean {
    if (this.scaleGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufScale);
    }
    return this.scaleGenerated;
  }

  elemCount(): number {
    return this.count;
  }

  drawMode(): GLenum {
    return gl.TRIANGLES;
  }

  setNumInstances(num: number) {
    this.numInstances = num;
  }
};

export default Drawable;
