//# Spherical Harmonics Mesh Builder
//Rendered with [THREE.js](http://threejs.org)

//Demonstrates how to use the `toxi.geom.mesh.SurfaceMeshBuilder` class
//in conjunction with a spherical harmonics function to dynamically create a variety
//of organic looking forms. The function is described in detail on
//[Paul Bourke's website](http://paulbourke.net/geometry/sphericalh/).

//I like this one [4, 2, 4, 6, 4, 0, 1, 1]
//   "three": "0.66.66",

import * as THREE from 'three';
global.THREE = THREE;
import $ from 'jquery';
//import toxi from 'toxiclibsjs';
import { TrackballControls } from './libs/TrackballControls';
import dat from 'dat.gui';

THREE.TrackballControls = TrackballControls;
THREE.TrackballControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.TrackballControls.prototype.constructor = TrackballControls;

export var container = $('#app')[0];
var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

var $m = $("<div>"),
    //    stage = new toxi.geom.Vec2D(window.innerWidth, window.innerHeight - 60),
    //    camera = new THREE.PerspectiveCamera(45, stage.x / stage.y, 1, 2000),
    scene = new THREE.Scene(),
    renderer = new THREE.WebGLRenderer({ antialias: true }),
    options,
    material,
    threeMesh; //<--we'll put the converted mesh here

//set the scene
container.style.backgroundColor = "black";
camera.position.z = 800;
scene.add(camera);
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
container.appendChild(renderer.domElement);

//add the rotation controls
var controls = new THREE.TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.2;
controls.noZoom = true;
controls.noPan = false;
controls.staticMoving = false;
controls.dynamicDampingFactor = 0.1;

material = new THREE.MeshNormalMaterial({ color: 0xBAE8E6, opacity: 1.0 });
material.side = THREE.DoubleSide;


options = {
    zoom: 81,
    meshResolution: 100,
    changeHarmonics: true,
    m: [5, 8, 3, 1, 7, 3, 3, 7],
    a: 3,
    b: 1,
    c: 1,
    d: 1,
    uRange: 1,
    vRange: 1,
    uMin: 1,
    uMax: 2,
    vMin: 1,
    vMax: 1,
    segments: 30,
    randomizeHarmonics: function () {
        options.m = [];
        for (var i = 0; i < 8; i++) {
            options.m.push(parseInt(Math.random() * 9, 10));
        }
        $m.remove();
        $m = $("<div id=\"m\">m: [" + options.m + "]" + "</div>");
        $("#guiAbout").append($m);
    },
    updateMesh: function (res) {
        var sh, builder, toxiMesh, threeGeometry;
        if (res === undefined) {
            res = options.meshResolution;
        }
        if (threeMesh !== undefined) {
            scene.remove(threeMesh);
        }
        if (options.changeHarmonics) {
            options.randomizeHarmonics();
        }

        //get the model
        /*
        sh = new toxi.geom.mesh.SphericalHarmonics(options.m);
        //build the surface
        builder = new toxi.geom.mesh.SurfaceMeshBuilder(sh);
        //make it into a toxiclibs TriangleMesh
        toxiMesh = builder.createMesh(new toxi.geom.mesh.TriangleMesh(), res, 1, true);
        //turn the mesh into THREE.Geometry
        threeGeometry = toxi.THREE.ToxiclibsSupport.createMeshGeometry(toxiMesh);
        */
       var xs = (u, v) => Math.cos(u) * (options.a + options.b * Math.cos(v));
       var ys = (u, v) => Math.sin(u) * (options.a + options.b * Math.cos(v));
       var zs = (u, v) => options.b * Math.sin(v);
        var meshFunction = function (u0, v0, vect) {
            var u = options.uRange * u0 + options.uMin;
            var v = options.vRange * v0 + options.vMin;
            // var x = options.xFunc(u, v);
            //var y = options.yFunc(u, v);
            //var z = options.zFunc(u, v);

            var x = xs(u, v);
            var y = ys(u, v);
            var z = zs(u, v);
            if (isNaN(x) || isNaN(y) || isNaN(z))
                vect.set(0, 0, 1); // TODO: better fix
            else
                vect.set(x, y, z);
        };
        var graphGeometry = new THREE.ParametricGeometry(meshFunction, options.segments, options.segments, true);

        console.log(graphGeometry);
        threeMesh = new THREE.Mesh(graphGeometry, material);
        threeMesh.scale.set(options.zoom, options.zoom, options.zoom);
        scene.add(threeMesh);
    }
};


//GUI
var gui = new dat.GUI();
$("#guidat")
    .find(".guidat")
    .prepend("<div id=\"guiAbout\">" + $("#about").html() + "</div>");

gui.add(options, "zoom").min(10).max(500)
    .onChange(function () {
        threeMesh.scale.set(options.zoom, options.zoom, options.zoom);
    });
gui.add(material, "wireframe");
gui.add(options, "meshResolution")
    .name("Mesh Resolution").min(10).max(350).step(1);
gui.add(options, "changeHarmonics")
    .name("New Random Parameters");
gui.add(options, "updateMesh")
    .name("Generate New Mesh!");

/*
(function addParticles() {
    var positions = [];
    for (var k = 0; k < 500; k++) {
        positions.push(toxi.geom.Vec3D.randomVector().scale(200 + Math.random() * 300));
    }
    var geom = new THREE.Geometry();
    geom.vertices = positions.map(function (v) { return new THREE.Vector3(v.x, v.y, v.z); });
    var material = new THREE.ParticleBasicMaterial({
        color: 0xffff00,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    var particleSystem = new THREE.ParticleSystem(geom, material);
    scene.add(particleSystem);

    //if you construct a new toxi.THREE.ToxiclibsSupport
    //and pass it the THREE.Scene it can add things for you
    //new toxi.THREE.ToxiclibsSupport( scene ).addParticles(positions, particleMaterial );
}());
*/
//create first mesh
options.updateMesh();
//start the animation loop
animate();
function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    controls.update();
    renderer.render(scene, camera);
}


//THREE.TrackballControls prevents scrolling, so let's stop it from getting the event
(function () {
    var stopProp = function (evt) { evt.stopPropagation(); };
    document.addEventListener('mousewheel', stopProp, true);
    document.addEventListener('DOMMouseScroll', stopProp, true);
})();
