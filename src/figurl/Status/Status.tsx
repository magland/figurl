import React, { FunctionComponent } from 'react';
import KacheryhubApiStatus from './KacheryhubApiStatus';

type Props = {

}

const Status: FunctionComponent<Props> = () => {
    return (
        <div style={{margin: 20}}>
            <KacheryhubApiStatus />
            {/* <BitwooderApiStatus />
            <FigurlApiStatus /> */}
        </div>
    )
}

export default Status