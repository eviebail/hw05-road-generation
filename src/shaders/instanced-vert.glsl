#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.
in vec3 vs_R1;
in vec3 vs_R2;
in vec3 vs_R3;
in vec3 vs_Scale;

out vec4 fs_Col;
out vec4 fs_Pos;

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;

    mat3 translate = mat3(vec3(1.0, 0.0, 0.0),
                          vec3(0.0, 1.0, 0.0),
                          vec3(vs_Translate.x, vs_Translate.y, 1.0));
    
    mat3 rotate = (mat3(vs_R1,
                  vs_R2,
                  vs_R3));
    mat3 scale = mat3(vec3(vs_Scale.x, 0.0, 0.0),
                            vec3(0.0, vs_Scale.y, 0.0),
                            vec3(0.0, 0.0, 1.0));
    mat3 offset = mat3(vec3(1.0, 0.0, 0.0),
                          vec3(0.0, 1.0, 0.0),
                          vec3(0.0, 0.5, 1.0));
    mat3 neg_offset = mat3(vec3(1.0, 0.0, 0.0),
                          vec3(0.0, 1.0, 0.0),
                          vec3(0.0, 0.5, 1.0));
    vec3 pos = translate * rotate * scale * vec3(vs_Pos.xy, 1.0);
    gl_Position = vec4(vec3(pos.xy, 0.0), 1.0);
}
