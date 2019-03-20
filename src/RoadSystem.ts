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
    height : number;
    width : number;

    constructor(data : Uint8Array, numIter : number, screenHeight : number, screenWidth : number) {
        this.current = 0;
        this.numIterations = numIter;
        this.heightDensityData = new Uint8Array(data.length);
        this.height = screenHeight;
        this.width = screenWidth;
        for (let i = 0; i < data.length; i++) {
            this.heightDensityData[i] = data[i];
        }
        this.turtleHistory.push(new Turtle());
        while (this.isInWater(this.turtleHistory[0].position)) {
            this.turtleHistory.pop();
            this.turtleHistory.push(new Turtle());
        }
    }
    runSystem() : vec3[][] {
        let pos = this.draw();
        return pos;
    }

    isInWater(p : vec3) : boolean {
        let pos = vec3.fromValues(p[0], p[1], p[2]);
        vec3.add(pos, pos, vec3.fromValues(1.0,1.0,1.0));
        vec3.mul(pos, pos, [0.5, 0.5,0.5]);
        vec3.mul(pos, pos, [this.width, this.height, 1.0]);
        //(x + width*y) for indexing! (also *4 w/o converting to vec4s)
        let x = Math.floor(pos[0]);
        let y = Math.floor(pos[1]);
        var green = this.heightDensityData[(x + this.width * y)*4.0 + 1.0];
        var blue = this.heightDensityData[(x + this.width * y)*4.0 + 2.0];

        console.log("Blue: " + blue + " : Green " + green);
        
        if (blue > green) {
            return true;
        } else {
            return false;
        }
    }

    densityValue(p: vec3) : number {
        let pos = vec3.fromValues(p[0], p[1], p[2]);
        vec3.add(pos, pos, vec3.fromValues(1.0,1.0,1.0));
        vec3.mul(pos, pos, [0.5, 0.5,0.5]);
        vec3.mul(pos, pos, [this.width, this.height, 1.0]);
        //(x + width*y) for indexing! (also *4 w/o converting to vec4s)
        let x = Math.floor(pos[0]);
        let y = Math.floor(pos[1]);
        var density = this.heightDensityData[(x + this.width * y)*4.0 + 3.0];
        return density;
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

        //place a road at the initial position!
        pos.push(vec3.fromValues(t.position[0], t.position[1], t.position[2]));
        r1.push(vec3.fromValues(1, 0, 0));
        r2.push(vec3.fromValues(0,1,0));
        r3.push(vec3.fromValues(0,0,1));
        scale.push(vec3.fromValues(t.scale[0], t.scale[1], t.scale[2]));
        depth.push(vec3.fromValues(t.depth, t.depth, t.depth));

        //grow towards population!
        let pos1 = new Turtle();
        pos1.copy(t);
        pos1.moveForward(0.1);
        let d1 : number = this.densityValue(pos1.position);

        let pos2 = new Turtle();
        pos2.copy(t);
        pos2.moveRotate(1, 45.0);
        pos2.moveForward(0.1);
        let d2 : number = this.densityValue(pos2.position);

        if (d1 < d2) {
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
        } else {
            this.rotateTurtle(45.0);
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
        }

        
        // let p = this.moveForward();
        // var water = this.isInWater(vec3.fromValues(p[0][0], p[0][1], p[0][2]));
        // //also check endpoint!
        // let endpt = vec3.fromValues(0,0,0);
        
        // let o = vec3.fromValues(t.orientation[0], t.orientation[1], t.orientation[2]);
        // vec3.mul(o,o,p[4]);
        // vec3.add(endpt, p[0], o);
        // var endwater = this.isInWater(endpt);

        
        
        let container : vec3[][] = new Array();
        container.push(pos);
        container.push(r1);
        container.push(r2);
        container.push(r3);
        container.push(scale);
        container.push(depth);
        return container;
    }

    moveForward() : vec3[] {
        let t = this.turtleHistory[this.turtleHistory.length - 1];
        t.moveForward(0.1);
        //console.log("hi!");
        //console.log("Moving along curr forward: (" + t.forward[0] + ", " + t.forward[1] + ", " + t.forward[2] + ")");

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