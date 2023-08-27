async function loadRecordingList() {
    let recordings = await ipcRenderer.invoke("recordings.getRecordingList")

    recordings.forEach(recording => {
        let list = $("#recording-list")

        listItem = document.createElement("li")
        button = document.createElement("button")
        button.innerText = recording
        button.onclick = async () => {
            await ipcRenderer.invoke("recordings.newSession", recording)

            let canvas = $("#map-canvas")[0]
            let canvasCtx = canvas.getContext("2d")
            let bitmap = await ipcRenderer.invoke("recording.getInitialBitmap")

            let imageData = new ImageData(bitmap["bitmap"], bitmap["width"])

            canvas.width = bitmap["width"]
            canvas.height = bitmap["height"]
            canvas.style.width = canvas.width * 3
            canvas.style.height = canvas.height * 3

            canvasCtx.putImageData(imageData, 0, 0)
        }

        listItem.appendChild(button)

        list.append(listItem)
    })
}