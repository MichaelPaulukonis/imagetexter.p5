import * as dat from './dat.gui.js'
import saveAs from 'file-saver'
import fonts from './fonts'

export default class GuiControl {
  constructor (imageList) {
    var cnvs
    this.setupGui = (sketch) => {
      cnvs = document.getElementsByTagName('canvas')
      if (cnvs && cnvs[0]) {
        cnvs = cnvs[0]
      }
      setfocus()
      this.params.clear = sketch.clearDrawing
      this.params.save = saveSketch(sketch, cnvs)
      sketch.saveSketch = this.params.save

      this.imageChange = (fileName) => {
        sketch.setImage(`./assets/images/${fileName}`)
      }

      let ic = this.gui['__controllers'].filter(e => e.property === 'image')
      if (ic && ic[0] && ic[0].onChange) ic[0].onChange(this.imageChange)

      let src = this.gui['__controllers'].filter(e => e.property === 'showReference')
      if (src && src[0] && src[0].onChange) src[0].onChange(sketch.renderLayers)

      let rtc = this.gui['__controllers'].filter(e => e.property === 'referenceTransparency')
      if (rtc && rtc[0] && rtc[0].onChange) rtc[0].onChange(sketch.renderLayers)

      let ftc = this.gui['__controllers'].filter(e => e.property === 'font')
      if (ftc && ftc[0] && ftc[0].onChange) ftc[0].onChange(sketch.setFont)
    }

    // TODO: also need to re-implement open-in-tab
    // which may not work, since there's a hard-limit for URL length in chrome
    // needs reerence to sketch, to render layer1 only
    const saveSketch = (sketch, cnvs) => () => {
      const getDateFormatted = function () {
        var d = new Date()
        var df = `${d.getFullYear()}${pad((d.getMonth() + 1), 2)}${pad(d.getDate(), 2)}.${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}${pad(d.getSeconds(), 2)}`
        return df
      }

      const pad = function (nbr, width, fill = '0') {
        nbr = nbr + ''
        return nbr.length >= width ? nbr : new Array(width - nbr.length + 1).join(fill) + nbr
      }
      sketch.renderTarget()
      cnvs.toBlob((blob) => {
        saveAs(blob, `imagetexter.${getDateFormatted()}.png`)
      })
      sketch.renderLayers()
    }

    var setfocus = function () {
      cnvs.focus()
    }
    this.openCanvasInNewTab = function () {
      if (cnvs) {
        const img = cnvs.toDataURL('image/jpg')
        // https://ourcodeworld.com/articles/read/682/what-does-the-not-allowed-to-navigate-top-frame-to-data-url-javascript-exception-means-in-google-chrome
        var win = window.open()
        win.document.write('<iframe src="' + img +
          '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>')
      }
    }
    let fc = document.getElementById('focus')
    if (fc) fc.onclick = setfocus

    // const fontList = ['Georgia', 'Helvetica', 'Courier New']
    const fontList = fonts.concat(['ATARCC__', 'ATARCE__', 'ATARCS__', 'AtariClassic-Regular',
      'BlackCasper', 'BMREA___', 'CableDingbats', 'carbontype', 'clothing logos', 'Credit Cards',
      'D3Digitalism', 'D3DigitalismI', 'D3DigitalismR', 'edunline', 'enhanced_dot_digital-7', 'Fast Food logos',
      'Harting_plain', 'illustrate-it', 'openlogos', 'RecycleIt', 'retro_computer_personal_use', 'SEGA',
      'Smartphone Color Pro', 'Social Icons Pro Set 1 - Rounded', 'social_shapes', 'TRENU___',
      'Type Icons Color', 'Type Icons', 'VT323-Regular', 'Youkairo'])

    var paramsInitial = {
      name: 'image.texter',
      open: this.openCanvasInNewTab,
      // bind after defined in sketch (call setupGui)
      save: saveSketch,
      clear: () => { },
      textsize: 18,
      distanceJitRange: 20,
      textsizeJitRange: 20,
      heightOffset: 0,
      textModes: {
        'character': 0,
        'word': 1
      },
      textMode: 0,
      autoPaintMode: false,
      randomSizeMode: true,
      font: fontList[0],
      rotate: false,
      rotation: 0,
      images: imageList,
      image: imageList[0],
      showReference: true,
      referenceTransparency: 25,
      paintMode: 2,
      paintModes: {
        'black/white': 0,
        'rainbowish': 1,
        'from image': 2,
        'black': 3,
        'white': 4
      }
    }

    this.imageChange = () => { }
    let imageChange = this.imageChange

    let params = Object.assign({}, paramsInitial)
    let gui = new dat.GUI({ name: 'newgui' })
    gui.remember(params)
    gui.add(params, 'name')
    gui.add(params, 'open')
    gui.add(params, 'save')
    gui.add(params, 'clear')
    gui.add(params, 'textsize').min(4).max(64).step(1).listen()
    gui.add(params, 'textsizeJitRange').min(0).max(64).step(1).listen()
    gui.add(params, 'distanceJitRange').min(0).max(64).step(1).listen()
    gui.add(params, 'heightOffset').min(-20).max(20).step(1).listen()
    gui.add(params, 'textMode', params.textModes).listen()
    gui.add(params, 'rotate').listen()
    gui.add(params, 'rotation').min(-360).max(360).step(1)
    gui.add(params, 'paintMode', params.paintModes).listen()
    gui.add(params, 'autoPaintMode').listen()
    gui.add(params, 'randomSizeMode').listen()
    gui.add(params, 'font', fontList).listen()
    gui.add(params, 'image', imageList).onChange(imageChange).listen()
    gui.add(params, 'showReference')
    gui.add(params, 'referenceTransparency').min(0).max(100).step(1).listen()
    this.params = params
    this.gui = gui
  }
}
