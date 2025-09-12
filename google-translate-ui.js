// ==UserScript==
// @name        edit google translate ui to improve use in a single window
// @namespace   Violentmonkey Scripts
// @match       https://translate.google.com/*
// @grant       none
// @version     1.0
// @author      mchampanis
// @license     MIT
// @description removes and resizes some ui elements
// ==/UserScript==

(function () {

    'use strict';

    function removeItems() {
        // do it this way for now because google html is obsfucated and it will probably change
        const selectors = [
            { selector: 'nav.VlPnLc', useParent: false },
            { selector: 'div.HWmS8', useParent: false }
        ];

        for (const { selector, useParent } of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                const targetElement = useParent ? element.parentNode : element;
                targetElement.remove();
            } //if
        } //for
    } //removeItems

    function resizeTextBox() {
        const textBox = document.querySelector('c-wiz.rm1UF');
        textBox.style.minHeight = '300px';
    } //resizeTextBox

    function doAll() {
        removeItems();
        resizeTextBox();
    } //doAll

    doAll();

    // MutationObserver to handle dynamically loaded elements
    const observer = new MutationObserver(function (mutations) {
        doAll();
    });

    // observe the document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    }); //observe

})();
