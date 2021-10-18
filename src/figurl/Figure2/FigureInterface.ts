import { MutableRefObject } from "react"
import { GetFigureDataResponse, isFigurlRequest } from "./viewInterface/FigurlRequestTypes"

class FigureInterface {
    constructor(private a: {figureId: string, viewUrl: string, figureData: any, iframeElement: MutableRefObject<HTMLIFrameElement | null | undefined>}) {
        window.addEventListener('message', e => {
            const msg = e.data
            let x
            try {x = JSON.parse(msg)}
            catch(err) {return}
            if (x.type === 'figurlRequest') {
                if (x.figureId === a.figureId) {
                    const requestId = x.requestId
                    const request = x.request
                    if (!isFigurlRequest(request)) return
                    if (request.type === 'getFigureData') {
                        const response: GetFigureDataResponse = {
                            type: 'getFigureData',
                            figureData: a.figureData
                        }
                        if (!a.iframeElement.current) return
                        const cw = a.iframeElement.current.contentWindow
                        if (!cw) return
                        cw.postMessage(JSON.stringify({
                            type: 'figurlResponse',
                            requestId,
                            response
                        }), a.viewUrl)
                    }
                }
            }
        })
    }
}

export default FigureInterface