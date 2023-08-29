const { floodFill } = require("../main/bitmap-util")
const Color = require("../main/color");

test("flood fill works", () => {
    let width = 6;
    let height = 5;
    let bitmap = new Uint32Array(width * height)

    let backgroundColor = new Color(255, 0, 0, 255)
    let replaceColor = new Color(0, 255, 0, 255)

    let replaceEndIndex = Math.floor(width * height / 2)

    bitmap.fill(backgroundColor.asUint32())
    bitmap.fill(replaceColor.asUint32(), 0, replaceEndIndex)

    let fillColor = new Color([0, 0, 255, 255])

    floodFill(bitmap, width, height, 0, 0, fillColor)

    console.log(bitmap)
    console.log(fillColor.asUint32())

    expect(bitmap.slice(0, replaceEndIndex).every(p => p === fillColor.asUint32())).toBe(true)
})