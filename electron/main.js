const {
    app,
    BrowserWindow
} = require('electron')

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 750,
        minWidth: 800,
        minHeight: 600
    })

    win.loadFile('app/View/index.html')
    win.removeMenu()
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})