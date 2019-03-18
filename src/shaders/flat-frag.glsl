#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;
uniform sampler2D u_Texture; // The texture to be read from by this shader

in vec2 fs_Pos;
out vec4 out_Col;

void main() {
  vec2 uv = vec2(2.0 * (fs_Pos.x / u_Dimensions.x) - 1.0, 1.0 - 2.0 * (fs_Pos.y / u_Dimensions.y));
  vec4 diffuseColor = texture(u_Texture, uv);
  out_Col = vec4(vec3(diffuseColor), 1.0); //vec4(0.5 * (fs_Pos + vec2(1.0)), 0.0, 1.0);
}
