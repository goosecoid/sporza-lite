/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "puppeteer":
/***/ ((module) => {

module.exports = require("puppeteer");

/***/ }),

/***/ "tslib":
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),

/***/ "crypto":
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "fs":
/***/ ((module) => {

module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const puppeteer = __webpack_require__("puppeteer");
const crypto_1 = __webpack_require__("crypto");
const fs_1 = __webpack_require__("fs");
const getArticles = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer.launch();
    const page = yield browser.newPage();
    yield page.goto('https://sporza.be/nl/pas-verschenen');
    const filteredHrefs = yield page.$$eval('a', as => as.map(a => a.href)
        .filter(href => href.includes('2022') && !href.includes('bekijk') && !href.includes('categorie')));
    const articles = {};
    for (const href of filteredHrefs) {
        yield page.goto(href, { waitUntil: 'networkidle0' });
        const title = yield page.$eval('body > div > main > article > header > div.title', elem => elem.textContent);
        const intro = yield page.$eval('body > div > main > article > section > div.vrt-article__intro', elem => elem.textContent);
        const content = yield page.$eval('body > div > main > article > section > div.vrt-page__par', elem => elem.textContent);
        const article = { title: title.trim(), intro, content: content.includes('Gerelateerd') ? content.split('Gerelateerd')[0] : content };
        const hash = (0, crypto_1.createHash)('sha256');
        hash.update(title.trim());
        const key = hash.digest('hex');
        articles[key] = article;
    }
    yield page.close();
    yield browser.close();
    (0, fs_1.writeFileSync)('articles.json', JSON.stringify(articles), { encoding: 'utf8' });
});
getArticles()
    .finally(() => console.log("\nDone !"));

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map