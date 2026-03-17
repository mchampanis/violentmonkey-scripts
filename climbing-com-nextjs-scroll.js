// ==UserScript==
// @name        Fix climbing.com scroll error
// @namespace   Violentmonkey Scripts
// @match       *://www.climbing.com/*
// @run-at      document-start
// @grant       none
// @version     1.3
// @author      mchampanis
// @license     MIT
// @description Fix Next.js crashes caused by blocked third-party scripts (uBlock Origin)
// ==/UserScript==

// Suppress errors
window.addEventListener('unhandledrejection', (e) => {
    if (e.reason?.message?.includes('is not a function') ||
        e.reason?.message?.includes('ambiguous')) {
        e.preventDefault();
    }
});
window.addEventListener('error', (e) => {
    if (e.message?.includes('is not a function') ||
        e.message?.includes('ambiguous')) {
        e.preventDefault();
        return true;
    }
});

// Stub Connatix
window.cnx = window.cnx || (() => { });
window.cnx.cmd = window.cnx?.cmd || { push: () => { } };

// Stub brandmetrics
window.top._brandmetrics = window.top._brandmetrics || { push: () => { } };

// Fix cyclic JSON
const origStringify = JSON.stringify;
JSON.stringify = function (value, replacer, space) {
    const seen = new WeakSet();
    return origStringify(value, (key, val) => {
        if (typeof val === 'object' && val !== null) {
            if (seen.has(val)) return undefined;
            seen.add(val);
        }
        return replacer ? replacer(key, val) : val;
    }, space);
};

// Stub BeyondWords metrics fetch
const origFetch = window.fetch;
window.fetch = function (url, ...args) {
    if (typeof url === 'string' && url.includes('metrics.beyondwords.io')) {
        return Promise.resolve(new Response('{}', { status: 200 }));
    }
    return origFetch.call(this, url, ...args);
};

// Patch querySelectorAll to deduplicate #beyondwords-player at query time
const origQSA = Document.prototype.querySelectorAll;
Document.prototype.querySelectorAll = function (selector, ...args) {
    const results = origQSA.call(this, selector, ...args);
    if (selector === '#beyondwords-player' && results.length > 1) {
        for (let i = 1; i < results.length; i++) {
            results[i].id = 'beyondwords-player-dupe';
        }
        return origQSA.call(this, selector, ...args);
    }
    return results;
};
