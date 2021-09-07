import { Checkbox, FormGroup, IconButton, Switch } from '@material-ui/core';
import React, { FunctionComponent, useMemo } from 'react';

interface Props {
    width: number
    height: number
    top?: number
    customActions?: any[] | null
}

const iconButtonStyle = {paddingLeft: 6, paddingRight: 6, paddingTop: 4, paddingBottom: 4}

type ToolbarElement = {
    type: string
    subtype?: string
    title: string
    onClick?: () => void
    icon?: any
    selected: boolean
    disabled?: boolean
    content?: string | number
    contentSigFigs?: number
    contentAlwaysShowDecimal?: boolean
    // TODO: Support for indeterminate state for checkboxes?
    elementIndex: number
}

const ToolbarItem: FunctionComponent<ToolbarElement> = (props: ToolbarElement) => {
    if (props.type === 'button') {
        let color: 'inherit' | 'primary' | 'secondary' = 'inherit'
        // in general, 'secondary' color scheme seems to look more like selection than 'primary' does
        if (props.selected) color = 'secondary'
        return (
            <span title={props.title} key={props.elementIndex + '-span'}>
                <IconButton
                    title={props.title}
                    onClick={props.onClick}
                    key={props.elementIndex}
                    color={color}
                    style={iconButtonStyle}
                    disabled={props.disabled ? true : false}>
                    {props.icon}
                </IconButton>
            </span>
        )
    } else if (props.type === 'divider') {
        return <hr key={props.elementIndex} />
    } else if (props.type === 'text') {
        const numericContent: number = Number.isFinite(props.content)
            ? props.content as any as number
            : 0
        const sigFigs = props.contentSigFigs || 0
        const roundsToInt = Math.abs(numericContent - Math.round(numericContent)) * (10**(sigFigs + 1)) < 1
        const _content = Number.isFinite(props.content)
            ? roundsToInt && !props.contentAlwaysShowDecimal
                ? Math.round(numericContent) + ''
                : (numericContent).toFixed(props.contentSigFigs || 2)
            : (props.content || '')
        return (
            <div
                key={props.elementIndex}
                title={props.title}
                style={{textAlign: 'center', fontWeight: 'bold'}}
            >
                {_content}
            </div>
        )
    } else if (props.type === 'toggle') {
        if (props.subtype === 'checkbox') {
            return (
                <Checkbox
                    key={props.elementIndex}
                    checked={props.selected}
                    onClick={props.onClick}
                    style={{padding: 1, paddingLeft: 6 }}
                    title={props.title}
                    disabled={props.disabled}
                />
            )
        }
        else if (props.subtype === 'slider') {
            // TODO: This actually suggests that we could do a better job of rewriting this entire section of functionality
            // to better support accessibility practices/logical form-control grouping.
            // (I.e. probably everything should be in a FormGroup or something.)
            // I don't know enough to do this right now, but we'll want to come back to it.
            // TODO: Compare this with what we do in LockableSelectUnitsWidget.
            return (
                <FormGroup key={props.elementIndex}>
                    <Switch
                            checked={props.selected}
                            size={"small"} // TODO: make styling more configurable
                            style={{left: -3}} // Note: this seems to center it in the 36-pixel spaces we've been using.
                                               // There's probably a better way to do this...
                            onChange={props.onClick}
                            disabled={props.disabled}
                            title={props.title}
                    />
                </FormGroup>
            )
        }
        else {
            return <span key={props.elementIndex}>ERROR: Bad toggle subtype {props.subtype}</span>
        }
    } else {
        return <span key={props.elementIndex} />
    }
}

const ViewToolbar: FunctionComponent<Props> = (props) => {
    const toolbarStyle = useMemo(() => ({
        width: props.width,
        height: props.height,
        top: props.top ?? 0,
        overflow: 'hidden'
    }), [props.width, props.height, props.top])
    const elements: ToolbarElement[] = useMemo(() => {
        return (props.customActions || []).map((e, ii) => ({
            type: e.type || 'button',
            subtype: e.subtype,
            title: e.title,
            onClick: e.callback,
            icon: e.icon || '',
            selected: e.selected,
            disabled: e.disabled,
            content: e.content,
            contentSigFigs: e.contentSigFigs,
            contentAlwaysShowDecimal: e.boolean,
            elementIndex: ii
        }))
    }, [props.customActions])
    // The 'key' prop won't ever get used in this way, because the ToolbarItem is really a catch-all that gets replaced
    // with more specific components, but this makes React happier.
    const renderedElements = useMemo(() => elements.map((e) => <ToolbarItem {...e} key={e.elementIndex}/>), [elements])
    return (
        <div className="ViewToolBar" style={{position: 'absolute', ...toolbarStyle}}>
            {renderedElements}
        </div>
    );
}

export default ViewToolbar