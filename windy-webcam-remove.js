// ==UserScript==
// @name        hide windy.com webcam search results
// @namespace   Violentmonkey Scripts
// @match       https://*.windy.com/*
// @grant       none
// @version     1.0
// @author      mchampanis
// @license     MIT
// @description hides webcams from windy.com search results
// ==/UserScript==

(function () {

    'use strict';

    function removeWebcamSearchElements() {
        const webcams = document.querySelectorAll('a.item--type-webcam');

        webcams.forEach((webcam) => {
            webcam.remove();
        });
    } //removeWebcamSearchElements

    removeWebcamSearchElements();

    // MutationObserver to handle dynamically loaded elements
    const observer = new MutationObserver(function (mutations) {
        removeWebcamSearchElements();
    });

    // observe the document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    }); //observe

})();
