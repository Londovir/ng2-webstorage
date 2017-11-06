(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core'], factory) :
    (factory((global.ng2Webstorage = global.ng2Webstorage || {}),global.ng.core));
}(this, (function (exports,_angular_core) { 'use strict';

var STORAGE;
(function (STORAGE) {
    STORAGE[STORAGE["local"] = 0] = "local";
    STORAGE[STORAGE["session"] = 1] = "session";
})(STORAGE || (STORAGE = {}));

var LIB_KEY = 'ng2-webstorage';
var LIB_KEY_SEPARATOR = '|';
var LIB_KEY_CASE_SENSITIVE = false;
var STORAGE_NAMES = (_a = {},
    _a[STORAGE.local] = 'local',
    _a[STORAGE.session] = 'session',
    _a);
var _a;

var CUSTOM_LIB_KEY = LIB_KEY;
var CUSTOM_LIB_KEY_SEPARATOR = LIB_KEY_SEPARATOR;
var CUSTOM_LIB_KEY_CASE_SENSITIVE = LIB_KEY_CASE_SENSITIVE;
function isManagedKey(sKey) {
    return sKey.indexOf(CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR) === 0;
}
var KeyStorageHelper = (function () {
    function KeyStorageHelper() {
    }
    KeyStorageHelper.isManagedKey = function (sKey) {
        return sKey.indexOf(CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR) === 0;
    };
    KeyStorageHelper.retrieveKeysFromStorage = function (storage) {
        return Object.keys(storage).filter(isManagedKey);
    };
    KeyStorageHelper.genKey = function (raw) {
        if (typeof raw !== 'string')
            throw Error('attempt to generate a storage key with a non string value');
        return "" + CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR + this.formatKey(raw);
    };
    KeyStorageHelper.formatKey = function (raw) {
        var key = raw.toString();
        return CUSTOM_LIB_KEY_CASE_SENSITIVE ? key : key.toLowerCase();
    };
    KeyStorageHelper.setStorageKeyPrefix = function (key) {
        if (key === void 0) { key = LIB_KEY; }
        CUSTOM_LIB_KEY = key;
    };
    KeyStorageHelper.setCaseSensitivity = function (enable) {
        if (enable === void 0) { enable = LIB_KEY_CASE_SENSITIVE; }
        CUSTOM_LIB_KEY_CASE_SENSITIVE = enable;
    };
    KeyStorageHelper.setStorageKeySeparator = function (separator) {
        if (separator === void 0) { separator = LIB_KEY_SEPARATOR; }
        CUSTOM_LIB_KEY_SEPARATOR = separator;
    };
    return KeyStorageHelper;
}());

var StorageObserverHelper = (function () {
    function StorageObserverHelper() {
    }
    StorageObserverHelper.observe = function (sType, sKey) {
        var oKey = this.genObserverKey(sType, sKey);
        if (oKey in this.observers)
            return this.observers[oKey];
        return this.observers[oKey] = new _angular_core.EventEmitter();
    };
    StorageObserverHelper.emit = function (sType, sKey, value) {
        var oKey = this.genObserverKey(sType, sKey);
        if (oKey in this.observers)
            this.observers[oKey].emit(value);
    };
    StorageObserverHelper.genObserverKey = function (sType, sKey) {
        return sType + '|' + sKey;
    };
    StorageObserverHelper.observers = {};
    return StorageObserverHelper;
}());

var MockStorageHelper = (function () {
    function MockStorageHelper() {
    }
    MockStorageHelper.isSecuredField = function (field) {
        return !!~MockStorageHelper.securedFields.indexOf(field);
    };
    MockStorageHelper.getStorage = function (sType) {
        if (!this.mockStorages[sType])
            this.mockStorages[sType] = MockStorageHelper.generateStorage();
        return this.mockStorages[sType];
    };
    MockStorageHelper.generateStorage = function () {
        var storage = {};
        Object.defineProperties(storage, {
            setItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key, value) {
                    if (!MockStorageHelper.isSecuredField(key))
                        this[key] = value;
                },
            },
            getItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key) {
                    return !MockStorageHelper.isSecuredField(key) ? this[key] || null : null;
                },
            },
            removeItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key) {
                    if (!MockStorageHelper.isSecuredField(key))
                        delete this[key];
                },
            },
            length: {
                enumerable: false,
                configurable: false,
                get: function () {
                    return Object.keys(this).length;
                }
            }
        });
        return storage;
    };
    MockStorageHelper.securedFields = ['setItem', 'getItem', 'removeItem', 'length'];
    MockStorageHelper.mockStorages = {};
    return MockStorageHelper;
}());

var CACHED = (_a$1 = {}, _a$1[STORAGE.local] = {}, _a$1[STORAGE.session] = {}, _a$1);
var STORAGEAVAILABILITY = (_b = {}, _b[STORAGE.local] = null, _b[STORAGE.session] = null, _b);
var WebStorageHelper = (function () {
    function WebStorageHelper() {
    }
    WebStorageHelper.store = function (sType, sKey, value) {
        this.getStorage(sType).setItem(sKey, JSON.stringify(value));
        CACHED[sType][sKey] = value;
        StorageObserverHelper.emit(sType, sKey, value);
    };
    WebStorageHelper.retrieve = function (sType, sKey) {
        if (CACHED[sType][sKey])
            return CACHED[sType][sKey];
        return CACHED[sType][sKey] = WebStorageHelper.retrieveFromStorage(sType, sKey);
    };
    WebStorageHelper.retrieveFromStorage = function (sType, sKey) {
        var data = null;
        try {
            data = JSON.parse(this.getStorage(sType).getItem(sKey));
        }
        catch (err) {
            console.warn("invalid value for " + sKey);
        }
        return data;
    };
    WebStorageHelper.refresh = function (sType, sKey) {
        if (!KeyStorageHelper.isManagedKey(sKey))
            return;
        var value = WebStorageHelper.retrieveFromStorage(sType, sKey);
        if (value === null) {
            delete CACHED[sType][sKey];
            StorageObserverHelper.emit(sType, sKey, null);
        }
        else if (value !== CACHED[sType][sKey]) {
            CACHED[sType][sKey] = value;
            StorageObserverHelper.emit(sType, sKey, value);
        }
    };
    WebStorageHelper.clearAll = function (sType) {
        var storage = this.getStorage(sType);
        KeyStorageHelper.retrieveKeysFromStorage(storage)
            .forEach(function (sKey) {
            storage.removeItem(sKey);
            delete CACHED[sType][sKey];
            StorageObserverHelper.emit(sType, sKey, null);
        });
    };
    WebStorageHelper.clear = function (sType, sKey) {
        this.getStorage(sType).removeItem(sKey);
        delete CACHED[sType][sKey];
        StorageObserverHelper.emit(sType, sKey, null);
    };
    WebStorageHelper.getStorage = function (sType) {
        if (this.isStorageAvailable(sType))
            return this.getWStorage(sType);
        else
            return MockStorageHelper.getStorage(sType);
    };
    WebStorageHelper.getWStorage = function (sType) {
        var storage;
        switch (sType) {
            case STORAGE.local:
                storage = localStorage;
                break;
            case STORAGE.session:
                storage = sessionStorage;
                break;
            default:
                throw Error('invalid storage type');
        }
        return storage;
    };
    WebStorageHelper.isStorageAvailable = function (sType) {
        if (typeof STORAGEAVAILABILITY[sType] === 'boolean')
            return STORAGEAVAILABILITY[sType];
        var isAvailable = true, storage;
        try {
            storage = this.getWStorage(sType);
            if (typeof storage === 'object') {
                storage.setItem('test-storage', 'foobar');
                storage.removeItem('test-storage');
            }
            else
                isAvailable = false;
        }
        catch (e) {
            isAvailable = false;
        }
        if (!isAvailable)
            console.warn(STORAGE_NAMES[sType] + " storage unavailable, Ng2Webstorage will use a fallback strategy instead");
        return STORAGEAVAILABILITY[sType] = isAvailable;
    };
    return WebStorageHelper;
}());
var _a$1;
var _b;

var WebStorageService = (function () {
    function WebStorageService(sType) {
        if (sType === void 0) { sType = null; }
        this.sType = sType;
        this.sType = sType;
    }
    WebStorageService.prototype.store = function (raw, value) {
        var sKey = KeyStorageHelper.genKey(raw);
        WebStorageHelper.store(this.sType, sKey, value);
    };
    WebStorageService.prototype.retrieve = function (raw) {
        var sKey = KeyStorageHelper.genKey(raw);
        return WebStorageHelper.retrieve(this.sType, sKey);
    };
    WebStorageService.prototype.clear = function (raw) {
        if (raw)
            WebStorageHelper.clear(this.sType, KeyStorageHelper.genKey(raw));
        else
            WebStorageHelper.clearAll(this.sType);
    };
    WebStorageService.prototype.observe = function (raw) {
        var sKey = KeyStorageHelper.genKey(raw);
        return StorageObserverHelper.observe(this.sType, sKey);
    };
    return WebStorageService;
}());

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LocalStorageService = (function (_super) {
    __extends(LocalStorageService, _super);
    function LocalStorageService() {
        return _super.call(this, STORAGE.local) || this;
    }
    LocalStorageService.decorators = [
        { type: _angular_core.Injectable },
    ];
    /** @nocollapse */
    LocalStorageService.ctorParameters = function () { return []; };
    return LocalStorageService;
}(WebStorageService));

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var SessionStorageService = (function (_super) {
    __extends$1(SessionStorageService, _super);
    function SessionStorageService() {
        return _super.call(this, STORAGE.session) || this;
    }
    SessionStorageService.decorators = [
        { type: _angular_core.Injectable },
    ];
    /** @nocollapse */
    SessionStorageService.ctorParameters = function () { return []; };
    return SessionStorageService;
}(WebStorageService));

var WebstorageConfig = (function () {
    function WebstorageConfig(config) {
        this.prefix = LIB_KEY;
        this.separator = LIB_KEY_SEPARATOR;
        this.caseSensitive = LIB_KEY_CASE_SENSITIVE;
        if (config && config.prefix !== undefined) {
            this.prefix = config.prefix;
        }
        if (config && config.separator !== undefined) {
            this.separator = config.separator;
        }
        if (config && config.caseSensitive !== undefined) {
            this.caseSensitive = config.caseSensitive;
        }
    }
    return WebstorageConfig;
}());

function WebStorage(webSKey, sType, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, STORAGE.local, targetedClass, raw, defaultValue);
    };
}
function WebStorageDecorator(webSKey, sType, targetedClass, raw, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    var key = webSKey || raw;
    Object.defineProperty(targetedClass, raw, {
        get: function () {
            var sKey = KeyStorageHelper.genKey(key);
            return WebStorageHelper.retrieve(sType, sKey);
        },
        set: function (value) {
            var sKey = KeyStorageHelper.genKey(key);
            this[sKey] = value;
            WebStorageHelper.store(sType, sKey, value);
        }
    });
    if (targetedClass[raw] === null)
        targetedClass[raw] = defaultValue;
}

function LocalStorage(webSKey, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, STORAGE.local, targetedClass, raw, defaultValue);
    };
}

function SessionStorage(webSKey, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, STORAGE.session, targetedClass, raw, defaultValue);
    };
}

var WEBSTORAGE_CONFIG = new _angular_core.InjectionToken('WEBSTORAGE_CONFIG');
var Ng2Webstorage = (function () {
    function Ng2Webstorage(ngZone, config) {
        this.ngZone = ngZone;
        if (config) {
            KeyStorageHelper.setStorageKeyPrefix(config.prefix);
            KeyStorageHelper.setStorageKeySeparator(config.separator);
            KeyStorageHelper.setCaseSensitivity(config.caseSensitive);
        }
        this.initStorageListener();
    }
    Ng2Webstorage.forRoot = function (config) {
        return {
            ngModule: Ng2Webstorage,
            providers: [
                {
                    provide: WEBSTORAGE_CONFIG,
                    useValue: config
                },
                {
                    provide: WebstorageConfig,
                    useFactory: provideConfig,
                    deps: [
                        WEBSTORAGE_CONFIG
                    ]
                }
            ]
        };
    };
    Ng2Webstorage.prototype.initStorageListener = function () {
        var _this = this;
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', function (event) {
                return _this.ngZone.run(function () {
                    var storage = window.sessionStorage === event.storageArea ? STORAGE.session : STORAGE.local;
                    WebStorageHelper.refresh(storage, event.key);
                });
            });
        }
    };
    Ng2Webstorage.decorators = [
        { type: _angular_core.NgModule, args: [{
                    declarations: [],
                    providers: [SessionStorageService, LocalStorageService],
                    imports: []
                },] },
    ];
    /** @nocollapse */
    Ng2Webstorage.ctorParameters = function () { return [
        { type: _angular_core.NgZone, },
        { type: WebstorageConfig, decorators: [{ type: _angular_core.Optional }, { type: _angular_core.Inject, args: [WebstorageConfig,] },] },
    ]; };
    return Ng2Webstorage;
}());
function provideConfig(config) {
    return new WebstorageConfig(config);
}
function configure(_a) {
    var _b = _a === void 0 ? {
        caseSensitive: LIB_KEY_CASE_SENSITIVE,
        prefix: LIB_KEY,
        separator: LIB_KEY_SEPARATOR
    } : _a, prefix = _b.prefix, separator = _b.separator, caseSensitive = _b.caseSensitive;
    /*@Deprecation*/
    console.warn('[ng2-webstorage:deprecation] The configure method is deprecated since the v1.5.0, consider to use forRoot instead');
    KeyStorageHelper.setStorageKeyPrefix(prefix);
    KeyStorageHelper.setStorageKeySeparator(separator);
    KeyStorageHelper.setCaseSensitivity(caseSensitive);
}

exports.WEBSTORAGE_CONFIG = WEBSTORAGE_CONFIG;
exports.Ng2Webstorage = Ng2Webstorage;
exports.provideConfig = provideConfig;
exports.configure = configure;
exports.WebstorageConfig = WebstorageConfig;
exports.LocalStorage = LocalStorage;
exports.SessionStorage = SessionStorage;
exports.WebStorage = WebStorage;
exports.WebStorageDecorator = WebStorageDecorator;
exports.WebStorageService = WebStorageService;
exports.LocalStorageService = LocalStorageService;
exports.SessionStorageService = SessionStorageService;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2Rpc3QvZW51bXMvc3RvcmFnZS5qcyIsIi4uL2Rpc3QvY29uc3RhbnRzL2xpYi5qcyIsIi4uL2Rpc3QvaGVscGVycy9rZXlTdG9yYWdlLmpzIiwiLi4vZGlzdC9oZWxwZXJzL3N0b3JhZ2VPYnNlcnZlci5qcyIsIi4uL2Rpc3QvaGVscGVycy9tb2NrU3RvcmFnZS5qcyIsIi4uL2Rpc3QvaGVscGVycy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9zZXJ2aWNlcy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9zZXJ2aWNlcy9sb2NhbFN0b3JhZ2UuanMiLCIuLi9kaXN0L3NlcnZpY2VzL3Nlc3Npb25TdG9yYWdlLmpzIiwiLi4vZGlzdC9pbnRlcmZhY2VzL2NvbmZpZy5qcyIsIi4uL2Rpc3QvZGVjb3JhdG9ycy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9kZWNvcmF0b3JzL2xvY2FsU3RvcmFnZS5qcyIsIi4uL2Rpc3QvZGVjb3JhdG9ycy9zZXNzaW9uU3RvcmFnZS5qcyIsIi4uL2Rpc3QvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB2YXIgU1RPUkFHRTtcclxuKGZ1bmN0aW9uIChTVE9SQUdFKSB7XHJcbiAgICBTVE9SQUdFW1NUT1JBR0VbXCJsb2NhbFwiXSA9IDBdID0gXCJsb2NhbFwiO1xyXG4gICAgU1RPUkFHRVtTVE9SQUdFW1wic2Vzc2lvblwiXSA9IDFdID0gXCJzZXNzaW9uXCI7XHJcbn0pKFNUT1JBR0UgfHwgKFNUT1JBR0UgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdG9yYWdlLmpzLm1hcCIsImltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuLi9lbnVtcy9zdG9yYWdlJztcclxuZXhwb3J0IHZhciBMSUJfS0VZID0gJ25nMi13ZWJzdG9yYWdlJztcclxuZXhwb3J0IHZhciBMSUJfS0VZX1NFUEFSQVRPUiA9ICd8JztcclxuZXhwb3J0IHZhciBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFID0gZmFsc2U7XHJcbmV4cG9ydCB2YXIgU1RPUkFHRV9OQU1FUyA9IChfYSA9IHt9LFxyXG4gICAgX2FbU1RPUkFHRS5sb2NhbF0gPSAnbG9jYWwnLFxyXG4gICAgX2FbU1RPUkFHRS5zZXNzaW9uXSA9ICdzZXNzaW9uJyxcclxuICAgIF9hKTtcclxudmFyIF9hO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1saWIuanMubWFwIiwiaW1wb3J0IHsgTElCX0tFWSwgTElCX0tFWV9DQVNFX1NFTlNJVElWRSwgTElCX0tFWV9TRVBBUkFUT1IgfSBmcm9tICcuLi9jb25zdGFudHMvbGliJztcclxudmFyIENVU1RPTV9MSUJfS0VZID0gTElCX0tFWTtcclxudmFyIENVU1RPTV9MSUJfS0VZX1NFUEFSQVRPUiA9IExJQl9LRVlfU0VQQVJBVE9SO1xyXG52YXIgQ1VTVE9NX0xJQl9LRVlfQ0FTRV9TRU5TSVRJVkUgPSBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFO1xyXG5leHBvcnQgZnVuY3Rpb24gaXNNYW5hZ2VkS2V5KHNLZXkpIHtcclxuICAgIHJldHVybiBzS2V5LmluZGV4T2YoQ1VTVE9NX0xJQl9LRVkgKyBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IpID09PSAwO1xyXG59XHJcbnZhciBLZXlTdG9yYWdlSGVscGVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEtleVN0b3JhZ2VIZWxwZXIoKSB7XHJcbiAgICB9XHJcbiAgICBLZXlTdG9yYWdlSGVscGVyLmlzTWFuYWdlZEtleSA9IGZ1bmN0aW9uIChzS2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIHNLZXkuaW5kZXhPZihDVVNUT01fTElCX0tFWSArIENVU1RPTV9MSUJfS0VZX1NFUEFSQVRPUikgPT09IDA7XHJcbiAgICB9O1xyXG4gICAgS2V5U3RvcmFnZUhlbHBlci5yZXRyaWV2ZUtleXNGcm9tU3RvcmFnZSA9IGZ1bmN0aW9uIChzdG9yYWdlKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHN0b3JhZ2UpLmZpbHRlcihpc01hbmFnZWRLZXkpO1xyXG4gICAgfTtcclxuICAgIEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5ID0gZnVuY3Rpb24gKHJhdykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcmF3ICE9PSAnc3RyaW5nJylcclxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ2F0dGVtcHQgdG8gZ2VuZXJhdGUgYSBzdG9yYWdlIGtleSB3aXRoIGEgbm9uIHN0cmluZyB2YWx1ZScpO1xyXG4gICAgICAgIHJldHVybiBcIlwiICsgQ1VTVE9NX0xJQl9LRVkgKyBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IgKyB0aGlzLmZvcm1hdEtleShyYXcpO1xyXG4gICAgfTtcclxuICAgIEtleVN0b3JhZ2VIZWxwZXIuZm9ybWF0S2V5ID0gZnVuY3Rpb24gKHJhdykge1xyXG4gICAgICAgIHZhciBrZXkgPSByYXcudG9TdHJpbmcoKTtcclxuICAgICAgICByZXR1cm4gQ1VTVE9NX0xJQl9LRVlfQ0FTRV9TRU5TSVRJVkUgPyBrZXkgOiBrZXkudG9Mb3dlckNhc2UoKTtcclxuICAgIH07XHJcbiAgICBLZXlTdG9yYWdlSGVscGVyLnNldFN0b3JhZ2VLZXlQcmVmaXggPSBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgaWYgKGtleSA9PT0gdm9pZCAwKSB7IGtleSA9IExJQl9LRVk7IH1cclxuICAgICAgICBDVVNUT01fTElCX0tFWSA9IGtleTtcclxuICAgIH07XHJcbiAgICBLZXlTdG9yYWdlSGVscGVyLnNldENhc2VTZW5zaXRpdml0eSA9IGZ1bmN0aW9uIChlbmFibGUpIHtcclxuICAgICAgICBpZiAoZW5hYmxlID09PSB2b2lkIDApIHsgZW5hYmxlID0gTElCX0tFWV9DQVNFX1NFTlNJVElWRTsgfVxyXG4gICAgICAgIENVU1RPTV9MSUJfS0VZX0NBU0VfU0VOU0lUSVZFID0gZW5hYmxlO1xyXG4gICAgfTtcclxuICAgIEtleVN0b3JhZ2VIZWxwZXIuc2V0U3RvcmFnZUtleVNlcGFyYXRvciA9IGZ1bmN0aW9uIChzZXBhcmF0b3IpIHtcclxuICAgICAgICBpZiAoc2VwYXJhdG9yID09PSB2b2lkIDApIHsgc2VwYXJhdG9yID0gTElCX0tFWV9TRVBBUkFUT1I7IH1cclxuICAgICAgICBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IgPSBzZXBhcmF0b3I7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEtleVN0b3JhZ2VIZWxwZXI7XHJcbn0oKSk7XHJcbmV4cG9ydCB7IEtleVN0b3JhZ2VIZWxwZXIgfTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9a2V5U3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxudmFyIFN0b3JhZ2VPYnNlcnZlckhlbHBlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIoKSB7XHJcbiAgICB9XHJcbiAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIub2JzZXJ2ZSA9IGZ1bmN0aW9uIChzVHlwZSwgc0tleSkge1xyXG4gICAgICAgIHZhciBvS2V5ID0gdGhpcy5nZW5PYnNlcnZlcktleShzVHlwZSwgc0tleSk7XHJcbiAgICAgICAgaWYgKG9LZXkgaW4gdGhpcy5vYnNlcnZlcnMpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9ic2VydmVyc1tvS2V5XTtcclxuICAgICAgICByZXR1cm4gdGhpcy5vYnNlcnZlcnNbb0tleV0gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgICB9O1xyXG4gICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXksIHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIG9LZXkgPSB0aGlzLmdlbk9ic2VydmVyS2V5KHNUeXBlLCBzS2V5KTtcclxuICAgICAgICBpZiAob0tleSBpbiB0aGlzLm9ic2VydmVycylcclxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnNbb0tleV0uZW1pdCh2YWx1ZSk7XHJcbiAgICB9O1xyXG4gICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmdlbk9ic2VydmVyS2V5ID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIHNUeXBlICsgJ3wnICsgc0tleTtcclxuICAgIH07XHJcbiAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIub2JzZXJ2ZXJzID0ge307XHJcbiAgICByZXR1cm4gU3RvcmFnZU9ic2VydmVySGVscGVyO1xyXG59KCkpO1xyXG5leHBvcnQgeyBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIgfTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RvcmFnZU9ic2VydmVyLmpzLm1hcCIsInZhciBNb2NrU3RvcmFnZUhlbHBlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBNb2NrU3RvcmFnZUhlbHBlcigpIHtcclxuICAgIH1cclxuICAgIE1vY2tTdG9yYWdlSGVscGVyLmlzU2VjdXJlZEZpZWxkID0gZnVuY3Rpb24gKGZpZWxkKSB7XHJcbiAgICAgICAgcmV0dXJuICEhfk1vY2tTdG9yYWdlSGVscGVyLnNlY3VyZWRGaWVsZHMuaW5kZXhPZihmaWVsZCk7XHJcbiAgICB9O1xyXG4gICAgTW9ja1N0b3JhZ2VIZWxwZXIuZ2V0U3RvcmFnZSA9IGZ1bmN0aW9uIChzVHlwZSkge1xyXG4gICAgICAgIGlmICghdGhpcy5tb2NrU3RvcmFnZXNbc1R5cGVdKVxyXG4gICAgICAgICAgICB0aGlzLm1vY2tTdG9yYWdlc1tzVHlwZV0gPSBNb2NrU3RvcmFnZUhlbHBlci5nZW5lcmF0ZVN0b3JhZ2UoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2NrU3RvcmFnZXNbc1R5cGVdO1xyXG4gICAgfTtcclxuICAgIE1vY2tTdG9yYWdlSGVscGVyLmdlbmVyYXRlU3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc3RvcmFnZSA9IHt9O1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHN0b3JhZ2UsIHtcclxuICAgICAgICAgICAgc2V0SXRlbToge1xyXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFNb2NrU3RvcmFnZUhlbHBlci5pc1NlY3VyZWRGaWVsZChrZXkpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldEl0ZW06IHtcclxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFNb2NrU3RvcmFnZUhlbHBlci5pc1NlY3VyZWRGaWVsZChrZXkpID8gdGhpc1trZXldIHx8IG51bGwgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVtb3ZlSXRlbToge1xyXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIU1vY2tTdG9yYWdlSGVscGVyLmlzU2VjdXJlZEZpZWxkKGtleSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW2tleV07XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBsZW5ndGg6IHtcclxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzKS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gc3RvcmFnZTtcclxuICAgIH07XHJcbiAgICBNb2NrU3RvcmFnZUhlbHBlci5zZWN1cmVkRmllbGRzID0gWydzZXRJdGVtJywgJ2dldEl0ZW0nLCAncmVtb3ZlSXRlbScsICdsZW5ndGgnXTtcclxuICAgIE1vY2tTdG9yYWdlSGVscGVyLm1vY2tTdG9yYWdlcyA9IHt9O1xyXG4gICAgcmV0dXJuIE1vY2tTdG9yYWdlSGVscGVyO1xyXG59KCkpO1xyXG5leHBvcnQgeyBNb2NrU3RvcmFnZUhlbHBlciB9O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tb2NrU3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBTVE9SQUdFIH0gZnJvbSAnLi4vZW51bXMvc3RvcmFnZSc7XHJcbmltcG9ydCB7IFN0b3JhZ2VPYnNlcnZlckhlbHBlciB9IGZyb20gJy4vc3RvcmFnZU9ic2VydmVyJztcclxuaW1wb3J0IHsgS2V5U3RvcmFnZUhlbHBlciB9IGZyb20gJy4va2V5U3RvcmFnZSc7XHJcbmltcG9ydCB7IE1vY2tTdG9yYWdlSGVscGVyIH0gZnJvbSAnLi9tb2NrU3RvcmFnZSc7XHJcbmltcG9ydCB7IFNUT1JBR0VfTkFNRVMgfSBmcm9tICcuLi9jb25zdGFudHMvbGliJztcclxudmFyIENBQ0hFRCA9IChfYSA9IHt9LCBfYVtTVE9SQUdFLmxvY2FsXSA9IHt9LCBfYVtTVE9SQUdFLnNlc3Npb25dID0ge30sIF9hKTtcclxudmFyIFNUT1JBR0VBVkFJTEFCSUxJVFkgPSAoX2IgPSB7fSwgX2JbU1RPUkFHRS5sb2NhbF0gPSBudWxsLCBfYltTVE9SQUdFLnNlc3Npb25dID0gbnVsbCwgX2IpO1xyXG52YXIgV2ViU3RvcmFnZUhlbHBlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBXZWJTdG9yYWdlSGVscGVyKCkge1xyXG4gICAgfVxyXG4gICAgV2ViU3RvcmFnZUhlbHBlci5zdG9yZSA9IGZ1bmN0aW9uIChzVHlwZSwgc0tleSwgdmFsdWUpIHtcclxuICAgICAgICB0aGlzLmdldFN0b3JhZ2Uoc1R5cGUpLnNldEl0ZW0oc0tleSwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcclxuICAgICAgICBDQUNIRURbc1R5cGVdW3NLZXldID0gdmFsdWU7XHJcbiAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIHZhbHVlKTtcclxuICAgIH07XHJcbiAgICBXZWJTdG9yYWdlSGVscGVyLnJldHJpZXZlID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5KSB7XHJcbiAgICAgICAgaWYgKENBQ0hFRFtzVHlwZV1bc0tleV0pXHJcbiAgICAgICAgICAgIHJldHVybiBDQUNIRURbc1R5cGVdW3NLZXldO1xyXG4gICAgICAgIHJldHVybiBDQUNIRURbc1R5cGVdW3NLZXldID0gV2ViU3RvcmFnZUhlbHBlci5yZXRyaWV2ZUZyb21TdG9yYWdlKHNUeXBlLCBzS2V5KTtcclxuICAgIH07XHJcbiAgICBXZWJTdG9yYWdlSGVscGVyLnJldHJpZXZlRnJvbVN0b3JhZ2UgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IG51bGw7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UodGhpcy5nZXRTdG9yYWdlKHNUeXBlKS5nZXRJdGVtKHNLZXkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJpbnZhbGlkIHZhbHVlIGZvciBcIiArIHNLZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH07XHJcbiAgICBXZWJTdG9yYWdlSGVscGVyLnJlZnJlc2ggPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcclxuICAgICAgICBpZiAoIUtleVN0b3JhZ2VIZWxwZXIuaXNNYW5hZ2VkS2V5KHNLZXkpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyIHZhbHVlID0gV2ViU3RvcmFnZUhlbHBlci5yZXRyaWV2ZUZyb21TdG9yYWdlKHNUeXBlLCBzS2V5KTtcclxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgZGVsZXRlIENBQ0hFRFtzVHlwZV1bc0tleV07XHJcbiAgICAgICAgICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5lbWl0KHNUeXBlLCBzS2V5LCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodmFsdWUgIT09IENBQ0hFRFtzVHlwZV1bc0tleV0pIHtcclxuICAgICAgICAgICAgQ0FDSEVEW3NUeXBlXVtzS2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuZW1pdChzVHlwZSwgc0tleSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBXZWJTdG9yYWdlSGVscGVyLmNsZWFyQWxsID0gZnVuY3Rpb24gKHNUeXBlKSB7XHJcbiAgICAgICAgdmFyIHN0b3JhZ2UgPSB0aGlzLmdldFN0b3JhZ2Uoc1R5cGUpO1xyXG4gICAgICAgIEtleVN0b3JhZ2VIZWxwZXIucmV0cmlldmVLZXlzRnJvbVN0b3JhZ2Uoc3RvcmFnZSlcclxuICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKHNLZXkpIHtcclxuICAgICAgICAgICAgc3RvcmFnZS5yZW1vdmVJdGVtKHNLZXkpO1xyXG4gICAgICAgICAgICBkZWxldGUgQ0FDSEVEW3NUeXBlXVtzS2V5XTtcclxuICAgICAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIG51bGwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFdlYlN0b3JhZ2VIZWxwZXIuY2xlYXIgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcclxuICAgICAgICB0aGlzLmdldFN0b3JhZ2Uoc1R5cGUpLnJlbW92ZUl0ZW0oc0tleSk7XHJcbiAgICAgICAgZGVsZXRlIENBQ0hFRFtzVHlwZV1bc0tleV07XHJcbiAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIG51bGwpO1xyXG4gICAgfTtcclxuICAgIFdlYlN0b3JhZ2VIZWxwZXIuZ2V0U3RvcmFnZSA9IGZ1bmN0aW9uIChzVHlwZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzU3RvcmFnZUF2YWlsYWJsZShzVHlwZSkpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFdTdG9yYWdlKHNUeXBlKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiBNb2NrU3RvcmFnZUhlbHBlci5nZXRTdG9yYWdlKHNUeXBlKTtcclxuICAgIH07XHJcbiAgICBXZWJTdG9yYWdlSGVscGVyLmdldFdTdG9yYWdlID0gZnVuY3Rpb24gKHNUeXBlKSB7XHJcbiAgICAgICAgdmFyIHN0b3JhZ2U7XHJcbiAgICAgICAgc3dpdGNoIChzVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFNUT1JBR0UubG9jYWw6XHJcbiAgICAgICAgICAgICAgICBzdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgU1RPUkFHRS5zZXNzaW9uOlxyXG4gICAgICAgICAgICAgICAgc3RvcmFnZSA9IHNlc3Npb25TdG9yYWdlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcignaW52YWxpZCBzdG9yYWdlIHR5cGUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0b3JhZ2U7XHJcbiAgICB9O1xyXG4gICAgV2ViU3RvcmFnZUhlbHBlci5pc1N0b3JhZ2VBdmFpbGFibGUgPSBmdW5jdGlvbiAoc1R5cGUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIFNUT1JBR0VBVkFJTEFCSUxJVFlbc1R5cGVdID09PSAnYm9vbGVhbicpXHJcbiAgICAgICAgICAgIHJldHVybiBTVE9SQUdFQVZBSUxBQklMSVRZW3NUeXBlXTtcclxuICAgICAgICB2YXIgaXNBdmFpbGFibGUgPSB0cnVlLCBzdG9yYWdlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHN0b3JhZ2UgPSB0aGlzLmdldFdTdG9yYWdlKHNUeXBlKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzdG9yYWdlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgc3RvcmFnZS5zZXRJdGVtKCd0ZXN0LXN0b3JhZ2UnLCAnZm9vYmFyJyk7XHJcbiAgICAgICAgICAgICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rlc3Qtc3RvcmFnZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGlzQXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGlzQXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaXNBdmFpbGFibGUpXHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihTVE9SQUdFX05BTUVTW3NUeXBlXSArIFwiIHN0b3JhZ2UgdW5hdmFpbGFibGUsIE5nMldlYnN0b3JhZ2Ugd2lsbCB1c2UgYSBmYWxsYmFjayBzdHJhdGVneSBpbnN0ZWFkXCIpO1xyXG4gICAgICAgIHJldHVybiBTVE9SQUdFQVZBSUxBQklMSVRZW3NUeXBlXSA9IGlzQXZhaWxhYmxlO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBXZWJTdG9yYWdlSGVscGVyO1xyXG59KCkpO1xyXG5leHBvcnQgeyBXZWJTdG9yYWdlSGVscGVyIH07XHJcbnZhciBfYSwgX2I7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdlYlN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgS2V5U3RvcmFnZUhlbHBlciwgV2ViU3RvcmFnZUhlbHBlciwgU3RvcmFnZU9ic2VydmVySGVscGVyIH0gZnJvbSAnLi4vaGVscGVycy9pbmRleCc7XHJcbnZhciBXZWJTdG9yYWdlU2VydmljZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBXZWJTdG9yYWdlU2VydmljZShzVHlwZSkge1xyXG4gICAgICAgIGlmIChzVHlwZSA9PT0gdm9pZCAwKSB7IHNUeXBlID0gbnVsbDsgfVxyXG4gICAgICAgIHRoaXMuc1R5cGUgPSBzVHlwZTtcclxuICAgICAgICB0aGlzLnNUeXBlID0gc1R5cGU7XHJcbiAgICB9XHJcbiAgICBXZWJTdG9yYWdlU2VydmljZS5wcm90b3R5cGUuc3RvcmUgPSBmdW5jdGlvbiAocmF3LCB2YWx1ZSkge1xyXG4gICAgICAgIHZhciBzS2V5ID0gS2V5U3RvcmFnZUhlbHBlci5nZW5LZXkocmF3KTtcclxuICAgICAgICBXZWJTdG9yYWdlSGVscGVyLnN0b3JlKHRoaXMuc1R5cGUsIHNLZXksIHZhbHVlKTtcclxuICAgIH07XHJcbiAgICBXZWJTdG9yYWdlU2VydmljZS5wcm90b3R5cGUucmV0cmlldmUgPSBmdW5jdGlvbiAocmF3KSB7XHJcbiAgICAgICAgdmFyIHNLZXkgPSBLZXlTdG9yYWdlSGVscGVyLmdlbktleShyYXcpO1xyXG4gICAgICAgIHJldHVybiBXZWJTdG9yYWdlSGVscGVyLnJldHJpZXZlKHRoaXMuc1R5cGUsIHNLZXkpO1xyXG4gICAgfTtcclxuICAgIFdlYlN0b3JhZ2VTZXJ2aWNlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uIChyYXcpIHtcclxuICAgICAgICBpZiAocmF3KVxyXG4gICAgICAgICAgICBXZWJTdG9yYWdlSGVscGVyLmNsZWFyKHRoaXMuc1R5cGUsIEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5KHJhdykpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgV2ViU3RvcmFnZUhlbHBlci5jbGVhckFsbCh0aGlzLnNUeXBlKTtcclxuICAgIH07XHJcbiAgICBXZWJTdG9yYWdlU2VydmljZS5wcm90b3R5cGUub2JzZXJ2ZSA9IGZ1bmN0aW9uIChyYXcpIHtcclxuICAgICAgICB2YXIgc0tleSA9IEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5KHJhdyk7XHJcbiAgICAgICAgcmV0dXJuIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5vYnNlcnZlKHRoaXMuc1R5cGUsIHNLZXkpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBXZWJTdG9yYWdlU2VydmljZTtcclxufSgpKTtcclxuZXhwb3J0IHsgV2ViU3RvcmFnZVNlcnZpY2UgfTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2ViU3RvcmFnZS5qcy5tYXAiLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG4gICAgfTtcclxufSkoKTtcclxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBTVE9SQUdFIH0gZnJvbSAnLi4vZW51bXMvc3RvcmFnZSc7XHJcbmltcG9ydCB7IFdlYlN0b3JhZ2VTZXJ2aWNlIH0gZnJvbSAnLi93ZWJTdG9yYWdlJztcclxudmFyIExvY2FsU3RvcmFnZVNlcnZpY2UgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKExvY2FsU3RvcmFnZVNlcnZpY2UsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBMb2NhbFN0b3JhZ2VTZXJ2aWNlKCkge1xyXG4gICAgICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCBTVE9SQUdFLmxvY2FsKSB8fCB0aGlzO1xyXG4gICAgfVxyXG4gICAgTG9jYWxTdG9yYWdlU2VydmljZS5kZWNvcmF0b3JzID0gW1xyXG4gICAgICAgIHsgdHlwZTogSW5qZWN0YWJsZSB9LFxyXG4gICAgXTtcclxuICAgIC8qKiBAbm9jb2xsYXBzZSAqL1xyXG4gICAgTG9jYWxTdG9yYWdlU2VydmljZS5jdG9yUGFyYW1ldGVycyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtdOyB9O1xyXG4gICAgcmV0dXJuIExvY2FsU3RvcmFnZVNlcnZpY2U7XHJcbn0oV2ViU3RvcmFnZVNlcnZpY2UpKTtcclxuZXhwb3J0IHsgTG9jYWxTdG9yYWdlU2VydmljZSB9O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1sb2NhbFN0b3JhZ2UuanMubWFwIiwidmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgU1RPUkFHRSB9IGZyb20gJy4uL2VudW1zL3N0b3JhZ2UnO1xyXG5pbXBvcnQgeyBXZWJTdG9yYWdlU2VydmljZSB9IGZyb20gJy4vd2ViU3RvcmFnZSc7XHJcbnZhciBTZXNzaW9uU3RvcmFnZVNlcnZpY2UgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKFNlc3Npb25TdG9yYWdlU2VydmljZSwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIFNlc3Npb25TdG9yYWdlU2VydmljZSgpIHtcclxuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgU1RPUkFHRS5zZXNzaW9uKSB8fCB0aGlzO1xyXG4gICAgfVxyXG4gICAgU2Vzc2lvblN0b3JhZ2VTZXJ2aWNlLmRlY29yYXRvcnMgPSBbXHJcbiAgICAgICAgeyB0eXBlOiBJbmplY3RhYmxlIH0sXHJcbiAgICBdO1xyXG4gICAgLyoqIEBub2NvbGxhcHNlICovXHJcbiAgICBTZXNzaW9uU3RvcmFnZVNlcnZpY2UuY3RvclBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbXTsgfTtcclxuICAgIHJldHVybiBTZXNzaW9uU3RvcmFnZVNlcnZpY2U7XHJcbn0oV2ViU3RvcmFnZVNlcnZpY2UpKTtcclxuZXhwb3J0IHsgU2Vzc2lvblN0b3JhZ2VTZXJ2aWNlIH07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlc3Npb25TdG9yYWdlLmpzLm1hcCIsImltcG9ydCB7IExJQl9LRVksIExJQl9LRVlfQ0FTRV9TRU5TSVRJVkUsIExJQl9LRVlfU0VQQVJBVE9SIH0gZnJvbSAnLi4vY29uc3RhbnRzL2xpYic7XHJcbnZhciBXZWJzdG9yYWdlQ29uZmlnID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFdlYnN0b3JhZ2VDb25maWcoY29uZmlnKSB7XHJcbiAgICAgICAgdGhpcy5wcmVmaXggPSBMSUJfS0VZO1xyXG4gICAgICAgIHRoaXMuc2VwYXJhdG9yID0gTElCX0tFWV9TRVBBUkFUT1I7XHJcbiAgICAgICAgdGhpcy5jYXNlU2Vuc2l0aXZlID0gTElCX0tFWV9DQVNFX1NFTlNJVElWRTtcclxuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5wcmVmaXggIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLnByZWZpeCA9IGNvbmZpZy5wcmVmaXg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLnNlcGFyYXRvciAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VwYXJhdG9yID0gY29uZmlnLnNlcGFyYXRvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcuY2FzZVNlbnNpdGl2ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FzZVNlbnNpdGl2ZSA9IGNvbmZpZy5jYXNlU2Vuc2l0aXZlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBXZWJzdG9yYWdlQ29uZmlnO1xyXG59KCkpO1xyXG5leHBvcnQgeyBXZWJzdG9yYWdlQ29uZmlnIH07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbmZpZy5qcy5tYXAiLCJpbXBvcnQgeyBLZXlTdG9yYWdlSGVscGVyLCBXZWJTdG9yYWdlSGVscGVyIH0gZnJvbSAnLi4vaGVscGVycy9pbmRleCc7XHJcbmltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuLi9lbnVtcy9zdG9yYWdlJztcclxuZXhwb3J0IGZ1bmN0aW9uIFdlYlN0b3JhZ2Uod2ViU0tleSwgc1R5cGUsIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgaWYgKGRlZmF1bHRWYWx1ZSA9PT0gdm9pZCAwKSB7IGRlZmF1bHRWYWx1ZSA9IG51bGw7IH1cclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0ZWRDbGFzcywgcmF3KSB7XHJcbiAgICAgICAgV2ViU3RvcmFnZURlY29yYXRvcih3ZWJTS2V5LCBTVE9SQUdFLmxvY2FsLCB0YXJnZXRlZENsYXNzLCByYXcsIGRlZmF1bHRWYWx1ZSk7XHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBXZWJTdG9yYWdlRGVjb3JhdG9yKHdlYlNLZXksIHNUeXBlLCB0YXJnZXRlZENsYXNzLCByYXcsIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgaWYgKGRlZmF1bHRWYWx1ZSA9PT0gdm9pZCAwKSB7IGRlZmF1bHRWYWx1ZSA9IG51bGw7IH1cclxuICAgIHZhciBrZXkgPSB3ZWJTS2V5IHx8IHJhdztcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXRlZENsYXNzLCByYXcsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHNLZXkgPSBLZXlTdG9yYWdlSGVscGVyLmdlbktleShrZXkpO1xyXG4gICAgICAgICAgICByZXR1cm4gV2ViU3RvcmFnZUhlbHBlci5yZXRyaWV2ZShzVHlwZSwgc0tleSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgc0tleSA9IEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5KGtleSk7XHJcbiAgICAgICAgICAgIHRoaXNbc0tleV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgV2ViU3RvcmFnZUhlbHBlci5zdG9yZShzVHlwZSwgc0tleSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgaWYgKHRhcmdldGVkQ2xhc3NbcmF3XSA9PT0gbnVsbClcclxuICAgICAgICB0YXJnZXRlZENsYXNzW3Jhd10gPSBkZWZhdWx0VmFsdWU7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2ViU3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBXZWJTdG9yYWdlRGVjb3JhdG9yIH0gZnJvbSAnLi93ZWJTdG9yYWdlJztcclxuaW1wb3J0IHsgU1RPUkFHRSB9IGZyb20gJy4uL2VudW1zL3N0b3JhZ2UnO1xyXG5leHBvcnQgZnVuY3Rpb24gTG9jYWxTdG9yYWdlKHdlYlNLZXksIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgaWYgKGRlZmF1bHRWYWx1ZSA9PT0gdm9pZCAwKSB7IGRlZmF1bHRWYWx1ZSA9IG51bGw7IH1cclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0ZWRDbGFzcywgcmF3KSB7XHJcbiAgICAgICAgV2ViU3RvcmFnZURlY29yYXRvcih3ZWJTS2V5LCBTVE9SQUdFLmxvY2FsLCB0YXJnZXRlZENsYXNzLCByYXcsIGRlZmF1bHRWYWx1ZSk7XHJcbiAgICB9O1xyXG59XHJcbjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bG9jYWxTdG9yYWdlLmpzLm1hcCIsImltcG9ydCB7IFdlYlN0b3JhZ2VEZWNvcmF0b3IgfSBmcm9tICcuL3dlYlN0b3JhZ2UnO1xyXG5pbXBvcnQgeyBTVE9SQUdFIH0gZnJvbSAnLi4vZW51bXMvc3RvcmFnZSc7XHJcbmV4cG9ydCBmdW5jdGlvbiBTZXNzaW9uU3RvcmFnZSh3ZWJTS2V5LCBkZWZhdWx0VmFsdWUpIHtcclxuICAgIGlmIChkZWZhdWx0VmFsdWUgPT09IHZvaWQgMCkgeyBkZWZhdWx0VmFsdWUgPSBudWxsOyB9XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldGVkQ2xhc3MsIHJhdykge1xyXG4gICAgICAgIFdlYlN0b3JhZ2VEZWNvcmF0b3Iod2ViU0tleSwgU1RPUkFHRS5zZXNzaW9uLCB0YXJnZXRlZENsYXNzLCByYXcsIGRlZmF1bHRWYWx1ZSk7XHJcbiAgICB9O1xyXG59XHJcbjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2Vzc2lvblN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgTmdNb2R1bGUsIE5nWm9uZSwgSW5qZWN0aW9uVG9rZW4sIEluamVjdCwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTElCX0tFWSwgTElCX0tFWV9TRVBBUkFUT1IsIExJQl9LRVlfQ0FTRV9TRU5TSVRJVkUgfSBmcm9tICcuL2NvbnN0YW50cy9saWInO1xyXG5pbXBvcnQgeyBTVE9SQUdFIH0gZnJvbSAnLi9lbnVtcy9zdG9yYWdlJztcclxuaW1wb3J0IHsgTG9jYWxTdG9yYWdlU2VydmljZSwgU2Vzc2lvblN0b3JhZ2VTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9pbmRleCc7XHJcbmltcG9ydCB7IFdlYlN0b3JhZ2VIZWxwZXIgfSBmcm9tICcuL2hlbHBlcnMvd2ViU3RvcmFnZSc7XHJcbmltcG9ydCB7IFdlYnN0b3JhZ2VDb25maWcgfSBmcm9tICcuL2ludGVyZmFjZXMvY29uZmlnJztcclxuaW1wb3J0IHsgS2V5U3RvcmFnZUhlbHBlciB9IGZyb20gJy4vaGVscGVycy9rZXlTdG9yYWdlJztcclxuZXhwb3J0ICogZnJvbSAnLi9pbnRlcmZhY2VzL2luZGV4JztcclxuZXhwb3J0ICogZnJvbSAnLi9kZWNvcmF0b3JzL2luZGV4JztcclxuZXhwb3J0ICogZnJvbSAnLi9zZXJ2aWNlcy9pbmRleCc7XHJcbmV4cG9ydCB2YXIgV0VCU1RPUkFHRV9DT05GSUcgPSBuZXcgSW5qZWN0aW9uVG9rZW4oJ1dFQlNUT1JBR0VfQ09ORklHJyk7XHJcbnZhciBOZzJXZWJzdG9yYWdlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE5nMldlYnN0b3JhZ2Uobmdab25lLCBjb25maWcpIHtcclxuICAgICAgICB0aGlzLm5nWm9uZSA9IG5nWm9uZTtcclxuICAgICAgICBpZiAoY29uZmlnKSB7XHJcbiAgICAgICAgICAgIEtleVN0b3JhZ2VIZWxwZXIuc2V0U3RvcmFnZUtleVByZWZpeChjb25maWcucHJlZml4KTtcclxuICAgICAgICAgICAgS2V5U3RvcmFnZUhlbHBlci5zZXRTdG9yYWdlS2V5U2VwYXJhdG9yKGNvbmZpZy5zZXBhcmF0b3IpO1xyXG4gICAgICAgICAgICBLZXlTdG9yYWdlSGVscGVyLnNldENhc2VTZW5zaXRpdml0eShjb25maWcuY2FzZVNlbnNpdGl2ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW5pdFN0b3JhZ2VMaXN0ZW5lcigpO1xyXG4gICAgfVxyXG4gICAgTmcyV2Vic3RvcmFnZS5mb3JSb290ID0gZnVuY3Rpb24gKGNvbmZpZykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5nTW9kdWxlOiBOZzJXZWJzdG9yYWdlLFxyXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm92aWRlOiBXRUJTVE9SQUdFX0NPTkZJRyxcclxuICAgICAgICAgICAgICAgICAgICB1c2VWYWx1ZTogY29uZmlnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGU6IFdlYnN0b3JhZ2VDb25maWcsXHJcbiAgICAgICAgICAgICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZUNvbmZpZyxcclxuICAgICAgICAgICAgICAgICAgICBkZXBzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFdFQlNUT1JBR0VfQ09ORklHXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcbiAgICBOZzJXZWJzdG9yYWdlLnByb3RvdHlwZS5pbml0U3RvcmFnZUxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMubmdab25lLnJ1bihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JhZ2UgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UgPT09IGV2ZW50LnN0b3JhZ2VBcmVhID8gU1RPUkFHRS5zZXNzaW9uIDogU1RPUkFHRS5sb2NhbDtcclxuICAgICAgICAgICAgICAgICAgICBXZWJTdG9yYWdlSGVscGVyLnJlZnJlc2goc3RvcmFnZSwgZXZlbnQua2V5KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTmcyV2Vic3RvcmFnZS5kZWNvcmF0b3JzID0gW1xyXG4gICAgICAgIHsgdHlwZTogTmdNb2R1bGUsIGFyZ3M6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb25zOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IFtTZXNzaW9uU3RvcmFnZVNlcnZpY2UsIExvY2FsU3RvcmFnZVNlcnZpY2VdLFxyXG4gICAgICAgICAgICAgICAgICAgIGltcG9ydHM6IFtdXHJcbiAgICAgICAgICAgICAgICB9LF0gfSxcclxuICAgIF07XHJcbiAgICAvKiogQG5vY29sbGFwc2UgKi9cclxuICAgIE5nMldlYnN0b3JhZ2UuY3RvclBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbXHJcbiAgICAgICAgeyB0eXBlOiBOZ1pvbmUsIH0sXHJcbiAgICAgICAgeyB0eXBlOiBXZWJzdG9yYWdlQ29uZmlnLCBkZWNvcmF0b3JzOiBbeyB0eXBlOiBPcHRpb25hbCB9LCB7IHR5cGU6IEluamVjdCwgYXJnczogW1dlYnN0b3JhZ2VDb25maWcsXSB9LF0gfSxcclxuICAgIF07IH07XHJcbiAgICByZXR1cm4gTmcyV2Vic3RvcmFnZTtcclxufSgpKTtcclxuZXhwb3J0IHsgTmcyV2Vic3RvcmFnZSB9O1xyXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUNvbmZpZyhjb25maWcpIHtcclxuICAgIHJldHVybiBuZXcgV2Vic3RvcmFnZUNvbmZpZyhjb25maWcpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoX2EpIHtcclxuICAgIHZhciBfYiA9IF9hID09PSB2b2lkIDAgPyB7XHJcbiAgICAgICAgY2FzZVNlbnNpdGl2ZTogTElCX0tFWV9DQVNFX1NFTlNJVElWRSxcclxuICAgICAgICBwcmVmaXg6IExJQl9LRVksXHJcbiAgICAgICAgc2VwYXJhdG9yOiBMSUJfS0VZX1NFUEFSQVRPUlxyXG4gICAgfSA6IF9hLCBwcmVmaXggPSBfYi5wcmVmaXgsIHNlcGFyYXRvciA9IF9iLnNlcGFyYXRvciwgY2FzZVNlbnNpdGl2ZSA9IF9iLmNhc2VTZW5zaXRpdmU7XHJcbiAgICAvKkBEZXByZWNhdGlvbiovXHJcbiAgICBjb25zb2xlLndhcm4oJ1tuZzItd2Vic3RvcmFnZTpkZXByZWNhdGlvbl0gVGhlIGNvbmZpZ3VyZSBtZXRob2QgaXMgZGVwcmVjYXRlZCBzaW5jZSB0aGUgdjEuNS4wLCBjb25zaWRlciB0byB1c2UgZm9yUm9vdCBpbnN0ZWFkJyk7XHJcbiAgICBLZXlTdG9yYWdlSGVscGVyLnNldFN0b3JhZ2VLZXlQcmVmaXgocHJlZml4KTtcclxuICAgIEtleVN0b3JhZ2VIZWxwZXIuc2V0U3RvcmFnZUtleVNlcGFyYXRvcihzZXBhcmF0b3IpO1xyXG4gICAgS2V5U3RvcmFnZUhlbHBlci5zZXRDYXNlU2Vuc2l0aXZpdHkoY2FzZVNlbnNpdGl2ZSk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLmpzLm1hcCJdLCJuYW1lcyI6WyJFdmVudEVtaXR0ZXIiLCJfYSIsInRoaXMiLCJJbmplY3RhYmxlIiwiX19leHRlbmRzIiwiSW5qZWN0aW9uVG9rZW4iLCJOZ01vZHVsZSIsIk5nWm9uZSIsIk9wdGlvbmFsIiwiSW5qZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBTyxJQUFJLE9BQU8sQ0FBQztBQUNuQixDQUFDLFVBQVUsT0FBTyxFQUFFO0lBQ2hCLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO0lBQ3hDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO0NBQy9DLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxBQUM5Qjs7QUNKTyxJQUFJLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQztBQUN0QyxBQUFPLElBQUksaUJBQWlCLEdBQUcsR0FBRyxDQUFDO0FBQ25DLEFBQU8sSUFBSSxzQkFBc0IsR0FBRyxLQUFLLENBQUM7QUFDMUMsQUFBTyxJQUFJLGFBQWEsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFO0lBQy9CLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTztJQUMzQixFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFNBQVM7SUFDL0IsRUFBRSxDQUFDLENBQUM7QUFDUixJQUFJLEVBQUUsQ0FBQyxBQUNQOztBQ1JBLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQztBQUM3QixJQUFJLHdCQUF3QixHQUFHLGlCQUFpQixDQUFDO0FBQ2pELElBQUksNkJBQTZCLEdBQUcsc0JBQXNCLENBQUM7QUFDM0QsQUFBTyxTQUFTLFlBQVksQ0FBQyxJQUFJLEVBQUU7SUFDL0IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsR0FBRyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUN4RTtBQUNELElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxZQUFZO0lBQ2hDLFNBQVMsZ0JBQWdCLEdBQUc7S0FDM0I7SUFDRCxnQkFBZ0IsQ0FBQyxZQUFZLEdBQUcsVUFBVSxJQUFJLEVBQUU7UUFDNUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsR0FBRyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN4RSxDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsdUJBQXVCLEdBQUcsVUFBVSxPQUFPLEVBQUU7UUFDMUQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNwRCxDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLFVBQVUsR0FBRyxFQUFFO1FBQ3JDLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUTtZQUN2QixNQUFNLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO1FBQzdFLE9BQU8sRUFBRSxHQUFHLGNBQWMsR0FBRyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQy9FLENBQUM7SUFDRixnQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsVUFBVSxHQUFHLEVBQUU7UUFDeEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sNkJBQTZCLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNsRSxDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxHQUFHLEVBQUU7UUFDbEQsSUFBSSxHQUFHLEtBQUssS0FBSyxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsT0FBTyxDQUFDLEVBQUU7UUFDdEMsY0FBYyxHQUFHLEdBQUcsQ0FBQztLQUN4QixDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxNQUFNLEVBQUU7UUFDcEQsSUFBSSxNQUFNLEtBQUssS0FBSyxDQUFDLEVBQUUsRUFBRSxNQUFNLEdBQUcsc0JBQXNCLENBQUMsRUFBRTtRQUMzRCw2QkFBNkIsR0FBRyxNQUFNLENBQUM7S0FDMUMsQ0FBQztJQUNGLGdCQUFnQixDQUFDLHNCQUFzQixHQUFHLFVBQVUsU0FBUyxFQUFFO1FBQzNELElBQUksU0FBUyxLQUFLLEtBQUssQ0FBQyxFQUFFLEVBQUUsU0FBUyxHQUFHLGlCQUFpQixDQUFDLEVBQUU7UUFDNUQsd0JBQXdCLEdBQUcsU0FBUyxDQUFDO0tBQ3hDLENBQUM7SUFDRixPQUFPLGdCQUFnQixDQUFDO0NBQzNCLEVBQUUsQ0FBQyxDQUFDLEFBQ0wsQUFBNEIsQUFDNUI7O0FDdkNBLElBQUkscUJBQXFCLEdBQUcsQ0FBQyxZQUFZO0lBQ3JDLFNBQVMscUJBQXFCLEdBQUc7S0FDaEM7SUFDRCxxQkFBcUIsQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLEVBQUUsSUFBSSxFQUFFO1FBQ25ELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSUEsMEJBQVksRUFBRSxDQUFDO0tBQ3BELENBQUM7SUFDRixxQkFBcUIsQ0FBQyxJQUFJLEdBQUcsVUFBVSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtRQUN2RCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUztZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN4QyxDQUFDO0lBQ0YscUJBQXFCLENBQUMsY0FBYyxHQUFHLFVBQVUsS0FBSyxFQUFFLElBQUksRUFBRTtRQUMxRCxPQUFPLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO0tBQzdCLENBQUM7SUFDRixxQkFBcUIsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3JDLE9BQU8scUJBQXFCLENBQUM7Q0FDaEMsRUFBRSxDQUFDLENBQUMsQUFDTCxBQUFpQyxBQUNqQzs7QUN0QkEsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLFlBQVk7SUFDakMsU0FBUyxpQkFBaUIsR0FBRztLQUM1QjtJQUNELGlCQUFpQixDQUFDLGNBQWMsR0FBRyxVQUFVLEtBQUssRUFBRTtRQUNoRCxPQUFPLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDNUQsQ0FBQztJQUNGLGlCQUFpQixDQUFDLFVBQVUsR0FBRyxVQUFVLEtBQUssRUFBRTtRQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNuRSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbkMsQ0FBQztJQUNGLGlCQUFpQixDQUFDLGVBQWUsR0FBRyxZQUFZO1FBQzVDLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNqQixNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO1lBQzdCLE9BQU8sRUFBRTtnQkFDTCxRQUFRLEVBQUUsS0FBSztnQkFDZixVQUFVLEVBQUUsS0FBSztnQkFDakIsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLEtBQUssRUFBRSxVQUFVLEdBQUcsRUFBRSxLQUFLLEVBQUU7b0JBQ3pCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDO3dCQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO2lCQUN6QjthQUNKO1lBQ0QsT0FBTyxFQUFFO2dCQUNMLFFBQVEsRUFBRSxLQUFLO2dCQUNmLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixZQUFZLEVBQUUsS0FBSztnQkFDbkIsS0FBSyxFQUFFLFVBQVUsR0FBRyxFQUFFO29CQUNsQixPQUFPLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO2lCQUM1RTthQUNKO1lBQ0QsVUFBVSxFQUFFO2dCQUNSLFFBQVEsRUFBRSxLQUFLO2dCQUNmLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixZQUFZLEVBQUUsS0FBSztnQkFDbkIsS0FBSyxFQUFFLFVBQVUsR0FBRyxFQUFFO29CQUNsQixJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQzt3QkFDdEMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3hCO2FBQ0o7WUFDRCxNQUFNLEVBQUU7Z0JBQ0osVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFlBQVksRUFBRSxLQUFLO2dCQUNuQixHQUFHLEVBQUUsWUFBWTtvQkFDYixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO2lCQUNuQzthQUNKO1NBQ0osQ0FBQyxDQUFDO1FBQ0gsT0FBTyxPQUFPLENBQUM7S0FDbEIsQ0FBQztJQUNGLGlCQUFpQixDQUFDLGFBQWEsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2pGLGlCQUFpQixDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7SUFDcEMsT0FBTyxpQkFBaUIsQ0FBQztDQUM1QixFQUFFLENBQUMsQ0FBQyxBQUNMLEFBQTZCLEFBQzdCOztBQ2xEQSxJQUFJLE1BQU0sR0FBRyxDQUFDQyxJQUFFLEdBQUcsRUFBRSxFQUFFQSxJQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRUEsSUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUVBLElBQUUsQ0FBQyxDQUFDO0FBQzdFLElBQUksbUJBQW1CLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzlGLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxZQUFZO0lBQ2hDLFNBQVMsZ0JBQWdCLEdBQUc7S0FDM0I7SUFDRCxnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsVUFBVSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtRQUNuRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzVELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDNUIscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDbEQsQ0FBQztJQUNGLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxVQUFVLEtBQUssRUFBRSxJQUFJLEVBQUU7UUFDL0MsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNsRixDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxLQUFLLEVBQUUsSUFBSSxFQUFFO1FBQzFELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixJQUFJO1lBQ0EsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUMzRDtRQUNELE9BQU8sR0FBRyxFQUFFO1lBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUM3QztRQUNELE9BQU8sSUFBSSxDQUFDO0tBQ2YsQ0FBQztJQUNGLGdCQUFnQixDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUssRUFBRSxJQUFJLEVBQUU7UUFDOUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7WUFDcEMsT0FBTztRQUNYLElBQUksS0FBSyxHQUFHLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5RCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDaEIsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDakQ7YUFDSSxJQUFJLEtBQUssS0FBSyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDcEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUM1QixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNsRDtLQUNKLENBQUM7SUFDRixnQkFBZ0IsQ0FBQyxRQUFRLEdBQUcsVUFBVSxLQUFLLEVBQUU7UUFDekMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQyxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUM7YUFDNUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxFQUFFO1lBQ3pCLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekIsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDakQsQ0FBQyxDQUFDO0tBQ04sQ0FBQztJQUNGLGdCQUFnQixDQUFDLEtBQUssR0FBRyxVQUFVLEtBQUssRUFBRSxJQUFJLEVBQUU7UUFDNUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDakQsQ0FBQztJQUNGLGdCQUFnQixDQUFDLFVBQVUsR0FBRyxVQUFVLEtBQUssRUFBRTtRQUMzQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7WUFDOUIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztZQUUvQixPQUFPLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNsRCxDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsV0FBVyxHQUFHLFVBQVUsS0FBSyxFQUFFO1FBQzVDLElBQUksT0FBTyxDQUFDO1FBQ1osUUFBUSxLQUFLO1lBQ1QsS0FBSyxPQUFPLENBQUMsS0FBSztnQkFDZCxPQUFPLEdBQUcsWUFBWSxDQUFDO2dCQUN2QixNQUFNO1lBQ1YsS0FBSyxPQUFPLENBQUMsT0FBTztnQkFDaEIsT0FBTyxHQUFHLGNBQWMsQ0FBQztnQkFDekIsTUFBTTtZQUNWO2dCQUNJLE1BQU0sS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7U0FDM0M7UUFDRCxPQUFPLE9BQU8sQ0FBQztLQUNsQixDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxLQUFLLEVBQUU7UUFDbkQsSUFBSSxPQUFPLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxLQUFLLFNBQVM7WUFDL0MsT0FBTyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QyxJQUFJLFdBQVcsR0FBRyxJQUFJLEVBQUUsT0FBTyxDQUFDO1FBQ2hDLElBQUk7WUFDQSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsQyxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtnQkFDN0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7YUFDdEM7O2dCQUVHLFdBQVcsR0FBRyxLQUFLLENBQUM7U0FDM0I7UUFDRCxPQUFPLENBQUMsRUFBRTtZQUNOLFdBQVcsR0FBRyxLQUFLLENBQUM7U0FDdkI7UUFDRCxJQUFJLENBQUMsV0FBVztZQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLDBFQUEwRSxDQUFDLENBQUM7UUFDcEgsT0FBTyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxXQUFXLENBQUM7S0FDbkQsQ0FBQztJQUNGLE9BQU8sZ0JBQWdCLENBQUM7Q0FDM0IsRUFBRSxDQUFDLENBQUM7QUFDTCxBQUNBLElBQUlBLElBQUU7SUFBRSxFQUFFLENBQUMsQUFDWDs7QUNwR0EsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLFlBQVk7SUFDakMsU0FBUyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUU7UUFDOUIsSUFBSSxLQUFLLEtBQUssS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUU7UUFDdkMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7S0FDdEI7SUFDRCxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxFQUFFLEtBQUssRUFBRTtRQUN0RCxJQUFJLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ25ELENBQUM7SUFDRixpQkFBaUIsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVUsR0FBRyxFQUFFO1FBQ2xELElBQUksSUFBSSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QyxPQUFPLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3RELENBQUM7SUFDRixpQkFBaUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxFQUFFO1FBQy9DLElBQUksR0FBRztZQUNILGdCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOztZQUVqRSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzdDLENBQUM7SUFDRixpQkFBaUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVUsR0FBRyxFQUFFO1FBQ2pELElBQUksSUFBSSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QyxPQUFPLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzFELENBQUM7SUFDRixPQUFPLGlCQUFpQixDQUFDO0NBQzVCLEVBQUUsQ0FBQyxDQUFDLEFBQ0wsQUFBNkIsQUFDN0I7O0FDNUJBLElBQUksU0FBUyxHQUFHLENBQUNDLFNBQUksSUFBSUEsU0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWTtJQUNyRCxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsY0FBYztRQUNyQyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxZQUFZLEtBQUssSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDNUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQy9FLE9BQU8sVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ25CLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEIsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQ3ZDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztLQUN4RixDQUFDO0NBQ0wsQ0FBQyxFQUFFLENBQUM7QUFDTCxBQUNBLEFBQ0EsQUFDQSxJQUFJLG1CQUFtQixHQUFHLENBQUMsVUFBVSxNQUFNLEVBQUU7SUFDekMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZDLFNBQVMsbUJBQW1CLEdBQUc7UUFDM0IsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDO0tBQ25EO0lBQ0QsbUJBQW1CLENBQUMsVUFBVSxHQUFHO1FBQzdCLEVBQUUsSUFBSSxFQUFFQyx3QkFBVSxFQUFFO0tBQ3ZCLENBQUM7O0lBRUYsbUJBQW1CLENBQUMsY0FBYyxHQUFHLFlBQVksRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDaEUsT0FBTyxtQkFBbUIsQ0FBQztDQUM5QixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxBQUN0QixBQUErQixBQUMvQjs7QUMxQkEsSUFBSUMsV0FBUyxHQUFHLENBQUNGLFNBQUksSUFBSUEsU0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWTtJQUNyRCxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsY0FBYztRQUNyQyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxZQUFZLEtBQUssSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDNUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQy9FLE9BQU8sVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ25CLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEIsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQ3ZDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztLQUN4RixDQUFDO0NBQ0wsQ0FBQyxFQUFFLENBQUM7QUFDTCxBQUNBLEFBQ0EsQUFDQSxJQUFJLHFCQUFxQixHQUFHLENBQUMsVUFBVSxNQUFNLEVBQUU7SUFDM0NFLFdBQVMsQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6QyxTQUFTLHFCQUFxQixHQUFHO1FBQzdCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQztLQUNyRDtJQUNELHFCQUFxQixDQUFDLFVBQVUsR0FBRztRQUMvQixFQUFFLElBQUksRUFBRUQsd0JBQVUsRUFBRTtLQUN2QixDQUFDOztJQUVGLHFCQUFxQixDQUFDLGNBQWMsR0FBRyxZQUFZLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ2xFLE9BQU8scUJBQXFCLENBQUM7Q0FDaEMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQUFDdEIsQUFBaUMsQUFDakM7O0FDekJBLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxZQUFZO0lBQ2hDLFNBQVMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUM7UUFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQztRQUM1QyxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7U0FDL0I7UUFDRCxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsU0FBUyxLQUFLLFNBQVMsRUFBRTtZQUMxQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7U0FDckM7UUFDRCxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsYUFBYSxLQUFLLFNBQVMsRUFBRTtZQUM5QyxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7U0FDN0M7S0FDSjtJQUNELE9BQU8sZ0JBQWdCLENBQUM7Q0FDM0IsRUFBRSxDQUFDLENBQUMsQUFDTCxBQUE0QixBQUM1Qjs7QUNqQk8sU0FBUyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUU7SUFDckQsSUFBSSxZQUFZLEtBQUssS0FBSyxDQUFDLEVBQUUsRUFBRSxZQUFZLEdBQUcsSUFBSSxDQUFDLEVBQUU7SUFDckQsT0FBTyxVQUFVLGFBQWEsRUFBRSxHQUFHLEVBQUU7UUFDakMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUNqRixDQUFDO0NBQ0w7QUFDRCxBQUFPLFNBQVMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRTtJQUNsRixJQUFJLFlBQVksS0FBSyxLQUFLLENBQUMsRUFBRSxFQUFFLFlBQVksR0FBRyxJQUFJLENBQUMsRUFBRTtJQUNyRCxJQUFJLEdBQUcsR0FBRyxPQUFPLElBQUksR0FBRyxDQUFDO0lBQ3pCLE1BQU0sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtRQUN0QyxHQUFHLEVBQUUsWUFBWTtZQUNiLElBQUksSUFBSSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QyxPQUFPLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDakQ7UUFDRCxHQUFHLEVBQUUsVUFBVSxLQUFLLEVBQUU7WUFDbEIsSUFBSSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDbkIsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDOUM7S0FDSixDQUFDLENBQUM7SUFDSCxJQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJO1FBQzNCLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUM7Q0FDekMsQUFDRDs7QUN2Qk8sU0FBUyxZQUFZLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRTtJQUNoRCxJQUFJLFlBQVksS0FBSyxLQUFLLENBQUMsRUFBRSxFQUFFLFlBQVksR0FBRyxJQUFJLENBQUMsRUFBRTtJQUNyRCxPQUFPLFVBQVUsYUFBYSxFQUFFLEdBQUcsRUFBRTtRQUNqQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQ2pGLENBQUM7Q0FDTCxBQUNELEFBQUMsQUFDRDs7QUNQTyxTQUFTLGNBQWMsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFO0lBQ2xELElBQUksWUFBWSxLQUFLLEtBQUssQ0FBQyxFQUFFLEVBQUUsWUFBWSxHQUFHLElBQUksQ0FBQyxFQUFFO0lBQ3JELE9BQU8sVUFBVSxhQUFhLEVBQUUsR0FBRyxFQUFFO1FBQ2pDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7S0FDbkYsQ0FBQztDQUNMLEFBQ0QsQUFBQyxBQUNEOztBQ0NPLElBQUksaUJBQWlCLEdBQUcsSUFBSUUsNEJBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3ZFLElBQUksYUFBYSxHQUFHLENBQUMsWUFBWTtJQUM3QixTQUFTLGFBQWEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO1FBQ25DLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksTUFBTSxFQUFFO1lBQ1IsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BELGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxRCxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDN0Q7UUFDRCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztLQUM5QjtJQUNELGFBQWEsQ0FBQyxPQUFPLEdBQUcsVUFBVSxNQUFNLEVBQUU7UUFDdEMsT0FBTztZQUNILFFBQVEsRUFBRSxhQUFhO1lBQ3ZCLFNBQVMsRUFBRTtnQkFDUDtvQkFDSSxPQUFPLEVBQUUsaUJBQWlCO29CQUMxQixRQUFRLEVBQUUsTUFBTTtpQkFDbkI7Z0JBQ0Q7b0JBQ0ksT0FBTyxFQUFFLGdCQUFnQjtvQkFDekIsVUFBVSxFQUFFLGFBQWE7b0JBQ3pCLElBQUksRUFBRTt3QkFDRixpQkFBaUI7cUJBQ3BCO2lCQUNKO2FBQ0o7U0FDSixDQUFDO0tBQ0wsQ0FBQztJQUNGLGFBQWEsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEdBQUcsWUFBWTtRQUN0RCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUU7WUFDL0IsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFVLEtBQUssRUFBRTtnQkFDaEQsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZO29CQUNoQyxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsY0FBYyxLQUFLLEtBQUssQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO29CQUM1RixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDaEQsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0lBQ0YsYUFBYSxDQUFDLFVBQVUsR0FBRztRQUN2QixFQUFFLElBQUksRUFBRUMsc0JBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQztvQkFDYixZQUFZLEVBQUUsRUFBRTtvQkFDaEIsU0FBUyxFQUFFLENBQUMscUJBQXFCLEVBQUUsbUJBQW1CLENBQUM7b0JBQ3ZELE9BQU8sRUFBRSxFQUFFO2lCQUNkLEVBQUUsRUFBRTtLQUNoQixDQUFDOztJQUVGLGFBQWEsQ0FBQyxjQUFjLEdBQUcsWUFBWSxFQUFFLE9BQU87UUFDaEQsRUFBRSxJQUFJLEVBQUVDLG9CQUFNLEdBQUc7UUFDakIsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUVDLHNCQUFRLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRUMsb0JBQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsRUFBRTtLQUM3RyxDQUFDLEVBQUUsQ0FBQztJQUNMLE9BQU8sYUFBYSxDQUFDO0NBQ3hCLEVBQUUsQ0FBQyxDQUFDO0FBQ0wsQUFDQSxBQUFPLFNBQVMsYUFBYSxDQUFDLE1BQU0sRUFBRTtJQUNsQyxPQUFPLElBQUksZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDdkM7QUFDRCxBQUFPLFNBQVMsU0FBUyxDQUFDLEVBQUUsRUFBRTtJQUMxQixJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUc7UUFDckIsYUFBYSxFQUFFLHNCQUFzQjtRQUNyQyxNQUFNLEVBQUUsT0FBTztRQUNmLFNBQVMsRUFBRSxpQkFBaUI7S0FDL0IsR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsYUFBYSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUM7O0lBRXZGLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUhBQW1ILENBQUMsQ0FBQztJQUNsSSxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3QyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuRCxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztDQUN0RCxBQUNELDs7Ozs7Ozs7Ozs7OzssOzssOzsifQ==
