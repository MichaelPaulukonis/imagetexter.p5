// import P5 from 'p5'
// import P5 from 'p5/lib/p5.min'
import P5 from 'p5'
import 'p5/lib/addons/p5.dom'
import queryString from 'query-string'
import TextManager from './sketch/TextManager'
import Sketch from './sketch/sketch.js'
import GuiControl from './sketch/gui.js'

let loc = location || {}
let queryParams = queryString.parse(loc.search)

console.log(`APP-VERSION : ${VERSION}`)
console.log(`params: ${JSON.stringify(queryParams)}`)

let suppliedText = queryParams.text || ''
let t = new TextManager(suppliedText)

let gc = new GuiControl(IMAGES)
gc.params.autoPaintGrid |= queryParams.autoPaintGrid
gc.params.autoSave = queryParams.autoSave || false

const launchSketch = () => {
  function builder (p) {
    p.disableFriendlyErrors = true
    myP5 = new Sketch(p, t, gc.params, gc)
  }

  var myP5 = new P5(builder)
}

launchSketch()
