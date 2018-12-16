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

  let bypassRender = false

  const blackfield = '#000000';
  const whitefield = '#FFFFFF';
  params.blackNotWhite = false;
  var img;
  var drawingLayer // drawing layer
  // var layer2 // image reference layer (for superimposition - manual comparison reference, not saved)
  let canvasSize = { x: 700, y: 700 }

  const textInputBox = document.getElementById('bodycopy')
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
    drawingLayer = initializeDrawingLayer(canvasSize.x, canvasSize.y)

    setBodyCopy(textManager.getText())
    const textButton = document.getElementById('applytext')
    textButton.addEventListener('click', () => {
      textManager.setText(getBodyCopy())
    })
    curPaintMode = params.paintMode || 2; // paint with background
    guiControl.setupGui(this)
    parseImageSelection();
  }

  const renderSetup = (r) => {
    r.pixelDensity(1)
    clearLayer(r);
    r.textSize(params.textsize);
    r.textAlign(p5.CENTER, p5.CENTER);
    r.textFont(params.font)
  }

  p5.draw = () => {
    if (params.autoPaintGrid && imageLoaded) {
      paintGrid(drawingLayer)
      params.autoPaintGrid = false
    }
    if (params.autoSave && imageLoaded) {
      this.saveSketch()
      params.autoSave = false
    }

    if (params.autoPaintMode) {
      paintWordInRegion(0, 0, p5.width, p5.height);
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

  const renderLayers = () => {
    if (bypassRender) return
    clearLayer(p5)
    // once the param changes, we should NOT use the changed version
    // UNTIL the drawing has been cleared
    // not sure of the cleanest way to do it
    // not a common thing, but.... UGH
    p5.blendMode(params.blackNotWhite ? p5.DARKEST : p5.LIGHTEST)
    if (params.showReference) {
      p5.push()
      p5.tint(255, (params.referenceTransparency / 100 * 255))
      p5.image(img, 0, 0)
      p5.pop()
    }
    renderTarget()
  }
  this.renderLayers = renderLayers

  const renderTarget = () => {
    p5.image(drawingLayer, 0, 0)
  }
  this.renderTarget = renderTarget

  const clearLayer = (r = p5) => {
    r.blendMode(p5.NORMAL)
    var field = params.blackNotWhite ? whitefield : blackfield
    r.background(field)
  }
  this.clearLayer = clearLayer

  const clearDrawing = () => {
    // TODO: everywhere, this appears to be inverted
    // or it is named wrong. It's what the background should be
    // TODO: also figure out how to make background ALPHA which would get rid of the whole need for blending
    clearLayer(drawingLayer)
    p5.blendMode(params.blackNotWhite ? p5.DARKEST : p5.LIGHTEST)
    renderLayers()
  }
  this.clearDrawing = clearDrawing

  function paintWordAtPoint (locX, locY) {
    if (params.randomSizeMode) {
      spatterWordAtPoint(locX, locY);
    }
    else {
      drawingLayer.textSize(params.textsize);
      paintStaticSizedWordNearPoint(locX, locY);
    }
  }

  function paintStaticSizedWordNearPoint (locX, locY) {
    // absolute positioning
    const x = locX + getJitter()
    const y = locY + getJitter()
    setFill(x, y, drawingLayer);
    // shouldn't this be CENTERED ?????
    drawingLayer.text(textManager.getWord(), x, y);
    renderLayers()
  }

  // paint words AROUND the point in different sizes
  function spatterWordAtPoint (locX, locY) {
    const r = drawingLayer
    r.textSize(randomTextSize(params.textsize));
    paintStaticSizedWordNearPoint(locX, locY);
    r.textSize(params.textsize); // restore original size
  }

  function randomTextSize (prevSize) {
    var offset = getJitter();
    var newsize = offset + prevSize;
    if (newsize < 2) newsize = 2;
    return newsize;
  }

  function changeTextsize (direction) {
    var step = 2;
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

  const setFont = (font, layer = drawingLayer) => {
    layer.textFont(font)
  }
  this.setFont = setFont

  const imageReady = () => {
    renderSetup(p5)
    renderSetup(drawingLayer)
    if (img.height < p5.height) {
      img.resize(0, p5.height)
    } else {
      img.resize(p5.width, 0)
      p5.resizeCanvas(p5.width, img.height)
      drawingLayer = initializeDrawingLayer(p5.width, p5.height)
    }
    img.loadPixels()
    clearLayer(drawingLayer)
    imageLoaded = true
    renderLayers()
  }

  const initializeDrawingLayer = (w, h) => {
    let layer = p5.createGraphics(w, h)
    setFont(params.font, layer)
    return layer
  }

  function parseImageSelection () {
    params.image = getRandom(params.images)
    // seriously? this is not part of sketch - it's external knowledge
    // ALSO NOT PART OF THE GUI - it should be provided
    setImage(`./assets/images/${params.image}`)
  }

  const setImage = (filename) => {
    imageLoaded = false
    img = p5.loadImage(filename, imageReady)
  }
  this.setImage = setImage

  // print a grid of characters from upper-left to lower-right
  // TODO: not honoring text size (probably a layers thing)
  const paintGrid = (r = drawingLayer) => {
    r.textSize(params.textsize)
    r.textAlign(p5.LEFT, p5.BOTTOM);
    var nextX = 0
    var nextY = 0
    var yOffset = r.textAscent() + params.heightOffset
    yOffset = (yOffset > 2) ? yOffset : 3
    var w = textManager.getchar();
    nextY = nextY + yOffset;
    while (nextX < p5.width && (nextY - yOffset) < p5.height) {
      setFill(nextX, nextY, r);
      r.text(w, nextX, nextY);
      nextX = nextX + r.textWidth(w);
      w = textManager.getchar();
      // this can leave a gap on the right - there should be _some_ overlap
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
        renderer.fill(pix[0], pix[1], pix[2]);
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

  const paintWordInRegion = (minX, minY, maxX, maxY) => {
    let locX = getRandomInt(minX, maxX)
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
    let handled = false
    if (keyCode === p5.UP_ARROW || keyCode === p5.DOWN_ARROW) {
      handled = true
      changeTextsize(keyCode === p5.UP_ARROW ? 1 : -1)
    }
    else if (keyCode == p5.RIGHT_ARROW || keyCode == p5.LEFT_ARROW) {
      handled = true
      setJitRange(eyCode === p5.RIGHT_ARROW ? 1 : -1)
    }
    else if (keyCode === p5.BACKSPACE || keyCode === p5.DELETE) {
      handled = true
      clearDrawing()
    }
    return handled
  }

  let keyHandler = (char) => {
    switch (char) {

      case '1':
        macro1()
        break;

      case '2':
        macro2()
        break;

      case '3':
        macro3()
        break;

      case '5':
        parseImageSelection();
        break;

      case 'a':
        toggleAutoPaintMode();
        break;

      case 'c':
        clearLayer(drawingLayer);
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

  const gotFile = (file) => {
    // If it's an image file
    if (file.type === 'image') {
      img = p5.loadImage(file.data, imageReady)
    } else {
      p5.println('Not an image file!');
    }
  }

  const macroWrapper = (f) => () => {
    // the whole `bypassRender` global is awkward
    // at least we've got the wrapper
    bypassRender = true
    f()
    bypassRender = false
    renderLayers()
  }

  const paintNwords = (n) => () => {
    for (let i = 0; i < n; i++) {
      paintWordInRegion(0, 0, p5.width, p5.height)
    }
  }

  const macro1 = macroWrapper(paintNwords(50))
  const macro2 = macroWrapper(paintNwords(1000))
  const macro3 = macroWrapper(paintNwords(5000))

}