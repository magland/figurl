import { Grid } from '@material-ui/core';
import React, { FunctionComponent, useMemo } from 'react';
import SpikeClusterView from './SpikeClusterView';

type Props = {
    snippets: number[][][] // L x T x M
    timestamps: number[] // L
    features: number[][] // L x K
    featureNames: string[]
}

const SpikeExplorer: FunctionComponent<Props> = ({snippets, timestamps, features, featureNames}) => {
    const plots = useMemo(() => {
        const plots: {xIndex: number, yIndex: number}[] = []
        for (let i = 0; i < featureNames.length; i++) {
            for (let j = i + 1; j < featureNames.length; j++) {
                plots.push({xIndex: i, yIndex: j})
            }
        }
        return plots
    }, [featureNames])
    return (
        <Grid container>
            {
                plots.map(p => (
                    <Grid item>
                        <SpikeClusterView
                            features={features}
                            xIndex={p.xIndex}
                            yIndex={p.yIndex}
                            xLabel={featureNames[p.xIndex]}
                            yLabel={featureNames[p.yIndex]}
                        />
                    </Grid>
                ))    
            }
        </Grid>
    )
}

export default SpikeExplorer