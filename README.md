# Scripts for violentmonkey

- developed on Firefox (macOS), should work on any browser/OS that has the violentmonkey browser extension
- scripts might work with TamperMonkey, but [violentmonkey](https://violentmonkey.github.io/) is the preferred extension (open source and actively maintained).

## `google-translate-ui.js`

remove some UI elements, and make the translation text boxes bigger. Google HTML is obsfucated/minimised so current CSS selectors could break at anytime.

## `whatsapp-status-remove.js`

remove the distracting `Status` and `Meta AI` nav items. Meta HTML is obsfucated/minimised so current CSS selectors could break at anytime.

## `windy-webcam-remove.js`

remove webcam results when searching locations in Windy.com. I find them annoying when you are trying to search and open weather predictions for a city, not look for webcam results.

## `zyxel-1password-complete.js`

Zyxel internet routers have terrible Javascript that does not behave properly with 1Password (a password manager). This is a bit of a hack to fix things enough to allow the 1Password extension to work and fill in your saved details. Only developed and tested for the router I had at home.
