(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[8],{

/***/ "./node_modules/@ionic/pwa-elements/dist/esm/polyfills/css-shim.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@ionic/pwa-elements/dist/esm/polyfills/css-shim.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
Extremely simple css parser. Intended to be not more than what we need
and definitely not necessarily correct =).
*/
/** @unrestricted */
var StyleNode = /** @class */ (function () {
    function StyleNode() {
        this.start = 0;
        this.end = 0;
        this.previous = null;
        this.parent = null;
        this.rules = null;
        this.parsedCssText = '';
        this.cssText = '';
        this.atRule = false;
        this.type = 0;
        this.keyframesName = '';
        this.selector = '';
        this.parsedSelector = '';
    }
    return StyleNode;
}());
// given a string of css, return a simple rule tree
/**
 * @param {string} text
 * @return {StyleNode}
 */
function parse(text) {
    text = clean(text);
    return parseCss(lex(text), text);
}
// remove stuff we don't care about that may hinder parsing
/**
 * @param {string} cssText
 * @return {string}
 */
function clean(cssText) {
    return cssText.replace(RX.comments, '').replace(RX.port, '');
}
// super simple {...} lexer that returns a node tree
/**
 * @param {string} text
 * @return {StyleNode}
 */
function lex(text) {
    var root = new StyleNode();
    root['start'] = 0;
    root['end'] = text.length;
    var n = root;
    for (var i = 0, l = text.length; i < l; i++) {
        if (text[i] === OPEN_BRACE) {
            if (!n['rules']) {
                n['rules'] = [];
            }
            var p = n;
            var previous = p['rules'][p['rules'].length - 1] || null;
            n = new StyleNode();
            n['start'] = i + 1;
            n['parent'] = p;
            n['previous'] = previous;
            p['rules'].push(n);
        }
        else if (text[i] === CLOSE_BRACE) {
            n['end'] = i + 1;
            n = n['parent'] || root;
        }
    }
    return root;
}
// add selectors/cssText to node tree
/**
 * @param {StyleNode} node
 * @param {string} text
 * @return {StyleNode}
 */
function parseCss(node, text) {
    var t = text.substring(node['start'], node['end'] - 1);
    node['parsedCssText'] = node['cssText'] = t.trim();
    if (node.parent) {
        var ss = node.previous ? node.previous['end'] : node.parent['start'];
        t = text.substring(ss, node['start'] - 1);
        t = _expandUnicodeEscapes(t);
        t = t.replace(RX.multipleSpaces, ' ');
        // TODO(sorvell): ad hoc; make selector include only after last ;
        // helps with mixin syntax
        t = t.substring(t.lastIndexOf(';') + 1);
        var s = node['parsedSelector'] = node['selector'] = t.trim();
        node['atRule'] = (s.indexOf(AT_START) === 0);
        // note, support a subset of rule types...
        if (node['atRule']) {
            if (s.indexOf(MEDIA_START) === 0) {
                node['type'] = types.MEDIA_RULE;
            }
            else if (s.match(RX.keyframesRule)) {
                node['type'] = types.KEYFRAMES_RULE;
                node['keyframesName'] = node['selector'].split(RX.multipleSpaces).pop();
            }
        }
        else {
            if (s.indexOf(VAR_START) === 0) {
                node['type'] = types.MIXIN_RULE;
            }
            else {
                node['type'] = types.STYLE_RULE;
            }
        }
    }
    var r$ = node['rules'];
    if (r$) {
        for (var i = 0, l = r$.length, r = void 0; (i < l) && (r = r$[i]); i++) {
            parseCss(r, text);
        }
    }
    return node;
}
/**
 * conversion of sort unicode escapes with spaces like `\33 ` (and longer) into
 * expanded form that doesn't require trailing space `\000033`
 * @param {string} s
 * @return {string}
 */
function _expandUnicodeEscapes(s) {
    return s.replace(/\\([0-9a-f]{1,6})\s/gi, function () {
        var code = arguments[1], repeat = 6 - code.length;
        while (repeat--) {
            code = '0' + code;
        }
        return '\\' + code;
    });
}
/** @enum {number} */
var types = {
    STYLE_RULE: 1,
    KEYFRAMES_RULE: 7,
    MEDIA_RULE: 4,
    MIXIN_RULE: 1000
};
var OPEN_BRACE = '{';
var CLOSE_BRACE = '}';
// helper regexp's
var RX = {
    comments: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,
    port: /@import[^;]*;/gim,
    customProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,
    mixinProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,
    mixinApply: /@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,
    varApply: /[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,
    keyframesRule: /^@[^\s]*keyframes/,
    multipleSpaces: /\s+/g
};
var VAR_START = '--';
var MEDIA_START = '@media';
var AT_START = '@';
function findRegex(regex, cssText, offset) {
    regex['lastIndex'] = 0;
    var r = cssText.substring(offset).match(regex);
    if (r) {
        var start = offset + r['index'];
        return {
            start: start,
            end: start + r[0].length
        };
    }
    return null;
}
var VAR_USAGE_START = /\bvar\(/;
var VAR_ASSIGN_START = /\B--[\w-]+\s*:/;
var COMMENTS = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim;
var TRAILING_LINES = /^[\t ]+\n/gm;
function resolveVar(props, prop, fallback) {
    if (props[prop]) {
        return props[prop];
    }
    if (fallback) {
        return executeTemplate(fallback, props);
    }
    return '';
}
function findVarEndIndex(cssText, offset) {
    var count = 0;
    var i = offset;
    for (; i < cssText.length; i++) {
        var c = cssText[i];
        if (c === '(') {
            count++;
        }
        else if (c === ')') {
            count--;
            if (count <= 0) {
                return i + 1;
            }
        }
    }
    return i;
}
function parseVar(cssText, offset) {
    var varPos = findRegex(VAR_USAGE_START, cssText, offset);
    if (!varPos) {
        return null;
    }
    var endVar = findVarEndIndex(cssText, varPos.start);
    var varContent = cssText.substring(varPos.end, endVar - 1);
    var _a = varContent.split(','), propName = _a[0], fallback = _a.slice(1);
    return {
        start: varPos.start,
        end: endVar,
        propName: propName.trim(),
        fallback: fallback.length > 0 ? fallback.join(',').trim() : undefined
    };
}
function compileVar(cssText, template, offset) {
    var varMeta = parseVar(cssText, offset);
    if (!varMeta) {
        template.push(cssText.substring(offset, cssText.length));
        return cssText.length;
    }
    var propName = varMeta.propName;
    var fallback = varMeta.fallback != null ? compileTemplate(varMeta.fallback) : undefined;
    template.push(cssText.substring(offset, varMeta.start), function (params) { return resolveVar(params, propName, fallback); });
    return varMeta.end;
}
function executeTemplate(template, props) {
    var final = '';
    for (var i = 0; i < template.length; i++) {
        var s = template[i];
        final += (typeof s === 'string')
            ? s
            : s(props);
    }
    return final;
}
function findEndValue(cssText, offset) {
    var onStr = false;
    var double = false;
    var i = offset;
    for (; i < cssText.length; i++) {
        var c = cssText[i];
        if (onStr) {
            if (double && c === '"') {
                onStr = false;
            }
            if (!double && c === '\'') {
                onStr = false;
            }
        }
        else {
            if (c === '"') {
                onStr = true;
                double = true;
            }
            else if (c === '\'') {
                onStr = true;
                double = false;
            }
            else if (c === ';') {
                return i + 1;
            }
            else if (c === '}') {
                return i;
            }
        }
    }
    return i;
}
function removeCustomAssigns(cssText) {
    var final = '';
    var offset = 0;
    while (true) {
        var assignPos = findRegex(VAR_ASSIGN_START, cssText, offset);
        var start = assignPos ? assignPos.start : cssText.length;
        final += cssText.substring(offset, start);
        if (assignPos) {
            offset = findEndValue(cssText, start);
        }
        else {
            break;
        }
    }
    return final;
}
function compileTemplate(cssText) {
    var index = 0;
    cssText = cssText.replace(COMMENTS, '');
    cssText = removeCustomAssigns(cssText)
        .replace(TRAILING_LINES, '');
    var segments = [];
    while (index < cssText.length) {
        index = compileVar(cssText, segments, index);
    }
    return segments;
}
function resolveValues(selectors) {
    var props = {};
    selectors.forEach(function (selector) {
        selector.declarations.forEach(function (dec) {
            props[dec.prop] = dec.value;
        });
    });
    var propsValues = {};
    var entries = Object.entries(props);
    var _loop_1 = function (i) {
        var dirty = false;
        entries.forEach(function (_a) {
            var key = _a[0], value = _a[1];
            var propValue = executeTemplate(value, propsValues);
            if (propValue !== propsValues[key]) {
                propsValues[key] = propValue;
                dirty = true;
            }
        });
        if (!dirty) {
            return "break";
        }
    };
    for (var i = 0; i < 10; i++) {
        var state_1 = _loop_1(i);
        if (state_1 === "break")
            break;
    }
    return propsValues;
}
function getSelectors(root, index) {
    if (index === void 0) { index = 0; }
    if (!root.rules) {
        return [];
    }
    var selectors = [];
    root.rules
        .filter(function (rule) { return rule.type === types.STYLE_RULE; })
        .forEach(function (rule) {
        var declarations = getDeclarations(rule.cssText);
        if (declarations.length > 0) {
            rule.parsedSelector.split(',').forEach(function (selector) {
                selector = selector.trim();
                selectors.push({
                    selector: selector,
                    declarations: declarations,
                    specificity: computeSpecificity(),
                    nu: index
                });
            });
        }
        index++;
    });
    return selectors;
}
function computeSpecificity(_selector) {
    return 1;
}
var IMPORTANT = '!important';
var FIND_DECLARATIONS = /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};{])+)|\{([^}]*)\}(?:(?=[;\s}])|$))/gm;
function getDeclarations(cssText) {
    var declarations = [];
    var xArray;
    while (xArray = FIND_DECLARATIONS.exec(cssText.trim())) {
        var _a = normalizeValue(xArray[2]), value = _a.value, important = _a.important;
        declarations.push({
            prop: xArray[1].trim(),
            value: compileTemplate(value),
            important: important,
        });
    }
    return declarations;
}
function normalizeValue(value) {
    var regex = /\s+/gim;
    value = value.replace(regex, ' ').trim();
    var important = value.endsWith(IMPORTANT);
    if (important) {
        value = value.substr(0, value.length - IMPORTANT.length).trim();
    }
    return {
        value: value,
        important: important
    };
}
function getActiveSelectors(hostEl, hostScopeMap, globalScopes) {
    // computes the css scopes that might affect this particular element
    // avoiding using spread arrays to avoid ts helper fns when in es5
    var scopes = [];
    var scopesForElement = getScopesForElement(hostScopeMap, hostEl);
    // globalScopes are always took into account
    globalScopes.forEach(function (s) { return scopes.push(s); });
    // the parent scopes are computed by walking parent dom until <html> is reached
    scopesForElement.forEach(function (s) { return scopes.push(s); });
    // each scope might have an array of associated selectors
    // let's flatten the complete array of selectors from all the scopes
    var selectorSet = getSelectorsForScopes(scopes);
    // we filter to only the selectors that matches the hostEl
    var activeSelectors = selectorSet.filter(function (selector) { return matches(hostEl, selector.selector); });
    // sort selectors by specifity
    return sortSelectors(activeSelectors);
}
function getScopesForElement(hostTemplateMap, node) {
    var scopes = [];
    while (node) {
        var scope = hostTemplateMap.get(node);
        if (scope) {
            scopes.push(scope);
        }
        node = node.parentElement;
    }
    return scopes;
}
function getSelectorsForScopes(scopes) {
    var selectors = [];
    scopes.forEach(function (scope) {
        selectors.push.apply(selectors, scope.selectors);
    });
    return selectors;
}
function sortSelectors(selectors) {
    selectors.sort(function (a, b) {
        if (a.specificity === b.specificity) {
            return a.nu - b.nu;
        }
        return a.specificity - b.specificity;
    });
    return selectors;
}
function matches(el, selector) {
    return selector === ':root' || selector === 'html' || el.matches(selector);
}
function parseCSS(original) {
    var ast = parse(original);
    var template = compileTemplate(original);
    var selectors = getSelectors(ast);
    return {
        original: original,
        template: template,
        selectors: selectors,
        usesCssVars: template.length > 1
    };
}
function addGlobalStyle(globalScopes, styleEl) {
    var css = parseCSS(styleEl.innerHTML);
    css.styleEl = styleEl;
    globalScopes.push(css);
}
function updateGlobalScopes(scopes) {
    var selectors = getSelectorsForScopes(scopes);
    var props = resolveValues(selectors);
    scopes.forEach(function (scope) {
        if (scope.usesCssVars) {
            scope.styleEl.innerHTML = executeTemplate(scope.template, props);
        }
    });
}
function reScope(scope, scopeId) {
    var template = scope.template.map(function (segment) {
        return (typeof segment === 'string')
            ? replaceScope(segment, scope.scopeId, scopeId)
            : segment;
    });
    var selectors = scope.selectors.map(function (sel) {
        return Object.assign({}, sel, { selector: replaceScope(sel.selector, scope.scopeId, scopeId) });
    });
    return Object.assign({}, scope, { template: template,
        selectors: selectors,
        scopeId: scopeId });
}
function replaceScope(original, oldScopeId, newScopeId) {
    original = replaceAll(original, "\\." + oldScopeId, "." + newScopeId);
    return original;
}
function replaceAll(input, find, replace) {
    return input.replace(new RegExp(find, 'g'), replace);
}
function loadDocument(doc, globalScopes) {
    loadDocumentStyles(doc, globalScopes);
    return loadDocumentLinks(doc, globalScopes);
}
function loadDocumentLinks(doc, globalScopes) {
    var promises = [];
    var linkElms = doc.querySelectorAll('link[rel="stylesheet"][href]');
    for (var i = 0; i < linkElms.length; i++) {
        promises.push(addGlobalLink(doc, globalScopes, linkElms[i]));
    }
    return Promise.all(promises);
}
function loadDocumentStyles(doc, globalScopes) {
    var styleElms = doc.querySelectorAll('style:not([data-styles])');
    for (var i = 0; i < styleElms.length; i++) {
        addGlobalStyle(globalScopes, styleElms[i]);
    }
}
function addGlobalLink(doc, globalScopes, linkElm) {
    var url = linkElm.href;
    return fetch(url).then(function (rsp) { return rsp.text(); }).then(function (text) {
        if (hasCssVariables(text) && linkElm.parentNode) {
            if (hasRelativeUrls(text)) {
                text = fixRelativeUrls(text, url);
            }
            var styleEl = doc.createElement('style');
            styleEl.setAttribute('data-styles', '');
            styleEl.innerHTML = text;
            addGlobalStyle(globalScopes, styleEl);
            linkElm.parentNode.insertBefore(styleEl, linkElm);
            linkElm.remove();
        }
    }).catch(function (err) {
        console.error(err);
    });
}
// This regexp tries to determine when a variable is declared, for example:
//
// .my-el { --highlight-color: green; }
//
// but we don't want to trigger when a classname uses "--" or a pseudo-class is
// used. We assume that the only characters that can preceed a variable
// declaration are "{", from an opening block, ";" from a preceeding rule, or a
// space. This prevents the regexp from matching a word in a selector, since
// they would need to start with a "." or "#". (We assume element names don't
// start with "--").
var CSS_VARIABLE_REGEXP = /[\s;{]--[-a-zA-Z0-9]+\s*:/m;
function hasCssVariables(css) {
    return css.indexOf('var(') > -1 || CSS_VARIABLE_REGEXP.test(css);
}
// This regexp find all url() usages with relative urls
var CSS_URL_REGEXP = /url[\s]*\([\s]*['"]?(?![http|/])([^\'\"\)]*)[\s]*['"]?\)[\s]*/gim;
function hasRelativeUrls(css) {
    CSS_URL_REGEXP.lastIndex = 0;
    return CSS_URL_REGEXP.test(css);
}
function fixRelativeUrls(css, originalUrl) {
    // get the basepath from the original import url
    var basePath = originalUrl.replace(/[^/]*$/, '');
    // replace the relative url, with the new relative url
    return css.replace(CSS_URL_REGEXP, function (fullMatch, url) {
        // rhe new relative path is the base path + uri
        // TODO: normalize relative URL
        var relativeUrl = basePath + url;
        return fullMatch.replace(url, relativeUrl);
    });
}
var CustomStyle = /** @class */ (function () {
    function CustomStyle(win, doc) {
        this.win = win;
        this.doc = doc;
        this.count = 0;
        this.hostStyleMap = new WeakMap();
        this.hostScopeMap = new WeakMap();
        this.globalScopes = [];
        this.scopesMap = new Map();
    }
    CustomStyle.prototype.initShim = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.win.requestAnimationFrame(function () {
                loadDocument(_this.doc, _this.globalScopes).then(function () { return resolve(); });
            });
        });
    };
    CustomStyle.prototype.addLink = function (linkEl) {
        var _this = this;
        return addGlobalLink(this.doc, this.globalScopes, linkEl).then(function () {
            _this.updateGlobal();
        });
    };
    CustomStyle.prototype.addGlobalStyle = function (styleEl) {
        addGlobalStyle(this.globalScopes, styleEl);
        this.updateGlobal();
    };
    CustomStyle.prototype.createHostStyle = function (hostEl, cssScopeId, cssText, isScoped) {
        if (this.hostScopeMap.has(hostEl)) {
            throw new Error('host style already created');
        }
        var baseScope = this.registerHostTemplate(cssText, cssScopeId, isScoped);
        var styleEl = this.doc.createElement('style');
        if (!baseScope.usesCssVars) {
            // This component does not use (read) css variables
            styleEl.innerHTML = cssText;
        }
        else if (isScoped) {
            // This component is dynamic: uses css var and is scoped
            styleEl['s-sc'] = cssScopeId = baseScope.scopeId + "-" + this.count;
            styleEl.innerHTML = '/*needs update*/';
            this.hostStyleMap.set(hostEl, styleEl);
            this.hostScopeMap.set(hostEl, reScope(baseScope, cssScopeId));
            this.count++;
        }
        else {
            // This component uses css vars, but it's no-encapsulation (global static)
            baseScope.styleEl = styleEl;
            if (!baseScope.usesCssVars) {
                styleEl.innerHTML = executeTemplate(baseScope.template, {});
            }
            this.globalScopes.push(baseScope);
            this.updateGlobal();
            this.hostScopeMap.set(hostEl, baseScope);
        }
        return styleEl;
    };
    CustomStyle.prototype.removeHost = function (hostEl) {
        var css = this.hostStyleMap.get(hostEl);
        if (css) {
            css.remove();
        }
        this.hostStyleMap.delete(hostEl);
        this.hostScopeMap.delete(hostEl);
    };
    CustomStyle.prototype.updateHost = function (hostEl) {
        var scope = this.hostScopeMap.get(hostEl);
        if (scope && scope.usesCssVars && scope.isScoped) {
            var styleEl = this.hostStyleMap.get(hostEl);
            if (styleEl) {
                var selectors = getActiveSelectors(hostEl, this.hostScopeMap, this.globalScopes);
                var props = resolveValues(selectors);
                styleEl.innerHTML = executeTemplate(scope.template, props);
            }
        }
    };
    CustomStyle.prototype.updateGlobal = function () {
        updateGlobalScopes(this.globalScopes);
    };
    CustomStyle.prototype.registerHostTemplate = function (cssText, scopeId, isScoped) {
        var scope = this.scopesMap.get(scopeId);
        if (!scope) {
            scope = parseCSS(cssText);
            scope.scopeId = scopeId;
            scope.isScoped = isScoped;
            this.scopesMap.set(scopeId, scope);
        }
        return scope;
    };
    return CustomStyle;
}());
var win = window;
function needsShim() {
    return !(win.CSS && win.CSS.supports && win.CSS.supports('color', 'var(--c)'));
}
if (!win.__stencil_cssshim && needsShim()) {
    win.__stencil_cssshim = new CustomStyle(win, document);
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGlvbmljL3B3YS1lbGVtZW50cy9kaXN0L2VzbS9wb2x5ZmlsbHMvY3NzLXNoaW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixJQUFJO0FBQ3JCO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsT0FBTztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFVBQVU7QUFDckIsV0FBVyxPQUFPO0FBQ2xCLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQSx3Q0FBd0M7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRCx3QkFBd0I7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixZQUFZO0FBQ1o7QUFDQTtB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhFQUE4RSxrQkFBa0IsRUFBRTtBQUNsRyxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEVBQTBFO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6IjguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuRXh0cmVtZWx5IHNpbXBsZSBjc3MgcGFyc2VyLiBJbnRlbmRlZCB0byBiZSBub3QgbW9yZSB0aGFuIHdoYXQgd2UgbmVlZFxuYW5kIGRlZmluaXRlbHkgbm90IG5lY2Vzc2FyaWx5IGNvcnJlY3QgPSkuXG4qL1xuLyoqIEB1bnJlc3RyaWN0ZWQgKi9cbnZhciBTdHlsZU5vZGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3R5bGVOb2RlKCkge1xuICAgICAgICB0aGlzLnN0YXJ0ID0gMDtcbiAgICAgICAgdGhpcy5lbmQgPSAwO1xuICAgICAgICB0aGlzLnByZXZpb3VzID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLnJ1bGVzID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXJzZWRDc3NUZXh0ID0gJyc7XG4gICAgICAgIHRoaXMuY3NzVGV4dCA9ICcnO1xuICAgICAgICB0aGlzLmF0UnVsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnR5cGUgPSAwO1xuICAgICAgICB0aGlzLmtleWZyYW1lc05hbWUgPSAnJztcbiAgICAgICAgdGhpcy5zZWxlY3RvciA9ICcnO1xuICAgICAgICB0aGlzLnBhcnNlZFNlbGVjdG9yID0gJyc7XG4gICAgfVxuICAgIHJldHVybiBTdHlsZU5vZGU7XG59KCkpO1xuLy8gZ2l2ZW4gYSBzdHJpbmcgb2YgY3NzLCByZXR1cm4gYSBzaW1wbGUgcnVsZSB0cmVlXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKiBAcmV0dXJuIHtTdHlsZU5vZGV9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlKHRleHQpIHtcbiAgICB0ZXh0ID0gY2xlYW4odGV4dCk7XG4gICAgcmV0dXJuIHBhcnNlQ3NzKGxleCh0ZXh0KSwgdGV4dCk7XG59XG4vLyByZW1vdmUgc3R1ZmYgd2UgZG9uJ3QgY2FyZSBhYm91dCB0aGF0IG1heSBoaW5kZXIgcGFyc2luZ1xuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gY3NzVGV4dFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBjbGVhbihjc3NUZXh0KSB7XG4gICAgcmV0dXJuIGNzc1RleHQucmVwbGFjZShSWC5jb21tZW50cywgJycpLnJlcGxhY2UoUlgucG9ydCwgJycpO1xufVxuLy8gc3VwZXIgc2ltcGxlIHsuLi59IGxleGVyIHRoYXQgcmV0dXJucyBhIG5vZGUgdHJlZVxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICogQHJldHVybiB7U3R5bGVOb2RlfVxuICovXG5mdW5jdGlvbiBsZXgodGV4dCkge1xuICAgIHZhciByb290ID0gbmV3IFN0eWxlTm9kZSgpO1xuICAgIHJvb3RbJ3N0YXJ0J10gPSAwO1xuICAgIHJvb3RbJ2VuZCddID0gdGV4dC5sZW5ndGg7XG4gICAgdmFyIG4gPSByb290O1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGV4dC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKHRleHRbaV0gPT09IE9QRU5fQlJBQ0UpIHtcbiAgICAgICAgICAgIGlmICghblsncnVsZXMnXSkge1xuICAgICAgICAgICAgICAgIG5bJ3J1bGVzJ10gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwID0gbjtcbiAgICAgICAgICAgIHZhciBwcmV2aW91cyA9IHBbJ3J1bGVzJ11bcFsncnVsZXMnXS5sZW5ndGggLSAxXSB8fCBudWxsO1xuICAgICAgICAgICAgbiA9IG5ldyBTdHlsZU5vZGUoKTtcbiAgICAgICAgICAgIG5bJ3N0YXJ0J10gPSBpICsgMTtcbiAgICAgICAgICAgIG5bJ3BhcmVudCddID0gcDtcbiAgICAgICAgICAgIG5bJ3ByZXZpb3VzJ10gPSBwcmV2aW91cztcbiAgICAgICAgICAgIHBbJ3J1bGVzJ10ucHVzaChuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0ZXh0W2ldID09PSBDTE9TRV9CUkFDRSkge1xuICAgICAgICAgICAgblsnZW5kJ10gPSBpICsgMTtcbiAgICAgICAgICAgIG4gPSBuWydwYXJlbnQnXSB8fCByb290O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByb290O1xufVxuLy8gYWRkIHNlbGVjdG9ycy9jc3NUZXh0IHRvIG5vZGUgdHJlZVxuLyoqXG4gKiBAcGFyYW0ge1N0eWxlTm9kZX0gbm9kZVxuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqIEByZXR1cm4ge1N0eWxlTm9kZX1cbiAqL1xuZnVuY3Rpb24gcGFyc2VDc3Mobm9kZSwgdGV4dCkge1xuICAgIHZhciB0ID0gdGV4dC5zdWJzdHJpbmcobm9kZVsnc3RhcnQnXSwgbm9kZVsnZW5kJ10gLSAxKTtcbiAgICBub2RlWydwYXJzZWRDc3NUZXh0J10gPSBub2RlWydjc3NUZXh0J10gPSB0LnRyaW0oKTtcbiAgICBpZiAobm9kZS5wYXJlbnQpIHtcbiAgICAgICAgdmFyIHNzID0gbm9kZS5wcmV2aW91cyA/IG5vZGUucHJldmlvdXNbJ2VuZCddIDogbm9kZS5wYXJlbnRbJ3N0YXJ0J107XG4gICAgICAgIHQgPSB0ZXh0LnN1YnN0cmluZyhzcywgbm9kZVsnc3RhcnQnXSAtIDEpO1xuICAgICAgICB0ID0gX2V4cGFuZFVuaWNvZGVFc2NhcGVzKHQpO1xuICAgICAgICB0ID0gdC5yZXBsYWNlKFJYLm11bHRpcGxlU3BhY2VzLCAnICcpO1xuICAgICAgICAvLyBUT0RPKHNvcnZlbGwpOiBhZCBob2M7IG1ha2Ugc2VsZWN0b3IgaW5jbHVkZSBvbmx5IGFmdGVyIGxhc3QgO1xuICAgICAgICAvLyBoZWxwcyB3aXRoIG1peGluIHN5bnRheFxuICAgICAgICB0ID0gdC5zdWJzdHJpbmcodC5sYXN0SW5kZXhPZignOycpICsgMSk7XG4gICAgICAgIHZhciBzID0gbm9kZVsncGFyc2VkU2VsZWN0b3InXSA9IG5vZGVbJ3NlbGVjdG9yJ10gPSB0LnRyaW0oKTtcbiAgICAgICAgbm9kZVsnYXRSdWxlJ10gPSAocy5pbmRleE9mKEFUX1NUQVJUKSA9PT0gMCk7XG4gICAgICAgIC8vIG5vdGUsIHN1cHBvcnQgYSBzdWJzZXQgb2YgcnVsZSB0eXBlcy4uLlxuICAgICAgICBpZiAobm9kZVsnYXRSdWxlJ10pIHtcbiAgICAgICAgICAgIGlmIChzLmluZGV4T2YoTUVESUFfU1RBUlQpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbm9kZVsndHlwZSddID0gdHlwZXMuTUVESUFfUlVMRTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHMubWF0Y2goUlgua2V5ZnJhbWVzUnVsZSkpIHtcbiAgICAgICAgICAgICAgICBub2RlWyd0eXBlJ10gPSB0eXBlcy5LRVlGUkFNRVNfUlVMRTtcbiAgICAgICAgICAgICAgICBub2RlWydrZXlmcmFtZXNOYW1lJ10gPSBub2RlWydzZWxlY3RvciddLnNwbGl0KFJYLm11bHRpcGxlU3BhY2VzKS5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzLmluZGV4T2YoVkFSX1NUQVJUKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIG5vZGVbJ3R5cGUnXSA9IHR5cGVzLk1JWElOX1JVTEU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBub2RlWyd0eXBlJ10gPSB0eXBlcy5TVFlMRV9SVUxFO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHZhciByJCA9IG5vZGVbJ3J1bGVzJ107XG4gICAgaWYgKHIkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gciQubGVuZ3RoLCByID0gdm9pZCAwOyAoaSA8IGwpICYmIChyID0gciRbaV0pOyBpKyspIHtcbiAgICAgICAgICAgIHBhcnNlQ3NzKHIsIHRleHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xufVxuLyoqXG4gKiBjb252ZXJzaW9uIG9mIHNvcnQgdW5pY29kZSBlc2NhcGVzIHdpdGggc3BhY2VzIGxpa2UgYFxcMzMgYCAoYW5kIGxvbmdlcikgaW50b1xuICogZXhwYW5kZWQgZm9ybSB0aGF0IGRvZXNuJ3QgcmVxdWlyZSB0cmFpbGluZyBzcGFjZSBgXFwwMDAwMzNgXG4gKiBAcGFyYW0ge3N0cmluZ30gc1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBfZXhwYW5kVW5pY29kZUVzY2FwZXMocykge1xuICAgIHJldHVybiBzLnJlcGxhY2UoL1xcXFwoWzAtOWEtZl17MSw2fSlcXHMvZ2ksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNvZGUgPSBhcmd1bWVudHNbMV0sIHJlcGVhdCA9IDYgLSBjb2RlLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKHJlcGVhdC0tKSB7XG4gICAgICAgICAgICBjb2RlID0gJzAnICsgY29kZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJ1xcXFwnICsgY29kZTtcbiAgICB9KTtcbn1cbi8qKiBAZW51bSB7bnVtYmVyfSAqL1xudmFyIHR5cGVzID0ge1xuICAgIFNUWUxFX1JVTEU6IDEsXG4gICAgS0VZRlJBTUVTX1JVTEU6IDcsXG4gICAgTUVESUFfUlVMRTogNCxcbiAgICBNSVhJTl9SVUxFOiAxMDAwXG59O1xudmFyIE9QRU5fQlJBQ0UgPSAneyc7XG52YXIgQ0xPU0VfQlJBQ0UgPSAnfSc7XG4vLyBoZWxwZXIgcmVnZXhwJ3NcbnZhciBSWCA9IHtcbiAgICBjb21tZW50czogL1xcL1xcKlteKl0qXFwqKyhbXi8qXVteKl0qXFwqKykqXFwvL2dpbSxcbiAgICBwb3J0OiAvQGltcG9ydFteO10qOy9naW0sXG4gICAgY3VzdG9tUHJvcDogLyg/Ol5bXjtcXC1cXHN9XSspPy0tW147e31dKj86W157fTtdKj8oPzpbO1xcbl18JCkvZ2ltLFxuICAgIG1peGluUHJvcDogLyg/Ol5bXjtcXC1cXHN9XSspPy0tW147e31dKj86W157fTtdKj97W159XSo/fSg/Ols7XFxuXXwkKT8vZ2ltLFxuICAgIG1peGluQXBwbHk6IC9AYXBwbHlcXHMqXFwoP1teKTtdKlxcKT9cXHMqKD86WztcXG5dfCQpPy9naW0sXG4gICAgdmFyQXBwbHk6IC9bXjs6XSo/OlteO10qP3ZhclxcKFteO10qXFwpKD86WztcXG5dfCQpPy9naW0sXG4gICAga2V5ZnJhbWVzUnVsZTogL15AW15cXHNdKmtleWZyYW1lcy8sXG4gICAgbXVsdGlwbGVTcGFjZXM6IC9cXHMrL2dcbn07XG52YXIgVkFSX1NUQVJUID0gJy0tJztcbnZhciBNRURJQV9TVEFSVCA9ICdAbWVkaWEnO1xudmFyIEFUX1NUQVJUID0gJ0AnO1xuZnVuY3Rpb24gZmluZFJlZ2V4KHJlZ2V4LCBjc3NUZXh0LCBvZmZzZXQpIHtcbiAgICByZWdleFsnbGFzdEluZGV4J10gPSAwO1xuICAgIHZhciByID0gY3NzVGV4dC5zdWJzdHJpbmcob2Zmc2V0KS5tYXRjaChyZWdleCk7XG4gICAgaWYgKHIpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gb2Zmc2V0ICsgclsnaW5kZXgnXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICAgIGVuZDogc3RhcnQgKyByWzBdLmxlbmd0aFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbnZhciBWQVJfVVNBR0VfU1RBUlQgPSAvXFxidmFyXFwoLztcbnZhciBWQVJfQVNTSUdOX1NUQVJUID0gL1xcQi0tW1xcdy1dK1xccyo6LztcbnZhciBDT01NRU5UUyA9IC9cXC9cXCpbXipdKlxcKisoW14vKl1bXipdKlxcKispKlxcLy9naW07XG52YXIgVFJBSUxJTkdfTElORVMgPSAvXltcXHQgXStcXG4vZ207XG5mdW5jdGlvbiByZXNvbHZlVmFyKHByb3BzLCBwcm9wLCBmYWxsYmFjaykge1xuICAgIGlmIChwcm9wc1twcm9wXSkge1xuICAgICAgICByZXR1cm4gcHJvcHNbcHJvcF07XG4gICAgfVxuICAgIGlmIChmYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gZXhlY3V0ZVRlbXBsYXRlKGZhbGxiYWNrLCBwcm9wcyk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbn1cbmZ1bmN0aW9uIGZpbmRWYXJFbmRJbmRleChjc3NUZXh0LCBvZmZzZXQpIHtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIHZhciBpID0gb2Zmc2V0O1xuICAgIGZvciAoOyBpIDwgY3NzVGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IGNzc1RleHRbaV07XG4gICAgICAgIGlmIChjID09PSAnKCcpIHtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYyA9PT0gJyknKSB7XG4gICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICAgICAgaWYgKGNvdW50IDw9IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGk7XG59XG5mdW5jdGlvbiBwYXJzZVZhcihjc3NUZXh0LCBvZmZzZXQpIHtcbiAgICB2YXIgdmFyUG9zID0gZmluZFJlZ2V4KFZBUl9VU0FHRV9TVEFSVCwgY3NzVGV4dCwgb2Zmc2V0KTtcbiAgICBpZiAoIXZhclBvcykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIGVuZFZhciA9IGZpbmRWYXJFbmRJbmRleChjc3NUZXh0LCB2YXJQb3Muc3RhcnQpO1xuICAgIHZhciB2YXJDb250ZW50ID0gY3NzVGV4dC5zdWJzdHJpbmcodmFyUG9zLmVuZCwgZW5kVmFyIC0gMSk7XG4gICAgdmFyIF9hID0gdmFyQ29udGVudC5zcGxpdCgnLCcpLCBwcm9wTmFtZSA9IF9hWzBdLCBmYWxsYmFjayA9IF9hLnNsaWNlKDEpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0OiB2YXJQb3Muc3RhcnQsXG4gICAgICAgIGVuZDogZW5kVmFyLFxuICAgICAgICBwcm9wTmFtZTogcHJvcE5hbWUudHJpbSgpLFxuICAgICAgICBmYWxsYmFjazogZmFsbGJhY2subGVuZ3RoID4gMCA/IGZhbGxiYWNrLmpvaW4oJywnKS50cmltKCkgOiB1bmRlZmluZWRcbiAgICB9O1xufVxuZnVuY3Rpb24gY29tcGlsZVZhcihjc3NUZXh0LCB0ZW1wbGF0ZSwgb2Zmc2V0KSB7XG4gICAgdmFyIHZhck1ldGEgPSBwYXJzZVZhcihjc3NUZXh0LCBvZmZzZXQpO1xuICAgIGlmICghdmFyTWV0YSkge1xuICAgICAgICB0ZW1wbGF0ZS5wdXNoKGNzc1RleHQuc3Vic3RyaW5nKG9mZnNldCwgY3NzVGV4dC5sZW5ndGgpKTtcbiAgICAgICAgcmV0dXJuIGNzc1RleHQubGVuZ3RoO1xuICAgIH1cbiAgICB2YXIgcHJvcE5hbWUgPSB2YXJNZXRhLnByb3BOYW1lO1xuICAgIHZhciBmYWxsYmFjayA9IHZhck1ldGEuZmFsbGJhY2sgIT0gbnVsbCA/IGNvbXBpbGVUZW1wbGF0ZSh2YXJNZXRhLmZhbGxiYWNrKSA6IHVuZGVmaW5lZDtcbiAgICB0ZW1wbGF0ZS5wdXNoKGNzc1RleHQuc3Vic3RyaW5nKG9mZnNldCwgdmFyTWV0YS5zdGFydCksIGZ1bmN0aW9uIChwYXJhbXMpIHsgcmV0dXJuIHJlc29sdmVWYXIocGFyYW1zLCBwcm9wTmFtZSwgZmFsbGJhY2spOyB9KTtcbiAgICByZXR1cm4gdmFyTWV0YS5lbmQ7XG59XG5mdW5jdGlvbiBleGVjdXRlVGVtcGxhdGUodGVtcGxhdGUsIHByb3BzKSB7XG4gICAgdmFyIGZpbmFsID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZW1wbGF0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcyA9IHRlbXBsYXRlW2ldO1xuICAgICAgICBmaW5hbCArPSAodHlwZW9mIHMgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgPyBzXG4gICAgICAgICAgICA6IHMocHJvcHMpO1xuICAgIH1cbiAgICByZXR1cm4gZmluYWw7XG59XG5mdW5jdGlvbiBmaW5kRW5kVmFsdWUoY3NzVGV4dCwgb2Zmc2V0KSB7XG4gICAgdmFyIG9uU3RyID0gZmFsc2U7XG4gICAgdmFyIGRvdWJsZSA9IGZhbHNlO1xuICAgIHZhciBpID0gb2Zmc2V0O1xuICAgIGZvciAoOyBpIDwgY3NzVGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IGNzc1RleHRbaV07XG4gICAgICAgIGlmIChvblN0cikge1xuICAgICAgICAgICAgaWYgKGRvdWJsZSAmJiBjID09PSAnXCInKSB7XG4gICAgICAgICAgICAgICAgb25TdHIgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZG91YmxlICYmIGMgPT09ICdcXCcnKSB7XG4gICAgICAgICAgICAgICAgb25TdHIgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjID09PSAnXCInKSB7XG4gICAgICAgICAgICAgICAgb25TdHIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGRvdWJsZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjID09PSAnXFwnJykge1xuICAgICAgICAgICAgICAgIG9uU3RyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkb3VibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGMgPT09ICc7Jykge1xuICAgICAgICAgICAgICAgIHJldHVybiBpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGMgPT09ICd9Jykge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpO1xufVxuZnVuY3Rpb24gcmVtb3ZlQ3VzdG9tQXNzaWducyhjc3NUZXh0KSB7XG4gICAgdmFyIGZpbmFsID0gJyc7XG4gICAgdmFyIG9mZnNldCA9IDA7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGFzc2lnblBvcyA9IGZpbmRSZWdleChWQVJfQVNTSUdOX1NUQVJULCBjc3NUZXh0LCBvZmZzZXQpO1xuICAgICAgICB2YXIgc3RhcnQgPSBhc3NpZ25Qb3MgPyBhc3NpZ25Qb3Muc3RhcnQgOiBjc3NUZXh0Lmxlbmd0aDtcbiAgICAgICAgZmluYWwgKz0gY3NzVGV4dC5zdWJzdHJpbmcob2Zmc2V0LCBzdGFydCk7XG4gICAgICAgIGlmIChhc3NpZ25Qb3MpIHtcbiAgICAgICAgICAgIG9mZnNldCA9IGZpbmRFbmRWYWx1ZShjc3NUZXh0LCBzdGFydCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmluYWw7XG59XG5mdW5jdGlvbiBjb21waWxlVGVtcGxhdGUoY3NzVGV4dCkge1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgY3NzVGV4dCA9IGNzc1RleHQucmVwbGFjZShDT01NRU5UUywgJycpO1xuICAgIGNzc1RleHQgPSByZW1vdmVDdXN0b21Bc3NpZ25zKGNzc1RleHQpXG4gICAgICAgIC5yZXBsYWNlKFRSQUlMSU5HX0xJTkVTLCAnJyk7XG4gICAgdmFyIHNlZ21lbnRzID0gW107XG4gICAgd2hpbGUgKGluZGV4IDwgY3NzVGV4dC5sZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSBjb21waWxlVmFyKGNzc1RleHQsIHNlZ21lbnRzLCBpbmRleCk7XG4gICAgfVxuICAgIHJldHVybiBzZWdtZW50cztcbn1cbmZ1bmN0aW9uIHJlc29sdmVWYWx1ZXMoc2VsZWN0b3JzKSB7XG4gICAgdmFyIHByb3BzID0ge307XG4gICAgc2VsZWN0b3JzLmZvckVhY2goZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICAgIHNlbGVjdG9yLmRlY2xhcmF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChkZWMpIHtcbiAgICAgICAgICAgIHByb3BzW2RlYy5wcm9wXSA9IGRlYy52YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgdmFyIHByb3BzVmFsdWVzID0ge307XG4gICAgdmFyIGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhwcm9wcyk7XG4gICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICB2YXIgZGlydHkgPSBmYWxzZTtcbiAgICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgdmFyIGtleSA9IF9hWzBdLCB2YWx1ZSA9IF9hWzFdO1xuICAgICAgICAgICAgdmFyIHByb3BWYWx1ZSA9IGV4ZWN1dGVUZW1wbGF0ZSh2YWx1ZSwgcHJvcHNWYWx1ZXMpO1xuICAgICAgICAgICAgaWYgKHByb3BWYWx1ZSAhPT0gcHJvcHNWYWx1ZXNba2V5XSkge1xuICAgICAgICAgICAgICAgIHByb3BzVmFsdWVzW2tleV0gPSBwcm9wVmFsdWU7XG4gICAgICAgICAgICAgICAgZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFkaXJ0eSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiYnJlYWtcIjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIHZhciBzdGF0ZV8xID0gX2xvb3BfMShpKTtcbiAgICAgICAgaWYgKHN0YXRlXzEgPT09IFwiYnJlYWtcIilcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gcHJvcHNWYWx1ZXM7XG59XG5mdW5jdGlvbiBnZXRTZWxlY3RvcnMocm9vdCwgaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPT09IHZvaWQgMCkgeyBpbmRleCA9IDA7IH1cbiAgICBpZiAoIXJvb3QucnVsZXMpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0b3JzID0gW107XG4gICAgcm9vdC5ydWxlc1xuICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uIChydWxlKSB7IHJldHVybiBydWxlLnR5cGUgPT09IHR5cGVzLlNUWUxFX1JVTEU7IH0pXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uIChydWxlKSB7XG4gICAgICAgIHZhciBkZWNsYXJhdGlvbnMgPSBnZXREZWNsYXJhdGlvbnMocnVsZS5jc3NUZXh0KTtcbiAgICAgICAgaWYgKGRlY2xhcmF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBydWxlLnBhcnNlZFNlbGVjdG9yLnNwbGl0KCcsJykuZm9yRWFjaChmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnRyaW0oKTtcbiAgICAgICAgICAgICAgICBzZWxlY3RvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb25zOiBkZWNsYXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIHNwZWNpZmljaXR5OiBjb21wdXRlU3BlY2lmaWNpdHkoKSxcbiAgICAgICAgICAgICAgICAgICAgbnU6IGluZGV4XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpbmRleCsrO1xuICAgIH0pO1xuICAgIHJldHVybiBzZWxlY3RvcnM7XG59XG5mdW5jdGlvbiBjb21wdXRlU3BlY2lmaWNpdHkoX3NlbGVjdG9yKSB7XG4gICAgcmV0dXJuIDE7XG59XG52YXIgSU1QT1JUQU5UID0gJyFpbXBvcnRhbnQnO1xudmFyIEZJTkRfREVDTEFSQVRJT05TID0gLyg/Ol58WztcXHN7XVxccyopKC0tW1xcdy1dKj8pXFxzKjpcXHMqKD86KCg/OicoPzpcXFxcJ3wuKSo/J3xcIig/OlxcXFxcInwuKSo/XCJ8XFwoW14pXSo/XFwpfFtefTt7XSkrKXxcXHsoW159XSopXFx9KD86KD89WztcXHN9XSl8JCkpL2dtO1xuZnVuY3Rpb24gZ2V0RGVjbGFyYXRpb25zKGNzc1RleHQpIHtcbiAgICB2YXIgZGVjbGFyYXRpb25zID0gW107XG4gICAgdmFyIHhBcnJheTtcbiAgICB3aGlsZSAoeEFycmF5ID0gRklORF9ERUNMQVJBVElPTlMuZXhlYyhjc3NUZXh0LnRyaW0oKSkpIHtcbiAgICAgICAgdmFyIF9hID0gbm9ybWFsaXplVmFsdWUoeEFycmF5WzJdKSwgdmFsdWUgPSBfYS52YWx1ZSwgaW1wb3J0YW50ID0gX2EuaW1wb3J0YW50O1xuICAgICAgICBkZWNsYXJhdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBwcm9wOiB4QXJyYXlbMV0udHJpbSgpLFxuICAgICAgICAgICAgdmFsdWU6IGNvbXBpbGVUZW1wbGF0ZSh2YWx1ZSksXG4gICAgICAgICAgICBpbXBvcnRhbnQ6IGltcG9ydGFudCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBkZWNsYXJhdGlvbnM7XG59XG5mdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIHZhciByZWdleCA9IC9cXHMrL2dpbTtcbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UocmVnZXgsICcgJykudHJpbSgpO1xuICAgIHZhciBpbXBvcnRhbnQgPSB2YWx1ZS5lbmRzV2l0aChJTVBPUlRBTlQpO1xuICAgIGlmIChpbXBvcnRhbnQpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHIoMCwgdmFsdWUubGVuZ3RoIC0gSU1QT1JUQU5ULmxlbmd0aCkudHJpbSgpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGltcG9ydGFudDogaW1wb3J0YW50XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGdldEFjdGl2ZVNlbGVjdG9ycyhob3N0RWwsIGhvc3RTY29wZU1hcCwgZ2xvYmFsU2NvcGVzKSB7XG4gICAgLy8gY29tcHV0ZXMgdGhlIGNzcyBzY29wZXMgdGhhdCBtaWdodCBhZmZlY3QgdGhpcyBwYXJ0aWN1bGFyIGVsZW1lbnRcbiAgICAvLyBhdm9pZGluZyB1c2luZyBzcHJlYWQgYXJyYXlzIHRvIGF2b2lkIHRzIGhlbHBlciBmbnMgd2hlbiBpbiBlczVcbiAgICB2YXIgc2NvcGVzID0gW107XG4gICAgdmFyIHNjb3Blc0ZvckVsZW1lbnQgPSBnZXRTY29wZXNGb3JFbGVtZW50KGhvc3RTY29wZU1hcCwgaG9zdEVsKTtcbiAgICAvLyBnbG9iYWxTY29wZXMgYXJlIGFsd2F5cyB0b29rIGludG8gYWNjb3VudFxuICAgIGdsb2JhbFNjb3Blcy5mb3JFYWNoKGZ1bmN0aW9uIChzKSB7IHJldHVybiBzY29wZXMucHVzaChzKTsgfSk7XG4gICAgLy8gdGhlIHBhcmVudCBzY29wZXMgYXJlIGNvbXB1dGVkIGJ5IHdhbGtpbmcgcGFyZW50IGRvbSB1bnRpbCA8aHRtbD4gaXMgcmVhY2hlZFxuICAgIHNjb3Blc0ZvckVsZW1lbnQuZm9yRWFjaChmdW5jdGlvbiAocykgeyByZXR1cm4gc2NvcGVzLnB1c2gocyk7IH0pO1xuICAgIC8vIGVhY2ggc2NvcGUgbWlnaHQgaGF2ZSBhbiBhcnJheSBvZiBhc3NvY2lhdGVkIHNlbGVjdG9yc1xuICAgIC8vIGxldCdzIGZsYXR0ZW4gdGhlIGNvbXBsZXRlIGFycmF5IG9mIHNlbGVjdG9ycyBmcm9tIGFsbCB0aGUgc2NvcGVzXG4gICAgdmFyIHNlbGVjdG9yU2V0ID0gZ2V0U2VsZWN0b3JzRm9yU2NvcGVzKHNjb3Blcyk7XG4gICAgLy8gd2UgZmlsdGVyIHRvIG9ubHkgdGhlIHNlbGVjdG9ycyB0aGF0IG1hdGNoZXMgdGhlIGhvc3RFbFxuICAgIHZhciBhY3RpdmVTZWxlY3RvcnMgPSBzZWxlY3RvclNldC5maWx0ZXIoZnVuY3Rpb24gKHNlbGVjdG9yKSB7IHJldHVybiBtYXRjaGVzKGhvc3RFbCwgc2VsZWN0b3Iuc2VsZWN0b3IpOyB9KTtcbiAgICAvLyBzb3J0IHNlbGVjdG9ycyBieSBzcGVjaWZpdHlcbiAgICByZXR1cm4gc29ydFNlbGVjdG9ycyhhY3RpdmVTZWxlY3RvcnMpO1xufVxuZnVuY3Rpb24gZ2V0U2NvcGVzRm9yRWxlbWVudChob3N0VGVtcGxhdGVNYXAsIG5vZGUpIHtcbiAgICB2YXIgc2NvcGVzID0gW107XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgdmFyIHNjb3BlID0gaG9zdFRlbXBsYXRlTWFwLmdldChub2RlKTtcbiAgICAgICAgaWYgKHNjb3BlKSB7XG4gICAgICAgICAgICBzY29wZXMucHVzaChzY29wZSk7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudDtcbiAgICB9XG4gICAgcmV0dXJuIHNjb3Blcztcbn1cbmZ1bmN0aW9uIGdldFNlbGVjdG9yc0ZvclNjb3BlcyhzY29wZXMpIHtcbiAgICB2YXIgc2VsZWN0b3JzID0gW107XG4gICAgc2NvcGVzLmZvckVhY2goZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgIHNlbGVjdG9ycy5wdXNoLmFwcGx5KHNlbGVjdG9ycywgc2NvcGUuc2VsZWN0b3JzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2VsZWN0b3JzO1xufVxuZnVuY3Rpb24gc29ydFNlbGVjdG9ycyhzZWxlY3RvcnMpIHtcbiAgICBzZWxlY3RvcnMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICBpZiAoYS5zcGVjaWZpY2l0eSA9PT0gYi5zcGVjaWZpY2l0eSkge1xuICAgICAgICAgICAgcmV0dXJuIGEubnUgLSBiLm51O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhLnNwZWNpZmljaXR5IC0gYi5zcGVjaWZpY2l0eTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2VsZWN0b3JzO1xufVxuZnVuY3Rpb24gbWF0Y2hlcyhlbCwgc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gc2VsZWN0b3IgPT09ICc6cm9vdCcgfHwgc2VsZWN0b3IgPT09ICdodG1sJyB8fCBlbC5tYXRjaGVzKHNlbGVjdG9yKTtcbn1cbmZ1bmN0aW9uIHBhcnNlQ1NTKG9yaWdpbmFsKSB7XG4gICAgdmFyIGFzdCA9IHBhcnNlKG9yaWdpbmFsKTtcbiAgICB2YXIgdGVtcGxhdGUgPSBjb21waWxlVGVtcGxhdGUob3JpZ2luYWwpO1xuICAgIHZhciBzZWxlY3RvcnMgPSBnZXRTZWxlY3RvcnMoYXN0KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBvcmlnaW5hbDogb3JpZ2luYWwsXG4gICAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcbiAgICAgICAgc2VsZWN0b3JzOiBzZWxlY3RvcnMsXG4gICAgICAgIHVzZXNDc3NWYXJzOiB0ZW1wbGF0ZS5sZW5ndGggPiAxXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGFkZEdsb2JhbFN0eWxlKGdsb2JhbFNjb3Blcywgc3R5bGVFbCkge1xuICAgIHZhciBjc3MgPSBwYXJzZUNTUyhzdHlsZUVsLmlubmVySFRNTCk7XG4gICAgY3NzLnN0eWxlRWwgPSBzdHlsZUVsO1xuICAgIGdsb2JhbFNjb3Blcy5wdXNoKGNzcyk7XG59XG5mdW5jdGlvbiB1cGRhdGVHbG9iYWxTY29wZXMoc2NvcGVzKSB7XG4gICAgdmFyIHNlbGVjdG9ycyA9IGdldFNlbGVjdG9yc0ZvclNjb3BlcyhzY29wZXMpO1xuICAgIHZhciBwcm9wcyA9IHJlc29sdmVWYWx1ZXMoc2VsZWN0b3JzKTtcbiAgICBzY29wZXMuZm9yRWFjaChmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgICAgaWYgKHNjb3BlLnVzZXNDc3NWYXJzKSB7XG4gICAgICAgICAgICBzY29wZS5zdHlsZUVsLmlubmVySFRNTCA9IGV4ZWN1dGVUZW1wbGF0ZShzY29wZS50ZW1wbGF0ZSwgcHJvcHMpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5mdW5jdGlvbiByZVNjb3BlKHNjb3BlLCBzY29wZUlkKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gc2NvcGUudGVtcGxhdGUubWFwKGZ1bmN0aW9uIChzZWdtZW50KSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mIHNlZ21lbnQgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgPyByZXBsYWNlU2NvcGUoc2VnbWVudCwgc2NvcGUuc2NvcGVJZCwgc2NvcGVJZClcbiAgICAgICAgICAgIDogc2VnbWVudDtcbiAgICB9KTtcbiAgICB2YXIgc2VsZWN0b3JzID0gc2NvcGUuc2VsZWN0b3JzLm1hcChmdW5jdGlvbiAoc2VsKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBzZWwsIHsgc2VsZWN0b3I6IHJlcGxhY2VTY29wZShzZWwuc2VsZWN0b3IsIHNjb3BlLnNjb3BlSWQsIHNjb3BlSWQpIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBzY29wZSwgeyB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICAgIHNlbGVjdG9yczogc2VsZWN0b3JzLFxuICAgICAgICBzY29wZUlkOiBzY29wZUlkIH0pO1xufVxuZnVuY3Rpb24gcmVwbGFjZVNjb3BlKG9yaWdpbmFsLCBvbGRTY29wZUlkLCBuZXdTY29wZUlkKSB7XG4gICAgb3JpZ2luYWwgPSByZXBsYWNlQWxsKG9yaWdpbmFsLCBcIlxcXFwuXCIgKyBvbGRTY29wZUlkLCBcIi5cIiArIG5ld1Njb3BlSWQpO1xuICAgIHJldHVybiBvcmlnaW5hbDtcbn1cbmZ1bmN0aW9uIHJlcGxhY2VBbGwoaW5wdXQsIGZpbmQsIHJlcGxhY2UpIHtcbiAgICByZXR1cm4gaW5wdXQucmVwbGFjZShuZXcgUmVnRXhwKGZpbmQsICdnJyksIHJlcGxhY2UpO1xufVxuZnVuY3Rpb24gbG9hZERvY3VtZW50KGRvYywgZ2xvYmFsU2NvcGVzKSB7XG4gICAgbG9hZERvY3VtZW50U3R5bGVzKGRvYywgZ2xvYmFsU2NvcGVzKTtcbiAgICByZXR1cm4gbG9hZERvY3VtZW50TGlua3MoZG9jLCBnbG9iYWxTY29wZXMpO1xufVxuZnVuY3Rpb24gbG9hZERvY3VtZW50TGlua3MoZG9jLCBnbG9iYWxTY29wZXMpIHtcbiAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICB2YXIgbGlua0VsbXMgPSBkb2MucXVlcnlTZWxlY3RvckFsbCgnbGlua1tyZWw9XCJzdHlsZXNoZWV0XCJdW2hyZWZdJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5rRWxtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwcm9taXNlcy5wdXNoKGFkZEdsb2JhbExpbmsoZG9jLCBnbG9iYWxTY29wZXMsIGxpbmtFbG1zW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59XG5mdW5jdGlvbiBsb2FkRG9jdW1lbnRTdHlsZXMoZG9jLCBnbG9iYWxTY29wZXMpIHtcbiAgICB2YXIgc3R5bGVFbG1zID0gZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoJ3N0eWxlOm5vdChbZGF0YS1zdHlsZXNdKScpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVFbG1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFkZEdsb2JhbFN0eWxlKGdsb2JhbFNjb3Blcywgc3R5bGVFbG1zW2ldKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhZGRHbG9iYWxMaW5rKGRvYywgZ2xvYmFsU2NvcGVzLCBsaW5rRWxtKSB7XG4gICAgdmFyIHVybCA9IGxpbmtFbG0uaHJlZjtcbiAgICByZXR1cm4gZmV0Y2godXJsKS50aGVuKGZ1bmN0aW9uIChyc3ApIHsgcmV0dXJuIHJzcC50ZXh0KCk7IH0pLnRoZW4oZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgaWYgKGhhc0Nzc1ZhcmlhYmxlcyh0ZXh0KSAmJiBsaW5rRWxtLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChoYXNSZWxhdGl2ZVVybHModGV4dCkpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gZml4UmVsYXRpdmVVcmxzKHRleHQsIHVybCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc3R5bGVFbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgc3R5bGVFbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3R5bGVzJywgJycpO1xuICAgICAgICAgICAgc3R5bGVFbC5pbm5lckhUTUwgPSB0ZXh0O1xuICAgICAgICAgICAgYWRkR2xvYmFsU3R5bGUoZ2xvYmFsU2NvcGVzLCBzdHlsZUVsKTtcbiAgICAgICAgICAgIGxpbmtFbG0ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGVFbCwgbGlua0VsbSk7XG4gICAgICAgICAgICBsaW5rRWxtLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfSk7XG59XG4vLyBUaGlzIHJlZ2V4cCB0cmllcyB0byBkZXRlcm1pbmUgd2hlbiBhIHZhcmlhYmxlIGlzIGRlY2xhcmVkLCBmb3IgZXhhbXBsZTpcbi8vXG4vLyAubXktZWwgeyAtLWhpZ2hsaWdodC1jb2xvcjogZ3JlZW47IH1cbi8vXG4vLyBidXQgd2UgZG9uJ3Qgd2FudCB0byB0cmlnZ2VyIHdoZW4gYSBjbGFzc25hbWUgdXNlcyBcIi0tXCIgb3IgYSBwc2V1ZG8tY2xhc3MgaXNcbi8vIHVzZWQuIFdlIGFzc3VtZSB0aGF0IHRoZSBvbmx5IGNoYXJhY3RlcnMgdGhhdCBjYW4gcHJlY2VlZCBhIHZhcmlhYmxlXG4vLyBkZWNsYXJhdGlvbiBhcmUgXCJ7XCIsIGZyb20gYW4gb3BlbmluZyBibG9jaywgXCI7XCIgZnJvbSBhIHByZWNlZWRpbmcgcnVsZSwgb3IgYVxuLy8gc3BhY2UuIFRoaXMgcHJldmVudHMgdGhlIHJlZ2V4cCBmcm9tIG1hdGNoaW5nIGEgd29yZCBpbiBhIHNlbGVjdG9yLCBzaW5jZVxuLy8gdGhleSB3b3VsZCBuZWVkIHRvIHN0YXJ0IHdpdGggYSBcIi5cIiBvciBcIiNcIi4gKFdlIGFzc3VtZSBlbGVtZW50IG5hbWVzIGRvbid0XG4vLyBzdGFydCB3aXRoIFwiLS1cIikuXG52YXIgQ1NTX1ZBUklBQkxFX1JFR0VYUCA9IC9bXFxzO3tdLS1bLWEtekEtWjAtOV0rXFxzKjovbTtcbmZ1bmN0aW9uIGhhc0Nzc1ZhcmlhYmxlcyhjc3MpIHtcbiAgICByZXR1cm4gY3NzLmluZGV4T2YoJ3ZhcignKSA+IC0xIHx8IENTU19WQVJJQUJMRV9SRUdFWFAudGVzdChjc3MpO1xufVxuLy8gVGhpcyByZWdleHAgZmluZCBhbGwgdXJsKCkgdXNhZ2VzIHdpdGggcmVsYXRpdmUgdXJsc1xudmFyIENTU19VUkxfUkVHRVhQID0gL3VybFtcXHNdKlxcKFtcXHNdKlsnXCJdPyg/IVtodHRwfC9dKShbXlxcJ1xcXCJcXCldKilbXFxzXSpbJ1wiXT9cXClbXFxzXSovZ2ltO1xuZnVuY3Rpb24gaGFzUmVsYXRpdmVVcmxzKGNzcykge1xuICAgIENTU19VUkxfUkVHRVhQLmxhc3RJbmRleCA9IDA7XG4gICAgcmV0dXJuIENTU19VUkxfUkVHRVhQLnRlc3QoY3NzKTtcbn1cbmZ1bmN0aW9uIGZpeFJlbGF0aXZlVXJscyhjc3MsIG9yaWdpbmFsVXJsKSB7XG4gICAgLy8gZ2V0IHRoZSBiYXNlcGF0aCBmcm9tIHRoZSBvcmlnaW5hbCBpbXBvcnQgdXJsXG4gICAgdmFyIGJhc2VQYXRoID0gb3JpZ2luYWxVcmwucmVwbGFjZSgvW14vXSokLywgJycpO1xuICAgIC8vIHJlcGxhY2UgdGhlIHJlbGF0aXZlIHVybCwgd2l0aCB0aGUgbmV3IHJlbGF0aXZlIHVybFxuICAgIHJldHVybiBjc3MucmVwbGFjZShDU1NfVVJMX1JFR0VYUCwgZnVuY3Rpb24gKGZ1bGxNYXRjaCwgdXJsKSB7XG4gICAgICAgIC8vIHJoZSBuZXcgcmVsYXRpdmUgcGF0aCBpcyB0aGUgYmFzZSBwYXRoICsgdXJpXG4gICAgICAgIC8vIFRPRE86IG5vcm1hbGl6ZSByZWxhdGl2ZSBVUkxcbiAgICAgICAgdmFyIHJlbGF0aXZlVXJsID0gYmFzZVBhdGggKyB1cmw7XG4gICAgICAgIHJldHVybiBmdWxsTWF0Y2gucmVwbGFjZSh1cmwsIHJlbGF0aXZlVXJsKTtcbiAgICB9KTtcbn1cbnZhciBDdXN0b21TdHlsZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDdXN0b21TdHlsZSh3aW4sIGRvYykge1xuICAgICAgICB0aGlzLndpbiA9IHdpbjtcbiAgICAgICAgdGhpcy5kb2MgPSBkb2M7XG4gICAgICAgIHRoaXMuY291bnQgPSAwO1xuICAgICAgICB0aGlzLmhvc3RTdHlsZU1hcCA9IG5ldyBXZWFrTWFwKCk7XG4gICAgICAgIHRoaXMuaG9zdFNjb3BlTWFwID0gbmV3IFdlYWtNYXAoKTtcbiAgICAgICAgdGhpcy5nbG9iYWxTY29wZXMgPSBbXTtcbiAgICAgICAgdGhpcy5zY29wZXNNYXAgPSBuZXcgTWFwKCk7XG4gICAgfVxuICAgIEN1c3RvbVN0eWxlLnByb3RvdHlwZS5pbml0U2hpbSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgICBfdGhpcy53aW4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsb2FkRG9jdW1lbnQoX3RoaXMuZG9jLCBfdGhpcy5nbG9iYWxTY29wZXMpLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVzb2x2ZSgpOyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIEN1c3RvbVN0eWxlLnByb3RvdHlwZS5hZGRMaW5rID0gZnVuY3Rpb24gKGxpbmtFbCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICByZXR1cm4gYWRkR2xvYmFsTGluayh0aGlzLmRvYywgdGhpcy5nbG9iYWxTY29wZXMsIGxpbmtFbCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy51cGRhdGVHbG9iYWwoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBDdXN0b21TdHlsZS5wcm90b3R5cGUuYWRkR2xvYmFsU3R5bGUgPSBmdW5jdGlvbiAoc3R5bGVFbCkge1xuICAgICAgICBhZGRHbG9iYWxTdHlsZSh0aGlzLmdsb2JhbFNjb3Blcywgc3R5bGVFbCk7XG4gICAgICAgIHRoaXMudXBkYXRlR2xvYmFsKCk7XG4gICAgfTtcbiAgICBDdXN0b21TdHlsZS5wcm90b3R5cGUuY3JlYXRlSG9zdFN0eWxlID0gZnVuY3Rpb24gKGhvc3RFbCwgY3NzU2NvcGVJZCwgY3NzVGV4dCwgaXNTY29wZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuaG9zdFNjb3BlTWFwLmhhcyhob3N0RWwpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hvc3Qgc3R5bGUgYWxyZWFkeSBjcmVhdGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJhc2VTY29wZSA9IHRoaXMucmVnaXN0ZXJIb3N0VGVtcGxhdGUoY3NzVGV4dCwgY3NzU2NvcGVJZCwgaXNTY29wZWQpO1xuICAgICAgICB2YXIgc3R5bGVFbCA9IHRoaXMuZG9jLmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgIGlmICghYmFzZVNjb3BlLnVzZXNDc3NWYXJzKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGNvbXBvbmVudCBkb2VzIG5vdCB1c2UgKHJlYWQpIGNzcyB2YXJpYWJsZXNcbiAgICAgICAgICAgIHN0eWxlRWwuaW5uZXJIVE1MID0gY3NzVGV4dDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1Njb3BlZCkge1xuICAgICAgICAgICAgLy8gVGhpcyBjb21wb25lbnQgaXMgZHluYW1pYzogdXNlcyBjc3MgdmFyIGFuZCBpcyBzY29wZWRcbiAgICAgICAgICAgIHN0eWxlRWxbJ3Mtc2MnXSA9IGNzc1Njb3BlSWQgPSBiYXNlU2NvcGUuc2NvcGVJZCArIFwiLVwiICsgdGhpcy5jb3VudDtcbiAgICAgICAgICAgIHN0eWxlRWwuaW5uZXJIVE1MID0gJy8qbmVlZHMgdXBkYXRlKi8nO1xuICAgICAgICAgICAgdGhpcy5ob3N0U3R5bGVNYXAuc2V0KGhvc3RFbCwgc3R5bGVFbCk7XG4gICAgICAgICAgICB0aGlzLmhvc3RTY29wZU1hcC5zZXQoaG9zdEVsLCByZVNjb3BlKGJhc2VTY29wZSwgY3NzU2NvcGVJZCkpO1xuICAgICAgICAgICAgdGhpcy5jb3VudCsrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBjb21wb25lbnQgdXNlcyBjc3MgdmFycywgYnV0IGl0J3Mgbm8tZW5jYXBzdWxhdGlvbiAoZ2xvYmFsIHN0YXRpYylcbiAgICAgICAgICAgIGJhc2VTY29wZS5zdHlsZUVsID0gc3R5bGVFbDtcbiAgICAgICAgICAgIGlmICghYmFzZVNjb3BlLnVzZXNDc3NWYXJzKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVFbC5pbm5lckhUTUwgPSBleGVjdXRlVGVtcGxhdGUoYmFzZVNjb3BlLnRlbXBsYXRlLCB7fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmdsb2JhbFNjb3Blcy5wdXNoKGJhc2VTY29wZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUdsb2JhbCgpO1xuICAgICAgICAgICAgdGhpcy5ob3N0U2NvcGVNYXAuc2V0KGhvc3RFbCwgYmFzZVNjb3BlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3R5bGVFbDtcbiAgICB9O1xuICAgIEN1c3RvbVN0eWxlLnByb3RvdHlwZS5yZW1vdmVIb3N0ID0gZnVuY3Rpb24gKGhvc3RFbCkge1xuICAgICAgICB2YXIgY3NzID0gdGhpcy5ob3N0U3R5bGVNYXAuZ2V0KGhvc3RFbCk7XG4gICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgIGNzcy5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhvc3RTdHlsZU1hcC5kZWxldGUoaG9zdEVsKTtcbiAgICAgICAgdGhpcy5ob3N0U2NvcGVNYXAuZGVsZXRlKGhvc3RFbCk7XG4gICAgfTtcbiAgICBDdXN0b21TdHlsZS5wcm90b3R5cGUudXBkYXRlSG9zdCA9IGZ1bmN0aW9uIChob3N0RWwpIHtcbiAgICAgICAgdmFyIHNjb3BlID0gdGhpcy5ob3N0U2NvcGVNYXAuZ2V0KGhvc3RFbCk7XG4gICAgICAgIGlmIChzY29wZSAmJiBzY29wZS51c2VzQ3NzVmFycyAmJiBzY29wZS5pc1Njb3BlZCkge1xuICAgICAgICAgICAgdmFyIHN0eWxlRWwgPSB0aGlzLmhvc3RTdHlsZU1hcC5nZXQoaG9zdEVsKTtcbiAgICAgICAgICAgIGlmIChzdHlsZUVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGVjdG9ycyA9IGdldEFjdGl2ZVNlbGVjdG9ycyhob3N0RWwsIHRoaXMuaG9zdFNjb3BlTWFwLCB0aGlzLmdsb2JhbFNjb3Blcyk7XG4gICAgICAgICAgICAgICAgdmFyIHByb3BzID0gcmVzb2x2ZVZhbHVlcyhzZWxlY3RvcnMpO1xuICAgICAgICAgICAgICAgIHN0eWxlRWwuaW5uZXJIVE1MID0gZXhlY3V0ZVRlbXBsYXRlKHNjb3BlLnRlbXBsYXRlLCBwcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEN1c3RvbVN0eWxlLnByb3RvdHlwZS51cGRhdGVHbG9iYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHVwZGF0ZUdsb2JhbFNjb3Blcyh0aGlzLmdsb2JhbFNjb3Blcyk7XG4gICAgfTtcbiAgICBDdXN0b21TdHlsZS5wcm90b3R5cGUucmVnaXN0ZXJIb3N0VGVtcGxhdGUgPSBmdW5jdGlvbiAoY3NzVGV4dCwgc2NvcGVJZCwgaXNTY29wZWQpIHtcbiAgICAgICAgdmFyIHNjb3BlID0gdGhpcy5zY29wZXNNYXAuZ2V0KHNjb3BlSWQpO1xuICAgICAgICBpZiAoIXNjb3BlKSB7XG4gICAgICAgICAgICBzY29wZSA9IHBhcnNlQ1NTKGNzc1RleHQpO1xuICAgICAgICAgICAgc2NvcGUuc2NvcGVJZCA9IHNjb3BlSWQ7XG4gICAgICAgICAgICBzY29wZS5pc1Njb3BlZCA9IGlzU2NvcGVkO1xuICAgICAgICAgICAgdGhpcy5zY29wZXNNYXAuc2V0KHNjb3BlSWQsIHNjb3BlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NvcGU7XG4gICAgfTtcbiAgICByZXR1cm4gQ3VzdG9tU3R5bGU7XG59KCkpO1xudmFyIHdpbiA9IHdpbmRvdztcbmZ1bmN0aW9uIG5lZWRzU2hpbSgpIHtcbiAgICByZXR1cm4gISh3aW4uQ1NTICYmIHdpbi5DU1Muc3VwcG9ydHMgJiYgd2luLkNTUy5zdXBwb3J0cygnY29sb3InLCAndmFyKC0tYyknKSk7XG59XG5pZiAoIXdpbi5fX3N0ZW5jaWxfY3Nzc2hpbSAmJiBuZWVkc1NoaW0oKSkge1xuICAgIHdpbi5fX3N0ZW5jaWxfY3Nzc2hpbSA9IG5ldyBDdXN0b21TdHlsZSh3aW4sIGRvY3VtZW50KTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=