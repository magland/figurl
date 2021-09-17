import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CanvasWidgetLayer, ClickEventType, KeyEventType, MousePresenceEventType } from './CanvasWidgetLayer'

// This class serves three purposes:
// 1. It collects & is a repository for the Layers that actually execute view and display output
// 3. It creates and lays out the Canvas elements the Layers draw to.
// Essentially it's an interface between the browser and the Layer logic.

interface Props {
    layers: (CanvasWidgetLayer<any, any> | null)[] // the layers to paint (each corresponds to a canvas html element)
    width: number
    height: number
    preventDefaultWheel?: boolean // whether to prevent default behavior of mouse wheel
}

const CanvasWidget = (props: Props) => {
    const { layers, preventDefaultWheel, width, height } = props

    // To learn about callback refs: https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
    const [divElement, setDivElement] = useState<HTMLDivElement | null>(null)
    const [hasFocus, setHasFocus] = useState<boolean>(false)
    const divRef = React.useCallback((elmt: HTMLDivElement) => {
        // this should get called only once after the div has been written to the DOM
        // we set this div element so that it can be used below when we set the canvas
        // elements to the layers
        setDivElement(elmt)
    }, [])

    useEffect(() => {
        if (divElement) {
            (divElement as any)['_hasFocus'] = hasFocus
        }
    }, [hasFocus, divElement])

    useEffect(() => {
        // this should be called only when the divElement has been first set (above)
        // or when the layers (prop) has changed (or if preventDefaultWheel has changed)
        // we set the canvas elements on the layers and schedule repaints
        if (!divElement) return
        if (!layers) return
        const stopScrollEvent = (e: Event) => {
            if ((divElement as any)['_hasFocus']) {
                e.preventDefault()
            }
        }
        layers.forEach((L, i) => {
            const canvasElement = divElement.children[i]
            if ((canvasElement) && (L)) {
                if (preventDefaultWheel) {
                    canvasElement.addEventListener("wheel", stopScrollEvent)
                }
                L.resetCanvasElement(canvasElement)
                L.scheduleRepaint() 
            }
            else {
                console.warn('Unable to get canvas element for layer', i)
            }
        })
    }, [divElement, layers, preventDefaultWheel])

    // schedule repaint when width or height change
    useEffect(() => {
        layers.forEach(L => {
            if (L) {
                L.scheduleRepaint()
            }
        })
    }, [width, height, layers])

    const _handleDiscreteMouseEvents = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>, type: ClickEventType) => {
        for (let l of layers) {
            if (l) {
                l.handleDiscreteEvent(e, type)
            }
        }
    }, [layers])

    const _handleMousePresenceEvents = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>, type: MousePresenceEventType) => {
        if (!layers) return
        for (const l of layers) {
            l && l.handleMousePresenceEvent(e, type)
        }
    }, [layers])

    const _handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        _handleDiscreteMouseEvents(e, ClickEventType.Move)
    }, [_handleDiscreteMouseEvents])

    const _handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        _handleDiscreteMouseEvents(e, ClickEventType.Press)
    }, [_handleDiscreteMouseEvents])

    const _handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setHasFocus(true)
        _handleDiscreteMouseEvents(e, ClickEventType.Release)
    }, [_handleDiscreteMouseEvents])

    const _handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        _handleMousePresenceEvents(e, MousePresenceEventType.Enter)
    }, [_handleMousePresenceEvents])

    const _handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setHasFocus(false)
        _handleMousePresenceEvents(e, MousePresenceEventType.Leave)
    }, [_handleMousePresenceEvents])

    const _handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
        for (let l of layers) {
            if (l) {
                l.handleWheelEvent(e)
            }
        }
        // The below *ought* to disable events only when this element has focus.
        // Unfortunately it fails to disable them because React attaches this to an element
        // which is by default passive (i.e. not allowed to preventDefault) and I can't
        // sort out how to make it not do that.
        // Leaving this code in because it's almost a solution to the bigger problem.
        // console.log(`I have focus: ${hasFocus}`)
        // if (preventDefaultWheel && hasFocus) {
        //     console.log(`Absorbing wheel event. Default: ${preventDefaultWheel} Focus: ${hasFocus}`)
        //     e.preventDefault()
        // }
    // }, [layers, preventDefaultWheel, hasFocus])
    }, [layers])

    const _handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        for (let l of layers) {
            if (l) {
                if (l.handleKeyboardEvent(KeyEventType.Press, e) === false) {
                    e.preventDefault()
                }
            }
        }
    }, [layers])

    // make sure that the layers have width/height that matches this canvas widget
    for (const L of layers) {
        if (L) {
            const {width: layerWidth, height: layerHeight} = L.getProps()
            if ((layerWidth !== width) || (layerHeight !== height)) {
                console.warn(layerWidth, layerHeight, width, height)
                throw Error('Inconsistent width or height between canvas widget and layer')
            }
        }
    }


    // useCheckForChanges('Rendered layers', {
    //     'layers': layers,
    //     'width': width,
    //     'height': height,
    //     'mouse move': _handleMouseMove,
    //     'mouse down': _handleMouseDown,
    //     'mouse up': _handleMouseUp,
    //     'mouse enter': _handleMouseEnter,
    //     'mouse leave': _handleMouseLeave,
    //     'wheel event': _handleWheel
    // })
    const renderedLayers = useMemo(() => {
        console.log(`Rerendering layers.`)
        return (layers || []).map((L, index) => (
            <canvas
                key={'canvas-' + index}
                style={{position: 'absolute', left: 0, top: 0}}
                width={width}
                height={height}
            />
        ))
    }, [layers, width, height])

    return (
        <div
            ref={divRef}
            style={{position: 'relative', width, height, left: 0, top: 0}}
            onKeyDown={_handleKeyPress}
            tabIndex={0} // tabindex needed to handle keypress
            onMouseMove={_handleMouseMove}
            onMouseDown={_handleMouseDown}
            onMouseUp={_handleMouseUp}
            onMouseEnter={_handleMouseEnter}
            onMouseLeave={_handleMouseLeave}
            onWheel={_handleWheel}
        >
            { renderedLayers }
            {/* {
                this.props.menuOpts ? (
                    <CanvasWidgetMenu visible={this.state.menuVisible}
                        menuOpts={this.props.menuOpts}
                        onExportSvg={this._exportSvg}
                    />
                ) : <span />
            } */}

        </div>
    )
}

export default CanvasWidget