// ==UserScript==
// @name        remove WhatsApp web status menu item
// @namespace   Violentmonkey Scripts
// @match       https://web.whatsapp.com/*
// @grant       none
// @version     1.0
// @author      mchampanis
// @license     MIT
// @description hides the status/stories menu item from WhatsApp web
// ==/UserScript==

(function () {

    'use strict';

    function removeStatusMenuItem() {
        const statusButton = document.querySelector('button[aria-label="Updates in Status"]');

        if (statusButton) {
            statusButton.parentNode.remove();
        } //if
    } //removeStatusMenuItem

    removeStatusMenuItem();

    // MutationObserver to handle dynamically loaded elements
    const observer = new MutationObserver(function (mutations) {
        removeStatusMenuItem();
    });

    // observe the document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    }); //observe

})();
