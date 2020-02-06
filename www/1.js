(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[1],{

/***/ "./node_modules/@ionic/pwa-elements/dist/esm-es5/dom-59290340-59290340.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@ionic/pwa-elements/dist/esm-es5/dom-59290340-59290340.js ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

(function () {
    var aa = new Set("annotation-xml color-profile font-face font-face-src font-face-uri font-face-format font-face-name missing-glyph".split(" "));
    function g(a) { var b = aa.has(a); a = /^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/.test(a); return !b && a; }
    function l(a) { var b = a.isConnected; if (void 0 !== b)
        return b; for (; a && !(a.__CE_isImportDocument || a instanceof Document);)
        a = a.parentNode || (window.ShadowRoot && a instanceof ShadowRoot ? a.host : void 0); return !(!a || !(a.__CE_isImportDocument || a instanceof Document)); }
    function n(a, b) { for (; b && b !== a && !b.nextSibling;)
        b = b.parentNode; return b && b !== a ? b.nextSibling : null; }
    function p(a, b, d) { d = void 0 === d ? new Set : d; for (var c = a; c;) {
        if (c.nodeType === Node.ELEMENT_NODE) {
            var e = c;
            b(e);
            var f = e.localName;
            if ("link" === f && "import" === e.getAttribute("rel")) {
                c = e.import;
                if (c instanceof Node && !d.has(c))
                    for (d.add(c), c = c.firstChild; c; c = c.nextSibling)
                        p(c, b, d);
                c = n(a, e);
                continue;
            }
            else if ("template" === f) {
                c = n(a, e);
                continue;
            }
            if (e = e.__CE_shadowRoot)
                for (e = e.firstChild; e; e = e.nextSibling)
                    p(e, b, d);
        }
        c = c.firstChild ? c.firstChild : n(a, c);
    } }
    function r(a, b, d) { a[b] = d; }
    function u() { this.a = new Map; this.g = new Map; this.c = []; this.f = []; this.b = !1; }
    function ba(a, b, d) { a.a.set(b, d); a.g.set(d.constructorFunction, d); }
    function ca(a, b) { a.b = !0; a.c.push(b); }
    function da(a, b) { a.b = !0; a.f.push(b); }
    function v(a, b) { a.b && p(b, function (b) { return w(a, b); }); }
    function w(a, b) { if (a.b && !b.__CE_patched) {
        b.__CE_patched = !0;
        for (var d = 0; d < a.c.length; d++)
            a.c[d](b);
        for (d = 0; d < a.f.length; d++)
            a.f[d](b);
    } }
    function x(a, b) { var d = []; p(b, function (b) { return d.push(b); }); for (b = 0; b < d.length; b++) {
        var c = d[b];
        1 === c.__CE_state ? a.connectedCallback(c) : y(a, c);
    } }
    function z(a, b) { var d = []; p(b, function (b) { return d.push(b); }); for (b = 0; b < d.length; b++) {
        var c = d[b];
        1 === c.__CE_state && a.disconnectedCallback(c);
    } }
    function A(a, b, d) {
        d = void 0 === d ? {} : d;
        var c = d.u || new Set, e = d.i || function (b) { return y(a, b); }, f = [];
        p(b, function (b) { if ("link" === b.localName && "import" === b.getAttribute("rel")) {
            var d = b.import;
            d instanceof Node && (d.__CE_isImportDocument = !0, d.__CE_hasRegistry = !0);
            d && "complete" === d.readyState ? d.__CE_documentLoadHandled = !0 : b.addEventListener("load", function () { var d = b.import; if (!d.__CE_documentLoadHandled) {
                d.__CE_documentLoadHandled = !0;
                var f = new Set(c);
                f.delete(d);
                A(a, d, { u: f, i: e });
            } });
        }
        else
            f.push(b); }, c);
        if (a.b)
            for (b =
                0; b < f.length; b++)
                w(a, f[b]);
        for (b = 0; b < f.length; b++)
            e(f[b]);
    }
    function y(a, b) {
        if (void 0 === b.__CE_state) {
            var d = b.ownerDocument;
            if (d.defaultView || d.__CE_isImportDocument && d.__CE_hasRegistry)
                if (d = a.a.get(b.localName)) {
                    d.constructionStack.push(b);
                    var c = d.constructorFunction;
                    try {
                        try {
                            if (new c !== b)
                                throw Error("The custom element constructor did not produce the element being upgraded.");
                        }
                        finally {
                            d.constructionStack.pop();
                        }
                    }
                    catch (t) {
                        throw b.__CE_state = 2, t;
                    }
                    b.__CE_state = 1;
                    b.__CE_definition = d;
                    if (d.attributeChangedCallback)
                        for (d = d.observedAttributes, c = 0; c < d.length; c++) {
                            var e = d[c], f = b.getAttribute(e);
                            null !== f && a.attributeChangedCallback(b, e, null, f, null);
                        }
                    l(b) && a.connectedCallback(b);
                }
        }
    }
    u.prototype.connectedCallback = function (a) { var b = a.__CE_definition; b.connectedCallback && b.connectedCallback.call(a); };
    u.prototype.disconnectedCallback = function (a) { var b = a.__CE_definition; b.disconnectedCallback && b.disconnectedCallback.call(a); };
    u.prototype.attributeChangedCallback = function (a, b, d, c, e) { var f = a.__CE_definition; f.attributeChangedCallback && -1 < f.observedAttributes.indexOf(b) && f.attributeChangedCallback.call(a, b, d, c, e); };
    function B(a) { var b = document; this.c = a; this.a = b; this.b = void 0; A(this.c, this.a); "loading" === this.a.readyState && (this.b = new MutationObserver(this.f.bind(this)), this.b.observe(this.a, { childList: !0, subtree: !0 })); }
    function C(a) { a.b && a.b.disconnect(); }
    B.prototype.f = function (a) { var b = this.a.readyState; "interactive" !== b && "complete" !== b || C(this); for (b = 0; b < a.length; b++)
        for (var d = a[b].addedNodes, c = 0; c < d.length; c++)
            A(this.c, d[c]); };
    function ea() { var a = this; this.b = this.a = void 0; this.c = new Promise(function (b) { a.b = b; a.a && b(a.a); }); }
    function D(a) { if (a.a)
        throw Error("Already resolved."); a.a = void 0; a.b && a.b(void 0); }
    function E(a) { this.c = !1; this.a = a; this.j = new Map; this.f = function (b) { return b(); }; this.b = !1; this.g = []; this.o = new B(a); }
    E.prototype.l = function (a, b) {
        var d = this;
        if (!(b instanceof Function))
            throw new TypeError("Custom element constructors must be functions.");
        if (!g(a))
            throw new SyntaxError("The element name '" + a + "' is not valid.");
        if (this.a.a.get(a))
            throw Error("A custom element with name '" + a + "' has already been defined.");
        if (this.c)
            throw Error("A custom element is already being defined.");
        this.c = !0;
        try {
            var c = function (b) {
                var a = e[b];
                if (void 0 !== a && !(a instanceof Function))
                    throw Error("The '" + b + "' callback must be a function.");
                return a;
            }, e = b.prototype;
            if (!(e instanceof Object))
                throw new TypeError("The custom element constructor's prototype is not an object.");
            var f = c("connectedCallback");
            var t = c("disconnectedCallback");
            var k = c("adoptedCallback");
            var h = c("attributeChangedCallback");
            var m = b.observedAttributes || [];
        }
        catch (q) {
            return;
        }
        finally {
            this.c = !1;
        }
        b = { localName: a, constructorFunction: b, connectedCallback: f, disconnectedCallback: t, adoptedCallback: k, attributeChangedCallback: h, observedAttributes: m, constructionStack: [] };
        ba(this.a, a, b);
        this.g.push(b);
        this.b || (this.b = !0, this.f(function () { return fa(d); }));
    };
    E.prototype.i = function (a) { A(this.a, a); };
    function fa(a) { if (!1 !== a.b) {
        a.b = !1;
        for (var b = a.g, d = [], c = new Map, e = 0; e < b.length; e++)
            c.set(b[e].localName, []);
        A(a.a, document, { i: function (b) { if (void 0 === b.__CE_state) {
                var e = b.localName, f = c.get(e);
                f ? f.push(b) : a.a.a.get(e) && d.push(b);
            } } });
        for (e = 0; e < d.length; e++)
            y(a.a, d[e]);
        for (; 0 < b.length;) {
            var f = b.shift();
            e = f.localName;
            f = c.get(f.localName);
            for (var t = 0; t < f.length; t++)
                y(a.a, f[t]);
            (e = a.j.get(e)) && D(e);
        }
    } }
    E.prototype.get = function (a) { if (a = this.a.a.get(a))
        return a.constructorFunction; };
    E.prototype.m = function (a) { if (!g(a))
        return Promise.reject(new SyntaxError("'" + a + "' is not a valid custom element name.")); var b = this.j.get(a); if (b)
        return b.c; b = new ea; this.j.set(a, b); this.a.a.get(a) && !this.g.some(function (b) { return b.localName === a; }) && D(b); return b.c; };
    E.prototype.s = function (a) { C(this.o); var b = this.f; this.f = function (d) { return a(function () { return b(d); }); }; };
    window.CustomElementRegistry = E;
    E.prototype.define = E.prototype.l;
    E.prototype.upgrade = E.prototype.i;
    E.prototype.get = E.prototype.get;
    E.prototype.whenDefined = E.prototype.m;
    E.prototype.polyfillWrapFlushCallback = E.prototype.s;
    var F = window.Document.prototype.createElement, G = window.Document.prototype.createElementNS, ha = window.Document.prototype.importNode, ia = window.Document.prototype.prepend, ja = window.Document.prototype.append, ka = window.DocumentFragment.prototype.prepend, la = window.DocumentFragment.prototype.append, H = window.Node.prototype.cloneNode, I = window.Node.prototype.appendChild, J = window.Node.prototype.insertBefore, K = window.Node.prototype.removeChild, L = window.Node.prototype.replaceChild, M = Object.getOwnPropertyDescriptor(window.Node.prototype, "textContent"), N = window.Element.prototype.attachShadow, O = Object.getOwnPropertyDescriptor(window.Element.prototype, "innerHTML"), P = window.Element.prototype.getAttribute, Q = window.Element.prototype.setAttribute, R = window.Element.prototype.removeAttribute, S = window.Element.prototype.getAttributeNS, T = window.Element.prototype.setAttributeNS, U = window.Element.prototype.removeAttributeNS, ma = window.Element.prototype.insertAdjacentElement, na = window.Element.prototype.insertAdjacentHTML, oa = window.Element.prototype.prepend, pa = window.Element.prototype.append, V = window.Element.prototype.before, qa = window.Element.prototype.after, ra = window.Element.prototype.replaceWith, sa = window.Element.prototype.remove, ta = window.HTMLElement, W = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "innerHTML"), ua = window.HTMLElement.prototype.insertAdjacentElement, va = window.HTMLElement.prototype.insertAdjacentHTML;
    var wa = new function () { };
    function xa() {
        var a = X;
        window.HTMLElement = function () {
            function b() {
                var b = this.constructor, c = a.g.get(b);
                if (!c)
                    throw Error("The custom element being constructed was not registered with `customElements`.");
                var e = c.constructionStack;
                if (0 === e.length)
                    return e = F.call(document, c.localName), Object.setPrototypeOf(e, b.prototype), e.__CE_state = 1, e.__CE_definition = c, w(a, e), e;
                c = e.length - 1;
                var f = e[c];
                if (f === wa)
                    throw Error("The HTMLElement constructor was either called reentrantly for this constructor or called multiple times.");
                e[c] = wa;
                Object.setPrototypeOf(f, b.prototype);
                w(a, f);
                return f;
            }
            b.prototype = ta.prototype;
            Object.defineProperty(b.prototype, "constructor", { writable: !0, configurable: !0, enumerable: !1, value: b });
            return b;
        }();
    }
    function Y(a, b, d) { function c(b) { return function (d) { for (var e = [], c = 0; c < arguments.length; ++c)
        e[c] = arguments[c]; c = []; for (var f = [], m = 0; m < e.length; m++) {
        var q = e[m];
        q instanceof Element && l(q) && f.push(q);
        if (q instanceof DocumentFragment)
            for (q = q.firstChild; q; q = q.nextSibling)
                c.push(q);
        else
            c.push(q);
    } b.apply(this, e); for (e = 0; e < f.length; e++)
        z(a, f[e]); if (l(this))
        for (e = 0; e < c.length; e++)
            f = c[e], f instanceof Element && x(a, f); }; } void 0 !== d.h && (b.prepend = c(d.h)); void 0 !== d.append && (b.append = c(d.append)); }
    function ya() {
        var a = X;
        r(Document.prototype, "createElement", function (b) { if (this.__CE_hasRegistry) {
            var d = a.a.get(b);
            if (d)
                return new d.constructorFunction;
        } b = F.call(this, b); w(a, b); return b; });
        r(Document.prototype, "importNode", function (b, d) { b = ha.call(this, b, !!d); this.__CE_hasRegistry ? A(a, b) : v(a, b); return b; });
        r(Document.prototype, "createElementNS", function (b, d) {
            if (this.__CE_hasRegistry && (null === b || "http://www.w3.org/1999/xhtml" === b)) {
                var c = a.a.get(d);
                if (c)
                    return new c.constructorFunction;
            }
            b = G.call(this, b, d);
            w(a, b);
            return b;
        });
        Y(a, Document.prototype, { h: ia, append: ja });
    }
    function za() {
        function a(a, c) { Object.defineProperty(a, "textContent", { enumerable: c.enumerable, configurable: !0, get: c.get, set: function (a) { if (this.nodeType === Node.TEXT_NODE)
                c.set.call(this, a);
            else {
                var d = void 0;
                if (this.firstChild) {
                    var e = this.childNodes, k = e.length;
                    if (0 < k && l(this)) {
                        d = Array(k);
                        for (var h = 0; h < k; h++)
                            d[h] = e[h];
                    }
                }
                c.set.call(this, a);
                if (d)
                    for (a = 0; a < d.length; a++)
                        z(b, d[a]);
            } } }); }
        var b = X;
        r(Node.prototype, "insertBefore", function (a, c) {
            if (a instanceof DocumentFragment) {
                var e = Array.prototype.slice.apply(a.childNodes);
                a = J.call(this, a, c);
                if (l(this))
                    for (c = 0; c < e.length; c++)
                        x(b, e[c]);
                return a;
            }
            e = l(a);
            c = J.call(this, a, c);
            e && z(b, a);
            l(this) && x(b, a);
            return c;
        });
        r(Node.prototype, "appendChild", function (a) { if (a instanceof DocumentFragment) {
            var c = Array.prototype.slice.apply(a.childNodes);
            a = I.call(this, a);
            if (l(this))
                for (var e = 0; e < c.length; e++)
                    x(b, c[e]);
            return a;
        } c = l(a); e = I.call(this, a); c && z(b, a); l(this) && x(b, a); return e; });
        r(Node.prototype, "cloneNode", function (a) {
            a = H.call(this, !!a);
            this.ownerDocument.__CE_hasRegistry ? A(b, a) : v(b, a);
            return a;
        });
        r(Node.prototype, "removeChild", function (a) { var c = l(a), e = K.call(this, a); c && z(b, a); return e; });
        r(Node.prototype, "replaceChild", function (a, c) { if (a instanceof DocumentFragment) {
            var e = Array.prototype.slice.apply(a.childNodes);
            a = L.call(this, a, c);
            if (l(this))
                for (z(b, c), c = 0; c < e.length; c++)
                    x(b, e[c]);
            return a;
        } e = l(a); var f = L.call(this, a, c), d = l(this); d && z(b, c); e && z(b, a); d && x(b, a); return f; });
        M && M.get ? a(Node.prototype, M) : ca(b, function (b) {
            a(b, { enumerable: !0, configurable: !0, get: function () {
                    for (var a = [], b = 0; b < this.childNodes.length; b++) {
                        var f = this.childNodes[b];
                        f.nodeType !== Node.COMMENT_NODE && a.push(f.textContent);
                    }
                    return a.join("");
                }, set: function (a) { for (; this.firstChild;)
                    K.call(this, this.firstChild); null != a && "" !== a && I.call(this, document.createTextNode(a)); } });
        });
    }
    function Aa(a) {
        function b(b) { return function (e) { for (var c = [], d = 0; d < arguments.length; ++d)
            c[d] = arguments[d]; d = []; for (var k = [], h = 0; h < c.length; h++) {
            var m = c[h];
            m instanceof Element && l(m) && k.push(m);
            if (m instanceof DocumentFragment)
                for (m = m.firstChild; m; m = m.nextSibling)
                    d.push(m);
            else
                d.push(m);
        } b.apply(this, c); for (c = 0; c < k.length; c++)
            z(a, k[c]); if (l(this))
            for (c = 0; c < d.length; c++)
                k = d[c], k instanceof Element && x(a, k); }; }
        var d = Element.prototype;
        void 0 !== V && (d.before = b(V));
        void 0 !== V && (d.after = b(qa));
        void 0 !== ra &&
            r(d, "replaceWith", function (b) { for (var e = [], c = 0; c < arguments.length; ++c)
                e[c] = arguments[c]; c = []; for (var d = [], k = 0; k < e.length; k++) {
                var h = e[k];
                h instanceof Element && l(h) && d.push(h);
                if (h instanceof DocumentFragment)
                    for (h = h.firstChild; h; h = h.nextSibling)
                        c.push(h);
                else
                    c.push(h);
            } k = l(this); ra.apply(this, e); for (e = 0; e < d.length; e++)
                z(a, d[e]); if (k)
                for (z(a, this), e = 0; e < c.length; e++)
                    d = c[e], d instanceof Element && x(a, d); });
        void 0 !== sa && r(d, "remove", function () { var b = l(this); sa.call(this); b && z(a, this); });
    }
    function Ba() {
        function a(a, b) { Object.defineProperty(a, "innerHTML", { enumerable: b.enumerable, configurable: !0, get: b.get, set: function (a) { var e = this, d = void 0; l(this) && (d = [], p(this, function (a) { a !== e && d.push(a); })); b.set.call(this, a); if (d)
                for (var f = 0; f < d.length; f++) {
                    var t = d[f];
                    1 === t.__CE_state && c.disconnectedCallback(t);
                } this.ownerDocument.__CE_hasRegistry ? A(c, this) : v(c, this); return a; } }); }
        function b(a, b) { r(a, "insertAdjacentElement", function (a, e) { var d = l(e); a = b.call(this, a, e); d && z(c, e); l(a) && x(c, e); return a; }); }
        function d(a, b) {
            function e(a, b) { for (var e = []; a !== b; a = a.nextSibling)
                e.push(a); for (b = 0; b < e.length; b++)
                A(c, e[b]); }
            r(a, "insertAdjacentHTML", function (a, c) {
                a = a.toLowerCase();
                if ("beforebegin" === a) {
                    var d = this.previousSibling;
                    b.call(this, a, c);
                    e(d || this.parentNode.firstChild, this);
                }
                else if ("afterbegin" === a)
                    d = this.firstChild, b.call(this, a, c), e(this.firstChild, d);
                else if ("beforeend" === a)
                    d = this.lastChild, b.call(this, a, c), e(d || this.firstChild, null);
                else if ("afterend" === a)
                    d = this.nextSibling, b.call(this, a, c), e(this.nextSibling, d);
                else
                    throw new SyntaxError("The value provided (" + String(a) + ") is not one of 'beforebegin', 'afterbegin', 'beforeend', or 'afterend'.");
            });
        }
        var c = X;
        N && r(Element.prototype, "attachShadow", function (a) { a = N.call(this, a); var b = c; if (b.b && !a.__CE_patched) {
            a.__CE_patched = !0;
            for (var e = 0; e < b.c.length; e++)
                b.c[e](a);
        } return this.__CE_shadowRoot = a; });
        O && O.get ? a(Element.prototype, O) : W && W.get ? a(HTMLElement.prototype, W) : da(c, function (b) {
            a(b, { enumerable: !0, configurable: !0, get: function () { return H.call(this, !0).innerHTML; },
                set: function (a) { var b = "template" === this.localName, c = b ? this.content : this, e = G.call(document, this.namespaceURI, this.localName); for (e.innerHTML = a; 0 < c.childNodes.length;)
                    K.call(c, c.childNodes[0]); for (a = b ? e.content : e; 0 < a.childNodes.length;)
                    I.call(c, a.childNodes[0]); } });
        });
        r(Element.prototype, "setAttribute", function (a, b) { if (1 !== this.__CE_state)
            return Q.call(this, a, b); var e = P.call(this, a); Q.call(this, a, b); b = P.call(this, a); c.attributeChangedCallback(this, a, e, b, null); });
        r(Element.prototype, "setAttributeNS", function (a, b, d) { if (1 !== this.__CE_state)
            return T.call(this, a, b, d); var e = S.call(this, a, b); T.call(this, a, b, d); d = S.call(this, a, b); c.attributeChangedCallback(this, b, e, d, a); });
        r(Element.prototype, "removeAttribute", function (a) { if (1 !== this.__CE_state)
            return R.call(this, a); var b = P.call(this, a); R.call(this, a); null !== b && c.attributeChangedCallback(this, a, b, null, null); });
        r(Element.prototype, "removeAttributeNS", function (a, b) {
            if (1 !== this.__CE_state)
                return U.call(this, a, b);
            var d = S.call(this, a, b);
            U.call(this, a, b);
            var e = S.call(this, a, b);
            d !== e && c.attributeChangedCallback(this, b, d, e, a);
        });
        ua ? b(HTMLElement.prototype, ua) : ma ? b(Element.prototype, ma) : console.warn("Custom Elements: `Element#insertAdjacentElement` was not patched.");
        va ? d(HTMLElement.prototype, va) : na ? d(Element.prototype, na) : console.warn("Custom Elements: `Element#insertAdjacentHTML` was not patched.");
        Y(c, Element.prototype, { h: oa, append: pa });
        Aa(c);
    }
    var Z = window.customElements;
    if (!Z || Z.forcePolyfill || "function" != typeof Z.define || "function" != typeof Z.get) {
        var X = new u;
        xa();
        ya();
        Y(X, DocumentFragment.prototype, { h: ka, append: la });
        za();
        Ba();
        document.__CE_hasRegistry = !0;
        var customElements = new E(X);
        Object.defineProperty(window, "customElements", { configurable: !0, enumerable: !0, value: customElements });
    }
}).call(self);
// Polyfill document.baseURI
if (typeof document.baseURI !== 'string') {
    Object.defineProperty(Document.prototype, 'baseURI', {
        enumerable: true,
        configurable: true,
        get: function () {
            var base = document.querySelector('base');
            if (base) {
                return base.href;
            }
            return document.URL;
        }
    });
}
// Polyfill CustomEvent
if (typeof window.CustomEvent !== 'function') {
    window.CustomEvent = function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    };
    window.CustomEvent.prototype = window.Event.prototype;
}
// Event.composedPath
(function (E, d, w) {
    if (!E.composedPath) {
        E.composedPath = function () {
            if (this.path) {
                return this.path;
            }
            var target = this.target;
            this.path = [];
            while (target.parentNode !== null) {
                this.path.push(target);
                target = target.parentNode;
            }
            this.path.push(d, w);
            return this.path;
        };
    }
})(Event.prototype, document, window);
/*!
Element.closest and Element.matches
https://github.com/jonathantneal/closest
Creative Commons Zero v1.0 Universal
*/
(function (a) { "function" !== typeof a.matches && (a.matches = a.msMatchesSelector || a.mozMatchesSelector || a.webkitMatchesSelector || function (a) { a = (this.document || this.ownerDocument).querySelectorAll(a); for (var b = 0; a[b] && a[b] !== this;)
    ++b; return !!a[b]; }); "function" !== typeof a.closest && (a.closest = function (a) { for (var b = this; b && 1 === b.nodeType;) {
    if (b.matches(a))
        return b;
    b = b.parentNode;
} return null; }); })(window.Element.prototype);
/*!
Element.getRootNode()
*/
(function (c) { function d(a) { a = b(a); return 11 === a.nodeType ? d(a.host) : a; } function b(a) { return a.parentNode ? b(a.parentNode) : a; } "function" !== typeof c.getRootNode && (c.getRootNode = function (a) { return a && a.composed ? d(this) : b(this); }); })(Element.prototype);
/*!
Element.remove()
*/
(function (b) { b.forEach(function (a) { a.hasOwnProperty("remove") || Object.defineProperty(a, "remove", { configurable: !0, enumerable: !0, writable: !0, value: function () { null !== this.parentNode && this.parentNode.removeChild(this); } }); }); })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
/*!
Element.classList
*/
!function (e) { 'classList' in e || Object.defineProperty(e, "classList", { get: function () { var e = this, t = (e.getAttribute("class") || "").replace(/^\s+|\s$/g, "").split(/\s+/g); function n() { t.length > 0 ? e.setAttribute("class", t.join(" ")) : e.removeAttribute("class"); } return "" === t[0] && t.splice(0, 1), t.toggle = function (e, i) { void 0 !== i ? i ? t.add(e) : t.remove(e) : -1 !== t.indexOf(e) ? t.splice(t.indexOf(e), 1) : t.push(e), n(); }, t.add = function () { for (var e = [].slice.call(arguments), i = 0, s = e.length; i < s; i++)
        -1 === t.indexOf(e[i]) && t.push(e[i]); n(); }, t.remove = function () { for (var e = [].slice.call(arguments), i = 0, s = e.length; i < s; i++)
        -1 !== t.indexOf(e[i]) && t.splice(t.indexOf(e[i]), 1); n(); }, t.item = function (e) { return t[e]; }, t.contains = function (e) { return -1 !== t.indexOf(e); }, t.replace = function (e, i) { -1 !== t.indexOf(e) && t.splice(t.indexOf(e), 1, i), n(); }, t.value = e.getAttribute("class") || "", t; } }); }(Element.prototype);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGlvbmljL3B3YS1lbGVtZW50cy9kaXN0L2VzbS1lczUvZG9tLTU5MjkwMzQwLTU5MjkwMzQwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQSxtQkFBbUIsbUJBQW1CLGdEQUFnRCxnQkFBZ0I7QUFDdEcsbUJBQW1CLHVCQUF1QjtBQUMxQyxpQkFBaUIsT0FBTywwREFBMEQ7QUFDbEYsNkZBQTZGLHFFQUFxRTtBQUNsSyxzQkFBc0IsT0FBTyxnQ0FBZ0M7QUFDN0QseUJBQXlCLDRDQUE0QztBQUNyRSx5QkFBeUIsZ0NBQWdDLGdCQUFnQixHQUFHO0FBQzVFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9ELEdBQUc7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLEdBQUc7QUFDekM7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLHlCQUF5QixVQUFVO0FBQ25DLGtCQUFrQixrQkFBa0Isa0JBQWtCLGFBQWEsYUFBYSxhQUFhO0FBQzdGLDBCQUEwQixlQUFlLG1DQUFtQztBQUM1RSx1QkFBdUIsVUFBVSxhQUFhO0FBQzlDLHVCQUF1QixVQUFVLGFBQWE7QUFDOUMsc0JBQXNCLDJCQUEyQixnQkFBZ0IsRUFBRSxFQUFFO0FBQ3JFLHNCQUFzQjtBQUN0QjtBQUNBLHVCQUF1QixnQkFBZ0I7QUFDdkM7QUFDQSxtQkFBbUIsZ0JBQWdCO0FBQ25DO0FBQ0EsS0FBSztBQUNMLHNCQUFzQixZQUFZLG9CQUFvQixrQkFBa0IsRUFBRSxFQUFFLFlBQVksY0FBYztBQUN0RztBQUNBO0FBQ0EsS0FBSztBQUNMLHNCQUFzQixZQUFZLG9CQUFvQixrQkFBa0IsRUFBRSxFQUFFLFlBQVksY0FBYztBQUN0RztBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsNkJBQTZCO0FBQzdCLHlEQUF5RCxnQkFBZ0IsRUFB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QUUsRUFBRTtBQUMzUDtBQUNBO0FBQ0E7QUFDQSxlQUFlLDREQUE0RCxtQkFBbUIsMEZBQTBGLGVBQWUsa0ZBQWtGLEVBQUUsbUVBQW1FLDhHQUE4RyxFQUFFLHVCQUF1Qiw0REFBNEQsT0FBTztBQUN4aUIsK0NBQStDLEtBQUssRUFBRSwwQkFBMEIsNERBQTRELE9BQU87QUFDbkosK0RBQStELEtBQUssRUFBRSx5QkFBeUIsYUFBYSxFQUFFLDZCQUE2Qiw0QkFBNEIsRUFBRSwrQkFBK0IsMERBQTBELEVBQUUsNkNBQTZDLEVBQUUsRUFBRSxFQUFFLEVBQUUiLCJmaWxlIjoiMS5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFhID0gbmV3IFNldChcImFubm90YXRpb24teG1sIGNvbG9yLXByb2ZpbGUgZm9udC1mYWNlIGZvbnQtZmFjZS1zcmMgZm9udC1mYWNlLXVyaSBmb250LWZhY2UtZm9ybWF0IGZvbnQtZmFjZS1uYW1lIG1pc3NpbmctZ2x5cGhcIi5zcGxpdChcIiBcIikpO1xuICAgIGZ1bmN0aW9uIGcoYSkgeyB2YXIgYiA9IGFhLmhhcyhhKTsgYSA9IC9eW2Etel1bLjAtOV9hLXpdKi1bXFwtLjAtOV9hLXpdKiQvLnRlc3QoYSk7IHJldHVybiAhYiAmJiBhOyB9XG4gICAgZnVuY3Rpb24gbChhKSB7IHZhciBiID0gYS5pc0Nvbm5lY3RlZDsgaWYgKHZvaWQgMCAhPT0gYilcbiAgICAgICAgcmV0dXJuIGI7IGZvciAoOyBhICYmICEoYS5fX0NFX2lzSW1wb3J0RG9jdW1lbnQgfHwgYSBpbnN0YW5jZW9mIERvY3VtZW50KTspXG4gICAgICAgIGEgPSBhLnBhcmVudE5vZGUgfHwgKHdpbmRvdy5TaGFkb3dSb290ICYmIGEgaW5zdGFuY2VvZiBTaGFkb3dSb290ID8gYS5ob3N0IDogdm9pZCAwKTsgcmV0dXJuICEoIWEgfHwgIShhLl9fQ0VfaXNJbXBvcnREb2N1bWVudCB8fCBhIGluc3RhbmNlb2YgRG9jdW1lbnQpKTsgfVxuICAgIGZ1bmN0aW9uIG4oYSwgYikgeyBmb3IgKDsgYiAmJiBiICE9PSBhICYmICFiLm5leHRTaWJsaW5nOylcbiAgICAgICAgYiA9IGIucGFyZW50Tm9kZTsgcmV0dXJuIGIgJiYgYiAhPT0gYSA/IGIubmV4dFNpYmxpbmcgOiBudWxsOyB9XG4gICAgZnVuY3Rpb24gcChhLCBiLCBkKSB7IGQgPSB2b2lkIDAgPT09IGQgPyBuZXcgU2V0IDogZDsgZm9yICh2YXIgYyA9IGE7IGM7KSB7XG4gICAgICAgIGlmIChjLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgdmFyIGUgPSBjO1xuICAgICAgICAgICAgYihlKTtcbiAgICAgICAgICAgIHZhciBmID0gZS5sb2NhbE5hbWU7XG4gICAgICAgICAgICBpZiAoXCJsaW5rXCIgPT09IGYgJiYgXCJpbXBvcnRcIiA9PT0gZS5nZXRBdHRyaWJ1dGUoXCJyZWxcIikpIHtcbiAgICAgICAgICAgICAgICBjID0gZS5pbXBvcnQ7XG4gICAgICAgICAgICAgICAgaWYgKGMgaW5zdGFuY2VvZiBOb2RlICYmICFkLmhhcyhjKSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChkLmFkZChjKSwgYyA9IGMuZmlyc3RDaGlsZDsgYzsgYyA9IGMubmV4dFNpYmxpbmcpXG4gICAgICAgICAgICAgICAgICAgICAgICBwKGMsIGIsIGQpO1xuICAgICAgICAgICAgICAgIGMgPSBuKGEsIGUpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoXCJ0ZW1wbGF0ZVwiID09PSBmKSB7XG4gICAgICAgICAgICAgICAgYyA9IG4oYSwgZSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZSA9IGUuX19DRV9zaGFkb3dSb290KVxuICAgICAgICAgICAgICAgIGZvciAoZSA9IGUuZmlyc3RDaGlsZDsgZTsgZSA9IGUubmV4dFNpYmxpbmcpXG4gICAgICAgICAgICAgICAgICAgIHAoZSwgYiwgZCk7XG4gICAgICAgIH1cbiAgICAgICAgYyA9IGMuZmlyc3RDaGlsZCA/IGMuZmlyc3RDaGlsZCA6IG4oYSwgYyk7XG4gICAgfSB9XG4gICAgZnVuY3Rpb24gcihhLCBiLCBkKSB7IGFbYl0gPSBkOyB9XG4gICAgZnVuY3Rpb24gdSgpIHsgdGhpcy5hID0gbmV3IE1hcDsgdGhpcy5nID0gbmV3IE1hcDsgdGhpcy5jID0gW107IHRoaXMuZiA9IFtdOyB0aGlzLmIgPSAhMTsgfVxuICAgIGZ1bmN0aW9uIGJhKGEsIGIsIGQpIHsgYS5hLnNldChiLCBkKTsgYS5nLnNldChkLmNvbnN0cnVjdG9yRnVuY3Rpb24sIGQpOyB9XG4gICAgZnVuY3Rpb24gY2EoYSwgYikgeyBhLmIgPSAhMDsgYS5jLnB1c2goYik7IH1cbiAgICBmdW5jdGlvbiBkYShhLCBiKSB7IGEuYiA9ICEwOyBhLmYucHVzaChiKTsgfVxuICAgIGZ1bmN0aW9uIHYoYSwgYikgeyBhLmIgJiYgcChiLCBmdW5jdGlvbiAoYikgeyByZXR1cm4gdyhhLCBiKTsgfSk7IH1cbiAgICBmdW5jdGlvbiB3KGEsIGIpIHsgaWYgKGEuYiAmJiAhYi5fX0NFX3BhdGNoZWQpIHtcbiAgICAgICAgYi5fX0NFX3BhdGNoZWQgPSAhMDtcbiAgICAgICAgZm9yICh2YXIgZCA9IDA7IGQgPCBhLmMubGVuZ3RoOyBkKyspXG4gICAgICAgICAgICBhLmNbZF0oYik7XG4gICAgICAgIGZvciAoZCA9IDA7IGQgPCBhLmYubGVuZ3RoOyBkKyspXG4gICAgICAgICAgICBhLmZbZF0oYik7XG4gICAgfSB9XG4gICAgZnVuY3Rpb24geChhLCBiKSB7IHZhciBkID0gW107IHAoYiwgZnVuY3Rpb24gKGIpIHsgcmV0dXJuIGQucHVzaChiKTsgfSk7IGZvciAoYiA9IDA7IGIgPCBkLmxlbmd0aDsgYisrKSB7XG4gICAgICAgIHZhciBjID0gZFtiXTtcbiAgICAgICAgMSA9PT0gYy5fX0NFX3N0YXRlID8gYS5jb25uZWN0ZWRDYWxsYmFjayhjKSA6IHkoYSwgYyk7XG4gICAgfSB9XG4gICAgZnVuY3Rpb24geihhLCBiKSB7IHZhciBkID0gW107IHAoYiwgZnVuY3Rpb24gKGIpIHsgcmV0dXJuIGQucHVzaChiKTsgfSk7IGZvciAoYiA9IDA7IGIgPCBkLmxlbmd0aDsgYisrKSB7XG4gICAgICAgIHZhciBjID0gZFtiXTtcbiAgICAgICAgMSA9PT0gYy5fX0NFX3N0YXRlICYmIGEuZGlzY29ubmVjdGVkQ2FsbGJhY2soYyk7XG4gICAgfSB9XG4gICAgZnVuY3Rpb24gQShhLCBiLCBkKSB7XG4gICAgICAgIGQgPSB2b2lkIDAgPT09IGQgPyB7fSA6IGQ7XG4gICAgICAgIHZhciBjID0gZC51IHx8IG5ldyBTZXQsIGUgPSBkLmkgfHwgZnVuY3Rpb24gKGIpIHsgcmV0dXJuIHkoYSwgYik7IH0sIGYgPSBbXTtcbiAgICAgICAgcChiLCBmdW5jdGlvbiAoYikgeyBpZiAoXCJsaW5rXCIgPT09IGIubG9jYWxOYW1lICYmIFwiaW1wb3J0XCIgPT09IGIuZ2V0QXR0cmlidXRlKFwicmVsXCIpKSB7XG4gICAgICAgICAgICB2YXIgZCA9IGIuaW1wb3J0O1xuICAgICAgICAgICAgZCBpbnN0YW5jZW9mIE5vZGUgJiYgKGQuX19DRV9pc0ltcG9ydERvY3VtZW50ID0gITAsIGQuX19DRV9oYXNSZWdpc3RyeSA9ICEwKTtcbiAgICAgICAgICAgIGQgJiYgXCJjb21wbGV0ZVwiID09PSBkLnJlYWR5U3RhdGUgPyBkLl9fQ0VfZG9jdW1lbnRMb2FkSGFuZGxlZCA9ICEwIDogYi5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7IHZhciBkID0gYi5pbXBvcnQ7IGlmICghZC5fX0NFX2RvY3VtZW50TG9hZEhhbmRsZWQpIHtcbiAgICAgICAgICAgICAgICBkLl9fQ0VfZG9jdW1lbnRMb2FkSGFuZGxlZCA9ICEwO1xuICAgICAgICAgICAgICAgIHZhciBmID0gbmV3IFNldChjKTtcbiAgICAgICAgICAgICAgICBmLmRlbGV0ZShkKTtcbiAgICAgICAgICAgICAgICBBKGEsIGQsIHsgdTogZiwgaTogZSB9KTtcbiAgICAgICAgICAgIH0gfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZi5wdXNoKGIpOyB9LCBjKTtcbiAgICAgICAgaWYgKGEuYilcbiAgICAgICAgICAgIGZvciAoYiA9XG4gICAgICAgICAgICAgICAgMDsgYiA8IGYubGVuZ3RoOyBiKyspXG4gICAgICAgICAgICAgICAgdyhhLCBmW2JdKTtcbiAgICAgICAgZm9yIChiID0gMDsgYiA8IGYubGVuZ3RoOyBiKyspXG4gICAgICAgICAgICBlKGZbYl0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiB5KGEsIGIpIHtcbiAgICAgICAgaWYgKHZvaWQgMCA9PT0gYi5fX0NFX3N0YXRlKSB7XG4gICAgICAgICAgICB2YXIgZCA9IGIub3duZXJEb2N1bWVudDtcbiAgICAgICAgICAgIGlmIChkLmRlZmF1bHRWaWV3IHx8IGQuX19DRV9pc0ltcG9ydERvY3VtZW50ICYmIGQuX19DRV9oYXNSZWdpc3RyeSlcbiAgICAgICAgICAgICAgICBpZiAoZCA9IGEuYS5nZXQoYi5sb2NhbE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGQuY29uc3RydWN0aW9uU3RhY2sucHVzaChiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGMgPSBkLmNvbnN0cnVjdG9yRnVuY3Rpb247XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXcgYyAhPT0gYilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJUaGUgY3VzdG9tIGVsZW1lbnQgY29uc3RydWN0b3IgZGlkIG5vdCBwcm9kdWNlIHRoZSBlbGVtZW50IGJlaW5nIHVwZ3JhZGVkLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQuY29uc3RydWN0aW9uU3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGIuX19DRV9zdGF0ZSA9IDIsIHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYi5fX0NFX3N0YXRlID0gMTtcbiAgICAgICAgICAgICAgICAgICAgYi5fX0NFX2RlZmluaXRpb24gPSBkO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZC5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2spXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGQgPSBkLm9ic2VydmVkQXR0cmlidXRlcywgYyA9IDA7IGMgPCBkLmxlbmd0aDsgYysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGUgPSBkW2NdLCBmID0gYi5nZXRBdHRyaWJ1dGUoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCAhPT0gZiAmJiBhLmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhiLCBlLCBudWxsLCBmLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbChiKSAmJiBhLmNvbm5lY3RlZENhbGxiYWNrKGIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB1LnByb3RvdHlwZS5jb25uZWN0ZWRDYWxsYmFjayA9IGZ1bmN0aW9uIChhKSB7IHZhciBiID0gYS5fX0NFX2RlZmluaXRpb247IGIuY29ubmVjdGVkQ2FsbGJhY2sgJiYgYi5jb25uZWN0ZWRDYWxsYmFjay5jYWxsKGEpOyB9O1xuICAgIHUucHJvdG90eXBlLmRpc2Nvbm5lY3RlZENhbGxiYWNrID0gZnVuY3Rpb24gKGEpIHsgdmFyIGIgPSBhLl9fQ0VfZGVmaW5pdGlvbjsgYi5kaXNjb25uZWN0ZWRDYWxsYmFjayAmJiBiLmRpc2Nvbm5lY3RlZENhbGxiYWNrLmNhbGwoYSk7IH07XG4gICAgdS5wcm90b3R5cGUuYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrID0gZnVuY3Rpb24gKGEsIGIsIGQsIGMsIGUpIHsgdmFyIGYgPSBhLl9fQ0VfZGVmaW5pdGlvbjsgZi5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgJiYgLTEgPCBmLm9ic2VydmVkQXR0cmlidXRlcy5pbmRleE9mKGIpICYmIGYuYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrLmNhbGwoYSwgYiwgZCwgYywgZSk7IH07XG4gICAgZnVuY3Rpb24gQihhKSB7IHZhciBiID0gZG9jdW1lbnQ7IHRoaXMuYyA9IGE7IHRoaXMuYSA9IGI7IHRoaXMuYiA9IHZvaWQgMDsgQSh0aGlzLmMsIHRoaXMuYSk7IFwibG9hZGluZ1wiID09PSB0aGlzLmEucmVhZHlTdGF0ZSAmJiAodGhpcy5iID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodGhpcy5mLmJpbmQodGhpcykpLCB0aGlzLmIub2JzZXJ2ZSh0aGlzLmEsIHsgY2hpbGRMaXN0OiAhMCwgc3VidHJlZTogITAgfSkpOyB9XG4gICAgZnVuY3Rpb24gQyhhKSB7IGEuYiAmJiBhLmIuZGlzY29ubmVjdCgpOyB9XG4gICAgQi5wcm90b3R5cGUuZiA9IGZ1bmN0aW9uIChhKSB7IHZhciBiID0gdGhpcy5hLnJlYWR5U3RhdGU7IFwiaW50ZXJhY3RpdmVcIiAhPT0gYiAmJiBcImNvbXBsZXRlXCIgIT09IGIgfHwgQyh0aGlzKTsgZm9yIChiID0gMDsgYiA8IGEubGVuZ3RoOyBiKyspXG4gICAgICAgIGZvciAodmFyIGQgPSBhW2JdLmFkZGVkTm9kZXMsIGMgPSAwOyBjIDwgZC5sZW5ndGg7IGMrKylcbiAgICAgICAgICAgIEEodGhpcy5jLCBkW2NdKTsgfTtcbiAgICBmdW5jdGlvbiBlYSgpIHsgdmFyIGEgPSB0aGlzOyB0aGlzLmIgPSB0aGlzLmEgPSB2b2lkIDA7IHRoaXMuYyA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChiKSB7IGEuYiA9IGI7IGEuYSAmJiBiKGEuYSk7IH0pOyB9XG4gICAgZnVuY3Rpb24gRChhKSB7IGlmIChhLmEpXG4gICAgICAgIHRocm93IEVycm9yKFwiQWxyZWFkeSByZXNvbHZlZC5cIik7IGEuYSA9IHZvaWQgMDsgYS5iICYmIGEuYih2b2lkIDApOyB9XG4gICAgZnVuY3Rpb24gRShhKSB7IHRoaXMuYyA9ICExOyB0aGlzLmEgPSBhOyB0aGlzLmogPSBuZXcgTWFwOyB0aGlzLmYgPSBmdW5jdGlvbiAoYikgeyByZXR1cm4gYigpOyB9OyB0aGlzLmIgPSAhMTsgdGhpcy5nID0gW107IHRoaXMubyA9IG5ldyBCKGEpOyB9XG4gICAgRS5wcm90b3R5cGUubCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIHZhciBkID0gdGhpcztcbiAgICAgICAgaWYgKCEoYiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDdXN0b20gZWxlbWVudCBjb25zdHJ1Y3RvcnMgbXVzdCBiZSBmdW5jdGlvbnMuXCIpO1xuICAgICAgICBpZiAoIWcoYSkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJUaGUgZWxlbWVudCBuYW1lICdcIiArIGEgKyBcIicgaXMgbm90IHZhbGlkLlwiKTtcbiAgICAgICAgaWYgKHRoaXMuYS5hLmdldChhKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiQSBjdXN0b20gZWxlbWVudCB3aXRoIG5hbWUgJ1wiICsgYSArIFwiJyBoYXMgYWxyZWFkeSBiZWVuIGRlZmluZWQuXCIpO1xuICAgICAgICBpZiAodGhpcy5jKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJBIGN1c3RvbSBlbGVtZW50IGlzIGFscmVhZHkgYmVpbmcgZGVmaW5lZC5cIik7XG4gICAgICAgIHRoaXMuYyA9ICEwO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIGMgPSBmdW5jdGlvbiAoYikge1xuICAgICAgICAgICAgICAgIHZhciBhID0gZVtiXTtcbiAgICAgICAgICAgICAgICBpZiAodm9pZCAwICE9PSBhICYmICEoYSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJUaGUgJ1wiICsgYiArIFwiJyBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24uXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICAgICAgfSwgZSA9IGIucHJvdG90eXBlO1xuICAgICAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIE9iamVjdCkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlRoZSBjdXN0b20gZWxlbWVudCBjb25zdHJ1Y3RvcidzIHByb3RvdHlwZSBpcyBub3QgYW4gb2JqZWN0LlwiKTtcbiAgICAgICAgICAgIHZhciBmID0gYyhcImNvbm5lY3RlZENhbGxiYWNrXCIpO1xuICAgICAgICAgICAgdmFyIHQgPSBjKFwiZGlzY29ubmVjdGVkQ2FsbGJhY2tcIik7XG4gICAgICAgICAgICB2YXIgayA9IGMoXCJhZG9wdGVkQ2FsbGJhY2tcIik7XG4gICAgICAgICAgICB2YXIgaCA9IGMoXCJhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2tcIik7XG4gICAgICAgICAgICB2YXIgbSA9IGIub2JzZXJ2ZWRBdHRyaWJ1dGVzIHx8IFtdO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLmMgPSAhMTtcbiAgICAgICAgfVxuICAgICAgICBiID0geyBsb2NhbE5hbWU6IGEsIGNvbnN0cnVjdG9yRnVuY3Rpb246IGIsIGNvbm5lY3RlZENhbGxiYWNrOiBmLCBkaXNjb25uZWN0ZWRDYWxsYmFjazogdCwgYWRvcHRlZENhbGxiYWNrOiBrLCBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2s6IGgsIG9ic2VydmVkQXR0cmlidXRlczogbSwgY29uc3RydWN0aW9uU3RhY2s6IFtdIH07XG4gICAgICAgIGJhKHRoaXMuYSwgYSwgYik7XG4gICAgICAgIHRoaXMuZy5wdXNoKGIpO1xuICAgICAgICB0aGlzLmIgfHwgKHRoaXMuYiA9ICEwLCB0aGlzLmYoZnVuY3Rpb24gKCkgeyByZXR1cm4gZmEoZCk7IH0pKTtcbiAgICB9O1xuICAgIEUucHJvdG90eXBlLmkgPSBmdW5jdGlvbiAoYSkgeyBBKHRoaXMuYSwgYSk7IH07XG4gICAgZnVuY3Rpb24gZmEoYSkgeyBpZiAoITEgIT09IGEuYikge1xuICAgICAgICBhLmIgPSAhMTtcbiAgICAgICAgZm9yICh2YXIgYiA9IGEuZywgZCA9IFtdLCBjID0gbmV3IE1hcCwgZSA9IDA7IGUgPCBiLmxlbmd0aDsgZSsrKVxuICAgICAgICAgICAgYy5zZXQoYltlXS5sb2NhbE5hbWUsIFtdKTtcbiAgICAgICAgQShhLmEsIGRvY3VtZW50LCB7IGk6IGZ1bmN0aW9uIChiKSB7IGlmICh2b2lkIDAgPT09IGIuX19DRV9zdGF0ZSkge1xuICAgICAgICAgICAgICAgIHZhciBlID0gYi5sb2NhbE5hbWUsIGYgPSBjLmdldChlKTtcbiAgICAgICAgICAgICAgICBmID8gZi5wdXNoKGIpIDogYS5hLmEuZ2V0KGUpICYmIGQucHVzaChiKTtcbiAgICAgICAgICAgIH0gfSB9KTtcbiAgICAgICAgZm9yIChlID0gMDsgZSA8IGQubGVuZ3RoOyBlKyspXG4gICAgICAgICAgICB5KGEuYSwgZFtlXSk7XG4gICAgICAgIGZvciAoOyAwIDwgYi5sZW5ndGg7KSB7XG4gICAgICAgICAgICB2YXIgZiA9IGIuc2hpZnQoKTtcbiAgICAgICAgICAgIGUgPSBmLmxvY2FsTmFtZTtcbiAgICAgICAgICAgIGYgPSBjLmdldChmLmxvY2FsTmFtZSk7XG4gICAgICAgICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IGYubGVuZ3RoOyB0KyspXG4gICAgICAgICAgICAgICAgeShhLmEsIGZbdF0pO1xuICAgICAgICAgICAgKGUgPSBhLmouZ2V0KGUpKSAmJiBEKGUpO1xuICAgICAgICB9XG4gICAgfSB9XG4gICAgRS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGEpIHsgaWYgKGEgPSB0aGlzLmEuYS5nZXQoYSkpXG4gICAgICAgIHJldHVybiBhLmNvbnN0cnVjdG9yRnVuY3Rpb247IH07XG4gICAgRS5wcm90b3R5cGUubSA9IGZ1bmN0aW9uIChhKSB7IGlmICghZyhhKSlcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBTeW50YXhFcnJvcihcIidcIiArIGEgKyBcIicgaXMgbm90IGEgdmFsaWQgY3VzdG9tIGVsZW1lbnQgbmFtZS5cIikpOyB2YXIgYiA9IHRoaXMuai5nZXQoYSk7IGlmIChiKVxuICAgICAgICByZXR1cm4gYi5jOyBiID0gbmV3IGVhOyB0aGlzLmouc2V0KGEsIGIpOyB0aGlzLmEuYS5nZXQoYSkgJiYgIXRoaXMuZy5zb21lKGZ1bmN0aW9uIChiKSB7IHJldHVybiBiLmxvY2FsTmFtZSA9PT0gYTsgfSkgJiYgRChiKTsgcmV0dXJuIGIuYzsgfTtcbiAgICBFLnByb3RvdHlwZS5zID0gZnVuY3Rpb24gKGEpIHsgQyh0aGlzLm8pOyB2YXIgYiA9IHRoaXMuZjsgdGhpcy5mID0gZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGEoZnVuY3Rpb24gKCkgeyByZXR1cm4gYihkKTsgfSk7IH07IH07XG4gICAgd2luZG93LkN1c3RvbUVsZW1lbnRSZWdpc3RyeSA9IEU7XG4gICAgRS5wcm90b3R5cGUuZGVmaW5lID0gRS5wcm90b3R5cGUubDtcbiAgICBFLnByb3RvdHlwZS51cGdyYWRlID0gRS5wcm90b3R5cGUuaTtcbiAgICBFLnByb3RvdHlwZS5nZXQgPSBFLnByb3RvdHlwZS5nZXQ7XG4gICAgRS5wcm90b3R5cGUud2hlbkRlZmluZWQgPSBFLnByb3RvdHlwZS5tO1xuICAgIEUucHJvdG90eXBlLnBvbHlmaWxsV3JhcEZsdXNoQ2FsbGJhY2sgPSBFLnByb3RvdHlwZS5zO1xuICAgIHZhciBGID0gd2luZG93LkRvY3VtZW50LnByb3RvdHlwZS5jcmVhdGVFbGVtZW50LCBHID0gd2luZG93LkRvY3VtZW50LnByb3RvdHlwZS5jcmVhdGVFbGVtZW50TlMsIGhhID0gd2luZG93LkRvY3VtZW50LnByb3RvdHlwZS5pbXBvcnROb2RlLCBpYSA9IHdpbmRvdy5Eb2N1bWVudC5wcm90b3R5cGUucHJlcGVuZCwgamEgPSB3aW5kb3cuRG9jdW1lbnQucHJvdG90eXBlLmFwcGVuZCwga2EgPSB3aW5kb3cuRG9jdW1lbnRGcmFnbWVudC5wcm90b3R5cGUucHJlcGVuZCwgbGEgPSB3aW5kb3cuRG9jdW1lbnRGcmFnbWVudC5wcm90b3R5cGUuYXBwZW5kLCBIID0gd2luZG93Lk5vZGUucHJvdG90eXBlLmNsb25lTm9kZSwgSSA9IHdpbmRvdy5Ob2RlLnByb3RvdHlwZS5hcHBlbmRDaGlsZCwgSiA9IHdpbmRvdy5Ob2RlLnByb3RvdHlwZS5pbnNlcnRCZWZvcmUsIEsgPSB3aW5kb3cuTm9kZS5wcm90b3R5cGUucmVtb3ZlQ2hpbGQsIEwgPSB3aW5kb3cuTm9kZS5wcm90b3R5cGUucmVwbGFjZUNoaWxkLCBNID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih3aW5kb3cuTm9kZS5wcm90b3R5cGUsIFwidGV4dENvbnRlbnRcIiksIE4gPSB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuYXR0YWNoU2hhZG93LCBPID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUsIFwiaW5uZXJIVE1MXCIpLCBQID0gd2luZG93LkVsZW1lbnQucHJvdG90eXBlLmdldEF0dHJpYnV0ZSwgUSA9IHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5zZXRBdHRyaWJ1dGUsIFIgPSB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlQXR0cmlidXRlLCBTID0gd2luZG93LkVsZW1lbnQucHJvdG90eXBlLmdldEF0dHJpYnV0ZU5TLCBUID0gd2luZG93LkVsZW1lbnQucHJvdG90eXBlLnNldEF0dHJpYnV0ZU5TLCBVID0gd2luZG93LkVsZW1lbnQucHJvdG90eXBlLnJlbW92ZUF0dHJpYnV0ZU5TLCBtYSA9IHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5pbnNlcnRBZGphY2VudEVsZW1lbnQsIG5hID0gd2luZG93LkVsZW1lbnQucHJvdG90eXBlLmluc2VydEFkamFjZW50SFRNTCwgb2EgPSB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUucHJlcGVuZCwgcGEgPSB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuYXBwZW5kLCBWID0gd2luZG93LkVsZW1lbnQucHJvdG90eXBlLmJlZm9yZSwgcWEgPSB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuYWZ0ZXIsIHJhID0gd2luZG93LkVsZW1lbnQucHJvdG90eXBlLnJlcGxhY2VXaXRoLCBzYSA9IHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5yZW1vdmUsIHRhID0gd2luZG93LkhUTUxFbGVtZW50LCBXID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih3aW5kb3cuSFRNTEVsZW1lbnQucHJvdG90eXBlLCBcImlubmVySFRNTFwiKSwgdWEgPSB3aW5kb3cuSFRNTEVsZW1lbnQucHJvdG90eXBlLmluc2VydEFkamFjZW50RWxlbWVudCwgdmEgPSB3aW5kb3cuSFRNTEVsZW1lbnQucHJvdG90eXBlLmluc2VydEFkamFjZW50SFRNTDtcbiAgICB2YXIgd2EgPSBuZXcgZnVuY3Rpb24gKCkgeyB9O1xuICAgIGZ1bmN0aW9uIHhhKCkge1xuICAgICAgICB2YXIgYSA9IFg7XG4gICAgICAgIHdpbmRvdy5IVE1MRWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGIoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGIgPSB0aGlzLmNvbnN0cnVjdG9yLCBjID0gYS5nLmdldChiKTtcbiAgICAgICAgICAgICAgICBpZiAoIWMpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFwiVGhlIGN1c3RvbSBlbGVtZW50IGJlaW5nIGNvbnN0cnVjdGVkIHdhcyBub3QgcmVnaXN0ZXJlZCB3aXRoIGBjdXN0b21FbGVtZW50c2AuXCIpO1xuICAgICAgICAgICAgICAgIHZhciBlID0gYy5jb25zdHJ1Y3Rpb25TdGFjaztcbiAgICAgICAgICAgICAgICBpZiAoMCA9PT0gZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlID0gRi5jYWxsKGRvY3VtZW50LCBjLmxvY2FsTmFtZSksIE9iamVjdC5zZXRQcm90b3R5cGVPZihlLCBiLnByb3RvdHlwZSksIGUuX19DRV9zdGF0ZSA9IDEsIGUuX19DRV9kZWZpbml0aW9uID0gYywgdyhhLCBlKSwgZTtcbiAgICAgICAgICAgICAgICBjID0gZS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIHZhciBmID0gZVtjXTtcbiAgICAgICAgICAgICAgICBpZiAoZiA9PT0gd2EpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFwiVGhlIEhUTUxFbGVtZW50IGNvbnN0cnVjdG9yIHdhcyBlaXRoZXIgY2FsbGVkIHJlZW50cmFudGx5IGZvciB0aGlzIGNvbnN0cnVjdG9yIG9yIGNhbGxlZCBtdWx0aXBsZSB0aW1lcy5cIik7XG4gICAgICAgICAgICAgICAgZVtjXSA9IHdhO1xuICAgICAgICAgICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihmLCBiLnByb3RvdHlwZSk7XG4gICAgICAgICAgICAgICAgdyhhLCBmKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGIucHJvdG90eXBlID0gdGEucHJvdG90eXBlO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGIucHJvdG90eXBlLCBcImNvbnN0cnVjdG9yXCIsIHsgd3JpdGFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCBlbnVtZXJhYmxlOiAhMSwgdmFsdWU6IGIgfSk7XG4gICAgICAgICAgICByZXR1cm4gYjtcbiAgICAgICAgfSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBZKGEsIGIsIGQpIHsgZnVuY3Rpb24gYyhiKSB7IHJldHVybiBmdW5jdGlvbiAoZCkgeyBmb3IgKHZhciBlID0gW10sIGMgPSAwOyBjIDwgYXJndW1lbnRzLmxlbmd0aDsgKytjKVxuICAgICAgICBlW2NdID0gYXJndW1lbnRzW2NdOyBjID0gW107IGZvciAodmFyIGYgPSBbXSwgbSA9IDA7IG0gPCBlLmxlbmd0aDsgbSsrKSB7XG4gICAgICAgIHZhciBxID0gZVttXTtcbiAgICAgICAgcSBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgbChxKSAmJiBmLnB1c2gocSk7XG4gICAgICAgIGlmIChxIGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudClcbiAgICAgICAgICAgIGZvciAocSA9IHEuZmlyc3RDaGlsZDsgcTsgcSA9IHEubmV4dFNpYmxpbmcpXG4gICAgICAgICAgICAgICAgYy5wdXNoKHEpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjLnB1c2gocSk7XG4gICAgfSBiLmFwcGx5KHRoaXMsIGUpOyBmb3IgKGUgPSAwOyBlIDwgZi5sZW5ndGg7IGUrKylcbiAgICAgICAgeihhLCBmW2VdKTsgaWYgKGwodGhpcykpXG4gICAgICAgIGZvciAoZSA9IDA7IGUgPCBjLmxlbmd0aDsgZSsrKVxuICAgICAgICAgICAgZiA9IGNbZV0sIGYgaW5zdGFuY2VvZiBFbGVtZW50ICYmIHgoYSwgZik7IH07IH0gdm9pZCAwICE9PSBkLmggJiYgKGIucHJlcGVuZCA9IGMoZC5oKSk7IHZvaWQgMCAhPT0gZC5hcHBlbmQgJiYgKGIuYXBwZW5kID0gYyhkLmFwcGVuZCkpOyB9XG4gICAgZnVuY3Rpb24geWEoKSB7XG4gICAgICAgIHZhciBhID0gWDtcbiAgICAgICAgcihEb2N1bWVudC5wcm90b3R5cGUsIFwiY3JlYXRlRWxlbWVudFwiLCBmdW5jdGlvbiAoYikgeyBpZiAodGhpcy5fX0NFX2hhc1JlZ2lzdHJ5KSB7XG4gICAgICAgICAgICB2YXIgZCA9IGEuYS5nZXQoYik7XG4gICAgICAgICAgICBpZiAoZClcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGQuY29uc3RydWN0b3JGdW5jdGlvbjtcbiAgICAgICAgfSBiID0gRi5jYWxsKHRoaXMsIGIpOyB3KGEsIGIpOyByZXR1cm4gYjsgfSk7XG4gICAgICAgIHIoRG9jdW1lbnQucHJvdG90eXBlLCBcImltcG9ydE5vZGVcIiwgZnVuY3Rpb24gKGIsIGQpIHsgYiA9IGhhLmNhbGwodGhpcywgYiwgISFkKTsgdGhpcy5fX0NFX2hhc1JlZ2lzdHJ5ID8gQShhLCBiKSA6IHYoYSwgYik7IHJldHVybiBiOyB9KTtcbiAgICAgICAgcihEb2N1bWVudC5wcm90b3R5cGUsIFwiY3JlYXRlRWxlbWVudE5TXCIsIGZ1bmN0aW9uIChiLCBkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fX0NFX2hhc1JlZ2lzdHJ5ICYmIChudWxsID09PSBiIHx8IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiID09PSBiKSkge1xuICAgICAgICAgICAgICAgIHZhciBjID0gYS5hLmdldChkKTtcbiAgICAgICAgICAgICAgICBpZiAoYylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBjLmNvbnN0cnVjdG9yRnVuY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiID0gRy5jYWxsKHRoaXMsIGIsIGQpO1xuICAgICAgICAgICAgdyhhLCBiKTtcbiAgICAgICAgICAgIHJldHVybiBiO1xuICAgICAgICB9KTtcbiAgICAgICAgWShhLCBEb2N1bWVudC5wcm90b3R5cGUsIHsgaDogaWEsIGFwcGVuZDogamEgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHphKCkge1xuICAgICAgICBmdW5jdGlvbiBhKGEsIGMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGEsIFwidGV4dENvbnRlbnRcIiwgeyBlbnVtZXJhYmxlOiBjLmVudW1lcmFibGUsIGNvbmZpZ3VyYWJsZTogITAsIGdldDogYy5nZXQsIHNldDogZnVuY3Rpb24gKGEpIHsgaWYgKHRoaXMubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKVxuICAgICAgICAgICAgICAgIGMuc2V0LmNhbGwodGhpcywgYSk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgZCA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlID0gdGhpcy5jaGlsZE5vZGVzLCBrID0gZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGlmICgwIDwgayAmJiBsKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkID0gQXJyYXkoayk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBoID0gMDsgaCA8IGs7IGgrKylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkW2hdID0gZVtoXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjLnNldC5jYWxsKHRoaXMsIGEpO1xuICAgICAgICAgICAgICAgIGlmIChkKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGEgPSAwOyBhIDwgZC5sZW5ndGg7IGErKylcbiAgICAgICAgICAgICAgICAgICAgICAgIHooYiwgZFthXSk7XG4gICAgICAgICAgICB9IH0gfSk7IH1cbiAgICAgICAgdmFyIGIgPSBYO1xuICAgICAgICByKE5vZGUucHJvdG90eXBlLCBcImluc2VydEJlZm9yZVwiLCBmdW5jdGlvbiAoYSwgYykge1xuICAgICAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBEb2N1bWVudEZyYWdtZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGUgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkoYS5jaGlsZE5vZGVzKTtcbiAgICAgICAgICAgICAgICBhID0gSi5jYWxsKHRoaXMsIGEsIGMpO1xuICAgICAgICAgICAgICAgIGlmIChsKHRoaXMpKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGMgPSAwOyBjIDwgZS5sZW5ndGg7IGMrKylcbiAgICAgICAgICAgICAgICAgICAgICAgIHgoYiwgZVtjXSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlID0gbChhKTtcbiAgICAgICAgICAgIGMgPSBKLmNhbGwodGhpcywgYSwgYyk7XG4gICAgICAgICAgICBlICYmIHooYiwgYSk7XG4gICAgICAgICAgICBsKHRoaXMpICYmIHgoYiwgYSk7XG4gICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfSk7XG4gICAgICAgIHIoTm9kZS5wcm90b3R5cGUsIFwiYXBwZW5kQ2hpbGRcIiwgZnVuY3Rpb24gKGEpIHsgaWYgKGEgaW5zdGFuY2VvZiBEb2N1bWVudEZyYWdtZW50KSB7XG4gICAgICAgICAgICB2YXIgYyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseShhLmNoaWxkTm9kZXMpO1xuICAgICAgICAgICAgYSA9IEkuY2FsbCh0aGlzLCBhKTtcbiAgICAgICAgICAgIGlmIChsKHRoaXMpKVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGUgPSAwOyBlIDwgYy5sZW5ndGg7IGUrKylcbiAgICAgICAgICAgICAgICAgICAgeChiLCBjW2VdKTtcbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9IGMgPSBsKGEpOyBlID0gSS5jYWxsKHRoaXMsIGEpOyBjICYmIHooYiwgYSk7IGwodGhpcykgJiYgeChiLCBhKTsgcmV0dXJuIGU7IH0pO1xuICAgICAgICByKE5vZGUucHJvdG90eXBlLCBcImNsb25lTm9kZVwiLCBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgYSA9IEguY2FsbCh0aGlzLCAhIWEpO1xuICAgICAgICAgICAgdGhpcy5vd25lckRvY3VtZW50Ll9fQ0VfaGFzUmVnaXN0cnkgPyBBKGIsIGEpIDogdihiLCBhKTtcbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9KTtcbiAgICAgICAgcihOb2RlLnByb3RvdHlwZSwgXCJyZW1vdmVDaGlsZFwiLCBmdW5jdGlvbiAoYSkgeyB2YXIgYyA9IGwoYSksIGUgPSBLLmNhbGwodGhpcywgYSk7IGMgJiYgeihiLCBhKTsgcmV0dXJuIGU7IH0pO1xuICAgICAgICByKE5vZGUucHJvdG90eXBlLCBcInJlcGxhY2VDaGlsZFwiLCBmdW5jdGlvbiAoYSwgYykgeyBpZiAoYSBpbnN0YW5jZW9mIERvY3VtZW50RnJhZ21lbnQpIHtcbiAgICAgICAgICAgIHZhciBlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGEuY2hpbGROb2Rlcyk7XG4gICAgICAgICAgICBhID0gTC5jYWxsKHRoaXMsIGEsIGMpO1xuICAgICAgICAgICAgaWYgKGwodGhpcykpXG4gICAgICAgICAgICAgICAgZm9yICh6KGIsIGMpLCBjID0gMDsgYyA8IGUubGVuZ3RoOyBjKyspXG4gICAgICAgICAgICAgICAgICAgIHgoYiwgZVtjXSk7XG4gICAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgfSBlID0gbChhKTsgdmFyIGYgPSBMLmNhbGwodGhpcywgYSwgYyksIGQgPSBsKHRoaXMpOyBkICYmIHooYiwgYyk7IGUgJiYgeihiLCBhKTsgZCAmJiB4KGIsIGEpOyByZXR1cm4gZjsgfSk7XG4gICAgICAgIE0gJiYgTS5nZXQgPyBhKE5vZGUucHJvdG90eXBlLCBNKSA6IGNhKGIsIGZ1bmN0aW9uIChiKSB7XG4gICAgICAgICAgICBhKGIsIHsgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBhID0gW10sIGIgPSAwOyBiIDwgdGhpcy5jaGlsZE5vZGVzLmxlbmd0aDsgYisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZiA9IHRoaXMuY2hpbGROb2Rlc1tiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGYubm9kZVR5cGUgIT09IE5vZGUuQ09NTUVOVF9OT0RFICYmIGEucHVzaChmLnRleHRDb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5qb2luKFwiXCIpO1xuICAgICAgICAgICAgICAgIH0sIHNldDogZnVuY3Rpb24gKGEpIHsgZm9yICg7IHRoaXMuZmlyc3RDaGlsZDspXG4gICAgICAgICAgICAgICAgICAgIEsuY2FsbCh0aGlzLCB0aGlzLmZpcnN0Q2hpbGQpOyBudWxsICE9IGEgJiYgXCJcIiAhPT0gYSAmJiBJLmNhbGwodGhpcywgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYSkpOyB9IH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gQWEoYSkge1xuICAgICAgICBmdW5jdGlvbiBiKGIpIHsgcmV0dXJuIGZ1bmN0aW9uIChlKSB7IGZvciAodmFyIGMgPSBbXSwgZCA9IDA7IGQgPCBhcmd1bWVudHMubGVuZ3RoOyArK2QpXG4gICAgICAgICAgICBjW2RdID0gYXJndW1lbnRzW2RdOyBkID0gW107IGZvciAodmFyIGsgPSBbXSwgaCA9IDA7IGggPCBjLmxlbmd0aDsgaCsrKSB7XG4gICAgICAgICAgICB2YXIgbSA9IGNbaF07XG4gICAgICAgICAgICBtIGluc3RhbmNlb2YgRWxlbWVudCAmJiBsKG0pICYmIGsucHVzaChtKTtcbiAgICAgICAgICAgIGlmIChtIGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudClcbiAgICAgICAgICAgICAgICBmb3IgKG0gPSBtLmZpcnN0Q2hpbGQ7IG07IG0gPSBtLm5leHRTaWJsaW5nKVxuICAgICAgICAgICAgICAgICAgICBkLnB1c2gobSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZC5wdXNoKG0pO1xuICAgICAgICB9IGIuYXBwbHkodGhpcywgYyk7IGZvciAoYyA9IDA7IGMgPCBrLmxlbmd0aDsgYysrKVxuICAgICAgICAgICAgeihhLCBrW2NdKTsgaWYgKGwodGhpcykpXG4gICAgICAgICAgICBmb3IgKGMgPSAwOyBjIDwgZC5sZW5ndGg7IGMrKylcbiAgICAgICAgICAgICAgICBrID0gZFtjXSwgayBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgeChhLCBrKTsgfTsgfVxuICAgICAgICB2YXIgZCA9IEVsZW1lbnQucHJvdG90eXBlO1xuICAgICAgICB2b2lkIDAgIT09IFYgJiYgKGQuYmVmb3JlID0gYihWKSk7XG4gICAgICAgIHZvaWQgMCAhPT0gViAmJiAoZC5hZnRlciA9IGIocWEpKTtcbiAgICAgICAgdm9pZCAwICE9PSByYSAmJlxuICAgICAgICAgICAgcihkLCBcInJlcGxhY2VXaXRoXCIsIGZ1bmN0aW9uIChiKSB7IGZvciAodmFyIGUgPSBbXSwgYyA9IDA7IGMgPCBhcmd1bWVudHMubGVuZ3RoOyArK2MpXG4gICAgICAgICAgICAgICAgZVtjXSA9IGFyZ3VtZW50c1tjXTsgYyA9IFtdOyBmb3IgKHZhciBkID0gW10sIGsgPSAwOyBrIDwgZS5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgIHZhciBoID0gZVtrXTtcbiAgICAgICAgICAgICAgICBoIGluc3RhbmNlb2YgRWxlbWVudCAmJiBsKGgpICYmIGQucHVzaChoKTtcbiAgICAgICAgICAgICAgICBpZiAoaCBpbnN0YW5jZW9mIERvY3VtZW50RnJhZ21lbnQpXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaCA9IGguZmlyc3RDaGlsZDsgaDsgaCA9IGgubmV4dFNpYmxpbmcpXG4gICAgICAgICAgICAgICAgICAgICAgICBjLnB1c2goaCk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjLnB1c2goaCk7XG4gICAgICAgICAgICB9IGsgPSBsKHRoaXMpOyByYS5hcHBseSh0aGlzLCBlKTsgZm9yIChlID0gMDsgZSA8IGQubGVuZ3RoOyBlKyspXG4gICAgICAgICAgICAgICAgeihhLCBkW2VdKTsgaWYgKGspXG4gICAgICAgICAgICAgICAgZm9yICh6KGEsIHRoaXMpLCBlID0gMDsgZSA8IGMubGVuZ3RoOyBlKyspXG4gICAgICAgICAgICAgICAgICAgIGQgPSBjW2VdLCBkIGluc3RhbmNlb2YgRWxlbWVudCAmJiB4KGEsIGQpOyB9KTtcbiAgICAgICAgdm9pZCAwICE9PSBzYSAmJiByKGQsIFwicmVtb3ZlXCIsIGZ1bmN0aW9uICgpIHsgdmFyIGIgPSBsKHRoaXMpOyBzYS5jYWxsKHRoaXMpOyBiICYmIHooYSwgdGhpcyk7IH0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBCYSgpIHtcbiAgICAgICAgZnVuY3Rpb24gYShhLCBiKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhLCBcImlubmVySFRNTFwiLCB7IGVudW1lcmFibGU6IGIuZW51bWVyYWJsZSwgY29uZmlndXJhYmxlOiAhMCwgZ2V0OiBiLmdldCwgc2V0OiBmdW5jdGlvbiAoYSkgeyB2YXIgZSA9IHRoaXMsIGQgPSB2b2lkIDA7IGwodGhpcykgJiYgKGQgPSBbXSwgcCh0aGlzLCBmdW5jdGlvbiAoYSkgeyBhICE9PSBlICYmIGQucHVzaChhKTsgfSkpOyBiLnNldC5jYWxsKHRoaXMsIGEpOyBpZiAoZClcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBmID0gMDsgZiA8IGQubGVuZ3RoOyBmKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHQgPSBkW2ZdO1xuICAgICAgICAgICAgICAgICAgICAxID09PSB0Ll9fQ0Vfc3RhdGUgJiYgYy5kaXNjb25uZWN0ZWRDYWxsYmFjayh0KTtcbiAgICAgICAgICAgICAgICB9IHRoaXMub3duZXJEb2N1bWVudC5fX0NFX2hhc1JlZ2lzdHJ5ID8gQShjLCB0aGlzKSA6IHYoYywgdGhpcyk7IHJldHVybiBhOyB9IH0pOyB9XG4gICAgICAgIGZ1bmN0aW9uIGIoYSwgYikgeyByKGEsIFwiaW5zZXJ0QWRqYWNlbnRFbGVtZW50XCIsIGZ1bmN0aW9uIChhLCBlKSB7IHZhciBkID0gbChlKTsgYSA9IGIuY2FsbCh0aGlzLCBhLCBlKTsgZCAmJiB6KGMsIGUpOyBsKGEpICYmIHgoYywgZSk7IHJldHVybiBhOyB9KTsgfVxuICAgICAgICBmdW5jdGlvbiBkKGEsIGIpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGUoYSwgYikgeyBmb3IgKHZhciBlID0gW107IGEgIT09IGI7IGEgPSBhLm5leHRTaWJsaW5nKVxuICAgICAgICAgICAgICAgIGUucHVzaChhKTsgZm9yIChiID0gMDsgYiA8IGUubGVuZ3RoOyBiKyspXG4gICAgICAgICAgICAgICAgQShjLCBlW2JdKTsgfVxuICAgICAgICAgICAgcihhLCBcImluc2VydEFkamFjZW50SFRNTFwiLCBmdW5jdGlvbiAoYSwgYykge1xuICAgICAgICAgICAgICAgIGEgPSBhLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgaWYgKFwiYmVmb3JlYmVnaW5cIiA9PT0gYSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IHRoaXMucHJldmlvdXNTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICBiLmNhbGwodGhpcywgYSwgYyk7XG4gICAgICAgICAgICAgICAgICAgIGUoZCB8fCB0aGlzLnBhcmVudE5vZGUuZmlyc3RDaGlsZCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFwiYWZ0ZXJiZWdpblwiID09PSBhKVxuICAgICAgICAgICAgICAgICAgICBkID0gdGhpcy5maXJzdENoaWxkLCBiLmNhbGwodGhpcywgYSwgYyksIGUodGhpcy5maXJzdENoaWxkLCBkKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChcImJlZm9yZWVuZFwiID09PSBhKVxuICAgICAgICAgICAgICAgICAgICBkID0gdGhpcy5sYXN0Q2hpbGQsIGIuY2FsbCh0aGlzLCBhLCBjKSwgZShkIHx8IHRoaXMuZmlyc3RDaGlsZCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoXCJhZnRlcmVuZFwiID09PSBhKVxuICAgICAgICAgICAgICAgICAgICBkID0gdGhpcy5uZXh0U2libGluZywgYi5jYWxsKHRoaXMsIGEsIGMpLCBlKHRoaXMubmV4dFNpYmxpbmcsIGQpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiVGhlIHZhbHVlIHByb3ZpZGVkIChcIiArIFN0cmluZyhhKSArIFwiKSBpcyBub3Qgb25lIG9mICdiZWZvcmViZWdpbicsICdhZnRlcmJlZ2luJywgJ2JlZm9yZWVuZCcsIG9yICdhZnRlcmVuZCcuXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGMgPSBYO1xuICAgICAgICBOICYmIHIoRWxlbWVudC5wcm90b3R5cGUsIFwiYXR0YWNoU2hhZG93XCIsIGZ1bmN0aW9uIChhKSB7IGEgPSBOLmNhbGwodGhpcywgYSk7IHZhciBiID0gYzsgaWYgKGIuYiAmJiAhYS5fX0NFX3BhdGNoZWQpIHtcbiAgICAgICAgICAgIGEuX19DRV9wYXRjaGVkID0gITA7XG4gICAgICAgICAgICBmb3IgKHZhciBlID0gMDsgZSA8IGIuYy5sZW5ndGg7IGUrKylcbiAgICAgICAgICAgICAgICBiLmNbZV0oYSk7XG4gICAgICAgIH0gcmV0dXJuIHRoaXMuX19DRV9zaGFkb3dSb290ID0gYTsgfSk7XG4gICAgICAgIE8gJiYgTy5nZXQgPyBhKEVsZW1lbnQucHJvdG90eXBlLCBPKSA6IFcgJiYgVy5nZXQgPyBhKEhUTUxFbGVtZW50LnByb3RvdHlwZSwgVykgOiBkYShjLCBmdW5jdGlvbiAoYikge1xuICAgICAgICAgICAgYShiLCB7IGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIEguY2FsbCh0aGlzLCAhMCkuaW5uZXJIVE1MOyB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKGEpIHsgdmFyIGIgPSBcInRlbXBsYXRlXCIgPT09IHRoaXMubG9jYWxOYW1lLCBjID0gYiA/IHRoaXMuY29udGVudCA6IHRoaXMsIGUgPSBHLmNhbGwoZG9jdW1lbnQsIHRoaXMubmFtZXNwYWNlVVJJLCB0aGlzLmxvY2FsTmFtZSk7IGZvciAoZS5pbm5lckhUTUwgPSBhOyAwIDwgYy5jaGlsZE5vZGVzLmxlbmd0aDspXG4gICAgICAgICAgICAgICAgICAgIEsuY2FsbChjLCBjLmNoaWxkTm9kZXNbMF0pOyBmb3IgKGEgPSBiID8gZS5jb250ZW50IDogZTsgMCA8IGEuY2hpbGROb2Rlcy5sZW5ndGg7KVxuICAgICAgICAgICAgICAgICAgICBJLmNhbGwoYywgYS5jaGlsZE5vZGVzWzBdKTsgfSB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHIoRWxlbWVudC5wcm90b3R5cGUsIFwic2V0QXR0cmlidXRlXCIsIGZ1bmN0aW9uIChhLCBiKSB7IGlmICgxICE9PSB0aGlzLl9fQ0Vfc3RhdGUpXG4gICAgICAgICAgICByZXR1cm4gUS5jYWxsKHRoaXMsIGEsIGIpOyB2YXIgZSA9IFAuY2FsbCh0aGlzLCBhKTsgUS5jYWxsKHRoaXMsIGEsIGIpOyBiID0gUC5jYWxsKHRoaXMsIGEpOyBjLmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayh0aGlzLCBhLCBlLCBiLCBudWxsKTsgfSk7XG4gICAgICAgIHIoRWxlbWVudC5wcm90b3R5cGUsIFwic2V0QXR0cmlidXRlTlNcIiwgZnVuY3Rpb24gKGEsIGIsIGQpIHsgaWYgKDEgIT09IHRoaXMuX19DRV9zdGF0ZSlcbiAgICAgICAgICAgIHJldHVybiBULmNhbGwodGhpcywgYSwgYiwgZCk7IHZhciBlID0gUy5jYWxsKHRoaXMsIGEsIGIpOyBULmNhbGwodGhpcywgYSwgYiwgZCk7IGQgPSBTLmNhbGwodGhpcywgYSwgYik7IGMuYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKHRoaXMsIGIsIGUsIGQsIGEpOyB9KTtcbiAgICAgICAgcihFbGVtZW50LnByb3RvdHlwZSwgXCJyZW1vdmVBdHRyaWJ1dGVcIiwgZnVuY3Rpb24gKGEpIHsgaWYgKDEgIT09IHRoaXMuX19DRV9zdGF0ZSlcbiAgICAgICAgICAgIHJldHVybiBSLmNhbGwodGhpcywgYSk7IHZhciBiID0gUC5jYWxsKHRoaXMsIGEpOyBSLmNhbGwodGhpcywgYSk7IG51bGwgIT09IGIgJiYgYy5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sodGhpcywgYSwgYiwgbnVsbCwgbnVsbCk7IH0pO1xuICAgICAgICByKEVsZW1lbnQucHJvdG90eXBlLCBcInJlbW92ZUF0dHJpYnV0ZU5TXCIsIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICBpZiAoMSAhPT0gdGhpcy5fX0NFX3N0YXRlKVxuICAgICAgICAgICAgICAgIHJldHVybiBVLmNhbGwodGhpcywgYSwgYik7XG4gICAgICAgICAgICB2YXIgZCA9IFMuY2FsbCh0aGlzLCBhLCBiKTtcbiAgICAgICAgICAgIFUuY2FsbCh0aGlzLCBhLCBiKTtcbiAgICAgICAgICAgIHZhciBlID0gUy5jYWxsKHRoaXMsIGEsIGIpO1xuICAgICAgICAgICAgZCAhPT0gZSAmJiBjLmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayh0aGlzLCBiLCBkLCBlLCBhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHVhID8gYihIVE1MRWxlbWVudC5wcm90b3R5cGUsIHVhKSA6IG1hID8gYihFbGVtZW50LnByb3RvdHlwZSwgbWEpIDogY29uc29sZS53YXJuKFwiQ3VzdG9tIEVsZW1lbnRzOiBgRWxlbWVudCNpbnNlcnRBZGphY2VudEVsZW1lbnRgIHdhcyBub3QgcGF0Y2hlZC5cIik7XG4gICAgICAgIHZhID8gZChIVE1MRWxlbWVudC5wcm90b3R5cGUsIHZhKSA6IG5hID8gZChFbGVtZW50LnByb3RvdHlwZSwgbmEpIDogY29uc29sZS53YXJuKFwiQ3VzdG9tIEVsZW1lbnRzOiBgRWxlbWVudCNpbnNlcnRBZGphY2VudEhUTUxgIHdhcyBub3QgcGF0Y2hlZC5cIik7XG4gICAgICAgIFkoYywgRWxlbWVudC5wcm90b3R5cGUsIHsgaDogb2EsIGFwcGVuZDogcGEgfSk7XG4gICAgICAgIEFhKGMpO1xuICAgIH1cbiAgICB2YXIgWiA9IHdpbmRvdy5jdXN0b21FbGVtZW50cztcbiAgICBpZiAoIVogfHwgWi5mb3JjZVBvbHlmaWxsIHx8IFwiZnVuY3Rpb25cIiAhPSB0eXBlb2YgWi5kZWZpbmUgfHwgXCJmdW5jdGlvblwiICE9IHR5cGVvZiBaLmdldCkge1xuICAgICAgICB2YXIgWCA9IG5ldyB1O1xuICAgICAgICB4YSgpO1xuICAgICAgICB5YSgpO1xuICAgICAgICBZKFgsIERvY3VtZW50RnJhZ21lbnQucHJvdG90eXBlLCB7IGg6IGthLCBhcHBlbmQ6IGxhIH0pO1xuICAgICAgICB6YSgpO1xuICAgICAgICBCYSgpO1xuICAgICAgICBkb2N1bWVudC5fX0NFX2hhc1JlZ2lzdHJ5ID0gITA7XG4gICAgICAgIHZhciBjdXN0b21FbGVtZW50cyA9IG5ldyBFKFgpO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LCBcImN1c3RvbUVsZW1lbnRzXCIsIHsgY29uZmlndXJhYmxlOiAhMCwgZW51bWVyYWJsZTogITAsIHZhbHVlOiBjdXN0b21FbGVtZW50cyB9KTtcbiAgICB9XG59KS5jYWxsKHNlbGYpO1xuLy8gUG9seWZpbGwgZG9jdW1lbnQuYmFzZVVSSVxuaWYgKHR5cGVvZiBkb2N1bWVudC5iYXNlVVJJICE9PSAnc3RyaW5nJykge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEb2N1bWVudC5wcm90b3R5cGUsICdiYXNlVVJJJywge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdiYXNlJyk7XG4gICAgICAgICAgICBpZiAoYmFzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBiYXNlLmhyZWY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuVVJMO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4vLyBQb2x5ZmlsbCBDdXN0b21FdmVudFxuaWYgKHR5cGVvZiB3aW5kb3cuQ3VzdG9tRXZlbnQgIT09ICdmdW5jdGlvbicpIHtcbiAgICB3aW5kb3cuQ3VzdG9tRXZlbnQgPSBmdW5jdGlvbiBDdXN0b21FdmVudChldmVudCwgcGFyYW1zKSB7XG4gICAgICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7IGJ1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlOiBmYWxzZSwgZGV0YWlsOiB1bmRlZmluZWQgfTtcbiAgICAgICAgdmFyIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgICAgICBldnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xuICAgICAgICByZXR1cm4gZXZ0O1xuICAgIH07XG4gICAgd2luZG93LkN1c3RvbUV2ZW50LnByb3RvdHlwZSA9IHdpbmRvdy5FdmVudC5wcm90b3R5cGU7XG59XG4vLyBFdmVudC5jb21wb3NlZFBhdGhcbihmdW5jdGlvbiAoRSwgZCwgdykge1xuICAgIGlmICghRS5jb21wb3NlZFBhdGgpIHtcbiAgICAgICAgRS5jb21wb3NlZFBhdGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wYXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSB0aGlzLnRhcmdldDtcbiAgICAgICAgICAgIHRoaXMucGF0aCA9IFtdO1xuICAgICAgICAgICAgd2hpbGUgKHRhcmdldC5wYXJlbnROb2RlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXRoLnB1c2godGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucGF0aC5wdXNoKGQsIHcpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGF0aDtcbiAgICAgICAgfTtcbiAgICB9XG59KShFdmVudC5wcm90b3R5cGUsIGRvY3VtZW50LCB3aW5kb3cpO1xuLyohXG5FbGVtZW50LmNsb3Nlc3QgYW5kIEVsZW1lbnQubWF0Y2hlc1xuaHR0cHM6Ly9naXRodWIuY29tL2pvbmF0aGFudG5lYWwvY2xvc2VzdFxuQ3JlYXRpdmUgQ29tbW9ucyBaZXJvIHYxLjAgVW5pdmVyc2FsXG4qL1xuKGZ1bmN0aW9uIChhKSB7IFwiZnVuY3Rpb25cIiAhPT0gdHlwZW9mIGEubWF0Y2hlcyAmJiAoYS5tYXRjaGVzID0gYS5tc01hdGNoZXNTZWxlY3RvciB8fCBhLm1vek1hdGNoZXNTZWxlY3RvciB8fCBhLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fCBmdW5jdGlvbiAoYSkgeyBhID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKGEpOyBmb3IgKHZhciBiID0gMDsgYVtiXSAmJiBhW2JdICE9PSB0aGlzOylcbiAgICArK2I7IHJldHVybiAhIWFbYl07IH0pOyBcImZ1bmN0aW9uXCIgIT09IHR5cGVvZiBhLmNsb3Nlc3QgJiYgKGEuY2xvc2VzdCA9IGZ1bmN0aW9uIChhKSB7IGZvciAodmFyIGIgPSB0aGlzOyBiICYmIDEgPT09IGIubm9kZVR5cGU7KSB7XG4gICAgaWYgKGIubWF0Y2hlcyhhKSlcbiAgICAgICAgcmV0dXJuIGI7XG4gICAgYiA9IGIucGFyZW50Tm9kZTtcbn0gcmV0dXJuIG51bGw7IH0pOyB9KSh3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUpO1xuLyohXG5FbGVtZW50LmdldFJvb3ROb2RlKClcbiovXG4oZnVuY3Rpb24gKGMpIHsgZnVuY3Rpb24gZChhKSB7IGEgPSBiKGEpOyByZXR1cm4gMTEgPT09IGEubm9kZVR5cGUgPyBkKGEuaG9zdCkgOiBhOyB9IGZ1bmN0aW9uIGIoYSkgeyByZXR1cm4gYS5wYXJlbnROb2RlID8gYihhLnBhcmVudE5vZGUpIDogYTsgfSBcImZ1bmN0aW9uXCIgIT09IHR5cGVvZiBjLmdldFJvb3ROb2RlICYmIChjLmdldFJvb3ROb2RlID0gZnVuY3Rpb24gKGEpIHsgcmV0dXJuIGEgJiYgYS5jb21wb3NlZCA/IGQodGhpcykgOiBiKHRoaXMpOyB9KTsgfSkoRWxlbWVudC5wcm90b3R5cGUpO1xuLyohXG5FbGVtZW50LnJlbW92ZSgpXG4qL1xuKGZ1bmN0aW9uIChiKSB7IGIuZm9yRWFjaChmdW5jdGlvbiAoYSkgeyBhLmhhc093blByb3BlcnR5KFwicmVtb3ZlXCIpIHx8IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhLCBcInJlbW92ZVwiLCB7IGNvbmZpZ3VyYWJsZTogITAsIGVudW1lcmFibGU6ICEwLCB3cml0YWJsZTogITAsIHZhbHVlOiBmdW5jdGlvbiAoKSB7IG51bGwgIT09IHRoaXMucGFyZW50Tm9kZSAmJiB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7IH0gfSk7IH0pOyB9KShbRWxlbWVudC5wcm90b3R5cGUsIENoYXJhY3RlckRhdGEucHJvdG90eXBlLCBEb2N1bWVudFR5cGUucHJvdG90eXBlXSk7XG4vKiFcbkVsZW1lbnQuY2xhc3NMaXN0XG4qL1xuIWZ1bmN0aW9uIChlKSB7ICdjbGFzc0xpc3QnIGluIGUgfHwgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIFwiY2xhc3NMaXN0XCIsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHZhciBlID0gdGhpcywgdCA9IChlLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpLnJlcGxhY2UoL15cXHMrfFxccyQvZywgXCJcIikuc3BsaXQoL1xccysvZyk7IGZ1bmN0aW9uIG4oKSB7IHQubGVuZ3RoID4gMCA/IGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgdC5qb2luKFwiIFwiKSkgOiBlLnJlbW92ZUF0dHJpYnV0ZShcImNsYXNzXCIpOyB9IHJldHVybiBcIlwiID09PSB0WzBdICYmIHQuc3BsaWNlKDAsIDEpLCB0LnRvZ2dsZSA9IGZ1bmN0aW9uIChlLCBpKSB7IHZvaWQgMCAhPT0gaSA/IGkgPyB0LmFkZChlKSA6IHQucmVtb3ZlKGUpIDogLTEgIT09IHQuaW5kZXhPZihlKSA/IHQuc3BsaWNlKHQuaW5kZXhPZihlKSwgMSkgOiB0LnB1c2goZSksIG4oKTsgfSwgdC5hZGQgPSBmdW5jdGlvbiAoKSB7IGZvciAodmFyIGUgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyksIGkgPSAwLCBzID0gZS5sZW5ndGg7IGkgPCBzOyBpKyspXG4gICAgICAgIC0xID09PSB0LmluZGV4T2YoZVtpXSkgJiYgdC5wdXNoKGVbaV0pOyBuKCk7IH0sIHQucmVtb3ZlID0gZnVuY3Rpb24gKCkgeyBmb3IgKHZhciBlID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLCBpID0gMCwgcyA9IGUubGVuZ3RoOyBpIDwgczsgaSsrKVxuICAgICAgICAtMSAhPT0gdC5pbmRleE9mKGVbaV0pICYmIHQuc3BsaWNlKHQuaW5kZXhPZihlW2ldKSwgMSk7IG4oKTsgfSwgdC5pdGVtID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIHRbZV07IH0sIHQuY29udGFpbnMgPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gLTEgIT09IHQuaW5kZXhPZihlKTsgfSwgdC5yZXBsYWNlID0gZnVuY3Rpb24gKGUsIGkpIHsgLTEgIT09IHQuaW5kZXhPZihlKSAmJiB0LnNwbGljZSh0LmluZGV4T2YoZSksIDEsIGkpLCBuKCk7IH0sIHQudmFsdWUgPSBlLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIsIHQ7IH0gfSk7IH0oRWxlbWVudC5wcm90b3R5cGUpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==