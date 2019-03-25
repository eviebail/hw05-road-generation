import { vec3 } from "gl-matrix";

export default class Edge {
    v1 : vec3;
    v2 : vec3;
    forward : vec3;
    right : vec3;
    up : vec3;
    direction : vec3;
    length : number;
    width : number;

    constructor(origin : vec3, direction : vec3, length : number, width : number) {
        this.v1 = origin;
        this.direction = direction;
        this.length = length;
        this.width = width;
        this.v2 = vec3.create();
        let endpt = vec3.fromValues(0,0,0);
        let o = vec3.fromValues(direction[0], direction[1], direction[2]);
        vec3.mul(o,o,vec3.fromValues(length, length, length));
        vec3.add(endpt, this.v1, o);
        this.v2 = vec3.fromValues(endpt[0], endpt[1], endpt[2]);
    }

    setAxes(f : vec3, r : vec3, u : vec3) {
        this.forward = vec3.fromValues(f[0], f[1], f[2]);
        this.right = vec3.fromValues(r[0], r[1], r[2]);
        this.up = vec3.fromValues(u[0], u[1], u[2]);
    }

}