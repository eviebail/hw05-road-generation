import Turtle from "./Turtle";
import {vec3} from 'gl-matrix';
import {vec4} from 'gl-matrix';
import {mat4} from 'gl-matrix';
import {quat} from 'gl-matrix';

export default class RoadSystem {
    current : number;
    turtleHistory : Turtle[] = new Array();
    matrixData : Turtle[] = new Array();
    numIterations : number;
    heightDensityData : Uint8Array;

    constructor(data : Uint8Array, numIter : number) {
        this.current = 0;
        this.numIterations = numIter;
        this.turtleHistory.push(new Turtle());
        this.heightDensityData = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            this.heightDensityData[i] = data[i];
        }
    }

    draw() : vec3[][] {
        //let value = this.heightDensityData[0];
        // console.log("/////" + value[0] + ", " + value[1] + ", " + value[2]);
        //take the grammar and convert it to executable functions!
        let pos : vec3[] = new Array();
        let r1 : vec3[] = new Array();
        let r2 : vec3[] = new Array();
        let r3 : vec3[] = new Array();
        let scale : vec3[] = new Array();
        let depth : vec3[] = new Array();

        let t : Turtle = this.turtleHistory[this.turtleHistory.length - 1.0];

        
        let p = this.moveForward();
        if (p[0][0] != -1) {
            //pos forward right up
            pos.push(p[0]);
            r1.push(p[1]);
            r2.push(p[2]);
            r3.push(p[3]);
            scale.push(p[4]);
            depth.push(p[5]);
        }

        this.save();

        this.rotateTurtle(20.0);

        let b = this.moveForward();
        if (b[0][0] != -1) {
            //pos forward right up
            //console.log("Hi?" + p[0][0] + ", " + p[0][1] + ", " + p[0][2]);
            pos.push(b[0]);
            r1.push(b[1]);
            r2.push(b[2]);
            r3.push(b[3]);
            scale.push(b[4]);
            depth.push(b[5]);
        }

        this.reset();

        let r = this.moveForward();
        if (r[0][0] != -1) {
            //pos forward right up
            //console.log("Hi?" + p[0][0] + ", " + p[0][1] + ", " + p[0][2]);
            pos.push(r[0]);
            r1.push(r[1]);
            r2.push(r[2]);
            r3.push(r[3]);
            scale.push(r[4]);
            depth.push(r[5]);
        }
        
        let container : vec3[][] = new Array();
        container.push(pos);
        container.push(r1);
        container.push(r2);
        container.push(r3);
        container.push(scale);
        container.push(depth);
        return container;
    }

    runSystem() : vec3[][] {
        let pos = this.draw();
        return pos;
    }

    moveForward() : vec3[] {
        let t = this.turtleHistory[this.turtleHistory.length - 1];
        t.moveForward(0.1);
        console.log("hi!");
        console.log("Moving along curr forward: (" + t.forward[0] + ", " + t.forward[1] + ", " + t.forward[2] + ")");

        this.turtleHistory[this.turtleHistory.length - 1] = t;
        let tPos = vec3.fromValues(t.position[0], t.position[1], t.position[2]);
        let tScale = vec3.fromValues(t.scale[0], t.scale[1], t.scale[2]);

        let rotation : mat4 = mat4.fromValues(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
        let angle = vec3.dot(t.orientation, vec3.fromValues(0,1,0));
        let axis = vec3.fromValues(0,0,0);
        vec3.cross(axis, t.orientation, vec3.fromValues(0,1,0));
        mat4.rotate(rotation, rotation, angle, axis);
        let r1 = vec3.fromValues(rotation[0], rotation[1], rotation[2]);
        let r2 = vec3.fromValues(rotation[4], rotation[5], rotation[6]);
        let r3 = vec3.fromValues(rotation[8], rotation[9], rotation[10]);

        //save depth so main knows whether to draw a branch or a leaf
        let depth = vec3.fromValues(t.depth, 0, 0);

        let result = new Array();
        result.push(tPos);
        result.push(r1);
        result.push(r2);
        result.push(r3);
        result.push(tScale);
        result.push(depth);

        return result;
    }

    //case 1 for rotate about up for testing
    rotateTurtle(theta : number) : vec3[] {
        let t = this.turtleHistory[this.turtleHistory.length - 1];
        t.moveRotate(1, theta);
        this.turtleHistory[this.turtleHistory.length - 1] = t;
        let tPos = vec3.fromValues(-1,0,0);
        let result = new Array();
        result.push(tPos);
        return result;
    }
    save() : vec3[] {
        let t = this.turtleHistory[this.turtleHistory.length - 1];
        let newTurtle = new Turtle();
        newTurtle.copy(t);
        newTurtle.increaseDepth();
        this.turtleHistory.push(newTurtle);
        let result = new Array();
        result.push(vec3.fromValues(-1, 0, 0));
        return result;
    }
    reset() : vec3[] {
        let t = this.turtleHistory.pop();
        let result = new Array();
        result.push(vec3.fromValues(-1, 0, 0));
        return result;
    }
}