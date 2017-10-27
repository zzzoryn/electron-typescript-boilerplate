import { Menu, globalShortcut } from 'electron';

export default class DevTools {
  constructor(
    private _window: any,
    ifOpenDevTools: boolean,
    ifCreateMenus: boolean,
    ifShortcuts: boolean
  ) {
    require('devtron').install();
    if (ifOpenDevTools) this._window.webContents.openDevTools();
    if (ifCreateMenus) this._createMenu();
    if (ifShortcuts) this._registerShortcuts();
  }

  private _createMenu() {
    this._window.webContents.on('context-menu', (e: any, props: any) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
        label: 'Reload window',
        role: 'reload'
      }, {
        type: 'separator'
      }, {
        label: 'Toggle devtools',
        role: 'toggledevtools'
      }, {
        label: 'Check item',
        click: () => this._window.inspectElement(x, y)
      }]).popup(this._window);
    });
  }

  private _registerShortcuts() {
    // F5: reload window
    globalShortcut.register('F5', () => {
      this._window.reload();
    });

    // F6: open dev tools
    globalShortcut.register('F6', () => {
      this._window.webContents.openDevTools();
    });
  }
}