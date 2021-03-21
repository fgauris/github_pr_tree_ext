/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/background.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/content-scripts-register-polyfill/index.js":
/*!*****************************************************************!*\
  !*** ./node_modules/content-scripts-register-polyfill/index.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nfunction urlGlobToRegex(matchPattern) {\n    return '^' + matchPattern\n        .replace(/[.]/g, '\\\\.') // Escape dots\n        .replace(/[?]/, '.') // Single-character wildcards\n        .replace(/^[*]:/, 'https?') // Protocol\n        .replace(/^(https[?]?:[/][/])[*]/, '$1[^/:]+') // Subdomain wildcard\n        .replace(/[/][*]/, '/?.+') // Whole path wildcards (so it can match the whole origin)\n        .replace(/[*]/g, '.+') // Path wildcards\n        .replace(/[/]/g, '\\\\/'); // Escape slashes\n}\n// @ts-ignore\nasync function p(fn, ...args) {\n    return new Promise((resolve, reject) => {\n        // @ts-ignore\n        fn(...args, result => {\n            if (chrome.runtime.lastError) {\n                reject(chrome.runtime.lastError);\n            }\n            else {\n                resolve(result);\n            }\n        });\n    });\n}\nasync function isOriginPermitted(url) {\n    return p(chrome.permissions.contains, {\n        origins: [new URL(url).origin + '/*']\n    });\n}\nasync function wasPreviouslyLoaded(tabId, loadCheck) {\n    const result = await p(chrome.tabs.executeScript, tabId, {\n        code: loadCheck,\n        runAt: 'document_start'\n    });\n    return result && result[0];\n}\nif (!chrome.contentScripts) {\n    chrome.contentScripts = {\n        // The callback is only used by webextension-polyfill\n        async register(contentScriptOptions, callback) {\n            const { js = [], css = [], allFrames, matchAboutBlank, matches, runAt } = contentScriptOptions;\n            // Injectable code; it sets a `true` property on `document` with the hash of the files as key.\n            const loadCheck = `document[${JSON.stringify(JSON.stringify({ js, css }))}]`;\n            const matchesRegex = new RegExp(matches.map(urlGlobToRegex).join('$') + '$');\n            const listener = async (tabId, { status }) => {\n                if (status !== 'loading') {\n                    return;\n                }\n                const { url } = await p(chrome.tabs.get, tabId);\n                if (!url || // No URL = no permission;\n                    !matchesRegex.test(url) || // Manual `matches` glob matching\n                    !await isOriginPermitted(url) || // Permissions check\n                    await wasPreviouslyLoaded(tabId, loadCheck) // Double-injection avoidance\n                ) {\n                    return;\n                }\n                for (const file of css) {\n                    chrome.tabs.insertCSS(tabId, {\n                        ...file,\n                        matchAboutBlank,\n                        allFrames,\n                        runAt: runAt || 'document_start' // CSS should prefer `document_start` when unspecified\n                    });\n                }\n                for (const file of js) {\n                    chrome.tabs.executeScript(tabId, {\n                        ...file,\n                        matchAboutBlank,\n                        allFrames,\n                        runAt\n                    });\n                }\n                // Mark as loaded\n                chrome.tabs.executeScript(tabId, {\n                    code: `${loadCheck} = true`,\n                    runAt: 'document_start',\n                    allFrames\n                });\n            };\n            chrome.tabs.onUpdated.addListener(listener);\n            const registeredContentScript = {\n                async unregister() {\n                    return p(chrome.tabs.onUpdated.removeListener.bind(chrome.tabs.onUpdated), listener);\n                }\n            };\n            if (typeof callback === 'function') {\n                callback(registeredContentScript);\n            }\n            return Promise.resolve(registeredContentScript);\n        }\n    };\n}\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack:///./node_modules/content-scripts-register-polyfill/index.js?");

/***/ }),

/***/ "./node_modules/webext-additional-permissions/index.js":
/*!*************************************************************!*\
  !*** ./node_modules/webext-additional-permissions/index.js ***!
  \*************************************************************/
/*! exports provided: getManifestPermissions, getAdditionalPermissions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getManifestPermissions\", function() { return getManifestPermissions; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getAdditionalPermissions\", function() { return getAdditionalPermissions; });\nasync function getManifestPermissions() {\n    const manifest = chrome.runtime.getManifest();\n    const manifestPermissions = {\n        origins: [],\n        permissions: []\n    };\n    const list = new Set([\n        ...(manifest.permissions || []),\n        ...(manifest.content_scripts || []).flatMap(config => config.matches || [])\n    ]);\n    for (const permission of list) {\n        if (permission.includes('://')) {\n            manifestPermissions.origins.push(permission);\n        }\n        else {\n            manifestPermissions.permissions.push(permission);\n        }\n    }\n    return manifestPermissions;\n}\nasync function getAdditionalPermissions() {\n    const manifestPermissions = await getManifestPermissions();\n    return new Promise(resolve => {\n        chrome.permissions.getAll(currentPermissions => {\n            const additionalPermissions = {\n                origins: [],\n                permissions: []\n            };\n            for (const origin of currentPermissions.origins || []) {\n                if (!manifestPermissions.origins.includes(origin)) {\n                    additionalPermissions.origins.push(origin);\n                }\n            }\n            for (const permission of currentPermissions.permissions || []) {\n                if (!manifestPermissions.permissions.includes(permission)) {\n                    additionalPermissions.permissions.push(permission);\n                }\n            }\n            resolve(additionalPermissions);\n        });\n    });\n}\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack:///./node_modules/webext-additional-permissions/index.js?");

/***/ }),

/***/ "./node_modules/webext-domain-permission-toggle/index.js":
/*!***************************************************************!*\
  !*** ./node_modules/webext-domain-permission-toggle/index.js ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return addDomainPermissionToggle; });\n/* harmony import */ var webext_additional_permissions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webext-additional-permissions */ \"./node_modules/webext-additional-permissions/index.js\");\n\nconst contextMenuId = 'webext-domain-permission-toggle:add-permission';\nlet currentTabId;\nlet globalOptions;\n// @ts-ignore\nasync function p(fn, ...args) {\n    return new Promise((resolve, reject) => {\n        // @ts-ignore\n        fn(...args, result => {\n            if (chrome.runtime.lastError) {\n                reject(chrome.runtime.lastError);\n            }\n            else {\n                resolve(result);\n            }\n        });\n    });\n}\nasync function isOriginPermanentlyAllowed(origin) {\n    return p(chrome.permissions.contains, {\n        origins: [\n            origin + '/*'\n        ]\n    });\n}\nfunction createMenu() {\n    chrome.contextMenus.remove(contextMenuId, () => chrome.runtime.lastError);\n    chrome.contextMenus.create({\n        id: contextMenuId,\n        type: 'checkbox',\n        checked: false,\n        title: globalOptions.title,\n        contexts: [\n            'page_action',\n            'browser_action'\n        ],\n        documentUrlPatterns: [\n            'http://*/*',\n            'https://*/*'\n        ]\n    });\n}\nfunction updateItem({ tabId }) {\n    chrome.tabs.executeScript(tabId, {\n        code: 'location.origin'\n    }, async ([origin] = []) => {\n        const settings = {\n            checked: false,\n            enabled: true\n        };\n        if (!chrome.runtime.lastError && origin) {\n            // Manifest permissions can't be removed; this disables the toggle on those domains\n            const manifestPermissions = await Object(webext_additional_permissions__WEBPACK_IMPORTED_MODULE_0__[\"getManifestPermissions\"])();\n            const isDefault = manifestPermissions.origins.some(permission => permission.startsWith(origin));\n            settings.enabled = !isDefault;\n            // We might have temporary permission as part of `activeTab`, so it needs to be properly checked\n            settings.checked = isDefault || await isOriginPermanentlyAllowed(origin);\n        }\n        chrome.contextMenus.update(contextMenuId, settings);\n    });\n}\nasync function handleClick({ wasChecked, menuItemId }, tab) {\n    if (menuItemId !== contextMenuId || !tab) {\n        return;\n    }\n    try {\n        const successful = await p(wasChecked ? chrome.permissions.remove : chrome.permissions.request, {\n            origins: [\n                new URL(tab.url).origin + '/*'\n            ]\n        });\n        if (wasChecked && successful) {\n            chrome.contextMenus.update(contextMenuId, {\n                checked: false\n            });\n        }\n        if (!wasChecked && successful && globalOptions.reloadOnSuccess) {\n            // Firefox doesn't support `confirm()` from the background page.\n            // JSON.stringify escapes the string to avoid self-XSS\n            chrome.tabs.executeScript({\n                code: `confirm(${JSON.stringify(globalOptions.reloadOnSuccess)}) && location.reload()`\n            });\n        }\n    }\n    catch (error) {\n        console.error(error.message);\n        alert(`Error: ${error.message}`);\n        updateItem({ tabId: tab.id });\n    }\n}\n/**\n * Adds an item to the browser action icon's context menu.\n * The user can access this menu by right clicking the icon. If your extension doesn't have any action or\n * popup assigned to the icon, it will also appear with a left click.\n *\n * @param options {Options}\n */\nfunction addDomainPermissionToggle(options) {\n    if (globalOptions) {\n        throw new Error('webext-domain-permission-toggle can only be initialized once');\n    }\n    const { name } = chrome.runtime.getManifest();\n    globalOptions = { title: `Enable ${name} on this domain`,\n        reloadOnSuccess: `Do you want to reload this page to apply ${name}?`, ...options };\n    chrome.contextMenus.onClicked.addListener(handleClick);\n    chrome.tabs.onActivated.addListener(updateItem);\n    chrome.tabs.onUpdated.addListener((tabId, { status }) => {\n        if (currentTabId === tabId && status === 'complete') {\n            updateItem({ tabId });\n        }\n    });\n    createMenu();\n}\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack:///./node_modules/webext-domain-permission-toggle/index.js?");

/***/ }),

/***/ "./node_modules/webext-dynamic-content-scripts/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/webext-dynamic-content-scripts/index.js ***!
  \**************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var content_scripts_register_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! content-scripts-register-polyfill */ \"./node_modules/content-scripts-register-polyfill/index.js\");\n/* harmony import */ var content_scripts_register_polyfill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(content_scripts_register_polyfill__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var webext_permissions_events_polyfill__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! webext-permissions-events-polyfill */ \"./node_modules/webext-permissions-events-polyfill/index.js\");\n/* harmony import */ var webext_permissions_events_polyfill__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(webext_permissions_events_polyfill__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var webext_additional_permissions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! webext-additional-permissions */ \"./node_modules/webext-additional-permissions/index.js\");\n\n\n\nconst registeredScripts = new Map();\n// In Firefox, paths in the manifest are converted to full URLs under `moz-extension://` but browser.contentScripts expects exclusively relative paths\nfunction convertPath(file) {\n    const url = new URL(file, location.origin);\n    return { file: url.pathname };\n}\n// Automatically register the content scripts on the new origins\nasync function registerOnOrigins({ origins: newOrigins }) {\n    const manifest = chrome.runtime.getManifest().content_scripts;\n    // Register one at a time to allow removing one at a time as well\n    for (const origin of newOrigins || []) {\n        for (const config of manifest) {\n            const registeredScript = chrome.contentScripts.register({\n                js: (config.js || []).map(convertPath),\n                css: (config.css || []).map(convertPath),\n                allFrames: config.all_frames,\n                matches: [origin],\n                runAt: config.run_at\n            });\n            registeredScripts.set(origin, registeredScript);\n        }\n    }\n}\n(async () => {\n    registerOnOrigins(await Object(webext_additional_permissions__WEBPACK_IMPORTED_MODULE_2__[\"getAdditionalPermissions\"])());\n})();\nchrome.permissions.onAdded.addListener(permissions => {\n    if (permissions.origins && permissions.origins.length > 0) {\n        registerOnOrigins(permissions);\n    }\n});\nchrome.permissions.onRemoved.addListener(async ({ origins }) => {\n    if (!origins || origins.length === 0) {\n        return;\n    }\n    for (const [origin, script] of registeredScripts) {\n        if (origins.includes(origin)) {\n            // eslint-disable-next-line no-await-in-loop\n            (await script).unregister();\n        }\n    }\n});\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack:///./node_modules/webext-dynamic-content-scripts/index.js?");

/***/ }),

/***/ "./node_modules/webext-permissions-events-polyfill/index.js":
/*!******************************************************************!*\
  !*** ./node_modules/webext-permissions-events-polyfill/index.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nconst events = [\n    ['request', 'onAdded'],\n    ['remove', 'onRemoved']\n];\nif (chrome.permissions && !chrome.permissions.onAdded) {\n    for (const [action, event] of events) {\n        const act = chrome.permissions[action];\n        const listeners = new Set();\n        // Collect\n        chrome.permissions[event] = {\n            addListener(callback) {\n                listeners.add(callback);\n            }\n        };\n        // Listen into requests and fire callbacks\n        chrome.permissions[action] = (permissions, callback) => {\n            const initial = browser.permissions.contains(permissions);\n            const expected = action === 'request';\n            act(permissions, async (successful) => {\n                if (callback) {\n                    callback(successful);\n                }\n                if (!successful) {\n                    return;\n                }\n                // Only fire events if they changed\n                if (await initial !== expected) {\n                    const fullPermissions = { origins: [], permissions: [], ...permissions };\n                    // Firefox won't run asynchronous functions without this\n                    chrome.permissions.getAll(() => {\n                        for (const listener of listeners) {\n                            setTimeout(listener, 0, fullPermissions); // Run all listeners even if one errors\n                        }\n                    });\n                }\n            });\n        };\n        // @ts-ignore `onAdded` is specified as `const`, but isn't\n        browser.permissions[event] = chrome.permissions[event];\n        // TODO: drop `as 'request'` after https://github.com/jsmnbom/definitelytyped-firefox-webext-browser/issues/22\n        browser.permissions[action] = async (permissions) => new Promise((resolve, reject) => {\n            chrome.permissions[action](permissions, result => {\n                if (chrome.runtime.lastError) {\n                    reject(chrome.runtime.lastError);\n                }\n                else {\n                    resolve(result);\n                }\n            });\n        });\n    }\n}\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack:///./node_modules/webext-permissions-events-polyfill/index.js?");

/***/ }),

/***/ "./src/js/background.js":
/*!******************************!*\
  !*** ./src/js/background.js ***!
  \******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var webext_dynamic_content_scripts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webext-dynamic-content-scripts */ \"./node_modules/webext-dynamic-content-scripts/index.js\");\n/* harmony import */ var webext_domain_permission_toggle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! webext-domain-permission-toggle */ \"./node_modules/webext-domain-permission-toggle/index.js\");\n\n\nObject(webext_domain_permission_toggle__WEBPACK_IMPORTED_MODULE_1__[\"default\"])();\n\n//# sourceURL=webpack:///./src/js/background.js?");

/***/ })

/******/ });