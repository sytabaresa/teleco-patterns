
import {
    AxesHelper,
    CanvasRenderer,
    Clock,
    DoubleSide,
    FogExp2,
    Mesh,
    MeshBasicMaterial,
    MeshNormalMaterial,
    MeshLambertMaterial,
    PointLight,
    PerspectiveCamera,
    PlaneGeometry,
    Scene,
    WebGLRenderer,
    Vector3,
} from 'three'
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

//import * as THREEX from 'threex';
//import { Parser } from 'expr-eval';
import { create, all } from 'mathjs'
import { Detector } from './libs/Detector';
import Stats from 'stats.js';
import dat from 'dat.gui';
import { patters, antennas } from './patterns';

import './assets/css/style.css';

const config = {}
const Math = create(all, config)


//var keyboard = new THREEx.KeyboardState();
var clock = new Clock();


var container, scene, camera, renderer, controls, stats;
var graphGeometry;
var gridMaterial, wireMaterial, vertexColorMaterial;
var graphMesh;

// SCENE
scene = new Scene();
// CAMERA
var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
camera = new PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
scene.add(camera);
camera.position.set(0, 150, 800);
camera.lookAt(scene.position);

// RENDERER
if (Detector.webgl)
    renderer = new WebGLRenderer({ antialias: true });
else
    renderer = new CanvasRenderer();

renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
container = document.getElementById('app');
container.appendChild(renderer.domElement);

// EVENTS
//THREEx.WindowResize(renderer, camera);
//THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });

// CONTROLS
function createControls(camera) {
    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.keys = [65, 83, 68];
}

createControls(camera);

// STATS
stats = new Stats();
stats.dom.style.position = 'absolute';
stats.dom.style.bottom = '0';
stats.dom.style.zIndex = 100;
container.appendChild(stats.dom);

// LIGHT
var light = new PointLight(0xffffff);
light.position.set(0, 250, 0);
scene.add(light);

// SKYBOX/FOG
scene.fog = new FogExp2(0x888888, 0.0025);

////////////
// CUSTOM //
////////////

scene.add(new AxesHelper());
// wireframe for xy-plane
var wireframeMaterial = new MeshBasicMaterial({ color: 0x000088, wireframe: true, side: DoubleSide });
var floorGeometry = new PlaneGeometry(10, 10, 50, 50);
var floor = new Mesh(floorGeometry, wireframeMaterial);
floor.position.z = -0.01;
// rotate to lie in x-y plane
// floor.rotation.x = Math.PI / 2;
scene.add(floor);

var normMaterial = new MeshNormalMaterial;
var shadeMaterial = new MeshLambertMaterial({ color: 0xff0000 });

// "wireframe texture"
/*
var wireTexture = new THREE.ImageUtils.loadTexture('images/square.png');
wireTexture.wrapS = wireTexture.wrapT = THREE.RepeatWrapping;
wireTexture.repeat.set(40, 40);
wireMaterial = new THREE.MeshBasicMaterial({ map: wireTexture, vertexColors: THREE.VertexColors, side: THREE.DoubleSide });
var vertexColorMaterial = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
*/
// Background clear color
// renderer.setClearColorHex( 0x888888, 1 );
// parameters for the equations
var parameters = {
    a: 0.01,
    b: 0.01,
    c: 0.01,
    d: 0.01,
    l: 1,
    n: 1,
    Eo: 1,
    rho: 0
};

var options = {
    zoom: 81,
    meshResolution: 100,
    xFuncText: "r*sin(p)*sin(t)",
    yFuncText: "r*sin(p)*cos(t)",
    zFuncText: "r*cos(p)",
    rFuncText: "1",
    fFuncText: "1",
    segments: 60,
    uMin: 0.0,
    uMax: Math.PI,
    vMin: 0.00,
    vMax: 2 * Math.PI,
    zMin: -10,
    zMax: 10,
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0 // for autosizing window
};

options.xFunc = Math.parse(options.xFuncText).compile();
options.yFunc = Math.parse(options.yFuncText).compile();
options.zFunc = Math.parse(options.zFuncText).compile();

options.uRange = options.uMax - options.uMin;
options.vRange = options.vMax - options.vMin;
options.zRange = options.zMax - options.zMin;

///////////////////
//   GUI SETUP   //	
///////////////////
var gui = new dat.GUI();

gui.width = 400;
var menuParameters =
{
    resetCam: function () { resetCamera(); },
    graphFunc: function () { createGraph(); },
    finalValue: 337
};

// GUI -- equation
/*
var gui_xText = gui.add(options, 'xFuncText').name('x = f(u,v) = ');
var gui_yText = gui.add(options, 'yFuncText').name('y = g(u,v) = ');
var gui_zText = gui.add(options, 'zFuncText').name('z = h(u,v) = ');
*/

var updateRFunc = function (value) {
    options.rFunc = Math.parse("(" + options.fFuncText + ")*(" + options.rFuncText + ")").compile();
}
var gui_rText = gui.add(options, 'rFuncText').name('Patrón Horiz =');
gui_rText.onChange(updateRFunc);
var gui_fText = gui.add(options, 'fFuncText').name('Factor Forma =');
gui_fText.onChange(updateRFunc);


var gui_uMin = gui.add(options, 'uMin').name('t min = ');
var gui_uMax = gui.add(options, 'uMax').name('t max = ');
var gui_vMin = gui.add(options, 'vMin').name('p min = ');
var gui_vMax = gui.add(options, 'vMax').name('p max = ');

var gui_segments = gui.add(options, 'segments').name('Resolución = ');


// GUI -- parameters
var gui_parameters = gui.addFolder('Parámetros');
/*
var gui_a = gui_parameters.add(parameters, 'a').min(-5).max(5).step(0.01).name('a = ');
gui_a.onChange(function (value) { createGraph(); });

var gui_b = gui_parameters.add(parameters, 'b').min(-5).max(5).step(0.01).name('b = ');
gui_b.onChange(function (value) { createGraph(); });

var gui_c = gui_parameters.add(parameters, 'c').min(-5).max(5).step(0.01).name('c = ');
gui_c.onChange(function (value) { createGraph(); });

var gui_d = gui_parameters.add(parameters, 'd').min(-5).max(5).step(0.01).name('d = ');
gui_d.onChange(function (value) { createGraph(); });

gui_a.setValue(1);
gui_b.setValue(1);
gui_c.setValue(1);
gui_d.setValue(1);
*/

var gui_Eo = gui_parameters.add(parameters, 'Eo').min(0).max(5).step(0.01).name('Eo = ');
gui_Eo.onChange(function (value) { createGraph(); });

var gui_rho = gui_parameters.add(parameters, 'rho').min(-5).max(5).step(0.01).name('rho = ');
gui_rho.onChange(function (value) { createGraph(); });

var gui_l = gui_parameters.add(parameters, 'l').min(0).max(5).step(0.01).name('l = ');
gui_l.onChange(function (value) { createGraph(); });

var gui_n = gui_parameters.add(parameters, 'n').min(0).max(15).step(1).name('n = ');
gui_n.onChange(function (value) { createGraph(); });

// GUI -- preset equations
gui.add(menuParameters, 'resetCam').name("Reiniciar Cámara");
gui.add(menuParameters, 'graphFunc').name("Graficar");

animate();

function createGraph() {
    options.uRange = options.uMax - options.uMin;
    options.vRange = options.vMax - options.vMin;
    /*
    options.xFunc = Parser.parse(options.xFuncText).toJSFunction('r,t,p', parameters);
    options.yFunc = Parser.parse(options.yFuncText).toJSFunction('r,t,p', parameters);
    options.zFunc = Parser.parse(options.zFuncText).toJSFunction('r,t,p', parameters);
    options.rFunc = Parser.parse(options.rFuncText).toJSFunction('t,p', parameters);
*/
    //console.log(options)
    var meshFunction = function (u0, v0, vect) {
        var u = options.uRange * u0 + options.uMin;
        var v = options.vRange * v0 + options.vMin;
        parameters.t = u;
        parameters.p = v;
        /*       var r = Math.abs(options.rFunc(u, v));
              var x = options.xFunc(r, u, v);
              var y = options.yFunc(r, u, v);
              var z = options.zFunc(r, u, v); */
        var r = Math.abs(options.rFunc.evaluate(parameters));
        // console.log(parameters)
        // console.log(r)
        parameters.r = r;
        var x = options.xFunc.evaluate(parameters);
        var y = options.yFunc.evaluate(parameters);
        var z = options.zFunc.evaluate(parameters);
        // console.log(r,x,y,z);

        if (isNaN(x) || isNaN(y) || isNaN(z))
            vect.set(0, 0, 0); // TODO: better fix
        else
            vect.set(x, y, z);
    };

    // true => sensible image tile repeat...
    graphGeometry = new ParametricGeometry(meshFunction, options.segments, options.segments, true);
    //console.log(graphGeometry);
    ///////////////////////////////////////////////
    // calculate vertex colors based on Z values //
    ///////////////////////////////////////////////
    graphGeometry.computeBoundingBox();
    options.zMin = graphGeometry.boundingBox.min.z;
    options.zMax = graphGeometry.boundingBox.max.z;
    options.zRange = options.zMax - options.zMin;
    var color, point, face, numberOfSides, vertexIndex;
    // faces are indexed using characters
    var faceIndices = ['a', 'b', 'c', 'd'];
    // first, assign colors to vertices as desired
    // for (var i = 0; i < graphGeometry.attributes.position.array.length; i++) {
    //     point = graphGeometry.vertices[i];
    //     color = new THREE.Color(0x0000ff);
    //     color.setHSL(0.7 * (options.zMax - point.z) / options.zRange, 1, 0.5);
    //     graphGeometry.colors[i] = color; // use options array for convenience
    // }
    // // copy the colors as necessary to the face's vertexColors array.
    // for (var i = 0; i < graphGeometry.faces.length; i++) {
    //     face = graphGeometry.faces[i];
    //     numberOfSides = (face instanceof THREE.Face3) ? 3 : 4;
    //     for (var j = 0; j < numberOfSides; j++) {
    //         vertexIndex = face[faceIndices[j]];
    //         face.vertexColors[j] = graphGeometry.colors[vertexIndex];
    //     }
    // }
    ///////////////////////
    // end vertex colors //
    ///////////////////////

    options.xMin = graphGeometry.boundingBox.min.x;
    options.xMax = graphGeometry.boundingBox.max.x;
    options.yMin = graphGeometry.boundingBox.min.y;
    options.yMax = graphGeometry.boundingBox.max.y;

    // material choices: vertexColorMaterial, wireMaterial , normMaterial , shadeMaterial

    if (graphMesh) {
        scene.remove(graphMesh);
        // renderer.deallocateObject( graphMesh );
    }
    //wireMaterial.map.repeat.set(options.segments, options.segments);
    var material = new MeshNormalMaterial({ opacity: 0.50 });
    material.side = DoubleSide;


    graphMesh = new Mesh(graphGeometry, material);
    graphMesh.doubleSided = true;
    scene.add(graphMesh);
}

var gui_preset = gui.addFolder('Patrones predefinidos');
patters.forEach((e) => {
    loadPattern(e);
});

var gui_preset = gui.addFolder('Antenas predefinidas');
antennas.forEach((e) => {
    loadAntenna(e);
});

runPattern(patters[1]);
runAntenna(antennas[1]);
createGraph(); resetCamera();

function loadPattern(preset) {
    menuParameters[preset.name] = () => runPattern(preset);
    gui_preset.add(menuParameters, preset.name).name(preset.desc);
}

function runPattern(preset) {
    gui_rText.setValue(preset.f.replace(/ /g, ""));
    gui_Eo.setValue(preset.Eo);
    gui_rho.setValue(preset.rho);
    //createGraph(); resetCamera();
}

function loadAntenna(preset) {
    menuParameters[preset.name] = () => runAntenna(preset);
    gui_preset.add(menuParameters, preset.name).name(preset.desc);
}

function runAntenna(preset) {
    gui_fText.setValue(preset.ff);
    createGraph(); resetCamera();
}
function resetCamera() {
    // CAMERA
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera = new PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(2 * options.xMax, 6 * options.yMax, 4 * options.zMax);
    camera.up = new Vector3(0, 0, 1);
    camera.lookAt(scene.position);
    scene.add(camera);
    createControls(camera);
    //THREEx.WindowResize(renderer, camera);
}
function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}
function update() {
    /*
        if (keyboard.pressed("z")) {
            // do something
        }*/

    controls.update();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}