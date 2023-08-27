function getPixel(bitmap32, bitmapWidth, bitmapHeight, x, y) {
    if (x < 0 || y < 0 || x >= bitmapWidth || y >= bitmapHeight) {
        return null;
    } else {
        const offset = (y * bitmapWidth + x);

        return bitmap32[offset];
    }
}

function setPixel(bitmap32, bitmapWidth, bitmapHeight, x, y, color) {
    const offset = y * bitmapWidth + x;

    bitmap32[offset] = color
}

function floodFill(bitmap32, bitmapWidth, bitmapHeight, x, y, fillColor) {
    // get the color we're filling
    const replaceColor = getPixel(bitmap32, bitmapWidth, bitmapHeight, x, y);

    fillColor = fillColor.asUint32()

    if (replaceColor === fillColor)
        return

    let flood = [ [x, y] ]

    while (flood.length > 0) {
        let next = flood.pop()
        let color = getPixel(bitmap32, bitmapWidth, bitmapHeight, next[0], next[1])

        if (!color)
            continue

        if (color !== replaceColor)
            continue

        setPixel(bitmap32, bitmapWidth, bitmapHeight, next[0], next[1], fillColor)

        flood.push([next[0] + 1, next[1]])
        flood.push([next[0] - 1, next[1]])
        flood.push([next[0], next[1] + 1])
        flood.push([next[0], next[1] - 1])
    }
}

function editImageDataBitmap(bitmap, width, func) {
    let bitmapBuffer = new ArrayBuffer(bitmap.length)
    let bitmap8 = new Uint8ClampedArray(bitmapBuffer)
    let bitmap32 = new Uint32Array(bitmapBuffer)

    bitmap8.set(bitmap, 0)

    func(bitmap32)

    return bitmap8
}

module.exports = { floodFill, editImageDataBitmap }