import { BrowserWindow, ipcMain } from 'electron';

class RpcServer {
  constructor(app) {
    this._app = app;

    [
      'minimize',
      'maximize',
      'close',
    ]
      .forEach(fn => ipcMain.on(fn, this[fn]));
  }

  minimize(event) {
    const browserWindow = BrowserWindow.getFocusedWindow();
    browserWindow.minimize();
    event.returnValue = true;
  }

  maximize(event) {
    const browserWindow = BrowserWindow.getFocusedWindow();
    browserWindow.maximize();
    event.returnValue = true;
  }

  close(event) {
    const browserWindow = BrowserWindow.getFocusedWindow();
    browserWindow.close();
    event.returnValue = true;
  }
}

export default RpcServer;
