
runeworks = typeof runeworks != 'undefined' ? runeworks : {}

runeworks.babylon = (function() {

  /* Meta variables */
  let rwGroundTag    = 'rw-ground-tag'
  let canvasSelector = '#rw-canvas'

  let defaults = {
    cameraAlpha : -Math.PI / 2,
    cameraBeta  :  Math.PI / 2.5,
    cameraRadius: 10,
    cameraTarget: new BABYLON.Vector3( 0, 1, 0 ),

    cameraWheelPrecision      : 11,
    cameraRangeLowerProximity : 2.6,
    cameraRangeHigherProximity: 26,
    cameraRangeZenithUp       : Math.PI / 2.2,
    cameraRangeZenithDown     : Math.PI / (Math.PI * 1.7),
    cameraStartPosition       : new BABYLON.Vector3( -1.727, 2.377, 4.974 ),

    lightIntensity    : 1,
    shadowSourceOrigin: new BABYLON.Vector3( 0, 8, -11 ),

    groundWidth       : 6,
    groundHeight      : 6,

    animateSpin       : true,
  }

  /* Events */
  let events = {

  }
  /* In-memory variables */
  let body, canvas, settings, engine, scene, camera, shadows, model, ground;
  /* Computational variables */

  let setup = function(size) {
    body   = document.querySelector('body')
    canvas = document.querySelector(canvasSelector)
    // Set up settings
    settings = {}
    // Resize the canvas
    canvas.height = size ? size : window.innerHeight
    canvas.width  = size ? size : window.innerWidth
    // Create the engine
    engine = new BABYLON.Engine( canvas, false, {}, false )
    // Visual settings
    engine.setHardwareScalingLevel( 0.5 )
    engine.resize()
    // Event Listeners
    window.addEventListener('resize', engine.resize)

  }

  let defaultScene = async function(options) {
    let assets = await createScene(options)


    // Set some defaults
    settings.animateSpin = options?.animateSpin || defaults.animateSpin

    // Animate
    engine.runRenderLoop(function() {
      let spin = settings.animateSpin
      if (spin && camera?.alpha) {
        camera.alpha += 0.001
      }
      scene.render()
    })
    return assets
  }

  let createScene = async function(options) {
    scene = new BABYLON.Scene(engine)
    
    let cameraAlpha  = options?.cameraAlpha  || defaults.cameraAlpha
    let cameraBeta   = options?.cameraBeta   || defaults.cameraBeta
    let cameraRadius = options?.cameraRadius || defaults.cameraRadius
    let cameraTarget = options?.cameraTarget || defaults.cameraTarget

    let cameraWheelPrecision       = options?.cameraWheelPrecision       || defaults.cameraWheelPrecision
    let cameraRangeLowerProximity  = options?.cameraRangeLowerProximity  || defaults.cameraRangeLowerProximity
    let cameraRangeHigherProximity = options?.cameraRangeHigherProximity || defaults.cameraRangeHigherProximity
    let cameraRangeZenithUp        = options?.cameraRangeZenithUp        || defaults.cameraRangeZenithUp
    let cameraRangeZenithDown      = options?.cameraRangeZenithDown      || defaults.cameraRangeZenithDown
    let cameraStartPosition        = options?.cameraStartPosition        || defaults.cameraStartPosition

    /* Camera Setup */
    camera = new BABYLON.ArcRotateCamera('viewport', cameraAlpha, cameraBeta, cameraRadius, cameraTarget)
    // Attach camera to canvas
    camera.attachControl(canvas, true, false, 0)
    // Adjust the camera movements
    scene.useRightHandedSystem = true
    // Camera target
    camera.setTarget(cameraTarget)
    // Wheel inputs
    camera.inputs.addMouseWheel()
    camera.wheelPrecision = cameraWheelPrecision
    // Restrict camera-to-target range
    camera.lowerRadiusLimit = cameraRangeLowerProximity
    camera.upperRadiusLimit = cameraRangeHigherProximity
    // Restrict camera to above ground level
    camera.upperBetaLimit = cameraRangeZenithUp
    camera.lowerBetaLimit = cameraRangeZenithDown
    // Restrict Y-axis movement to prevent compound movements (this avoids below-ground transposition)
    camera.panningAxis = new BABYLON.Vector3( 1.1, 0, -1.6)
    // Change the speed of rotation
    camera.angularSensibilityX = 2000
    camera.angularSensibilityY = 2000
    // Set starting position
    camera.position = cameraStartPosition

    /* Light setup */
    let lightIntensity = options?.lightIntensity || defaults.lightIntensity

    let light = new BABYLON.HemisphericLight('Light', new BABYLON.Vector3( 0, 4, 2 ), scene)
    light.diffuse     = new BABYLON.Color3( 0.98, 0.97, 0.95 )
    light.specular    = new BABYLON.Color3( 0.98, 0.97, 0.95 )
    light.groundColor = new BABYLON.Color3( 0, 0, 0 )

    /* Creating shadow source */
    let shadowSourceOrigin = options?.shadowSourceOrigin || defaults.shadowSourceOrigin
    const dirlight = new BABYLON.DirectionalLight('DirLight01', new BABYLON.Vector3( 1, -1, 0 ), scene)
    dirlight.position = shadowSourceOrigin
    /* Shadow generator */
    shadows = new BABYLON.ShadowGenerator( 1024, dirlight )

    /* Ground setup */
    let groundWidth  = options?.groundWidth  || defaults.groundWidth
    let groundHeight = options?.groundHeight || defaults.groundHeight
    ground = BABYLON.MeshBuilder.CreateGround('ground', {width: groundWidth, height: groundHeight}, scene)
    ground.receiveShadows = true
    // Tag the ground
    ground.rwGroundTag = rwGroundTag

    return {
      scene   : scene, 
      camera  : camera, 
      model   : model, 
      ground  : ground, 
      engine  : engine, 
      shadows : shadows, 
      settings: settings
    }
  }

  return {
    setup       : setup,
    createScene : createScene,
    defaultScene: defaultScene,
    getAssets   : function() { 
      return {
        scene   : scene,
        camera  : camera,
        model   : model,
        ground  : ground,
        engine  : engine,
        shadows : shadows,
        settings: settings,
      } 
    },
  }
})()
