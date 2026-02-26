// ==UserScript==
// @name        remove distracting WhatsApp ui elements
// @namespace   Violentmonkey Scripts
// @match       https://web.whatsapp.com/*
// @grant       none
// @version     1.3
// @author      mchampanis
// @license     MIT
// @description hides the status/stories and AI menu items from WhatsApp web
// ==/UserScript==

(function () {

    'use strict';

    let debounceTimer;

    function removeItems() {
        // do it this way for now because meta html is obfuscated and it will probably change
        // each nav item is: wrapper div > span.html-span > button; remove the span
        const buttonSelectors = [
            'button[aria-label="Updates in Status"]',
            'button[aria-label="Status"]',
            'button[aria-label="Meta AI"]',
        ];

        for (const selector of buttonSelectors) {
            const el = document.querySelector(selector);
            if (el) el.parentElement.parentElement.remove();
        } //for
    } //removeItems

    // master function for future
    function doAllChanges() {
        removeItems();
    } //doAll

    doAllChanges();

    // MutationObserver to handle dynamically loaded elements; debounced to reduce CPU overhead
    const observer = new MutationObserver(function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(doAllChanges, 300);
    });

    // observe the document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    }); //observe

})();
