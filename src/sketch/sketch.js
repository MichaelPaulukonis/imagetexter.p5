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
    const canvas = p5.createCanvas(700, 700)
    canvas.parent('sketch-holder')
    canvas.drop(gotFile);
    setBodyCopy(textManager.getText())
    const textButton = document.getElementById('applytext')
    textButton.addEventListener('click', () => {
      textManager.setText(getBodyCopy())
    })
    clearCanvas();
    p5.textSize(params.textsize);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.frameRate(60); // change if paint events seem to be too rapid
    curPaintMode = params.paintMode || 2; // paint with background var.
    guiControl.setupGui(this)
    parseImageSelection(4);

  }

  p5.draw = () => {
    p5.textFont(params.font)
    // if autopaint AND the image has been imageLoaded....
    if (params.autoPaintGrid && imageLoaded) {
      paintGrid()
      params.autoPaintGrid = false
      console.log('painted!')
      return
    }
    if (params.autoSave && imageLoaded) {
      saveSketch()
      params.autoSave = false
      console.log('saved!')
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
    return p5.mouseY > 0 && p5.mouseY < p5.height && p5.mouseX > 0 && p5.mouseX < p5.width
  }

  function paintWordAtPoint (locX, locY) {
    if (params.randomSizeMode) {
      spatterWordAtPoint(locX, locY);
    }
    else {
      paintStaticSizedWordAtPoint(locX, locY);
    }
  }

  function paintStaticSizedWordAtPoint (locX, locY) {
    // absolute positioning
    const x = locX + getJitter()
    const y =locY + getJitter()
    setFill(x, y);
    p5.text(textManager.getWord(), x, y);
  }

  // paint words AROUND the point in different sizes
  function spatterWordAtPoint (locX, locY) {
    p5.textSize(randomTextSize(params.textsize));
    paintStaticSizedWordAtPoint(locX, locY);
    p5.textSize(params.textsize); // restore original size
  }


  function randomTextSize (prevSize) {
    var offset = getJitter();
    var newsize = offset + prevSize;
    if (newsize < 2) newsize = 2;
    return newsize;
  }


  const clearCanvas = () => {
    var field = params.blackNotWhite ? whitefield : blackfield;
    p5.background(field);
  }
  this.clearCanvas = clearCanvas

  function changeTextsize (direction) {
    var step = 5;
    params.textsize = (params.textsize + step * direction);
    if (params.textsize < 1) params.textsize = step;
    p5.textSize(params.textsize);
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


  const imageReady = () => {
    if (img.height < p5.height) {
      img.resize(0, p5.height)
    } else {
      img.resize(p5.width, 0)
      p5.resizeCanvas(p5.width, img.height)
    }
    img.loadPixels()
    clearCanvas()
    imageLoadedDisplay.removeClass('hide')
    imageLoaded = true
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
      // img = p5.loadImage(`./assets/images/${fileName}`, imageReady)
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
  // something about painting the grid causes the saving to fail
  // not with a code error or exception, but some kind of "network error"
  function paintGrid () {
    p5.textAlign(p5.LEFT, p5.BOTTOM);
    var nextX = 0
    var nextY = 0
    // TODO: make this somewhat tweakable
    // same too the space between
    // var yOffset = (p5.textAscent() + p5.textDescent());
    var yOffset = p5.textAscent() //+ p5.textDescent());

    var w = textManager.getchar();
    nextY = nextY + yOffset;
    while (nextX < p5.width && (nextY - yOffset) < p5.height) {
      setFill(nextX, nextY);
      p5.text(w, nextX, nextY);
      nextX = nextX + p5.textWidth(w);
      w = textManager.getchar();
      if (nextX + p5.textWidth(w) > p5.width) {
        nextX = 0;
        nextY = nextY + yOffset;
      }
    }
    p5.textAlign(p5.CENTER, p5.CENTER);
  }


  var paintModes = 3;
  var curPaintMode = 0;
  function nextPaintMode (direction) {
    curPaintMode = (curPaintMode + direction) % paintModes;
    if (curPaintMode < 0) curPaintMode = paintModes - 1;
  }

  function setFill (locX, locY) {

    if (locX < 0) locX = 0;
    if (locX >= p5.width) locX = p5.width - 1;
    if (locY < 0) locY = 0;
    if (locY >= p5.height) locY = p5.height - 1;

    switch (curPaintMode) {

      case 0:
      default:
        if (params.blackNotWhite) {
          p5.fill(blackfield);
        }
        else {
          p5.fill(whitefield);
        }

        break;

      // this is the one I'm really interested in for the project
      case 2:
        // This is adapted from the get() source - but is faster, since loadPixels()
        // is not performed on each iteration
        var pix = img.drawingContext.getImageData(locX, locY, 1, 1).data;
        p5.fill(pix[0], pix[1], pix[2], pix[3]);
        break;

      case 1:
        // TODO: fill based on... mouseX/MouseY + offset?
        p5.fill(locX, locY, 100);
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

  // const saveSketch = () => {
  //   const getDateFormatted = function () {
  //     var d = new Date()
  //     var df = `${d.getFullYear()}${pad((d.getMonth() + 1), 2)}${pad(d.getDate(), 2)}.${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}${pad(d.getSeconds(), 2)}`
  //     return df
  //   }

  //   const pad = function (nbr, width, fill = '0') {
  //     nbr = nbr + ''
  //     return nbr.length >= width ? nbr : new Array(width - nbr.length + 1).join(fill) + nbr
  //   }
  //   p5.saveCanvas(`imagetexter.${getDateFormatted()}.png`)
  // }
  // this.saveSketch = saveSketch

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
      clearCanvas();
    }
  }

  function keyHandler (char) {
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
        clearCanvas();
        break;

      case 'g':
        paintGrid();
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
        saveSketch();
        break;

      case 'x':
      case 'X':
        params.blackNotWhite = !params.blackNotWhite;
        setFill(p5.mouseX, p5.mouseY);
        break;

      case p5.DELETE:
      case p5.BACKSPACE:
        clearCanvas();
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