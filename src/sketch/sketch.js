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

export default function Sketch(p5, t) {

  var textsize = 10;
  var blackfield = '#000000';
  var whitefield = '#FFFFFF';
  var blackNotWhite = false;
  var img;

  p5.setup = () => {
    const canvas = p5.createCanvas(700, 700)
    canvas.parent('sketch-holder')
    // p5.colorMode(p5.RGB, p5.width, p5.height, 100);
    clearScreen();
    p5.textSize(textsize);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.frameRate(60); // change if paint events seem to be too rapid
    curPaintMode = 2; // paint with background var.
    setImage(4);
  }

  p5.draw = () => {
    if (autoPaintMode) {
      autoPaintRegion(0, 0, p5.width, p5.height);
      return;
    }

    if (p5.mouseIsPressed && p5.mouseY > 0 && p5.mouseY < p5.height
      && p5.mouseX > 0 && p5.mouseX < p5.width) {
      paintWordAtPoint(p5.mouseX, p5.mouseY);
    }
  }

  const mouseInCanvas = () => {
    return p5.mouseY > 0 && p5.mouseY < p5.height && p5.mouseX > 0 && p5.mouseX < p5.width
  }

  function paintWordAtPoint(locX, locY) {
    if (randomSizeMode) {
      spatterWordAtPoint(locX, locY);
    }
    else {
      paintStaticSizedWordAtPoint(locX, locY);
    }
  }

  function paintStaticSizedWordAtPoint(locX, locY) {

    // absolute positioning
    var offX = getJitter(), offY = getJitter();
    setFill(locX + offX, locY + offY);
    p5.text(t.getWord(), locX + offX, locY + offY);
  }

  // paint words AROUND the point in different sizes
  function spatterWordAtPoint(locX, locY) {

    var origTextSize = textsize;

    p5.textSize(randomTextSize(origTextSize));

    paintStaticSizedWordAtPoint(locX, locY);

    p5.textSize(origTextSize); // restore original size
  }


  function randomTextSize(prevSize) {
    var offset = getJitter();
    var newsize = offset + prevSize;
    if (newsize < 2) newsize = 2;
    return newsize;
  }


  function clearScreen() {
    var field = blackNotWhite ? whitefield : blackfield;
    p5.background(field);
  }

  function changeTextsize(direction) {
    var step = 5;
    textsize = (textsize + step * direction);
    if (textsize < 1) textsize = step;
    p5.textSize(textsize);
  }


  var jitRange = 20;
  function getJitter() {
    // return random(-jitRange, jitRange);
    return -jitRange + Math.floor(Math.random() * 2 * jitRange)
  }

  function setJitRange(direction) {
    var step = 5;
    jitRange = (jitRange + step * direction);
    if (jitRange < 1) jitRange = 1;
  }


  const imageReady = () => {
    img.resize(0, p5.height);
    img.loadPixels()
  }

  // select one of the 4 images
  // this BEGS for a refactoring
  /* @pjs preload="001.jpg,002.jpg,003.jpg,004.jpg"; */
  function setImage(image) {
    switch (image) {
      case 1:
        img = p5.loadImage("./assets/001.jpg", imageReady)
        break;

      case 2:
        img = p5.loadImage("./assets/002.jpg", imageReady)
        break;

      case 3:
        img = p5.loadImage("./assets/003.jpg", imageReady)
        break;

      case 4:
        img = p5.loadImage("./assets/004.jpg", imageReady)
        break;
    }
  }

  // print a grid of characters from upper-left to lower-right
  function paintGrid() {
    p5.textAlign(p5.LEFT, p5.BOTTOM);
    var nextX = 0, nextY = 0, yOffset = (p5.textAscent() + p5.textDescent());
    var w = t.getchar();
    nextY = nextY + yOffset;
    while (nextX < p5.width && (nextY - yOffset) < p5.height) {
      // println(w + " : " + nextX + ", " + nextY);
      setFill(nextX, nextY);
      p5.text(w, nextX, nextY);
      nextX = nextX + p5.textWidth(w);
      w = t.getchar();
      if (nextX + p5.textWidth(w) > p5.width) {
        nextX = 0;
        nextY = nextY + yOffset;
      }
    }
    p5.textAlign(p5.CENTER, p5.CENTER);
  }


  var paintModes = 3;
  var curPaintMode = 0;
  function nextPaintMode(direction) {
    curPaintMode = (curPaintMode + direction) % paintModes;
    if (curPaintMode < 0) curPaintMode = paintModes - 1;
  }

  function setFill(locX, locY) {

    if (locX < 0) locX = 0;
    if (locX >= p5.width) locX = p5.width - 1;
    if (locY < 0) locY = 0;
    if (locY >= p5.height) locY = p5.height - 1;

    switch (curPaintMode) {

      case 0:
      default:
        if (blackNotWhite) {
          p5.fill(0, p5.height, 0);
        }
        else {
          p5.fill(0, 0, 100);
        }

        break;

      // this is the one I'm really interested in for the project
      case 2:
        var pix = img.get(locX, locY)
        p5.fill(pix);

        break;

      case 1:
        // TODO: fill based on... mouseX/MouseY + offset?
        p5.fill(locX, locY, 100);
        break;
    }
  }

  var autoPaintMode = false;
  function toggleAutoPaintMode() {
    autoPaintMode = !autoPaintMode;
  }

  function autoPaintRegion(minX, minY, maxX, maxY) {
    var locX = random(minX, maxX),
      locY = random(minY, maxY);
    paintWordAtPoint(locX, locY);
  }


  let randomSizeMode = true;
  function toggleRandomSizeMode() {
    randomSizeMode = !randomSizeMode;
  }

  function save() {
    var filename = "image.text." + frameCount + ".png";
    p5.saveFrame(filename);
    console.log("saved as: " + filename);
    return filename;
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
    if (keyCode == p5.UP || keyCode == p5.DOWN) {
      if (keyCode == p5.UP) {
        changeTextsize(1);
      }
      else {
        changeTextsize(-1);
      }
    }
    else if (keyCode == p5.RIGHT || keyCode == p5.LEFT) {
      if (keyCode == p5.RIGHT) {
        setJitRange(1);
      }
      else {
        setJitRange(-1);
      }
    }
    else if (keyCode == p5.BACKSPACE || keyCode == p5.DELETE) {
      clearScreen();
    }
  }

  function keyHandler(char) {
    switch (char) {

      case '1':
        setImage(1);
        break;

      case '2':
        setImage(2);
        break;

      case '3':
        setImage(3);
        break;

      case '4':
        setImage(4);
        break;

      case 'a':
        toggleAutoPaintMode();
        break;

      case 'c':
        clearScreen();
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
        save();
        break;

      case 'x':
      case 'X':
        blackNotWhite = !blackNotWhite;
        setFill(p5.mouseX, p5.mouseY);
        break;

      // not working in processing.js
      case p5.DELETE:
      case p5.BACKSPACE:
        clearScreen();
        break;
    }
  }
}