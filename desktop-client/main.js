const path = require('path');
const url = require('url');
const electron = require('electron');

const { app, BrowserWindow, Menu } = electron;

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

    mainWindow.on('closed', () => {
        app.quit();
    });
});