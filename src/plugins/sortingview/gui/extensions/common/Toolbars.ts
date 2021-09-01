
export interface ActionItem {
    type: 'button'
    callback: () => void
    title: string
    icon: any
    selected?: boolean
    keyCode?: number
    disabled?: boolean
}

export interface DividerItem {
    type: 'divider'
}

export interface TextItem {
    type: 'text'
    title: string
    content: string | number
    contentSigFigs?: number
}
export interface CheckboxItem {
    type: 'checkbox'
    callback: () => void
    title: string
    selected?: boolean
    keyCode?: number
    disabled?: boolean
}
