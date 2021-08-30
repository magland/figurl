import { Radio } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { MCMCRunChain } from './MCMCRunView';

type Props = {
    selectedParameter: string
    onSelectedParameterChanged: (s: string) => void
    chains: MCMCRunChain[]
}

const ParameterSelector: FunctionComponent<Props> = ({chains, selectedParameter, onSelectedParameterChanged}) => {
    const parametersNames = useMemo(() => {
        const names: string[] = []
        for (let chain of chains) {
            if (chain.iterations.length > 0) {
                const it = chain.iterations[0]
                for (let pname in it.parameters) {
                    if (!names.includes(pname))
                        names.push(pname)
                }
            }
        }
        names.sort()
        return names
    }, [chains])
    const handleClick = useCallback((pname: string) => {
        onSelectedParameterChanged(pname)
    }, [onSelectedParameterChanged])
    return (
        <div>
            {
                parametersNames.map((p) => (
                    <span key={p}><Radio checked={p === selectedParameter} onClick={() => {handleClick(p)}} /> {p}</span>
                ))
            }
        </div>
    )
}

export default ParameterSelector