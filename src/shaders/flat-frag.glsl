#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform sampler2D u_Texture; // The texture to be read from by this shader
uniform vec4 u_MapState;

in vec2 fs_Pos;
out vec4 out_Col;

void main() {
  vec2 uv = vec2(0.5 * (fs_Pos.x + 1.0), 0.5 * (fs_Pos.y + 1.0));
  vec4 diffuseColor = texture(u_Texture, uv);
  if (u_MapState.w == 1.0) {
    if (diffuseColor.g > diffuseColor.b) {
      out_Col = vec4(0.0, 1.0, 0.0, 1.0);
    } else {
      out_Col = vec4(0.0, 0.0, 1.0, 1.0);
    }
  } else if (u_MapState.z == 1.0) {
    //render both!
    vec3 outpt = mix(vec3(diffuseColor), vec3(diffuseColor.w), 0.6);
    out_Col = vec4(outpt, 1.0);
  } else if (u_MapState.z == -1.0) {
    out_Col = vec4(vec3(diffuseColor), 1.0);
  }
  else {
    if (u_MapState.x == 1.0) {
      //render height only
      out_Col = vec4(vec3(diffuseColor), 1.0);
    } else {
      //render density only
      out_Col = vec4(vec3(diffuseColor.w), 1.0);
    }
  }
}
