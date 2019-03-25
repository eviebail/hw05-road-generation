import { vec2 } from "gl-matrix";
import Edge from "./Edge";

export default class Intersection {
    point : vec2;
    
    constructor() {
        this.point = vec2.fromValues(10000000, 100000000);
    }

    intersect(e1 : Edge, e2 : Edge) : boolean {
        var X = 0;
        var Y = 0;
        let x11 = e1.v1[0];
        let y11 = e1.v1[1];

        let x12 = e1.v2[0];
        let y12 = e1.v2[1];

        let x21 = e2.v1[0];
        let y21 = e2.v1[1];

        let x22 = e2.v2[0];
        let y22 = e2.v2[1];
        let epsilon = 0.000001;
        
        if (x11 == x12 && x21 == x22 ) {
            return false;
        }

        let m1 = (y12 - y11) / (x12 - x11);

        let m2 = (y22 - y21) / (x22 - x21);

        if (m1 == m2) {
            return false;
        }
        

        let b1 = y11 - m1*x11;
        let b2 = y21 - m2*x21;

        X = (b2 - b1) / (m1 - m2);

        Y = m1*X + b1;
        
        //check to make sure it is within the length of the roads
        if (X < Math.min(x11, x12) || X > Math.max(x11, x12)
            || Y < Math.min(y11, y12) || Y > Math.max(y11,y12)) {
                return false;
        }
        
        
        if (X < Math.min(x21, x22) || X > Math.max(x21, x22)
            || Y < Math.min(y21, y22) || Y > Math.max(y21,y22)) {
                return false;
        }
        if (x11 == x21 && y11 == y21) {
            return false;
        }

        this.point = vec2.fromValues(X,Y);
        return true;
     }

     snap(e1 : Edge, e2 : Edge) : boolean {
        var X = 0;
        var Y = 0;
        let x11 = e1.v1[0];
        let y11 = e1.v1[1];

        let x12 = e1.v2[0];
        let y12 = e1.v2[1];

        let x21 = e2.v1[0];
        let y21 = e2.v1[1];

        let x22 = e2.v2[0];
        let y22 = e2.v2[1];
        let epsilon = 0.000001;
        
        if (x11 == x12 && x21 == x22 ) {
            return false;
        }

        let m1 = (y12 - y11) / (x12 - x11);

        let m2 = (y22 - y21) / (x22 - x21);

        if (m1 == m2) {
            return false;
        }
        

        let b1 = y11 - m1*x11;
        let b2 = y21 - m2*x21;

        X = (b2 - b1) / (m1 - m2);

        Y = m1*X + b1;

        if (x11 == x21 && y11 == y21) {
            return false;
        }

        this.point = vec2.fromValues(X,Y);
        return true;
     }
}