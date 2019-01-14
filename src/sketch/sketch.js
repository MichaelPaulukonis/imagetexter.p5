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
import Undo from './undo.js'

export default function Sketch (p5, textManager, params, guiControl) {
  params.textsize = params.textsize || 10
  params.randomSizeMode = params.randomSizeMode || true

  let bypassRender = false

  const blackfield = '#000000'
  const whitefield = '#FFFFFF'
  params.blackText = false
  var img
  var drawingLayer // drawing layer
  let canvasSize = { x: 700, y: 700 }
  var undo
  let layers = {
    drawingLayer,
    p5
  }

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
    canvas.drop(gotFile)
    layers.drawingLayer = initializeDrawingLayer(canvasSize.x, canvasSize.y)

    setBodyCopy(textManager.getText())
    const textButton = document.getElementById('applytext')
    textButton.addEventListener('click', () => {
      textManager.setText(getBodyCopy())
    })
    curPaintMode = params.paintMode || 2 // paint with background
    guiControl.setupGui(this)
    setRandomImage()
    undo = new Undo(layers, renderLayers, 10)
  }

  const renderSetup = (r) => {
    r.pixelDensity(1)
    clearLayer(r)
    r.textSize(params.textsize)
    r.textAlign(p5.CENTER, p5.CENTER)
    r.textFont(params.font)
  }

  p5.draw = () => {
    if (params.autoPaintGrid && imageLoaded) {
      paintGrid(layers.drawingLayer, getTextFunc(params.textMode, textManager))
      params.autoPaintGrid = false
    }
    if (params.autoSave && imageLoaded) {
      this.saveSketch()
      params.autoSave = false
    }

    if (params.autoPaintMode) {
      paintWordInRegion(0, 0, p5.width, p5.height)
      return
    }

    if (p5.mouseIsPressed && mouseInCanvas()) {
      paintWordAtPoint(p5.mouseX, p5.mouseY)
    }
  }

  const mouseInCanvas = () => {
    let mic = p5.mouseY > 0 && p5.mouseY < p5.height && p5.mouseX > 0 && p5.mouseX < p5.width
    return mic
  }

  p5.mouseReleased = () => {
    undo.takeSnapshot()
  }

  const renderLayers = () => {
    if (bypassRender) return
    clearLayer(layers.p5)
    // once the param changes, we should NOT use the changed version
    // UNTIL the drawing has been cleared
    // not sure of the cleanest way to do it
    // not a common thing, but.... UGH
    p5.blendMode(params.blackText ? p5.DARKEST : p5.LIGHTEST)
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
    p5.image(layers.drawingLayer, 0, 0)
  }
  this.renderTarget = renderTarget

  const clearLayer = (r = p5) => {
    r.blendMode(p5.NORMAL)
    var field = params.blackText ? whitefield : blackfield
    r.background(field)
  }
  this.clearLayer = clearLayer

  const clearDrawing = () => {
    clearLayer(layers.drawingLayer)
    p5.blendMode(params.blackText ? p5.DARKEST : p5.LIGHTEST)
    renderLayers()
  }
  this.clearDrawing = clearDrawing

  const getTextFunc = (textMode, textManager) => {
    const textFunc = (parseInt(textMode, 10) === 0 ? textManager.getchar : textManager.getWord)
    return textFunc
  }

  const paintTextAtPoint = (t, coords, target) => {
    const { x, y } = coords
    if (params.rotate) {
      target.push()
      target.translate(x, y)
      target.rotate(p5.radians(params.rotation))
      target.text(t, 0, 0)
      target.pop()
    } else {
      target.text(t, x, y)
    }
  }

  function paintWordAtPoint (locX, locY) {
    if (params.randomSizeMode) {
      paintRandomSizedWordNearPoint(locX, locY)
    } else {
      layers.drawingLayer.textSize(params.textsize)
      paintWordNearPoint(locX, locY)
    }
  }

  function paintWordNearPoint (locX, locY) {
    // absolute positioning
    const x = locX + distanceJitter()
    const y = locY + distanceJitter()
    layers.drawingLayer.fill(getFill(x, y, params.paintMode))
    paintTextAtPoint(textManager.getWord(), { x, y }, layers.drawingLayer)
    renderLayers()
  }

  // paint word in a different size
  function paintRandomSizedWordNearPoint (locX, locY) {
    layers.drawingLayer.textSize(randomSizeNear(params.textsize))
    paintWordNearPoint(locX, locY)
    layers.drawingLayer.textSize(params.textsize) // restore original size
  }

  function randomSizeNear (prevSize) {
    var offset = textSizeJitter()
    var newsize = offset + prevSize
    if (newsize < 2) newsize = 2
    return newsize
  }

  function changeTextsize (direction) {
    var step = 2
    params.textsize = (params.textsize + step * direction)
    if (params.textsize < 1) params.textsize = step
    layers.drawingLayer.textSize(params.textsize)
  }

  const makeJitterGetter = (param) => () => {
    return getRandomInt(-params[param], params[param])
  }

  const makeSetJitter = (param) => (direction) => {
    var step = 2
    params[param] = (params[param] + step * direction)
    if (params[param] < 0) params[param] = 0
  }

  const distanceJitter = makeJitterGetter('distanceJitRange')
  const textSizeJitter = makeJitterGetter('textsizeJitRange')
  const setDistanceJitRange = makeSetJitter('distanceJitRange') // used with a gui key only
  // const setTextSizeJitRange = makeSetJitter('textsizeJitRange') // unmapped

  const setFont = (font, layer = layers.drawingLayer) => {
    layer.textFont(font)
  }
  this.setFont = setFont

  const imageReady = () => {
    renderSetup(layers.p5)
    renderSetup(layers.drawingLayer)
    if (img.height < p5.height) {
      img.resize(0, p5.height)
    } else {
      img.resize(p5.width, 0)
      layers.p5.resizeCanvas(layers.p5.width, img.height)
      layers.drawingLayer = initializeDrawingLayer(p5.width, p5.height)
    }
    renderSetup(layers.p5)
    renderSetup(layers.drawingLayer)
    img.loadPixels()
    clearLayer(layers.drawingLayer)
    imageLoaded = true
    renderLayers()
  }

  const initializeDrawingLayer = (w, h) => {
    let layer = p5.createGraphics(w, h)
    setFont(params.font, layer)
    return layer
  }

  function setRandomImage () {
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
  const paintGrid = (r = layers.drawingLayer, nextText = textManager.getchar) => {
    r.textSize(params.textsize)
    r.textAlign(p5.LEFT, p5.BOTTOM) // this "works" but leaves us with a blank line on top (and other artifacts)

    const yOffset = getYoffset(r.textAscent(), params.heightOffset)
    const fill = ((paintMode, layer) => bloc => layer.fill(getFill(bloc.x, bloc.y, paintMode)))(params.paintMode, r)
    const paint = (layer => bloc => paintTextAtPoint(bloc.text, bloc, layer))(r)
    let blocGen = blocGenerator(nextText, whOnly(p5), yOffset, r)
    let apx = (...fns) => gen => [...gen].map(b => fns.forEach(f => f(b)))
    apx(fill, paint)(blocGen)

    r.textAlign(p5.CENTER, p5.CENTER)
    renderLayers(params)
  }

  const getYoffset = (textAscent, heightOffset) => {
    var yOffset = textAscent + heightOffset
    yOffset = (yOffset > 2) ? yOffset : 3
    return yOffset
  }

  const whOnly = obj => ({ width: obj.width, height: obj.height })

  const hasNextCoord = (coords, gridSize, yOffset) => {
    return coords.x < gridSize.width && (coords.y - yOffset) < gridSize.height
  }

  const nextCoord = (coords, offsets, gridWidth) => {
    let nc = { ...coords }
    nc.x = nc.x + offsets.x
    if (nc.x + (0.25 * offsets.x) > gridWidth) {
      nc.x = 0
      nc.y = nc.y + offsets.y
    }
    return nc
  }

  function * blocGenerator (nextText, gridSize, yOffset, r) {
    let t = nextText()
    let coords = { x: 0, y: yOffset }
    let offsets = { x: 0, y: yOffset }
    while (hasNextCoord(coords, gridSize, yOffset)) {
      yield { text: t, x: coords.x, y: coords.y }
      offsets.x = r.textWidth(t)
      coords = nextCoord(coords, offsets, gridSize.width)
      t = nextText()
    }
    return 'done'
  }

  const paintModes = Object.keys(params.paintModes).length
  var curPaintMode = 0
  function nextPaintMode (direction) {
    curPaintMode = (curPaintMode + direction) % paintModes
    if (curPaintMode < 0) curPaintMode = paintModes - 1
  }

  /**
   * external refs include:
   * p5 params, blackfield, whitefield, img
   */
  const getFill = (locX, locY, paintMode) => {
    if (locX < 0) locX = 0
    if (locX >= p5.width) locX = p5.width - 1
    if (locY < 0) locY = 0
    if (locY >= p5.height) locY = p5.height - 1

    switch (parseInt(paintMode, 10)) {
      case 0:
      default:
        return (params.blackText) ? blackfield : whitefield

      // this is the one I'm really interested in for the project
      case 2:
        // This is adapted from the get() source - but is faster, since loadPixels()
        // is not performed on each iteration
        // ugh, img and p5 are not passed in......
        var pix = img.drawingContext.getImageData(locX, locY, 1, 1).data
        return p5.color(pix[0], pix[1], pix[2])

      case 1:
        // TODO: fill based on... mouseX/MouseY + offset?
        return p5.color(locX, locY, 100)

      case 3:
        return blackfield

      case 4:
        return whitefield
    }
  }

  function toggleAutoPaintMode () {
    params.autoPaintMode = !params.autoPaintMode
  }

  const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
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
    params.randomSizeMode = !params.randomSizeMode
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
    } else if (keyCode === p5.RIGHT_ARROW || keyCode === p5.LEFT_ARROW) {
      handled = true
      setDistanceJitRange(keyCode === p5.RIGHT_ARROW ? 1 : -1)
    } else if (keyCode === p5.BACKSPACE || keyCode === p5.DELETE) {
      undo.takeSnapshot()
      handled = true
      clearDrawing()
    }
    return handled
  }

  let keyHandler = (char) => {
    switch (char) {
      case '1':
        macro1()
        break

      case '2':
        macro2()
        break

      case '3':
        macro3()
        break

      case '4':
        macro4()
        break

      case '5':
        setRandomImage()
        break

      case 'a':
        toggleAutoPaintMode()
        break

      case 'c':
        undo.takeSnapshot()
        clearLayer(layers.drawingLayer)
        renderLayers()
        break

      case 'g':
        undo.takeSnapshot()
        paintGrid(layers.drawingLayer, getTextFunc(params.textMode, textManager))
        renderLayers()
        break

      case 'm':
        nextPaintMode(1)
        break
      case 'M':
        nextPaintMode(-1)
        break

      case 'r':
        toggleRandomSizeMode()
        break

      case 's':
        this.saveSketch()
        break

      case 'u':
        undo.undo()
        break
      case 'U':
        undo.redo()
        break

      case 'x':
      case 'X':
        params.blackText = !params.blackText
        // setFill(p5.mouseX, p5.mouseY, layers.drawingLayer)
        break
    }
  }

  const gotFile = (file) => {
    // If it's an image file
    if (file.type === 'image') {
      img = p5.loadImage(file.data, imageReady)
    } else {
      p5.println('Not an image file!')
    }
  }

  const macroWrapper = (f) => () => {
    // the whole `bypassRender` global is awkward
    // at least we've got the wrapper
    undo.takeSnapshot()
    bypassRender = true
    f()
    bypassRender = false
    renderLayers()
  }

  // TODO: rename? ugh. because
  // createPaintNwords(1000) yeilds a FUNCTION
  const createPaintNwords = (n) => () => {
    for (let i = 0; i < n; i++) {
      paintWordInRegion(0, 0, p5.width, p5.height)
    }
  }

  const macro1 = macroWrapper(createPaintNwords(50))
  const macro2 = macroWrapper(createPaintNwords(1000))
  const macro3 = macroWrapper(createPaintNwords(5000))
  const macro4 = macroWrapper(() => {
    const { rotate, rotation } = params
    params.rotate = true
    params.rotation = 45
    const paintALot = createPaintNwords(1000)
    paintALot()
    params.rotation = -45
    paintALot()
    params.rotate = rotate
    params.rotation = rotation
  })
}
