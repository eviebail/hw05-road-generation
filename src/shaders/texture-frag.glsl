#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float interpNoise2D(float x, float y) {
  float intX = floor(x);
  float fractX = fract(x);
  float intY = floor(y);
  float fractY = fract(y);

  float v1 = rand(vec2(intX, intY));
  float v2 = rand(vec2(intX + 1.0, intY));
  float v3 = rand(vec2(intX, intY + 1.0));
  float v4 = rand(vec2(intX + 1.0, intY + 1.0));

  float i1 = mix(v1, v2, fractX);
  float i2 = mix(v3, v4, fractX);

  return mix(i1, i2, fractY);
}

float fbm(float x, float y) {
  float roughness = 1.0;
  float total = 0.0;
  float persistence = 0.7;
  int octaves = 2;

  for (int i = 0; i < 8; i++) {
    float freq = pow(2.0, float(i));
    float amp = pow(persistence, float(i));

    total += interpNoise2D(x * freq, y * freq) * amp * roughness;
    roughness *= interpNoise2D(x*freq, y*freq);
  }
  return total;
}

float step_map(float value) {

if (value < 0.2f) {
    return 0.2f;
  } else if (value < 0.4f) {
    return 0.2f + ((value - 0.2f) / 0.2f)*0.2f;
  } else if (value < 0.6f) {
    return 0.4f + ((value - 0.4f) / 0.2f)*0.2f;
  } else if (value < 0.8f) {
    return 0.6f + ((value - 0.6f) / 0.2f)*0.2f;
  } else {
    return 1.f;
  }
  
}

vec2 random3( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

float worley (float c_size, float multiplier) {
  float cell_size = c_size;
  vec2 cell = fs_Pos.xy / cell_size;
  float noise = 0.f;
  
  //get the cell pixel position is in
  vec2 fract_pos = fract(cell);
  vec2 int_pos = floor(cell);

  float m_dist = 1.f;

  //compare pos to the randpoints in the neighboring cells and save the smallest dist
  for (int y= -1; y <= 1; y++) {
    for (int x= -1; x <= 1; x++) {
      // Neighbor place in the grid
      vec2 neighbor = vec2(float(x),float(y));
      vec2 randpt = random3(int_pos + neighbor);

      vec2 diff = neighbor + randpt - fract_pos;
      float dist = length(diff);
      float rough = 1.0;
      
      // Keep the closer distance
      if (dist < m_dist) {
        m_dist = dist;
        vec2 pt = (randpt + int_pos + neighbor) / cell_size;
        noise = m_dist*multiplier;
      }
    } 
  }
  return noise;
}

void main() {
  vec2 pos = fs_Pos * 2.0;
  float height = fbm(pos.x, pos.y);
  float pop_dens = 1.0 - (worley(0.5, 0.5) + 0.5*height);
  pop_dens = fbm(pop_dens, pop_dens);
  //height = step_map(height);
  height = log(height + 0.7);//pow(height, 0.8);//smoothstep(0.2, 1.0, height);
  if (height < 0.2) {
    pop_dens = 0.0;
    out_Col = vec4(0.0,0.0,0.5, pop_dens);
  } else if (height < 0.3) {
    pop_dens = 0.0;
    vec3 col = mix(vec3(0.0,0.0,0.5), vec3(0.0,height,0.0), 0.2);
    out_Col = vec4(col, pop_dens);
  } else {
    out_Col = vec4(0.0, height + 0.1, 0.0, pop_dens);
    //out_Col = vec4(pop_dens, pop_dens, pop_dens, pop_dens);
  }
  
}
