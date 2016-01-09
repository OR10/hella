// Use injected require to get the electron reference
const ipcRenderer = require('electron').ipcRenderer;

import 'font-awesome/css/font-awesome.min.css!';

import throttle from 'Support/throttle';
import domReady from 'domready';

throttle('resize', 'optimizedResize', window);

domReady(() => {
  const iframe = document.querySelector('iframe');

  function resize() {
    iframe.style.height = (window.innerHeight - 24) + 'px';
    iframe.style.width = (window.innerWidth) + 'px';
  }

  window.addEventListener('optimizedResize', resize, false);

  resize();


  document.querySelector('#window-controls .minimize').addEventListener(
    'click',
    () => ipcRenderer.send('minimize')
  );

  document.querySelector('#window-controls .maximize').addEventListener(
    'click',
    () => ipcRenderer.send('maximize')
  );

  document.querySelector('#window-controls .close').addEventListener(
    'click',
    () => ipcRenderer.send('close')
  );
});
