import { vec2 } from "gl-matrix";
import Edge from "./Edge";

export default class Intersection {
    point : vec2;
    
    constructor() {
        this.point = vec2.fromValues(10000000, 100000000);
    }

    //itself, other edge
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

         //only check the bounds of the other edge!!
        
            
        if (X < Math.min(x11, x12) || X > Math.max(x11, x12)
            || Y < Math.min(y11, y12) || Y > Math.max(y11,y12)) {
                //console.log("BABBBABBBABBA");
                // console.log("Y: " + Y + "max Y: " + y11 + " | " + y12);
                // console.log("X: " + X + "max X: " + x11 + " | " + x12);
                return false;
        }
        
        
        if (X < Math.min(x21, x22) || X > Math.max(x21, x22)
            || Y < Math.min(y21, y22) || Y > Math.max(y21,y22)) {
                //console.log("AAAAAAA");
                // console.log("Y: " + Y + "max Y: " + y21 + " | " + y22);
                // console.log("X: " + X + "max X: " + x21 + " | " + x22);
                return false;
        }
        if (x11 == x21 && y11 == y21) {
            return false;
        }

        // console.log("TRUE: " + X + ", " + Y);
        // console.log("E1 Origin: " + x11 + ", " + y11 + " and E1 End " + x12 + ", " + y12);
        // console.log("E2 Origin: " + x21 + ", " + y21 + " and E1 End " + x22 + ", " + y22);
        
        this.point = vec2.fromValues(X,Y);
        return true;
     }
}