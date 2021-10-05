export const copyMouseEvent = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const copy = new MouseEvent(
        event.type,
        {
            buttons: event.buttons,
            shiftKey: event.shiftKey,
            clientX: event.clientX,
            clientY: event.clientY
        }
    )
    // console.log(`Returning copied mouse event with ${copy.clientX} ${copy.clientY}`)
    return copy
}