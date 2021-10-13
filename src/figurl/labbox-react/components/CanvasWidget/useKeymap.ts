import { KeypressMap } from 'figurl/labbox-react/components/CanvasWidget'
import { ToolbarItem } from 'plugins/sortingview/gui/extensions/common/Toolbars'
import { useState } from 'react'

export const useKeymap = (controls: ToolbarItem[]): KeypressMap => {
    const [keymap, setKeymap] = useState<KeypressMap>({})

    const keysToMap = Object.assign({}, ...controls.map((c) => (c.type === 'button' && c.key ? {[c.key]: c.callback } : {})))
    if (Object.entries(keysToMap).length !== Object.entries(keymap).length) {
        setKeymap(keysToMap)
        return keysToMap
    }
    for (const [keycode, fn] of Object.entries(keysToMap)) {
        if (keymap[parseInt(keycode)] !== fn) {
            setKeymap(keysToMap)
            return keysToMap
        }
    }
    return keymap
}