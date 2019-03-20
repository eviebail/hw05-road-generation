import {vec3} from 'gl-matrix';
import {mat3} from 'gl-matrix';
import {vec4} from 'gl-matrix';
import {quat} from 'gl-matrix';

export default class Turtle {
    position : vec3;
    orientation : vec3;
    forward : vec3;
    right : vec3;
    up : vec3;
    depth : number;
    scale : vec3;


  constructor() {
    this.position = vec3.fromValues(0,0,0);
    this.orientation = vec3.fromValues(0,1,0);
    this.forward = vec3.fromValues(0,1,0);
    this.right = vec3.fromValues(1,0,0);
    this.up = vec3.fromValues(0,0,1);
    this.scale = vec3.fromValues(0.01,0.1,1.0);
    this.depth = 0.0;
  }

  copy(t : Turtle) {
    this.position = vec3.fromValues(t.position[0], t.position[1], t.position[2]);
    this.orientation = vec3.fromValues(t.orientation[0], t.orientation[1], t.orientation[2]);
    this.forward = vec3.fromValues(t.forward[0], t.forward[1], t.forward[2]);
    this.right = vec3.fromValues(t.right[0], t.right[1], t.right[2]);
    this.up = vec3.fromValues(t.up[0], t.up[1], t.up[2]);
    this.depth = t.depth;
  }

  rescale(s : vec3) {
    this.scale = vec3.fromValues(s[0], s[1], s[2]);
  }

  increaseDepth() {
    this.depth += 1.0;
  }

  update(pos: vec3, orient: vec3, forward: vec3, right : vec3, up : vec3) {
    this.position = pos;
    this.orientation = orient;
    this.forward = forward;
    this.right = right;
    this.up = up;
  }

  moveForward(amount : number) {
    this.position[0] = this.position[0] + amount * this.forward[0];
    this.position[1] = this.position[1] + amount * this.forward[1];
    this.position[2] = this.position[2] + amount * this.forward[2];
  }

  moveRotate(axis : number, phi : number) {
      switch(axis) {
        case 1: {
          //about up
          this.up = vec3.normalize(this.up, this.up);
          let q = quat.fromValues(this.up[0], this.up[1], this.up[2], phi * Math.PI / 180.0);
          let theta = phi * Math.PI / 180.0;
          //rodrigues formula
          let r00 = Math.cos(theta) + this.up[0]*this.up[0]*(1.0 - Math.cos(theta));
          let r01 = -this.up[2]*Math.sin(theta) + this.up[0]*this.up[1]*(1.0 - Math.cos(theta));
          let r02 = this.up[1]*Math.sin(theta) + this.up[0]*this.up[2]*(1.0 - Math.cos(theta));

          let r10 = this.up[2]*Math.sin(theta) + this.up[0]*this.up[1]*(1.0 - Math.cos(theta));
          let r11 = Math.cos(theta) + this.up[1]*this.up[1]*(1.0 - Math.cos(theta));
          let r12 = this.up[0]*Math.sin(theta) + this.up[1]*this.up[2]*(1.0 - Math.cos(theta));

          let r20 = -this.up[1]*Math.sin(theta) + this.up[0]*this.up[2]*(1.0 - Math.cos(theta));
          let r21 = this.up[0]*Math.sin(theta) + this.up[1]*this.up[2]*(1.0 - Math.cos(theta));
          let r22 = Math.cos(theta) + this.up[2]*this.up[2]*(1.0 - Math.cos(theta));

          let m : mat3 = mat3.fromValues(r00,r01,r02,r10,r11,r12,r20,r21,r22);
          vec3.transformMat3(this.orientation, this.orientation, m);
          vec3.transformMat3(this.right, this.right, m);
          vec3.transformMat3(this.forward, this.forward, m);
          break;
        }
        case 2: {
          //about right
          this.right = vec3.normalize(this.right, this.right);
          let theta = phi * Math.PI / 180.0;
          //rodrigues formula
          let r00 = Math.cos(theta) + this.right[0]*this.right[0]*(1.0 - Math.cos(theta));
          let r01 = -this.right[2]*Math.sin(theta) + this.right[0]*this.right[1]*(1.0 - Math.cos(theta));
          let r02 = this.right[1]*Math.sin(theta) + this.right[0]*this.right[2]*(1.0 - Math.cos(theta));

          let r10 = this.right[2]*Math.sin(theta) + this.right[0]*this.right[1]*(1.0 - Math.cos(theta));
          let r11 = Math.cos(theta) + this.right[1]*this.right[1]*(1.0 - Math.cos(theta));
          let r12 = this.right[0]*Math.sin(theta) + this.right[1]*this.right[2]*(1.0 - Math.cos(theta));

          let r20 = -this.right[1]*Math.sin(theta) + this.right[0]*this.right[2]*(1.0 - Math.cos(theta));
          let r21 = this.right[0]*Math.sin(theta) + this.right[1]*this.right[2]*(1.0 - Math.cos(theta));
          let r22 = Math.cos(theta) + this.right[2]*this.right[2]*(1.0 - Math.cos(theta));

          let m : mat3 = mat3.fromValues(r00,r01,r02,r10,r11,r12,r20,r21,r22);
          vec3.transformMat3(this.orientation, this.orientation, m);
          vec3.transformMat3(this.up, this.up, m);
          vec3.transformMat3(this.forward, this.forward, m);
          break;
        }
      }
    
  }


}