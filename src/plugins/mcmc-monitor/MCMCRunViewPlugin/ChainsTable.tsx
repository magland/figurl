import NiceTable from 'figurl/labbox-react/components/NiceTable/NiceTable';
import React, { FunctionComponent, useMemo } from 'react';
import { MCMCRunChain } from './MCMCRunView';

type Props = {
    chains: MCMCRunChain[]
    selectedChainIds: string[]
    onSelectedChainIdsChanged: (x: string[]) => void
}

const columns = [
    {
        key: 'chainId',
        label: 'Chain'
    },
    {
        key: 'numIterations',
        label: 'Num. Iterations'
    }
]

const ChainsTable: FunctionComponent<Props> = ({chains, selectedChainIds, onSelectedChainIdsChanged}) => {
    const rows = useMemo(() => (
        chains.map((chain) => ({
            key: chain.chainId,
            columnValues: {
                chainId: chain.chainId,
                numIterations: chain.iterations.length
            }
        }))
    ), [chains])
    return (
        <NiceTable
            rows={rows}
            columns={columns}
            selectedRowKeys={selectedChainIds}
            onSelectedRowKeysChanged={onSelectedChainIdsChanged}
            selectionMode="multiple"
        />
    )
}

export default ChainsTable