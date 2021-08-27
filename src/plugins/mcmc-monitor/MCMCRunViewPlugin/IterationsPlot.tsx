import { VegaLiteComponent, VegaLiteData } from 'plugins/builtin/VegaLite/VegaLitePlugin';
import React, { FunctionComponent, useMemo } from 'react';
import { MCMCRunChain } from './MCMCRunView';

type Props = {
    width: number
    height: number
    chains: MCMCRunChain[]
    parameter?: string
}

const specTemplate = (data: any[], x: string, y: string, color: string) => ({
    "config": {
        "view": {
            "continuousWidth": 400,
            "continuousHeight": 300
        }
    },
    "data": {
        "name": "data-057d1956670ab1adb5d81646e00573df"
    },
    "mark": "line",
    "encoding": {
        "color": {
            "type": "nominal",
            "field": color
        },
        "x": {
            "type": "quantitative",
            "field": x
        },
        "y": {
            "type": "quantitative",
            "field": y
        }
    },
    "$schema": "https://vega.github.io/schema/vega-lite/v5.1.0.json",
    "datasets": {
        "data-057d1956670ab1adb5d81646e00573df": data
    }
})

const IterationsPlot: FunctionComponent<Props> = ({chains, parameter, width, height}) => {
    const spec = useMemo(() => {
        const a = chains.map((chain, jj) => (
            chain.iterations.map((it, ii) => ({
                iteration: ii + 1,
                [parameter || 'none-selected']: parameter ? it.parameters[parameter] ?? undefined : undefined,
                chainId: chain.chainId
            }))
        ))
        const data = ([] as any[]).concat(...a)
        return specTemplate(data, 'iteration', parameter || 'none-selected', 'chainId')
    }, [chains, parameter])
    const data: VegaLiteData = {
        spec
    }
    return (
        <VegaLiteComponent
            width={width}
            height={height}
            data={data}
        />
    )
}

export default IterationsPlot