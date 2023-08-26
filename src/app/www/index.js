async function loadReplayList() {
    let replays = await ipcRenderer.invoke("replays.getReplayList")
    replays.forEach(replay => {
        let list = $("#replay-list")

        listItem = document.createElement("li")
        button = document.createElement("button")
        button.innerText = replay
        button.onclick = async () => {
            let canvas = $("#map-canvas")[0]
            let canvasCtx = canvas.getContext("2d")
            let bitmap = await ipcRenderer.invoke("replays.getReplayBitmap", replay)

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

async function replay_selected(replay) {
    

    
}