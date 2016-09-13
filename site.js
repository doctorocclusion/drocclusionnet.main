var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(-1, 1, -1, 1, -10, 10);

var renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

var askedMaxX = 1;
var askedMinX = -1;
var askedMaxY = 1;
var askedMinY = -1;
var alignX = .5;
var alignY = 0;
var fit = .9;

function resize(width, height) {
	renderer.setSize(width, height);

	var scaleRatioX = (askedMaxX - askedMinX) / width;
	var scaleRatioY = (askedMaxY - askedMinY) / height;

	if (scaleRatioX > scaleRatioY) {
		var scaleRatio = scaleRatioX * fit + scaleRatioY * (1 - fit);
	} else {
		var scaleRatio = scaleRatioY * fit + scaleRatioX * (1 - fit);
	}

	var centerX = askedMinX * (1. - alignX) + askedMaxX * alignX;
	var centerY = askedMinY * (1. - alignY) + askedMaxY * alignY;

	sizeX = scaleRatio * width;
	sizeY = scaleRatio * height;

	camera.left = centerX - sizeX * alignX;
	camera.right = centerX + sizeX * (1. - alignX);
	camera.top = centerY - sizeY * alignY;
	camera.bottom = centerY + sizeY * (1. - alignY);

	camera.updateProjectionMatrix();
}

resize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', function() {
	resize(window.innerWidth, window.innerHeight);
}, false);

var clock = new THREE.Clock();

var drawGeo;

function initGeo(obs) {
	var solid = new THREE.MeshBasicMaterial({ color: 0xF0F0F0 });
	var wire = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x000000, wireframeLinewidth: 3 });
	var outline = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x000000, wireframeLinewidth: 10 });

	// Ico
		var solidIco = new THREE.Mesh(obs.Ico, solid);
		var wireIco = new THREE.Mesh(obs.Ico, wire);

		var wireIcoObj = new THREE.Object3D();
		wireIcoObj.add(wireIco);
		wireIcoObj.scale.set(1.05, 1.05, 1.05);

		var icoObj = new THREE.Object3D();
		icoObj.add(solidIco);
		icoObj.add(wireIcoObj);

		icoObj.translateY(-.7);

		scene.add(icoObj);

	// Text
		var solidText = new THREE.Mesh(obs.Text, solid);
		var outlineText = new THREE.Mesh(obs.Text, outline);

		var outlineTextObj = new THREE.Object3D();
		outlineTextObj.add(outlineText);
		outlineTextObj.translateZ(-1);

		var textObj = new THREE.Object3D();
		textObj.add(solidText);
		textObj.add(outlineTextObj);

		textObj.translateY(-.15);

		scene.add(textObj);

	drawGeo = function() {
		var secs = clock.getElapsedTime();

		icoObj.rotation.x = 0;
		icoObj.rotation.y = 0;
		icoObj.rotation.z = 0;
		var rotVec = new THREE.Vector3(Math.sin(secs + 1), Math.sin(secs + 3), Math.sin(secs + 6));
		icoObj.rotateOnAxis(rotVec.normalize(), 90);

		lastSec = secs;
	}
}

var loader = new THREE.OBJLoader();
loader.load('../name.obj', function(object) {
		var obs = {};

		for (var i in object.children) {
			var child = object.children[i];
			obs[child.name] = child.geometry;
		}

		initGeo(obs);
	}
);

function render() {
	requestAnimationFrame(render);

	if (drawGeo) {
		drawGeo();
	}

	renderer.setClearColor(new THREE.Color(0x3C4E59));
	renderer.render(scene, camera);
}

render();