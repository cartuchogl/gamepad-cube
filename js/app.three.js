/* global _, $, THREE, FPSMeter */
(function(){

  var xRot = 0;
  var yRot = 0;

  var xxx = 0.0;
  var yyy = 0.0;

  var scene;
  var camera;
  var renderer;
  var cube;

  function resizeCanvas() {
    var canvas = document.getElementById("three-canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  var lastTime = 0;

  function animate() {
    var timeNow = new Date().getTime();
    if (lastTime !== 0) {
      if(controllers[0]) {
        xRot = controllers[0].axes[3]*50;
        yRot = controllers[0].axes[2]*50;

        yyy = -controllers[0].axes[1];
        xxx = controllers[0].axes[0];

        cube.rotation.x = degToRad(xRot);
        cube.rotation.y = degToRad(yRot);
        cube.position.x = xxx;
        cube.position.y = yyy;
      }
    }
    lastTime = timeNow;
  }

  var meter;

  function draw() {
    requestAnimationFrame(draw);
    // ... Code for Drawing the Frame ...
    tick();
  }

  function tick() {
    meter.tickStart();

    animate();

    renderer.render(scene, camera);

    updateStatus();
    meter.tick();
    rendererStats.update(renderer);
  }


  var haveEvents = 'ongamepadconnected' in window;
  var controllers = {};

  function connecthandler(e) {
    addgamepad(e.gamepad);
  }

  function addgamepad(gamepad) {
    controllers[gamepad.index] = gamepad;

    var html = _.template($('#controller-info-template').html())(gamepad);
    $('#controllers-list h1').remove();
    $('#controllers-list').append(html);
    requestAnimationFrame(updateStatus);
  }

  function disconnecthandler(e) {
    removegamepad(e.gamepad);
  }

  function removegamepad(gamepad) {
    $("controller" + gamepad.index).remove();
    delete controllers[gamepad.index];
  }

  var marks = [];

  function updateStatus() {
    if (!haveEvents) {
      scangamepads();
    }

    var i = 0;
    var j;

    for (j in controllers) {
      var controller = controllers[j];
      if(marks[controller.index]!==controller.timestamp) {
        marks[controller.index] = controller.timestamp;
        var d = document.getElementById("controller" + j);
        var buttons = d.getElementsByClassName("buttonll");

        for (i = 0; i < controller.buttons.length; i++) {
          var b = buttons[i];
          var val = controller.buttons[i];

          $(b).prev('h5').html('B'+i + "<br>"+ val.value.toFixed(2));
          b.setAttribute("value", val.value);

        }

        var axes = d.getElementsByClassName("axis");
        for (i = 0; i < controller.axes.length; i++) {
          var a = axes[i];
          $(a).prev('h5').html('AXIS '+i + ": " + controller.axes[i].toFixed(8));
          a.setAttribute("value", controller.axes[i] + 1);
        }
      }
    }
  }

  function scangamepads() {
    var gamepads = navigator.getGamepads();
    for (var i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        if (gamepads[i].index in controllers) {
          controllers[gamepads[i].index] = gamepads[i];
        } else {
          addgamepad(gamepads[i]);
        }
      }
    }
  }

  function initScene() {
    renderer = new THREE.WebGLRenderer( { canvas: document.getElementById("three-canvas"), alpha: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000, 0 ); // the default

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 1, 1 ).normalize();
    scene.add(light);

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('crate.gif') } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 3;

    meter = new FPSMeter({heat:1,graph:1,right:'5px',left:'auto'});

    draw();
  }

  var rendererStats;

  $(function(){
    rendererStats = new THREEx.RendererStats();
    rendererStats.domElement.style.position = 'absolute';
    rendererStats.domElement.style.left = '0px';
    rendererStats.domElement.style.bottom   = '0px';
    document.body.appendChild( rendererStats.domElement );
    initScene();
    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', _.debounce(resizeCanvas, 500), false);
    window.addEventListener("gamepadconnected", connecthandler);
    window.addEventListener("gamepaddisconnected", disconnecthandler);
  });

})();
