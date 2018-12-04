import P5 from 'p5'
import 'p5/lib/addons/p5.dom'
import queryString from 'query-string'
import TextManager from './sketch/TextManager'
import Sketch from './sketch/sketch.js'
import GuiControl from './sketch/gui.js'

let loc = location || {}
let queryParams = queryString.parse(loc.search)

console.log(`APP-VERSION: ${VERSION}`)
console.log(`params: ${JSON.stringify(queryParams)}`)

let suppliedText = queryParams.text || ''
let t = new TextManager(suppliedText)

let gc = new GuiControl()
gc.params.autoPaintGrid |= queryParams.autoPaintGrid // this is to paint the grid - RENAME
gc.params.autoSave = queryParams.autoSave || false

gc.params.images = [
  'A11288.jpg',
  'A11309.jpg',
  'A14854.jpg',
  'A15225.jpg',
  'A15324.jpg',
  'A15528.jpg',
  'A17014.jpg',
  'A17037.jpg',
  'A17070.jpg',
  'A17275.jpg',
  'A18640.jpg',
  'A18663.jpg',
  'A21721.jpg',
  'A23208.jpg',
  'A26576.jpg',
  'A30448.jpg',
  'A30827.jpg',
  'A35075.jpg',
  'A38696.jpg',
  'A40874.jpg',
  'A43727.jpg',
  'accordionist.jpg',
  'head-of-a-woman.jpg',
  'large-bather.jpg',
  'painter-and-model.jpg',
  'self-portrait.jpg'
]

const launchSketch = () => {
  function builder (p) {
    myP5 = new Sketch(p, t, gc.params)
  }

  var myP5 = new P5(builder)
}

launchSketch()
