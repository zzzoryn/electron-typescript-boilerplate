import { ipcRenderer } from 'electron';
import * as $ from 'jquery';

const $app = $('#app');
$app.append('<h1>Electron typesript app</h1>');
$app.append('<p>Description...</p>');