import { app, BrowserWindow, nativeImage } from 'electron';
import * as path from 'path';
import DevTools from '../classes/DevTools';

declare var global: any;

export default class MainWindow {
  private _mainWindow: BrowserWindow | null;
  private _isDev: boolean;

  constructor(private _devtools: boolean) {
    this._isDev = process.env.NODE_ENV !== 'production';
    const self = this;
    app.on('ready', () => self.create());

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (self._mainWindow === null) {
        self.create();
      }
    });
  }

  // Create new window
  create(): BrowserWindow {
    this._mainWindow = new BrowserWindow({
      width: global.DEV_MODE ? 1400 : 920,
      height: 700,
      minWidth: 640,
      minHeight: 350,
      icon: path.join(__dirname, '../../../resoutces/icons/128x128.png'),
    });

    if (this._devtools && global.DEV_MODE) {
      new DevTools(this._mainWindow, true, true, true);
    }

    this._mainWindow.loadURL(path.join(__dirname, '../../renderer/windows/mainWindow/view.html'));
    this._mainWindow.on('closed', () => this._mainWindow = null);

    if (app.dock) {
      app.dock.setIcon(nativeImage.createFromPath("resources/icon.icns"));
    }
    else if (process.platform === 'win32') {
      this._mainWindow.setIcon(nativeImage.createFromPath("resources/icon.ico"));
    }
    else {
      this._mainWindow.setIcon(nativeImage.createFromPath("resources/icon.png"));
    }

    return this._mainWindow;
  }

  // Close window
  close(): void {
    this._mainWindow = null;
  }

  // Get window 
  get window(): any {
    return this._mainWindow;
  }


}