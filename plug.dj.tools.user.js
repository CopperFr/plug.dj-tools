// ==UserScript==
// @name         plug.dj.tools
// @namespace    https://github.com/CopperFr/plug.dj-tools/
// @version      1.5.3
// @description  Some tools for plug.dj
// @author       CopperFr
// @match        https://plug.dj/*
// @grant        none
// ==/UserScript==

(function() {
script = document.createElement('script');
script.src = 'https://copperfr.github.io/plug.dj-tools/tools.js';
script.onload = function()
{
  this.remove();
};
(document.head || document.documentElement).appendChild(script);
})();
