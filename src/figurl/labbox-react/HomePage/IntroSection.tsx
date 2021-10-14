import React, { FunctionComponent } from 'react';

type Props = {
}

const IntroSection: FunctionComponent<Props> = () => {
    return (
        <div className="IntroSection HomeSection">
            <p>&nbsp;</p>
            <img src="/figurl.png" alt="figurl" width="200px" />
            <p>Shareable, interactive, data-backed figures</p>
            <p><a href="https://github.com/magland/figurl" target="_blank" rel="noreferrer">Figurl overview</a></p>
        </div>
    )
}

export default IntroSection