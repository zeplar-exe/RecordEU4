const { ipcMain } = require('electron')
const { readdir, readFile } = require("fs/promises")
const path = require("path");
const fs = require("fs")
const csv = require("node-csv")
const getAppDataPath = require("appdata-path");
const Jimp = require('jimp');
const Recording = require("./recording")
const { addDays, createColorKey } = require("./util")
const { editImageDataBitmap, floodFill } = require("./bitmap-util");
const Color = require("./color");

let appDataPath = getAppDataPath("RecordEU4")
let recordingsDir = path.join(appDataPath, "recordings")

let currentRecording = undefined

ipcMain.handle("recordings.getRecordingList", async (event) => {
    if (!fs.existsSync(recordingsDir))
        return []

    return await readdir(recordingsDir)
})

ipcMain.handle("recordings.newSession", async (event, recordingName) => {
    let recordingDir = path.join(recordingsDir, recordingName)
    let recordingData = JSON.parse((await readFile(path.join(recordingDir, "data.json"))).toString())

    currentRecording = new Recording(recordingName, recordingDir, recordingData)
})

ipcMain.handle("recording.getInitialDate", async (event) => {
    return new Date(currentRecording.data.game_start_date)
})

ipcMain.handle("recording.getInitialBitmap", async (event) => {
    let csvParser = csv.createParser(";")
    let provinceBitmap = await Jimp.read(path.join(currentRecording.directory, "map/provinces.bmp"))
    let definitionCsv = csvParser.parse(await readFile(path.join(currentRecording.directory, "map/definition.csv")))
    
    let definitions = new Map()

    definitionCsv.forEach((def) => {
        let color = createColorKey(def[1], def[2], def[3], 255)

        definitions[color] = { "id": parseInt(def[0]), "name": def[4] }
    })

    let provinceBitmapArray = new Uint8ClampedArray(provinceBitmap.bitmap.data)

    for (let i = 0; i < provinceBitmapArray.length; i += 4) {
        // Some of the most retarded bullshit possible.
        let r = provinceBitmapArray[i+1]
        let g = provinceBitmapArray[i+2]
        let b = provinceBitmapArray[i]
        let a = provinceBitmapArray[i+3]

        let color = createColorKey(r, g, b, a)

        provinceBitmapArray[i] = r
        provinceBitmapArray[i+1] = g
        provinceBitmapArray[i+2] = b
        provinceBitmapArray[i+3] = a

        let definition = definitions[color]

        if (!definition)
            continue

        let province_id = definition["id"]
        let province = currentRecording.data["initial_provinces"][province_id]

        if (!province)
            continue

        currentRecording.mapProvincePixelIndex(province.id, i / 4)

        let country = province["owner"]

        if (!country) {
            provinceBitmapArray[i+3] = 0

            continue
        }

        let countryColor = currentRecording.data["countries"][country]["color"]

        provinceBitmapArray[i] = countryColor[0]
        provinceBitmapArray[i+1] = countryColor[1]
        provinceBitmapArray[i+2] = countryColor[2]
        provinceBitmapArray[i+3] = 255
    }

    return { data: provinceBitmapArray, width: provinceBitmap.bitmap.width, height: provinceBitmap.bitmap.height }
})

ipcMain.handle("recording.updateBitmapOnDate", async (event, date, bitmap, bitmapWidth, bitmapHeight) => {
    let index = 0

    while (index < currentRecording.data.events.length) {
        let recordingEvent = currentRecording.data.events[index]
        let eventDate = new Date(recordingEvent.date)

        if (date.getTime() === eventDate.getTime())
            break

        if (date.getTime() < eventDate.getTime())
            return false

        index++
    }

    return editImageDataBitmap(bitmap, bitmapWidth, (bitmap32) => {
        while (index < currentRecording.data.events.length) {
            let recordingEvent = currentRecording.data.events[index]
            let eventDate = new Date(recordingEvent.date)

            if (eventDate.getTime() === date.getTime()) {
                switch (recordingEvent.type) {
                    case "province_occupied":
                        let pixelIndex = currentRecording.getProvincePixelIndex(recordingEvent.province)
                        let occupier = recordingEvent.occupier
                        let fillColor = new Color(...currentRecording.data.countries[occupier].color)
                        let x = pixelIndex % bitmapWidth
                        let y = Math.floor(pixelIndex / bitmapWidth)

                        floodFill(bitmap32, bitmapWidth, bitmapHeight, x, y, fillColor)

                        break
                }
            } else {
                break
            }

            index++
        }
    })
})