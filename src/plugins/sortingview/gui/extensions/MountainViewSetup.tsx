import { createExtensionContext, ExtensionsSetup } from 'figurl/labbox-react';
import React, { FunctionComponent } from 'react';
import { LabboxPlugin } from '../pluginInterface';
import registerExtensions from './registerExtensions';

const extensionContext = createExtensionContext<LabboxPlugin>()
registerExtensions(extensionContext)
const MountainViewSetup: FunctionComponent = ({children}) => {
    return (
        <ExtensionsSetup extensionContext={extensionContext}>
            {children}
        </ExtensionsSetup>
    )
}

export default MountainViewSetup