import Turtle from "./Turtle";
import {vec2, vec3, mat3} from 'gl-matrix';
import {vec4} from 'gl-matrix';
import {mat4} from 'gl-matrix';
import {quat} from 'gl-matrix';
import Edge from "./Edge";
import Intersection from "./Intersection";

export default class RoadSystem {
    current : number;
    turtleHistory : Turtle[] = new Array();
    matrixData : Turtle[] = new Array();
    edges : Edge[] = new Array<Edge>();
    highways : Edge[] = new Array<Edge>();
    grids : Edge[] = new Array<Edge>();
    numIterations : number;
    heightDensityData : Uint8Array;
    height : number;
    width : number;
    max : number;

    constructor(data : Uint8Array, numIter : number, screenHeight : number, screenWidth : number) {
        this.current = 0;
        this.numIterations = numIter;
        this.heightDensityData = new Uint8Array(data.length);
        this.height = screenHeight;
        this.width = screenWidth;
        for (let i = 0; i < data.length; i++) {
            this.heightDensityData[i] = data[i];
        }
    }

    setMaxLength(length : number) {
        this.max = length;
    }

    runSystem() : vec3[][] {
        let pos = this.drawHighways(0);

        let pos2 = this.drawHighways(1);
        let r1 = pos[0].concat(pos2[0]);
        let r2 = pos[1].concat(pos2[1]);
        let r3 = pos[2].concat(pos2[2]);
        let r4 = pos[3].concat(pos2[3]);
        let r5 = pos[4].concat(pos2[4]);
        let r6 = pos[5].concat(pos2[5]);

        let pos3 = this.drawHighways(2);
        r1 = r1.concat(pos3[0]);
        r2 = r2.concat(pos3[1]);
        r3 = r3.concat(pos3[2]);
        r4 = r4.concat(pos3[3]);
        r5 = r5.concat(pos3[4]);
        r6 = r6.concat(pos3[5]);

        let pos4 = this.drawHighways(3);
        r1 = r1.concat(pos4[0]);
        r2 = r2.concat(pos4[1]);
        r3 = r3.concat(pos4[2]);
        r4 = r4.concat(pos4[3]);
        r5 = r5.concat(pos4[4]);
        r6 = r6.concat(pos4[5]);

        let p = this.drawGrid();
        r1 = r1.concat(p[0]);
        r2 = r2.concat(p[1]);
        r3 = r3.concat(p[2]);
        r4 = r4.concat(p[3]);
        r5 = r5.concat(p[4]);
        r6 = r6.concat(p[5]);

        let result = new Array();

        result.push(r1);
        result.push(r2);
        result.push(r3);
        result.push(r4);
        result.push(r5);
        result.push(r6);

        return result;
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

    inRange(pos : vec3) : boolean {
        if (pos[0] < -1 || pos[0] > 1 || pos[1] < -1 || pos[1] > 1) {
            return false;
        }
        return true;
    }

    intersect(edge : Edge) : boolean {
        let minIsect : Intersection = new Intersection();
        let intersects = false;
        for (let i = 0; i < this.edges.length; i++) {
            let isect : Intersection = new Intersection();
            if (isect.intersect(edge, this.edges[i])) {
                intersects = true;
                //check min dist from origin
                let dist = vec2.dist(vec2.fromValues(edge.v1[0], edge.v1[1]), isect.point);//isect.point
                let dist2 = vec2.dist(vec2.fromValues(edge.v1[0], edge.v1[1]), minIsect.point);
                if (dist < dist2) {
                    minIsect.point = vec2.fromValues(isect.point[0], isect.point[1]);
                }
            }
        }
        if (intersects) {
            let l = vec2.dist(vec2.fromValues(minIsect.point[0], minIsect.point[1]), 
                              vec2.fromValues(edge.v1[0], edge.v1[1]));
            if (l < 0.000001) {
                return false;
            }
            edge.v2 = vec3.fromValues(minIsect.point[0], minIsect.point[1], 1.0);
            edge.length = l;
        }
        return intersects;
    }

    snap(edge : Edge) : boolean {
        let minIsect : Intersection = new Intersection();
        let snaps = false;
        for (let i = 0; i < this.highways.length; i++) {
            let isect : Intersection = new Intersection();
            if (isect.intersect(edge, this.highways[i])) {
                snaps = true;
                //check min dist from origin
                let dist = vec2.dist(vec2.fromValues(edge.v1[0], edge.v1[1]), isect.point);//isect.point
                let dist2 = vec2.dist(vec2.fromValues(edge.v1[0], edge.v1[1]), minIsect.point);
                if (dist < dist2) {
                    minIsect.point = vec2.fromValues(isect.point[0], isect.point[1]);
                }
            }
        }
        if (snaps) {
            let l = vec2.dist(vec2.fromValues(minIsect.point[0], minIsect.point[1]), 
                              vec2.fromValues(edge.v1[0], edge.v1[1]));
            if (l >= 100) {
                return false;
            }
            edge.v2 = vec3.fromValues(minIsect.point[0], minIsect.point[1], 1.0);

            edge.length = l;
        }
        return snaps;
    }

    drawHighways(type : number) : vec3[][] {
        let pos : vec3[] = new Array();
        let r1 : vec3[] = new Array();
        let r2 : vec3[] = new Array();
        let r3 : vec3[] = new Array();
        let scale : vec3[] = new Array();
        let depth : vec3[] = new Array();

        //place a road at the initial position!
        this.turtleHistory.push(new Turtle());
        this.turtleHistory[0].setInitPos(type);

        let max = this.max;

        while (this.turtleHistory.length != 0) {
            if (max <= 0) {
                break;
            }
             var t : Turtle = this.turtleHistory.pop();
             if (max == this.max) {
                t.numBranches = 2;
            }
            if (t.numBranches == 2) {
                let theta1 = 50.0;
                let theta2 = -50.0;
                
                var t1 = new Turtle();
                t1.copy(t);
                var t2 = new Turtle();
                t2.copy(t);
                
                var terminate : boolean = false;
                
                let endpt = vec3.fromValues(0,0,0);
                let o = vec3.fromValues(t1.orientation[0], t1.orientation[1], t1.orientation[2]);
                vec3.mul(o,o,vec3.fromValues(t1.scale[1], t1.scale[1], t1.scale[1]));
                vec3.add(endpt, t1.position, o);
                let inRange1 = this.inRange(t1.position) && this.inRange(endpt);
                let w1 = this.isInWater(t1.position) && this.isInWater(endpt); 
                let p = this.rotateTurtle(theta1, t1);
                     
                if (inRange1 && !w1) {
                    let e = new Edge(t1.position, t1.orientation, t1.scale[1], t1.scale[0]);
                    let old = e.length;
                    if (this.intersect(e)) {
                        terminate = true;
                    }
                    if(e.length < old) {
                        scale.push(vec3.fromValues(t1.scale[0],e.length,t1.scale[2]));
                        t1.scale[1] = e.length;
                        
                    } else {
                        scale.push(vec3.fromValues(t1.scale[0],t1.scale[1],t1.scale[2]));
                    }
                    pos.push(p[0]);
                    r1.push(p[1]);
                    r2.push(p[2]);
                    r3.push(p[3]);
                    depth.push(p[5]);

                    if (!terminate) {
                            //change the position to the endpoint before pushing back!
                            let endpt = vec3.fromValues(0,0,0);
                            let o = vec3.fromValues(t1.orientation[0], t1.orientation[1], t1.orientation[2]);
                            vec3.mul(o,o,vec3.fromValues(t1.scale[1], t1.scale[1], t1.scale[1]));
                            vec3.add(endpt, t1.position, o);
                            t1.position = vec3.fromValues(endpt[0], endpt[1], endpt[2]);
                            this.turtleHistory.push(t1);
                    } 
                    e.setAxes(t1.forward, t1.right, t1.up);
                    this.edges.push(e);
                    this.highways.push(e);
                }

                endpt = vec3.fromValues(0,0,0);
                o = vec3.fromValues(t2.orientation[0], t2.orientation[1], t2.orientation[2]);
                vec3.mul(o,o,vec3.fromValues(t2.scale[1], t2.scale[1], t2.scale[1]));
                vec3.add(endpt, t2.position, o);
                let inRange2 = this.inRange(t2.position) && this.inRange(endpt);
                let w2 = this.isInWater(t2.position) && this.isInWater(endpt); 
                p = this.rotateTurtle(theta2, t2);
                terminate = false;
                if (inRange2 && !w2) {
                    let e = new Edge(t2.position, t2.orientation, t2.scale[1], t2.scale[0]);
                    let old = e.length;
                    if (this.intersect(e)) {
                        terminate = true;
                    }
                    if(e.length < old) {
                        scale.push(vec3.fromValues(t2.scale[0],e.length,t2.scale[2]));
                        t2.scale[1] = e.length;
                    } else {
                        scale.push(vec3.fromValues(t2.scale[0],t2.scale[1],t2.scale[2]));
                    }
                    pos.push(p[0]);
                    r1.push(p[1]);
                    r2.push(p[2]);
                    r3.push(p[3]);
                    depth.push(p[5]);

                    if (!terminate) {
                            let endpt = vec3.fromValues(0,0,0);
                            let o = vec3.fromValues(t2.orientation[0], t2.orientation[1], t2.orientation[2]);
                            vec3.mul(o,o,vec3.fromValues(t2.scale[1], t2.scale[1], t2.scale[1]));
                            vec3.add(endpt, t2.position, o);
                            t2.position = vec3.fromValues(endpt[0], endpt[1], endpt[2]);
                            this.turtleHistory.push(t2);
                    }
                    e.setAxes(t2.forward, t2.right, t2.up);
                    this.edges.push(e);
                    this.highways.push(e);
                }

            } else {
                //grow towards population! choose 3 directions and choose the one towards population!
                let randomDir1 = (Math.random() * 2.0 - 1.0)*90;
                let randomDir2 = (Math.random() * 2.0 - 1.0)*90;
                let randomDir3 = (Math.random() * 2.0 - 1.0)*90;

                let pos1 = new Turtle();
                pos1.copy(t);
                pos1.moveRotate(1, randomDir1);

                let endpt = vec3.fromValues(0,0,0);
                let o = vec3.fromValues(pos1.orientation[0], pos1.orientation[1], pos1.orientation[2]);
                vec3.mul(o,o,vec3.fromValues(pos1.scale[1], pos1.scale[1], pos1.scale[1]));
                vec3.add(endpt, pos1.position, o);
                let inRange1 = this.inRange(pos1.position) && this.inRange(endpt);

                let end1 : vec3 = vec3.fromValues(0,0,0);
                o = vec3.fromValues(pos1.orientation[0], pos1.orientation[1], pos1.orientation[2]);
                vec3.mul(o,o,vec3.fromValues(pos1.scale[1], pos1.scale[1], pos1.scale[1]));
                vec3.add(end1, pos1.position, o);
                let w1 : boolean = this.isInWater(end1);
                let d1 : number = this.densityValue(end1);

                let pos2 = new Turtle();
                pos2.copy(t);
                pos2.moveRotate(1, randomDir2);

                endpt = vec3.fromValues(0,0,0);
                o = vec3.fromValues(pos2.orientation[0], pos2.orientation[1], pos2.orientation[2]);
                vec3.mul(o,o,vec3.fromValues(pos2.scale[1], pos2.scale[1], pos2.scale[1]));
                vec3.add(endpt, pos2.position, o);
                let inRange2 = this.inRange(pos2.position) && this.inRange(endpt);

                let end2 : vec3 = vec3.fromValues(0,0,0);
                o = vec3.fromValues(pos2.orientation[0], pos2.orientation[1], pos2.orientation[2]);
                vec3.mul(o,o,vec3.fromValues(pos2.scale[1], pos2.scale[1], pos2.scale[1]));
                vec3.add(end2, pos2.position, o);
                let w2 : boolean = this.isInWater(end2);
                let d2 : number = this.densityValue(end2);

                let pos3 = new Turtle();
                pos3.copy(t);
                pos3.moveRotate(1, randomDir3);
                
                endpt = vec3.fromValues(0,0,0);
                o = vec3.fromValues(pos3.orientation[0], pos3.orientation[1], pos3.orientation[2]);
                vec3.mul(o,o,vec3.fromValues(pos3.scale[1], pos3.scale[1], pos3.scale[1]));
                vec3.add(endpt, pos3.position, o);
                let inRange3 = this.inRange(pos3.position) && this.inRange(endpt);

                let end3 : vec3 = vec3.fromValues(0,0,0);
                o = vec3.fromValues(pos3.orientation[0], pos3.orientation[1], pos3.orientation[2]);
                vec3.mul(o,o,vec3.fromValues(pos3.scale[1], pos3.scale[1], pos3.scale[1]));
                vec3.add(end3, pos3.position, o);
                let w3 : boolean = this.isInWater(end3);
                let d3 : number = this.densityValue(end3);
                var flag : boolean = false;
                var terminate : boolean = false;
                var edge : Edge;
                

            if (d1 > d2 && d1 > d3 && !w1 && inRange1) {
                flag = true;
                let p = this.rotateTurtle(randomDir1, t);
                let e = new Edge(t.position, t.orientation, t.scale[1], t.scale[0]);
                    let length = e.length;
                    if (this.intersect(e)) {
                        terminate = true;
                    }
                    if(e.length < length) {
                        scale.push(vec3.fromValues(t.scale[0],e.length,t.scale[2]));
                        t.scale[1] = e.length;
                    } else {
                        scale.push(vec3.fromValues(t.scale[0],t.scale[1],t.scale[2]));
                    }
                    //pos forward right up
                    pos.push(p[0]);
                    r1.push(p[1]);
                    r2.push(p[2]);
                    r3.push(p[3]);
                    depth.push(p[5]);
                    edge = e;
            } else if (d2 > d1 && d2 > d3 && !w2 && inRange2) {
                flag = true;
                let p = this.rotateTurtle(randomDir2, t);
                let e = new Edge(t.position, t.orientation, t.scale[1], t.scale[0]);
                if (this.intersect(e)) {
                    terminate = true;
                }
                    this.intersect(e);
                    if(e.length < length) {
                        scale.push(vec3.fromValues(t.scale[0],e.length,t.scale[1]));
                        t.scale[1] = e.length;
                    } else {
                        scale.push(vec3.fromValues(t.scale[0],t.scale[1],t.scale[2]));
                    }
                    //pos forward right up
                    pos.push(p[0]);
                    r1.push(p[1]);
                    r2.push(p[2]);
                    r3.push(p[3]);
                    depth.push(p[5]);
                    edge = e;
            } else if (!w3 && inRange3) {
                flag = true;
                let p = this.rotateTurtle(randomDir3, t);
                let e = new Edge(t.position, t.orientation, t.scale[1], t.scale[0]);
                    let length = e.length;
                    if (this.intersect(e)) {
                        terminate = true;
                    }
                    if(e.length < length) {
                        scale.push(vec3.fromValues(t.scale[0],e.length,t.scale[2]));
                        t.scale[1] = e.length;
                    } else {
                        scale.push(vec3.fromValues(t.scale[0],t.scale[1],t.scale[2]));
                    }
                    //pos forward right up
                    pos.push(p[0]);
                    r1.push(p[1]);
                    r2.push(p[2]);
                    r3.push(p[3]);
                    depth.push(p[5]);
                    edge = e;
            }
            if (flag && !terminate) {
                let endpt = vec3.fromValues(0,0,0);
                let o = vec3.fromValues(t.orientation[0], t.orientation[1], t.orientation[2]);
                vec3.mul(o,o,vec3.fromValues(t.scale[1], t.scale[1], t.scale[1]));
                vec3.add(endpt, t.position, o);
                t.position = vec3.fromValues(endpt[0], endpt[1], endpt[2]);
                this.turtleHistory.push(t);
            }
            if (flag) {
                edge.setAxes(t.forward, t.right, t.up);
                this.edges.push(edge);
                this.highways.push(edge);
            }
        }
            max--;
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

    drawGrid() : vec3[][] {
        let pos : vec3[] = new Array();
        let r1 : vec3[] = new Array();
        let r2 : vec3[] = new Array();
        let r3 : vec3[] = new Array();
        let scale : vec3[] = new Array();
        let depth : vec3[] = new Array();

        let streets : Edge[] = new Array<Edge>();

        //empty out what's in there
        while (this.turtleHistory.length > 0) {
            this.turtleHistory.pop();
        }
        let n : Turtle = new Turtle();
        for (let i = 0; i < this.highways.length; i++) {
            let edge = this.highways[i];
            for (let j = 0; j < 4; j++) {
            //make n from main road
            let terminate = false;
            let offset = vec3.create();
            let o = vec3.fromValues(edge.direction[0], edge.direction[1], edge.direction[2]);
            
            vec3.mul(o,o,vec3.fromValues( j * edge.length / 3.0,  j * edge.length / 3.0, j * edge.length / 3.0));
            vec3.add(offset, edge.v1, o);
            n.position = offset; 
            n.forward = vec3.fromValues(edge.forward[0],edge.forward[1],edge.forward[2]);
            n.right = vec3.fromValues(edge.right[0],edge.right[1],edge.right[2]);
            n.up = vec3.fromValues(edge.up[0],edge.up[1],edge.up[2]);
            n.orientation = vec3.fromValues(edge.direction[0], edge.direction[1], edge.direction[2]);
            n.scale[0] = edge.width / 2.0;
            n.scale[1] = edge.length / 3.0;
            let p = this.rotateTurtle(90, n);
            let e = new Edge(n.position, n.orientation, n.scale[1], n.scale[0]);

            let end1 : vec3 = vec3.fromValues(0,0,0);
            o = vec3.fromValues(n.orientation[0], n.orientation[1], n.orientation[2]);
            vec3.mul(o,o,vec3.fromValues(n.scale[1], n.scale[1], n.scale[1]));
            vec3.add(end1, n.position, o);
            
            let inRange = this.inRange(n.position) && this.inRange(end1);
            let w : boolean = this.isInWater(n.position) && this.isInWater(end1);

            if (inRange && !w) {
            let length = e.length;
            this.intersect(e);
           if (e.length < length) {
                terminate = true;
                scale.push(vec3.fromValues(n.scale[0],e.length,n.scale[2]));
            } else {
                scale.push(vec3.fromValues(n.scale[0],length,n.scale[0]));
            }

            pos.push(p[0]);
            r1.push(p[1]);
            r2.push(p[2]);
            r3.push(p[3]);
            depth.push(p[5]);
            this.edges.push(e);
            streets.push(e);
            } else {
                terminate = true;
            }

            let max = this.max / 4.0;
            while (!terminate && max != 0) {
                max-=1;
                //make a branch off of it
                if (j != 3.0) {
                let nine = new Turtle();
                nine.copy(n);
                let newPos = vec3.fromValues(0,0,0);
                let or = vec3.fromValues(n.orientation[0], n.orientation[1], n.orientation[2]);
                vec3.mul(or,or,vec3.fromValues(n.scale[1], n.scale[1], n.scale[1]));
                vec3.add(newPos, n.position, or);
                nine.position = vec3.fromValues(newPos[0], newPos[1], newPos[2]);
                p = this.rotateTurtle(-90, nine);
                let e = new Edge(nine.position, nine.orientation, nine.scale[1], nine.scale[0]);
                
                let end1 : vec3 = vec3.fromValues(0,0,0);
                let o = vec3.fromValues(nine.orientation[0], nine.orientation[1], nine.orientation[2]);
                vec3.mul(o,o,vec3.fromValues(nine.scale[1], nine.scale[1], nine.scale[1]));
                vec3.add(end1, nine.position, o);
            
                let inRange = this.inRange(nine.position) && this.inRange(end1);
                let w : boolean = this.isInWater(nine.position) && this.isInWater(end1);
                
                if (inRange && !w) {
                    let length = e.length;
                    this.intersect(e);
                if (e.length < length) {
                    scale.push(vec3.fromValues(nine.scale[0],e.length,nine.scale[2]));
                } else {
                    scale.push(vec3.fromValues(nine.scale[0],length,nine.scale[0]));
                }
                pos.push(p[0]);
                r1.push(p[1]);
                r2.push(p[2]);
                r3.push(p[3]);
                depth.push(p[5]);
                this.edges.push(e);
                streets.push(e);
                }
            }
                
                //move original forward
                e = new Edge(n.position, n.orientation, n.scale[1], n.scale[0]);
                end1 = vec3.fromValues(0,0,0);
                o = vec3.fromValues(n.orientation[0], n.orientation[1], n.orientation[2]);
                vec3.mul(o,o,vec3.fromValues(n.scale[1], n.scale[1], n.scale[1]));
                vec3.add(end1, n.position, o);

                n.position = end1;

                p = this.rotateTurtle(0, n);
                e = new Edge(n.position, n.orientation, n.scale[1], n.scale[0]);
                end1 = vec3.fromValues(0,0,0);
                o = vec3.fromValues(n.orientation[0], n.orientation[1], n.orientation[2]);
                vec3.mul(o,o,vec3.fromValues(n.scale[1], n.scale[1], n.scale[1]));
                vec3.add(end1, n.position, o);
            
                inRange = this.inRange(n.position) && this.inRange(end1);
                w = this.isInWater(n.position) && this.isInWater(end1);

                if (inRange && !w) {
                    
                    length = e.length;
                    this.intersect(e);
                if (e.length < length) {
                    terminate = true;
                    scale.push(vec3.fromValues(n.scale[0],e.length,n.scale[2]));
                } else {
                    scale.push(vec3.fromValues(n.scale[0],length,n.scale[0]));
                }

                pos.push(p[0]);
                r1.push(p[1]);
                r2.push(p[2]);
                r3.push(p[3]);
                depth.push(p[5]);
                this.edges.push(e);
                streets.push(e);
                } else {
                    terminate = true;
                } 
                
            }

            if (j != 3.0) {
                let nine = new Turtle();
            nine.copy(n);
            let newPos = vec3.fromValues(0,0,0);
            let or = vec3.fromValues(n.orientation[0], n.orientation[1], n.orientation[2]);
            vec3.mul(or,or,vec3.fromValues(n.scale[1], n.scale[1], n.scale[1]));
            vec3.add(newPos, n.position, or);
            nine.position = vec3.fromValues(newPos[0], newPos[1], newPos[2]);
            p = this.rotateTurtle(-90, nine);
            e = new Edge(nine.position, nine.orientation, nine.scale[1], nine.scale[0]);
            
            end1 = vec3.fromValues(0,0,0);
            o = vec3.fromValues(nine.orientation[0], nine.orientation[1], nine.orientation[2]);
            vec3.mul(o,o,vec3.fromValues(nine.scale[1], nine.scale[1], nine.scale[1]));
            vec3.add(end1, nine.position, o);
        
            inRange = this.inRange(nine.position) && this.inRange(end1);
            w = this.isInWater(nine.position) && this.isInWater(end1);
            
            if (inRange && !w) {
                let length = e.length;
                this.intersect(e);
            if (e.length < length) {
                scale.push(vec3.fromValues(nine.scale[0],e.length,nine.scale[2]));
            } else {
                scale.push(vec3.fromValues(nine.scale[0],length,nine.scale[0]));
            }
            pos.push(p[0]);
            r1.push(p[1]);
            r2.push(p[2]);
            r3.push(p[3]);
            depth.push(p[5]);
            this.edges.push(e);
            streets.push(e);
            }
            }
            
            }
 
        }

        for (let k = 0; k < streets.length; k++) {
            this.snap(streets[k]);
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

    //case 1 for rotate about up for testing
    rotateTurtle(theta : number, t :Turtle) : vec3[] {
        t.moveRotate(1, theta);
        t.orientation = t.orientation;
        
        let tPos = vec3.fromValues(t.position[0], t.position[1], t.position[2]);
        let tScale = vec3.fromValues(t.scale[0], t.scale[1], t.scale[2]);

         let rotation : mat3 = mat3.fromValues(1,0,0,0,1,0,0,0,1);

        var q = quat.fromValues(0,0,0,0);
        quat.rotationTo(q,vec3.fromValues(0,1,0), t.orientation);
        mat3.fromQuat(rotation, q);

        let r1 = vec3.fromValues(rotation[0], rotation[1], rotation[2]);
        let r2 = vec3.fromValues(rotation[3], rotation[4], rotation[5]);
        let r3 = vec3.fromValues(rotation[6], rotation[7], rotation[8]);

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