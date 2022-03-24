import { useFigureData, useRoute2 } from 'figurl/Figure2/Figure2';
import React, { FunctionComponent, useCallback, useState } from 'react';
import axios from 'axios'
import {saveAs} from 'file-saver'
import ADMZip from 'adm-zip'
import randomAlphaString from 'commonInterface/util/randomAlphaString';
import { Button } from '@material-ui/core';
import { sleepMsecNum } from 'commonInterface/util/util';

type Props = {
    onClose: () => void
}

const ExportDialog: FunctionComponent<Props> = () => {
    const {viewUrlBase, figureDataHash, channelName, label} = useRoute2()
    const figureData = useFigureData(figureDataHash, channelName)
    const label2 = label.split(' ').join('-')
    const [status, setStatus] = useState<'ready' | 'downloading-bundle' | 'preparing-data' | 'saving-file'>('ready')
    const handleExportBundle = useCallback(() => {
        if (status !== 'ready') return
        setStatus('downloading-bundle')
        ;(async () => {
            const resp = await axios.get(`${viewUrlBase}/bundle.zip?cb=${randomAlphaString(8)}`, {responseType: 'blob'})
            setStatus('preparing-data')
            await sleepMsecNum(100)
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
            for (let uri in figurlFileData) {
                figurlDataJsContent += `window.figurlData.uri['${uri}'] = JSON.parse(atob("${btoa(JSON.stringify(figurlFileData[uri]))}"))\n`
            }
            newZip.addFile(`${label2}/figurlData.js`, Buffer.from(figurlDataJsContent))

            const buffer = newZip.toBuffer()
            setStatus('saving-file')
            await sleepMsecNum(100)
            saveAs(new Blob([buffer]), `${label2}.zip`)
            setStatus('ready')
        })()
    }, [viewUrlBase, figureData, label2, status])
    if (!figureData) {
        return (
            <div>Waiting for figure data</div>
        )
    }
    if (status === 'downloading-bundle') {
        return (
            <div>Downloading HTML bundle...</div>
        )
    }
    if (status === 'preparing-data') {
        return (
            <div>Preparing data...</div>
        )
    }
    if (status === 'saving-file') {
        return (
            <div>Saving file...</div>
        )
    }
    return (
        <div>
            <Button onClick={handleExportBundle}>
                Export figure as stand-alone HTML bundle
            </Button>
        </div>
    )
}

export default ExportDialog