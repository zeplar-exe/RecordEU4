async function loadRecordingList() {
    let recordings = await ipcRenderer.invoke("recordings.getRecordingList")

    recordings.forEach(recording => {
        let list = $("#recording-list")

        listItem = document.createElement("li")
        button = document.createElement("button")
        button.innerText = recording
        button.onclick = async () => {
            let canvas = $("#map-canvas")[0]
            let canvasCtx = canvas.getContext("2d")
            let bitmap = await ipcRenderer.invoke("recordings.getRecordingBitmap", recording)

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