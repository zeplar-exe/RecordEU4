import { app, BrowserWindow } from "electron";

let win

async function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    await win.loadFile('www/index.html')
}

app.whenReady().then(async () => {
    require("./ipc.js") // Electron is bullshit.

    await createWindow()

    app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit()
    })

    app.on('activate', async () => {
        if (BrowserWindow.getAllWindows().length === 0)
            await createWindow()
    })
})