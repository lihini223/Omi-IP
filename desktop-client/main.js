const path = require('path');
const url = require('url');
const electron = require('electron');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let gameWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    /*mainWindow.on('closed', () => {
        app.quit();
    });*/
});

ipcMain.on('player-data', (err, data) => {
    createGameWindow(data);
    mainWindow.close();
});

function createGameWindow(playerData) {
    gameWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    gameWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'omi.html'),
        protocol: 'file:',
        slashes: true
    }));

    gameWindow.once('ready-to-show', () => {
        gameWindow.webContents.send('player-data', playerData);
    });
}