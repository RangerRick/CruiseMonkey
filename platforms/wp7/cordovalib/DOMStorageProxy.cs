﻿using Microsoft.Phone.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WPCordovaClassLib.CordovaLib
{
    class DOMStorageProxy
    {
        private WebBrowser webBrowser;

        public DOMStorageProxy(ref WebBrowser browser) 
        {
            this.webBrowser = browser;
            browser.ScriptNotify += browser_ScriptNotify;
        }

        public void InjectScript()
        {
              var script = @"(function(win, doc) {
var docDomain = null;
try {
    docDomain = doc.domain;
} catch (err) {}

if (!docDomain || docDomain.length === 0) {
    var DOMStorage = function(type) {
        if (type == 'sessionStorage') {
            this._type = type;
        }
        Object.defineProperty(this, 'length', {
            configurable: true,
            get: function() {
                return this.getLength();
            }
        });
    };
    DOMStorage.prototype = {
        _type: 'localStorage',
        _result: null,
        keys: null,
        onResult: function(key, valueStr) {
            if (!this.keys) {
                this.keys = [];
            }
            this._result = valueStr;
        },
        onKeysChanged: function(jsonKeys) {
            this.keys = JSON.parse(jsonKeys);
            var key;
            for (var n = 0, len = this.keys.length; n < len; n++) {
                key = this.keys[n];
                if (!this.hasOwnProperty(key)) {
                    Object.defineProperty(this, key, {
                        configurable: true,
                        get: function() {
                            return this.getItem(key);
                        },
                        set: function(val) {
                            return this.setItem(key, val);
                        }
                    });
                }
            }
        },
        initialize: function() {
            window.external.Notify('DOMStorage/' + this._type + '/load/keys');
        },
        getLength: function() {
            if (!this.keys) {
                this.initialize();
            }
            return this.keys.length;
        },
        key: function(n) {
            if (!this.keys) {
                this.initialize();
            }
            if (n >= this.keys.length) {
                return null;
            } else {
                return this.keys[n];
            }
        },
        getItem: function(key) {
            if (!this.keys) {
                this.initialize();
            }
            var retVal = null;
            if (this.keys.indexOf(key) > -1) {
                window.external.Notify('DOMStorage/' + this._type + '/get/' + key);
                retVal = window.unescape(decodeURIComponent(this._result));
                this._result = null;
            }
            return retVal;
        },
        setItem: function(key, value) {
            if (!this.keys) {
                this.initialize();
            }
            window.external.Notify('DOMStorage/' + this._type + '/set/' + key + '/' + encodeURIComponent(window.escape(value)));
        },
        removeItem: function(key) {
            if (!this.keys) {
                this.initialize();
            }
            var index = this.keys.indexOf(key);
            if (index > -1) {
                this.keys.splice(index, 1);
                window.external.Notify('DOMStorage/' + this._type + '/remove/' + key);
                delete this[key];
            }
        },
        clear: function() {
            if (!this.keys) {
                this.initialize();
            }
            for (var n = 0, len = this.keys.length; n < len; n++) {
                delete this[this.keys[n]];
            }
            this.keys = [];
            window.external.Notify('DOMStorage/' + this._type + '/clear/');
        }
    };
    if (typeof window.localStorage === 'undefined') {
        Object.defineProperty(window, 'localStorage', {
            writable: false,
            configurable: false,
            value: new DOMStorage('localStorage')
        });
        window.localStorage.initialize();
    }
    if (typeof window.sessionStorage === 'undefined') {
        Object.defineProperty(window, 'sessionStorage', {
            writable: false,
            configurable: false,
            value: new DOMStorage('sessionStorage')
        });
        window.sessionStorage.initialize();
    }
}
})(window, document);";

              webBrowser.InvokeScript("execScript", new string[] { script });

        }

        void browser_ScriptNotify(object sender, NotifyEventArgs e)
        {
            
        }
    }
}
