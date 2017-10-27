import { app, ipcMain } from 'electron';
import MainWindow from './windows/MainWindow';

declare var global: any;

global.DEV_MODE = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test';

const mainWindow = new MainWindow(true);