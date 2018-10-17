import P5 from 'p5'
import 'p5/lib/addons/p5.dom'

import TextManager from './sketch/TextManager'
import Sketch from './sketch/sketch.js'

console.log(`APP-VERSION: ${VERSION}`)

let t = new TextManager()

function builder (p) {
  myP5 = new Sketch(p, t)
}

var myP5 = new P5(builder)

