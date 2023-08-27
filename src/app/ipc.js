const { ipcMain, contextBridge } = require('electron')
const { readdir, readFile } = require("fs/promises")
const path = require("path");
const csv = require("node-csv")
const getAppDataPath = require("appdata-path");
const Jimp = require('jimp');

let appDataPath = getAppDataPath("RecordEU4")
let recordingsDir = path.join(appDataPath, "recordings")

let currentRecordingName = undefined
let currentRecording = undefined

ipcMain.handle("recordings.getRecordingList", async (event) => {
    return await readdir(recordingsDir)
})

ipcMain.handle("recordings.newSession", async (event, recordingName) => {
    let recordingDir = path.join(recordingsDir, currentRecordingName)

    currentRecordingName = recordingName
    currentRecording = JSON.parse((await readFile(path.join(recordingDir, "data.json"))).toString())
})

ipcMain.handle("recording.getInitialBitmap", async (event) => {
    function createColorKey(r, g, b, a) {
        return `${r}_${g}_${b}_${a}`
    }

    let csvParser = csv.createParser(";")
    let recordingDir = path.join(recordingsDir, currentRecordingName)
    let provinceBitmap = await Jimp.read(path.join(recordingDir, "map/provinces.bmp"))
    let definitionCsv = csvParser.parse(await readFile(path.join(recordingDir, "map/definition.csv")))
    
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
        let province = currentRecording["initial_provinces"][province_id]

        if (!province)
            continue

        let country = province["owner"]

        if (!country) {
            provinceBitmapArray[i+3] = 0

            continue
        }

        let countryColor = currentRecording["countries"][country]["color"]

        provinceBitmapArray[i] = countryColor[0]
        provinceBitmapArray[i+1] = countryColor[1]
        provinceBitmapArray[i+2] = countryColor[2]
        provinceBitmapArray[i+3] = 255
    }

    return { bitmap: provinceBitmapArray, width: provinceBitmap.bitmap.width, height: provinceBitmap.bitmap.height }
})

ipcMain.handle("recording.getEventsOnDate", async (event, ...args) => {
    let date = args[0]

    return []
})