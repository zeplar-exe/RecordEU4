import { ipcMain } from "electron";

import { readdir, readFile } from "fs/promises";

import path from "path";
import csv from "node-csv";
import getAppDataPath from "appdata-path";
import Jimp from "jimp";
import { existsSync } from "fs";

import { Recording } from "./recording.js";

let appDataPath = getAppDataPath("RecordEU4")
let recordingsDir = path.join(appDataPath, "recordings")

let currentRecording = undefined

ipcMain.handle("recordings.getRecordingList", async (event) => {
    if (!existsSync(recordingsDir))
        return []

    return await readdir(recordingsDir)
})

ipcMain.handle("recordings.newSession", async (event, recordingName) => {
    let recordingDir = path.join(recordingsDir, recordingName)
    let recordingData = JSON.parse((await readFile(path.join(recordingDir, "data.json"))).toString())

    currentRecording = new Recording(recordingName, recordingDir, recordingData)
})

ipcMain.handle("recording.getInitialBitmap", async (event) => {
    function createColorKey(r, g, b, a) {
        return `${r}_${g}_${b}_${a}`
    }

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

        currentRecording.mapProvince(province, i)

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

    return { bitmap: provinceBitmapArray, width: provinceBitmap.bitmap.width, height: provinceBitmap.bitmap.height }
})

ipcMain.handle("recording.getEventsOnDate", async (event, ...args) => {
    let date = args[0]
    let events = []
    let index = 0

    while (index < currentRecording.data.events.length) {
        let recordingEvent = currentRecording.data.events[index]

        if (date.getTime() === new Date(recordingEvent).getTime())
            break
    }

    do {
        let recordingEvent = currentRecording.data.events[index]

        if (recordingEvent.date.getTime() === date.getTime()) {
            events.push(recordingEvent)
        } else {
            break
        }

        index++
    } while (index < currentRecording.data.events.length);

    return events
})