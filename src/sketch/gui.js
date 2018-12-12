import * as dat from './dat.gui.js'
import saveAs from 'file-saver'

export default class GuiControl {
    constructor() {
        var cnvs
        this.setupGui = (sketch) => {
            cnvs = document.getElementsByTagName('canvas')
            if (cnvs && cnvs[0]) {
                cnvs = cnvs[0]
            }
            setfocus()
            this.params.clear = sketch.clearCanvas
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
            // TODO: WE WANT TO GET LAYER 1 ACTUALLY UGH UGH UGH
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

        const fontList = ['Georgia', 'Helvetica', 'Courier New']
        const imageList = [
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
        var paramsInitial = {
            name: 'image.texter',
            open: this.openCanvasInNewTab,
            // bind after defined in sketch (call setupGui)
            save: saveSketch,
            clear: () => { },
            drawMode: 1,
            textsize: 10,
            autoPaintMode: false,
            randomSizeMode: true,
            font: fontList[0],
            images: imageList,
            image: imageList[0],
            showReference: true,
            referenceTransparency: 25,
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
        gui.add(params, 'autoPaintMode').listen()
        gui.add(params, 'randomSizeMode').listen()
        gui.add(params, 'font', fontList).listen()
        gui.add(params, 'image', imageList).onChange(imageChange)
        gui.add(params, 'showReference')
        gui.add(params, 'referenceTransparency').min(0).max(100).step(1).listen()
        this.params = params
        this.gui = gui
    }
}