
// Renderer
var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Scene
var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

// Camera
var camera = new THREE.PerspectiveCamera( 30, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 5;
scene.add(camera);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.7) );
var light = new THREE.PointLight( 0xffffff, 0.2, 1000 );
light.position.set( 50, 25, 50 );
camera.add( light );

// Globe
var globe = new Globe();
scene.add( globe );

/*
 * Points
 */

// Generating the dataset
var x=rnorm(), y=rnorm(), z=rnorm();
function rsphere(){
    x += 0.03*rnorm(); y+= 0.03*rnorm(); z+=0.03*rnorm();
    s = Math.sqrt(x*x + y*y + z*z);
    x = x/s; y = y/s; z = z/s;
    return [x, y, z];
}
var dataset = [];
for (var i = 0; i < 5000; i ++) dataset.push(rsphere());

// Creating the points
var points = new THREE.Group();
for (i = 0; i < dataset.length; i++) points.add(new Point(dataset[i]));
scene.add(points);

// Controls
var controls = new Controls(points, camera, renderer, window);
controls.onMouseWheel = function(event) {
    for (i=0; i < points.children.length; i++){
        points.children[i].setScale(controls.fovScale);
    }
    globe.setOpacity(1 - (1-Globe.OPACITY) * controls.fovScale);
    highlightPoints();
};
controls.onMouseMove = function(event) {
    highlightPoints();
};
controls.onMouseUp = function(event) {
    document.body.style.cursor = "crosshair";
}
controls.onMouseDown = function(event) {
    document.body.style.cursor = "grabbing";
}
controls.setup();

var highlighted = [];
var raycaster = new THREE.Raycaster();
function highlightPoints(){
    // Highlighting points
    raycaster.setFromCamera(controls.mousePosition, camera);
    var intersects = raycaster.intersectObjects(points.children);

    for (var i = 0; i < highlighted.length; i++){
        highlighted[i].object.material = Point.DEFAULT_MAT;
        highlighted[i].object.setScale(controls.fovScale);
    }
    highlighted = [];
    for (var i = 0; i < intersects.length; i++) {
        intersects[i].object.material = Point.DEFAULT_HIGHLIGHT_MAT;
        intersects[i].object.setScale(1.25 * controls.fovScale);
        highlighted.push(intersects[i])
    }
}

var quat = new THREE.Quaternion();
var animate = function () {

    quat.setFromAxisAngle({x:1, y:0, z:1}, -0.0015*controls.fovScale);
    points.applyQuaternion(quat);

    requestAnimationFrame( animate );
    renderer.render(scene, camera);
};
