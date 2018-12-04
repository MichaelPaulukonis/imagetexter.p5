import * as dat from './dat.gui.js'

export default class GuiControl {
    constructor() {
        var cnvs
        this.setupGui = function (sketch) {
            cnvs = document.getElementsByTagName('canvas')
            if (cnvs && cnvs[0]) {
                cnvs = cnvs[0]
            }
            setfocus()
            this.params.save = sketch.save_sketch
            this.params.clear = sketch.clearCanvas
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

        var paramsInitial = {
            name: 'image.texter',
            open: this.openCanvasInNewTab,
            // bind after defined in sketch
            save: () => { },
            clear: () => { },
            drawMode: 1,
            textsize: 10,
            autoPaintMode: false
          }

        let params = Object.assign({}, paramsInitial)
        var gui = new dat.GUI()
        gui.remember(params)
        gui.add(params, 'name')
        gui.add(params, 'open')
        gui.add(params, 'save')
        gui.add(params, 'clear')
        gui.add(params, 'textsize').min(4).max(64).step(1)
        gui.add(params, 'autoPaintMode').listen()

        this.params = params
    }
}