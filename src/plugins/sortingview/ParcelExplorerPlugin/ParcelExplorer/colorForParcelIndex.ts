import colorList from "./colorList"

const colorForParcelIndex = (index: number): string => {
    return colorList[index % colorList.length]
}

export default colorForParcelIndex