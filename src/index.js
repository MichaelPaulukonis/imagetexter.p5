import P5 from 'p5'
import 'p5/lib/addons/p5.dom'
import queryString from 'query-string'
import TextManager from './sketch/TextManager'
import Sketch from './sketch/sketch.js'

let loc = location || {}
let params = queryString.parse(loc.search)

console.log(`APP-VERSION: ${VERSION}`)
console.log(`params: ${JSON.stringify(params)}`)

let suppliedText = params.text || ''

let t = new TextManager(suppliedText)

function builder (p) {
  myP5 = new Sketch(p, t)
}

var myP5 = new P5(builder)

