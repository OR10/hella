// Use injected require to get the electron reference
const ipcRenderer = require('electron').ipcRenderer;

import 'font-awesome/css/font-awesome.min.css!';

import throttle from 'Support/throttle';
import domReady from 'domready';

throttle('resize', 'optimizedResize', window);

domReady(() => {
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

  const iframe = document.querySelector('iframe');

  function resize() {
    iframe.style.height = (window.innerHeight - 24) + 'px';
    iframe.style.width = (window.innerWidth) + 'px';
  }
  window.addEventListener('optimizedResize', resize, false);
  resize();

  iframe.addEventListener('load', () => {
    iframe.style.display = 'block';
    document.querySelector('.loading-mask').style.display = 'none';
  });
  iframe.src = 'https://anno.crosscan.com';
  //iframe.src = 'http://localhost:54321';
});
