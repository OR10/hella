import app from 'app';
import { BrowserWindow } from 'electron';
import RpcServer from './RpcServer';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', () => app.quit());

app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    frame: false,
    show: false,
  });
  mainWindow.on('closed', () => mainWindow = null);

  const server = new RpcServer(app, mainWindow.webContents);

  mainWindow.webContents.once('did-stop-loading', () => mainWindow.show());
  mainWindow.loadURL('file://' + __dirname + '/../Chrome/chrome.html');

  //mainWindow.toggleDevTools();
});