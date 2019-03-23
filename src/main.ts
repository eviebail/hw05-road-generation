import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import RoadSystem from './RoadSystem';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  Height_Map:  0,
  Density_Map: 1,
  Land_Water_Mode: 0,
  Population_Density: 0
};

let square: Square;
let screenQuad: ScreenQuad = new ScreenQuad();
let time: number = 0.0;
let system: RoadSystem;

function loadScene() {
  square = new Square();
  square.create();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let data = system.runSystem();

  let offsetsArray = [];
  let colorsArray = [];
  let r1Array = [];
  let r2Array = [];
  let r3Array = [];
  let scaleArray = [];
  
  let n: number = data[0].length;

  console.log("Length " + n);
  
  for(let i = 0; i < n; i++) {
    var pos = vec3.create();
    for(let j = 0; j < n; j++) {
      let position : vec3 = data[0][i];
      let r1 : vec3 = data[1][i];
      let r2 : vec3 = data[2][i];
      let r3 : vec3 = data[3][i];
      let scale : vec3 = data[4][i];
      //let depth : vec3 = data[5][i];

      pos = position;
      
      offsetsArray.push(position[0]);
      offsetsArray.push(position[1]);
      offsetsArray.push(position[2]);

      r1Array.push(r1[0]);
      r1Array.push(r1[1]);
      r1Array.push(r1[2]);

      r2Array.push(r2[0]);
      r2Array.push(r2[1]);
      r2Array.push(r2[2]);

      r3Array.push(r3[0]);
      r3Array.push(r3[1]);
      r3Array.push(r3[2]);

      scaleArray.push(scale[0]);
      scaleArray.push(scale[1]);
      scaleArray.push(scale[2]);

      if (i == 0) {
        colorsArray.push(1.0);
        colorsArray.push(1.0);
        colorsArray.push(1.0);
        colorsArray.push(1.0); // Alpha channel
      } else {
        colorsArray.push((n - i + 1) / n);
        colorsArray.push((n - i + 1) / n);
        colorsArray.push((n - i + 1) / n);
        colorsArray.push(1.0); // Alpha channel
      }

    }
    //console.log("HIII");
    //console.log("Offset: " + pos[0] + ", " + pos[1] + ", " + pos[2] + "\n");
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  let r1s: Float32Array = new Float32Array(r1Array);
  let r2s: Float32Array = new Float32Array(r2Array);
  let r3s: Float32Array = new Float32Array(r3Array);
  let scales: Float32Array = new Float32Array(scaleArray);
  square.setInstanceVBOs(offsets, colors, r1s, r2s, r3s, scales);
  square.setNumInstances(n * n); // grid of "particles"
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Height_Map', 0, 1).step(1);
  gui.add(controls, 'Density_Map', 0, 1).step(1);
  gui.add(controls, 'Land_Water_Mode', 0, 1).step(1);
  gui.add(controls, 'Population_Density', 0, 1).step(0.5);//Population_Density

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);


  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const textureBuffer = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/texture-frag.glsl')),
  ]);

  screenQuad.create();

  /////////////CREATE RENDER BUFFERS///////////////////////////////
  var m_renderedTexture = gl.createTexture();
  var m_depthRenderBuffer = gl.createRenderbuffer();
  var m_frameBuffer = gl.createFramebuffer();

  gl.bindFramebuffer(gl.FRAMEBUFFER, m_frameBuffer);
    // Bind our texture so that all functions that deal with textures will interact with this one
  gl.bindTexture(gl.TEXTURE_2D, m_renderedTexture);
    //Give an empty image to OpenGL ( the last "0" )
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, window.innerWidth, window.innerHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  // Set the render settings for the texture we've just created.
    // Essentially zero filtering on the "texture" so it appears exactly as rendered
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // Clamp the colors at the edge of our texture
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Initialize our depth buffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, m_depthRenderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, window.innerWidth, window.innerHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, m_depthRenderBuffer);

    // Set m_renderedTexture as the color output of our frame buffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, m_renderedTexture, 0);

    // Sets the color output of the fragment shader to be stored in GL_COLOR_ATTACHMENT0, 
    //which we previously set to m_renderedTextures[i]
    //gl.drawBuffers([gl.COLOR_ATTACHMENT0]);

    //error checking
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
    {
        console.log("Frame buffer did not initialize correctly...");
    }

    // Render the 3D scene to our frame buffer

    // Render to our framebuffer rather than the viewport
    gl.bindFramebuffer(gl.FRAMEBUFFER, m_frameBuffer);
    // Render on the whole framebuffer, complete from the lower left corner to the upper right
    gl.viewport(0,0,window.innerWidth, window.innerHeight);
    // Clear the screen so that we only see newly drawn images
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the model
    //mp_progSurfaceCurrent->draw(*mp_modelCurrent, 0);
    renderer.render(camera, textureBuffer, [screenQuad]);

    //save the texture for the lsystem!

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
      var pixels = new Uint8Array(window.innerWidth * window.innerHeight * 4);
      gl.readPixels(0, 0, window.innerWidth, window.innerHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      //console.log(pixels[window.innerWidth * window.innerHeight * 4 - 4] / 255.0 + ", " + pixels[window.innerWidth * window.innerHeight * 4 - 3] / 255.0 + ", " + pixels[window.innerWidth * window.innerHeight * 4 - 2] / 255.0);
      //now pass colorArray to turtle!
      //console.log("ARE YOU ALIVE???" + colorArray[0][0]);
      system = new RoadSystem(pixels,5.0, window.innerHeight, window.innerWidth);
    }

    // Initial call to load scene
    loadScene();

    // Tell OpenGL to render to the viewport's frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // Render on the whole framebuffer, complete from the lower left corner to the upper right
    gl.viewport(0,0,window.innerWidth, window.innerHeight);
    // Clear the screen
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Bind our texture in Texture Unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, m_renderedTexture);

    

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    flat.setState(vec4.fromValues(controls.Height_Map,controls.Density_Map,(controls.Height_Map + controls.Density_Map) - 1.0, controls.Land_Water_Mode));
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    //renderer.clear();

    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      square,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }



  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
