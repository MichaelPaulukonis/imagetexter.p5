/*
 A text-painter, with var coming (primarily) from 4 possible images.
 Try painting a grid, reducing the size, and painting again!
 
 UP/DOWN - change text size
 LEFT/RIGHT - change amount of "jitter" (random offset for painting)
 a - toggle AutoPaint (on/off)
 1,2,3,4 - change var-source image
 stored as square "001.jpg" etc, in the data folder
 g - paint a grid of text covering entire screen
 m/M - change paint Mode (the default mode takes var from images)
 s - save
 x - change black/white mode. mostly applies to alternate paint modes, or clearing screen
 DELETE - clear screen; sets to white/black depending upon black/white mode (default: black) 
 */
import Undo from './undo.js' // TODO: implement

export default function Sketch (p5, textManager, params, guiControl) {

  params.textsize = params.textsize || 10;
  params.randomSizeMode = params.randomSizeMode || true;

  const blackfield = '#000000';
  const whitefield = '#FFFFFF';
  params.blackNotWhite = false;
  var img;
  var drawingLayer // drawing layer
  // var layer2 // image reference layer (for superimposition - manual comparison reference, not saved)
  let canvasSize = { x: 700, y: 700 }

  const textInputBox = document.getElementById('bodycopy')
  const imageLoadedDisplay = p5.select('#imageLoaded')
  let imageLoaded = false

  function getBodyCopy () {
    return textInputBox.value
  }

  function setBodyCopy (text) {
    textInputBox.value = text
  }

  p5.setup = () => {
    const canvas = p5.createCanvas(canvasSize.x, canvasSize.y)
    canvas.parent('sketch-holder')
    canvas.drop(gotFile);
    drawingLayer = p5.createGraphics(canvasSize.x, canvasSize.y)
    // layer2 = p5.createGraphics(canvasSize.x, canvasSize.y)

    setBodyCopy(textManager.getText())
    const textButton = document.getElementById('applytext')
    textButton.addEventListener('click', () => {
      textManager.setText(getBodyCopy())
    })
    renderSetup(p5)
    renderSetup(drawingLayer)
    // renderSetup(layer2)
    p5.frameRate(60); // change if paint events seem to be too rapid
    curPaintMode = params.paintMode || 2; // paint with background var.
    guiControl.setupGui(this)
    parseImageSelection(4); // TODO: pick at random?
  }

  const renderSetup = (r) => {
    r.pixelDensity(1)
    clearCanvas(r);
    r.textSize(params.textsize);
    r.textAlign(p5.CENTER, p5.CENTER);
    r.textFont(params.font)
  }

  p5.draw = () => {
    // if autopaint AND the image has been imageLoaded....
    if (params.autoPaintGrid && imageLoaded) {
      paintGrid(drawingLayer)
      params.autoPaintGrid = false
    }
    if (params.autoSave && imageLoaded) {
      this.saveSketch()
      params.autoSave = false
    }

    if (params.autoPaintMode) {
      autoPaintRegion(0, 0, p5.width, p5.height);
      return;
    }

    if (p5.mouseIsPressed && mouseInCanvas()) {
      paintWordAtPoint(p5.mouseX, p5.mouseY);
    }
  }

  const mouseInCanvas = () => {
    let mic = p5.mouseY > 0 && p5.mouseY < p5.height && p5.mouseX > 0 && p5.mouseX < p5.width
    return mic
  }

  const logSizes = (msg) => {
    if (msg) console.log(msg)
    console.log(`canvas: ${p5.width},${p5.height}`)
    console.log(`drawing: ${drawingLayer.width},${drawingLayer.height}`)
    console.log(`image: ${img.width},${img.height}`)
  }

  const renderLayers = () => {
    if (p5.width !== drawingLayer.width || p5.height !== drawingLayer.height) {
      logSizes('\\nnDISCONTINUITY!!!\n')
    }
    p5.image(drawingLayer, 0, 0)
    if (params.showReference) {
      p5.push()
      p5.tint(255, (params.referenceTransparency / 100 * 255))
      p5.image(img, 0, 0)
      p5.pop()
    }
  }
  this.renderLayers = renderLayers

  const renderTarget = () => {
    p5.image(drawingLayer, 0, 0)
  }
  this.renderTarget = renderTarget

  function paintWordAtPoint (locX, locY) {
    if (params.randomSizeMode) {
      spatterWordAtPoint(locX, locY);
    }
    else {
      drawingLayer.textSize(params.textsize);
      paintStaticSizedWordAtPoint(locX, locY);
    }
  }

  function paintStaticSizedWordAtPoint (locX, locY) {
    // absolute positioning
    const x = locX + getJitter()
    const y = locY + getJitter()
    setFill(x, y, drawingLayer);
    drawingLayer.text(textManager.getWord(), x, y);
    renderLayers()
  }

  // paint words AROUND the point in different sizes
  function spatterWordAtPoint (locX, locY) {
    const r = drawingLayer
    r.textSize(randomTextSize(params.textsize));
    paintStaticSizedWordAtPoint(locX, locY);
    r.textSize(params.textsize); // restore original size
  }

  function randomTextSize (prevSize) {
    var offset = getJitter();
    var newsize = offset + prevSize;
    if (newsize < 2) newsize = 2;
    return newsize;
  }

  const clearCanvas = (r = p5) => {
    var field = params.blackNotWhite ? whitefield : blackfield;
    r.background(field);
  }
  this.clearCanvas = clearCanvas

  function changeTextsize (direction) {
    var step = 5;
    params.textsize = (params.textsize + step * direction);
    if (params.textsize < 1) params.textsize = step;
    drawingLayer.textSize(params.textsize);
  }

  var jitRange = 20;
  function getJitter () {
    return getRandomInt(-jitRange, jitRange)
  }

  function setJitRange (direction) {
    var step = 5;
    jitRange = (jitRange + step * direction);
    if (jitRange < 1) jitRange = 1;
  }

  // TODO: there are discontinuties
  // canvas:  700,941
  // drawing: 700,700
  // image:   700,941
  const imageReady = () => {
    logSizes('imageReady enter')
    if (img.height < p5.height) {
      img.resize(0, p5.height)
      console.log(`image branch)`)
    } else {
      img.resize(p5.width, 0)
      p5.resizeCanvas(p5.width, img.height)
      drawingLayer = p5.createGraphics(p5.width, p5.height)
      console.log(`all branch)`)
    }
    img.loadPixels()
    clearCanvas(drawingLayer)
    imageLoadedDisplay.removeClass('hide')
    imageLoaded = true
    logSizes('imageReady exit')
    renderLayers()
  }

  // select one of the 4 images
  // this BEGS for a refactoring
  /* @pjs preload="001.jpg,002.jpg,003.jpg,004.jpg"; */
  function parseImageSelection (image) {

    switch (image) {
      case 1:
        setImage("./assets/001.jpg")
        break;

      case 2:
        setImage("./assets/002.jpg")
        break;

      case 3:
        setImage("./assets/003.jpg")
        break;

      case 4:
        setImage("./assets/004.jpg")
        break;

      case 5:
        let fileName = getRandom(params.images)
        setImage(`./assets/images/${fileName}`)
    }
  }

  const setImage = (filename) => {
    if (imageLoadedDisplay.class() !== 'hide') {
      imageLoadedDisplay.addClass('hide')
    }
    imageLoaded = false
    img = p5.loadImage(filename, imageReady)
  }
  this.setImage = setImage

  // print a grid of characters from upper-left to lower-right
  // TODO: not honoring text size (probably a layers thing)
  const paintGrid = (r = drawingLayer) => {
    r.textAlign(p5.LEFT, p5.BOTTOM);
    var nextX = 0
    var nextY = 0
    // TODO: make this somewhat tweakable
    // same too the space between
    // var yOffset = (p5.textAscent() + p5.textDescent());
    var yOffset = r.textAscent() //+ p5.textDescent());

    var w = textManager.getchar();
    nextY = nextY + yOffset;
    while (nextX < p5.width && (nextY - yOffset) < p5.height) {
      setFill(nextX, nextY, r);
      r.text(w, nextX, nextY);
      nextX = nextX + r.textWidth(w);
      w = textManager.getchar();
      if (nextX + r.textWidth(w) > p5.width) {
        nextX = 0;
        nextY = nextY + yOffset;
      }
    }
    r.textAlign(p5.CENTER, p5.CENTER);
    renderLayers(params)
  }


  var paintModes = 3;
  var curPaintMode = 0;
  function nextPaintMode (direction) {
    curPaintMode = (curPaintMode + direction) % paintModes;
    if (curPaintMode < 0) curPaintMode = paintModes - 1;
  }

  function setFill (locX, locY, renderer) {

    if (locX < 0) locX = 0;
    if (locX >= p5.width) locX = p5.width - 1;
    if (locY < 0) locY = 0;
    if (locY >= p5.height) locY = p5.height - 1;

    switch (curPaintMode) {

      case 0:
      default:
        if (params.blackNotWhite) {
          renderer.fill(blackfield);
        }
        else {
          renderer.fill(whitefield);
        }

        break;

      // this is the one I'm really interested in for the project
      case 2:
        // This is adapted from the get() source - but is faster, since loadPixels()
        // is not performed on each iteration
        var pix = img.drawingContext.getImageData(locX, locY, 1, 1).data;
        renderer.fill(pix[0], pix[1], pix[2], pix[3]);
        break;

      case 1:
        // TODO: fill based on... mouseX/MouseY + offset?
        renderer.fill(locX, locY, 100);
        break;
    }
  }

  function toggleAutoPaintMode () {
    params.autoPaintMode = !params.autoPaintMode;
  }

  const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const getRandom = (arr) => {
    return arr[getRandomInt(0, arr.length - 1)]
  }

  function autoPaintRegion (minX, minY, maxX, maxY) {
    var locX = getRandomInt(minX, maxX)
    let locY = getRandomInt(minY, maxY)
    paintWordAtPoint(locX, locY)
  }

  function toggleRandomSizeMode () {
    params.randomSizeMode = !params.randomSizeMode;
  }

  p5.keyPressed = () => {
    if (!mouseInCanvas()) return
    let handled = keyPresser(p5.keyCode)
    return !handled
  }

  p5.keyTyped = () => {
    if (!mouseInCanvas()) return
    keyHandler(p5.key)
    return false
  }

  const keyPresser = (keyCode) => {
    if (keyCode == p5.UP_ARROW || keyCode == p5.DOWN_ARROW) {
      if (keyCode == p5.UP_ARROW) {
        changeTextsize(1);
      }
      else {
        changeTextsize(-1);
      }
    }
    else if (keyCode == p5.RIGHT_ARROW || keyCode == p5.LEFT_ARROW) {
      if (keyCode == p5.RIGHT_ARROW) {
        setJitRange(1);
      }
      else {
        setJitRange(-1);
      }
    }
    else if (keyCode == p5.BACKSPACE || keyCode == p5.DELETE) {
      clearCanvas(drawingLayer);
      renderLayers()
    }
  }

  let keyHandler = (char) => {
    switch (char) {

      case '1':
        parseImageSelection(1);
        break;

      case '2':
        parseImageSelection(2);
        break;

      case '3':
        parseImageSelection(3);
        break;

      case '4':
        parseImageSelection(4);
        break;

      case '5':
        parseImageSelection(5);
        break;

      case 'a':
        toggleAutoPaintMode();
        break;

      case 'c':
        clearCanvas(drawingLayer);
        renderLayers()
        break;

      case 'g':
        paintGrid(drawingLayer);
        renderLayers()
        break;

      case 'm':
        nextPaintMode(1);
        break;
      case 'M':
        nextPaintMode(-1);
        break;

      case 'r':
        toggleRandomSizeMode();
        break;

      case 's':
        this.saveSketch();
        break;

      case 'x':
      case 'X':
        params.blackNotWhite = !params.blackNotWhite;
        setFill(p5.mouseX, p5.mouseY, drawingLayer);
        break;
    }
  }

  function gotFile (file) {
    // If it's an image file
    if (file.type === 'image') {
      img = p5.loadImage(file.data, imageReady)
    } else {
      p5.println('Not an image file!');
    }
  }

}