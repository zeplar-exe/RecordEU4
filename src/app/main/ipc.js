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

    currentRecording.data.events.forEach((event) => {
        event["date"] = new Date(event["date"])
    })
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

ipcMain.handle("recoding.getEventsOnDate", async (event, date) => {
    let index = 0

    while (index < currentRecording.data.events.length) {
        let recordingEvent = currentRecording.data.events[index]
        let eventDate = recordingEvent.date

        if (date.getTime() === eventDate.getTime())
            break

        if (date.getTime() < eventDate.getTime())
            return []

        index++
    }

    let results = []

    while (index < currentRecording.data.events.length) {
        let recordingEvent = currentRecording.data.events[index]
        let eventDate = new Date(recordingEvent.date)

        if (eventDate.getTime() === date.getTime()) {
            results.push(recordingEvent)
        } else {
            break
        }

        index++
    }

    return results
})

ipcMain.handle("recording.applyEventsToBitmap", async (event, events, bitmap, bitmapWidth, bitmapHeight) => {
    return editImageDataBitmap(bitmap, bitmapWidth, (bitmap32) => {
        events.forEach((event) => {
            switch (event.type) {
                case "province_occupied": {
                    let pixelIndices = currentRecording.getProvincePixelIndices(event.province)
                    let occupier = event.occupier
                    let country = currentRecording.data.countries[owner]
                    let fillColor = country ? new Color(...country.color) : new Color(0, 0, 0, 0)

                    pixelIndices.forEach((index) => {
                        bitmap32[index] = fillColor.asUint32()
                    })

                    break
                }
                case "province_owner_changed": {
                    let pixelIndices = currentRecording.getProvincePixelIndices(event.province)
                    let owner = event.new_owner
                    let country = currentRecording.data.countries[owner]
                    let fillColor = country ? new Color(...country.color) : new Color(0, 0, 0, 0)

                    pixelIndices.forEach((index) => {
                        bitmap32[index] = fillColor.asUint32()
                    })

                    break
                }
            }
        })
    })
})