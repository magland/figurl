import React, { FunctionComponent } from 'react';

type Props = {
}

const IntroSection: FunctionComponent<Props> = () => {
    return (
        <div className="IntroSection HomeSection">
            <h3>Shareable, interactive, data-backed figures created using Python</h3>
            <p><a href="https://github.com/magland/figurl">Figurl overview</a></p>
        </div>
    )
}

export default IntroSection