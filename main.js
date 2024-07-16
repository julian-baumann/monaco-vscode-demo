const { app, BrowserWindow, ipcMain, systemPreferences, dialog} = require("electron");

const args = process.argv.slice(1);
const serve = args.some(val => val === "--serve");
const devTools = args.some(val => val === "--dev-tools");

let mainWindow;

function createWindow(width, height, minimizable = false, maximizable = false, fullscreenable = false, resizable = false) {
    const window = new BrowserWindow({
        width: devTools ? width + 600 : width,
        height: height,
        show: false,
        minimizable: minimizable,
        maximizable: maximizable,
        fullscreenable: fullscreenable,
        resizable: devTools ? true : resizable,
        vibrancy: devTools ? undefined : "sidebar",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    window.once("ready-to-show", () => {
        window.show();
    });

    if (devTools) {
        window.webContents.openDevTools();
    }

    return window;
}

function createWindowWithRoute(width, height, route = "", minimizable = false, maximizable = false, fullscreenable = false, resizable = false) {
    const window = createWindow(width, height, minimizable, maximizable, fullscreenable, resizable);

    if (serve) {
        window.loadURL(`http://localhost:4200#${route}`)
            .then()
            .catch((error) => console.error(error));
    } else {
        window.loadURL(`file://${__dirname}/../../dist/monaco-test/index.html#${route}`)
            .then()
            .catch((error) => console.error(error));
    }

    return window;
}


function createStartupWindow() {
    mainWindow = createWindowWithRoute( 700, 800);
}

app.on("ready", () => {
    createStartupWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createStartupWindow();
    }
});
