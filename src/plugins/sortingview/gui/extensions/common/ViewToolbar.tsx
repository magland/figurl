import { Checkbox, IconButton } from '@material-ui/core';
import React, { FunctionComponent, useMemo } from 'react';

interface Props {
    width: number
    height: number
    customActions?: any[] | null
}

const iconButtonStyle = {paddingLeft: 6, paddingRight: 6, paddingTop: 4, paddingBottom: 4}

type Button = {
    type: string
    title: string
    onClick: () => void
    icon: any
    selected: boolean
    disabled?: boolean
    content?: string | number
    contentSigFigs?: number
    // TODO: Support for indeterminate state for checkboxes?
}

const ViewToolbar: FunctionComponent<Props> = (props) => {
    const toolbarStyle = useMemo(() => ({
        width: props.width,
        height: props.height,
        overflow: 'hidden'
    }), [props.width, props.height])
    const buttons = useMemo(() => {
        const b: Button[] = []
        for (let a of (props.customActions || [])) {
            b.push({
                type: a.type || 'button',
                title: a.title,
                onClick: a.callback,
                icon: a.icon || '',
                selected: a.selected,
                disabled: a.disabled,
                content: a.content,
                contentSigFigs: a.contentSigFigs
            });
        }
        return b
    }, [props.customActions])
    return (
        <div className="ViewToolBar" style={{position: 'absolute', ...toolbarStyle}}>
            {
                buttons.map((button, ii) => {
                    if (button.type === 'button') {
                        let color: 'inherit' | 'primary' = 'inherit';
                        if (button.selected) color = 'primary';
                        return (
                            <IconButton title={button.title} onClick={button.onClick} key={ii} color={color} style={iconButtonStyle} disabled={button.disabled ? true : false}>
                                {button.icon}
                            </IconButton>
                        );
                    }
                    else if (button.type === 'text') {
                        const numericContent: number = Number.isFinite(button.content)
                            ? button.content as any as number
                            : 0
                        const sigFigs = button.contentSigFigs || 0
                        const roundsToInt = Math.abs(numericContent - Math.round(numericContent)) * (10**(sigFigs + 1)) < 1
                        const _content = Number.isFinite(button.content)
                            ? roundsToInt
                                ? Math.round(numericContent) + ''
                                : (numericContent).toFixed(button.contentSigFigs || 2)
                            : (button.content || '')
                        return (
                            <div
                                key={ii}
                                title={button.title}
                                style={{textAlign: 'center', fontWeight: 'bold'}}
                            >
                                {_content}
                            </div>
                        )
                    }
                    else if (button.type === 'checkbox') {
                        return (
                            <Checkbox
                                key={ii}
                                checked={button.selected}
                                onClick={button.onClick}
                                style={{padding: 1, paddingLeft: 6 }}
                                title={button.title}
                                disabled={button.disabled}
                            />
                        )
                    }
                    else if (button.type === 'divider') {
                        return <hr key={ii} />;
                    }
                    else {
                        return <span key={ii} />;
                    }
                })
            }
        </div>
    );
}

export default ViewToolbar