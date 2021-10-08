import { Checkbox, Radio } from '@material-ui/core';
import React, { FunctionComponent } from 'react';

export type OverviewClusterMode = 'mode1' | 'mode2'
const modes: OverviewClusterMode[] = ['mode1', 'mode2']

export type OverviewClusterOpts = {
    mode: OverviewClusterMode
    showDensity: boolean
}

type Props = {
    opts: OverviewClusterOpts
    setOpts: (o: OverviewClusterOpts) => void
}

const OverviewClusterToolbar: FunctionComponent<Props> = ({opts, setOpts}) => {
    return (
        <div>
            {
                modes.map(mode => (
                    <span key={mode}>
                        <Radio
                            checked={mode === opts.mode}
                            onClick={() => setOpts({...opts, mode})}
                        />
                        &nbsp;{mode}&nbsp;
                    </span>
                ))
            }
            {
                <span>
                    <Checkbox checked={opts.showDensity} onClick={() => setOpts({...opts, showDensity: !opts.showDensity})} />
                    &nbsp;show density&nbsp;
                </span>
            }
        </div>
    )
}

export default OverviewClusterToolbar