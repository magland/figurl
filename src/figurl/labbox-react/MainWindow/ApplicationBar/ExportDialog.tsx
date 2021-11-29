import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { useFigureData, useRoute2 } from 'figurl/Figure2/Figure2';
import React, { FunctionComponent, useCallback } from 'react';
import axios from 'axios'
import {saveAs} from 'file-saver'
import ADMZip from 'adm-zip'
import randomAlphaString from 'commonInterface/util/randomAlphaString';

type Props = {
    onClose: () => void
}

const ExportDialog: FunctionComponent<Props> = () => {
    const {viewUrlBase, figureDataHash, channelName, label} = useRoute2()
    const figureData = useFigureData(figureDataHash, channelName)
    const label2 = label.split(' ').join('-')
    const handleExportBundle = useCallback(() => {
        ;(async () => {
            const resp = await axios.get(`${viewUrlBase}/bundle.zip?cb=${randomAlphaString(8)}`, {responseType: 'blob'})
            const data = resp.data as Blob
            const data2 = Buffer.from(await data.arrayBuffer())
            const zip = new ADMZip(data2)
            const newZip = new ADMZip()
            for (let entry of zip.getEntries()) {
                const name = entry.entryName
                if (name.startsWith('build/')) {
                    const name2 = `${label2}/${name.slice('build/'.length)}`
                    newZip.addFile(name2, Buffer.from(entry.getData()))
                }
            }

            let figurlDataJsContent = 'window.figurlData = {}\n'
            figurlDataJsContent += `window.figurlData.figure = JSON.parse(atob("${btoa(JSON.stringify(figureData))}"))\n`
            figurlDataJsContent += `window.figurlData.sha1 = {}\n`
            const figurlFileData: {[key: string]: any} = (window as any).figurlFileData
            for (let sha1 in figurlFileData) {
                figurlDataJsContent += `window.figurlData.sha1['${sha1}'] = JSON.parse(atob("${btoa(JSON.stringify(figurlFileData[sha1]))}"))\n`
            }
            newZip.addFile(`${label2}/figurlData.js`, Buffer.from(figurlDataJsContent))

            const buffer = newZip.toBuffer()
            saveAs(new Blob([buffer]), `${label2}.zip`)
        })()
    }, [viewUrlBase, figureData, label2])
    return (
        <div>
            <Hyperlink onClick={handleExportBundle}>
                Export figure as stand-alone HTML bundle
            </Hyperlink>
        </div>
    )
}

export default ExportDialog