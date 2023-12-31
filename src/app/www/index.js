const { ipcRenderer } = require("electron")
const {addDays} = require("../main/util");

const dateFormat = { year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC" }

let currentDate = undefined
let isPlaying = false

function updateTimeDisplay() {
    $("#time-display").text(currentDate.toLocaleDateString("en-US", dateFormat))
}

async function loadRecordingList() {
    let recordings = await ipcRenderer.invoke("recordings.getRecordingList")

    recordings.forEach(recording => {
        let list = $("#recording-list")

        listItem = document.createElement("li")
        button = document.createElement("button")
        button.innerText = recording
        button.onclick = async () => {
            let mapView = $("#map-view")
            let loader = $("<div/>").addClass("loader")

            mapView.append(loader)

            await ipcRenderer.invoke("recordings.newSession", recording)

            let canvas = $("#map-canvas")[0]
            let canvasCtx = canvas.getContext("2d", { willReadFrequently: true })

            canvasCtx.clearRect(0, 0, canvas.width, canvas.height)

            let bitmap = await ipcRenderer.invoke("recording.getInitialBitmap")

            let imageData = new ImageData(bitmap["data"], bitmap["width"])

            canvas.width = bitmap["width"]
            canvas.height = bitmap["height"]
            canvas.style.width = canvas.width * 3
            canvas.style.height = canvas.height * 3

            canvasCtx.putImageData(imageData, 0, 0)

            currentDate = await ipcRenderer.invoke("recording.getInitialDate")
            isPlaying = false

            updateTimeDisplay()

            loader.remove()
        }

        listItem.appendChild(button)

        list.append(listItem)
    })
}

async function stepBackward() {
    if (!currentDate)
        return

    await changeDate(addDays(currentDate, -1))
}

async function pausePlay() {
    if (!currentDate)
        return

    isPlaying = !isPlaying
}

async function stepForward() {
    if (!currentDate)
        return

    await changeDate(addDays(currentDate, 1))
}

async function changeDate(date) {
    currentDate = date

    updateTimeDisplay()

    let events = await ipcRenderer.invoke("recoding.getEventsOnDate", currentDate)

    if (events.length === 0)
        return

    let canvas = $("#map-canvas")[0]
    let canvasCtx = canvas.getContext("2d", { willReadFrequently: true })

    let imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height)
    let newBitmap = await ipcRenderer.invoke("recording.applyEventsToBitmap",
        events, imageData.data, imageData.width, imageData.height)

    imageData.data.set(newBitmap)
    canvasCtx.putImageData(imageData, 0, 0)
}

async function play() {
    if (isPlaying)
        await stepForward()

    setTimeout(play, 1)//50)
}

play()