(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0],{

/***/ "./node_modules/@ionic/pwa-elements/dist/esm-es5/css-shim-8178315f-8178315f.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@ionic/pwa-elements/dist/esm-es5/css-shim-8178315f-8178315f.js ***!
  \*************************************************************************************/
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
        var state_1 = _loop_1();
        if (state_1 === "break")
            break;
    }
    return propsValues;
}
function getSelectors(root, index) {
    if (index === void 0) {
        index = 0;
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGlvbmljL3B3YS1lbGVtZW50cy9kaXN0L2VzbS1lczUvY3NzLXNoaW0tODE3ODMxNWYtODE3ODMxNWYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixJQUFJO0FBQ3JCO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsT0FBTztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFVBQVU7QUFDckIsV0FBVyxPQUFPO0FBQ2xCLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQSx3Q0FBd0M7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRCx3QkFBd0I7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixZQUFZ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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhFQUE4RSxrQkFBa0IsRUFBRTtBQUNsRyxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEVBQTBFO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6IjAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuRXh0cmVtZWx5IHNpbXBsZSBjc3MgcGFyc2VyLiBJbnRlbmRlZCB0byBiZSBub3QgbW9yZSB0aGFuIHdoYXQgd2UgbmVlZFxuYW5kIGRlZmluaXRlbHkgbm90IG5lY2Vzc2FyaWx5IGNvcnJlY3QgPSkuXG4qL1xuLyoqIEB1bnJlc3RyaWN0ZWQgKi9cbnZhciBTdHlsZU5vZGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3R5bGVOb2RlKCkge1xuICAgICAgICB0aGlzLnN0YXJ0ID0gMDtcbiAgICAgICAgdGhpcy5lbmQgPSAwO1xuICAgICAgICB0aGlzLnByZXZpb3VzID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLnJ1bGVzID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXJzZWRDc3NUZXh0ID0gJyc7XG4gICAgICAgIHRoaXMuY3NzVGV4dCA9ICcnO1xuICAgICAgICB0aGlzLmF0UnVsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnR5cGUgPSAwO1xuICAgICAgICB0aGlzLmtleWZyYW1lc05hbWUgPSAnJztcbiAgICAgICAgdGhpcy5zZWxlY3RvciA9ICcnO1xuICAgICAgICB0aGlzLnBhcnNlZFNlbGVjdG9yID0gJyc7XG4gICAgfVxuICAgIHJldHVybiBTdHlsZU5vZGU7XG59KCkpO1xuLy8gZ2l2ZW4gYSBzdHJpbmcgb2YgY3NzLCByZXR1cm4gYSBzaW1wbGUgcnVsZSB0cmVlXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKiBAcmV0dXJuIHtTdHlsZU5vZGV9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlKHRleHQpIHtcbiAgICB0ZXh0ID0gY2xlYW4odGV4dCk7XG4gICAgcmV0dXJuIHBhcnNlQ3NzKGxleCh0ZXh0KSwgdGV4dCk7XG59XG4vLyByZW1vdmUgc3R1ZmYgd2UgZG9uJ3QgY2FyZSBhYm91dCB0aGF0IG1heSBoaW5kZXIgcGFyc2luZ1xuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gY3NzVGV4dFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBjbGVhbihjc3NUZXh0KSB7XG4gICAgcmV0dXJuIGNzc1RleHQucmVwbGFjZShSWC5jb21tZW50cywgJycpLnJlcGxhY2UoUlgucG9ydCwgJycpO1xufVxuLy8gc3VwZXIgc2ltcGxlIHsuLi59IGxleGVyIHRoYXQgcmV0dXJucyBhIG5vZGUgdHJlZVxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICogQHJldHVybiB7U3R5bGVOb2RlfVxuICovXG5mdW5jdGlvbiBsZXgodGV4dCkge1xuICAgIHZhciByb290ID0gbmV3IFN0eWxlTm9kZSgpO1xuICAgIHJvb3RbJ3N0YXJ0J10gPSAwO1xuICAgIHJvb3RbJ2VuZCddID0gdGV4dC5sZW5ndGg7XG4gICAgdmFyIG4gPSByb290O1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGV4dC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKHRleHRbaV0gPT09IE9QRU5fQlJBQ0UpIHtcbiAgICAgICAgICAgIGlmICghblsncnVsZXMnXSkge1xuICAgICAgICAgICAgICAgIG5bJ3J1bGVzJ10gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwID0gbjtcbiAgICAgICAgICAgIHZhciBwcmV2aW91cyA9IHBbJ3J1bGVzJ11bcFsncnVsZXMnXS5sZW5ndGggLSAxXSB8fCBudWxsO1xuICAgICAgICAgICAgbiA9IG5ldyBTdHlsZU5vZGUoKTtcbiAgICAgICAgICAgIG5bJ3N0YXJ0J10gPSBpICsgMTtcbiAgICAgICAgICAgIG5bJ3BhcmVudCddID0gcDtcbiAgICAgICAgICAgIG5bJ3ByZXZpb3VzJ10gPSBwcmV2aW91cztcbiAgICAgICAgICAgIHBbJ3J1bGVzJ10ucHVzaChuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0ZXh0W2ldID09PSBDTE9TRV9CUkFDRSkge1xuICAgICAgICAgICAgblsnZW5kJ10gPSBpICsgMTtcbiAgICAgICAgICAgIG4gPSBuWydwYXJlbnQnXSB8fCByb290O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByb290O1xufVxuLy8gYWRkIHNlbGVjdG9ycy9jc3NUZXh0IHRvIG5vZGUgdHJlZVxuLyoqXG4gKiBAcGFyYW0ge1N0eWxlTm9kZX0gbm9kZVxuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqIEByZXR1cm4ge1N0eWxlTm9kZX1cbiAqL1xuZnVuY3Rpb24gcGFyc2VDc3Mobm9kZSwgdGV4dCkge1xuICAgIHZhciB0ID0gdGV4dC5zdWJzdHJpbmcobm9kZVsnc3RhcnQnXSwgbm9kZVsnZW5kJ10gLSAxKTtcbiAgICBub2RlWydwYXJzZWRDc3NUZXh0J10gPSBub2RlWydjc3NUZXh0J10gPSB0LnRyaW0oKTtcbiAgICBpZiAobm9kZS5wYXJlbnQpIHtcbiAgICAgICAgdmFyIHNzID0gbm9kZS5wcmV2aW91cyA/IG5vZGUucHJldmlvdXNbJ2VuZCddIDogbm9kZS5wYXJlbnRbJ3N0YXJ0J107XG4gICAgICAgIHQgPSB0ZXh0LnN1YnN0cmluZyhzcywgbm9kZVsnc3RhcnQnXSAtIDEpO1xuICAgICAgICB0ID0gX2V4cGFuZFVuaWNvZGVFc2NhcGVzKHQpO1xuICAgICAgICB0ID0gdC5yZXBsYWNlKFJYLm11bHRpcGxlU3BhY2VzLCAnICcpO1xuICAgICAgICAvLyBUT0RPKHNvcnZlbGwpOiBhZCBob2M7IG1ha2Ugc2VsZWN0b3IgaW5jbHVkZSBvbmx5IGFmdGVyIGxhc3QgO1xuICAgICAgICAvLyBoZWxwcyB3aXRoIG1peGluIHN5bnRheFxuICAgICAgICB0ID0gdC5zdWJzdHJpbmcodC5sYXN0SW5kZXhPZignOycpICsgMSk7XG4gICAgICAgIHZhciBzID0gbm9kZVsncGFyc2VkU2VsZWN0b3InXSA9IG5vZGVbJ3NlbGVjdG9yJ10gPSB0LnRyaW0oKTtcbiAgICAgICAgbm9kZVsnYXRSdWxlJ10gPSAocy5pbmRleE9mKEFUX1NUQVJUKSA9PT0gMCk7XG4gICAgICAgIC8vIG5vdGUsIHN1cHBvcnQgYSBzdWJzZXQgb2YgcnVsZSB0eXBlcy4uLlxuICAgICAgICBpZiAobm9kZVsnYXRSdWxlJ10pIHtcbiAgICAgICAgICAgIGlmIChzLmluZGV4T2YoTUVESUFfU1RBUlQpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbm9kZVsndHlwZSddID0gdHlwZXMuTUVESUFfUlVMRTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHMubWF0Y2goUlgua2V5ZnJhbWVzUnVsZSkpIHtcbiAgICAgICAgICAgICAgICBub2RlWyd0eXBlJ10gPSB0eXBlcy5LRVlGUkFNRVNfUlVMRTtcbiAgICAgICAgICAgICAgICBub2RlWydrZXlmcmFtZXNOYW1lJ10gPSBub2RlWydzZWxlY3RvciddLnNwbGl0KFJYLm11bHRpcGxlU3BhY2VzKS5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzLmluZGV4T2YoVkFSX1NUQVJUKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIG5vZGVbJ3R5cGUnXSA9IHR5cGVzLk1JWElOX1JVTEU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBub2RlWyd0eXBlJ10gPSB0eXBlcy5TVFlMRV9SVUxFO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHZhciByJCA9IG5vZGVbJ3J1bGVzJ107XG4gICAgaWYgKHIkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gciQubGVuZ3RoLCByID0gdm9pZCAwOyAoaSA8IGwpICYmIChyID0gciRbaV0pOyBpKyspIHtcbiAgICAgICAgICAgIHBhcnNlQ3NzKHIsIHRleHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xufVxuLyoqXG4gKiBjb252ZXJzaW9uIG9mIHNvcnQgdW5pY29kZSBlc2NhcGVzIHdpdGggc3BhY2VzIGxpa2UgYFxcMzMgYCAoYW5kIGxvbmdlcikgaW50b1xuICogZXhwYW5kZWQgZm9ybSB0aGF0IGRvZXNuJ3QgcmVxdWlyZSB0cmFpbGluZyBzcGFjZSBgXFwwMDAwMzNgXG4gKiBAcGFyYW0ge3N0cmluZ30gc1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBfZXhwYW5kVW5pY29kZUVzY2FwZXMocykge1xuICAgIHJldHVybiBzLnJlcGxhY2UoL1xcXFwoWzAtOWEtZl17MSw2fSlcXHMvZ2ksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNvZGUgPSBhcmd1bWVudHNbMV0sIHJlcGVhdCA9IDYgLSBjb2RlLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKHJlcGVhdC0tKSB7XG4gICAgICAgICAgICBjb2RlID0gJzAnICsgY29kZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJ1xcXFwnICsgY29kZTtcbiAgICB9KTtcbn1cbi8qKiBAZW51bSB7bnVtYmVyfSAqL1xudmFyIHR5cGVzID0ge1xuICAgIFNUWUxFX1JVTEU6IDEsXG4gICAgS0VZRlJBTUVTX1JVTEU6IDcsXG4gICAgTUVESUFfUlVMRTogNCxcbiAgICBNSVhJTl9SVUxFOiAxMDAwXG59O1xudmFyIE9QRU5fQlJBQ0UgPSAneyc7XG52YXIgQ0xPU0VfQlJBQ0UgPSAnfSc7XG4vLyBoZWxwZXIgcmVnZXhwJ3NcbnZhciBSWCA9IHtcbiAgICBjb21tZW50czogL1xcL1xcKlteKl0qXFwqKyhbXi8qXVteKl0qXFwqKykqXFwvL2dpbSxcbiAgICBwb3J0OiAvQGltcG9ydFteO10qOy9naW0sXG4gICAgY3VzdG9tUHJvcDogLyg/Ol5bXjtcXC1cXHN9XSspPy0tW147e31dKj86W157fTtdKj8oPzpbO1xcbl18JCkvZ2ltLFxuICAgIG1peGluUHJvcDogLyg/Ol5bXjtcXC1cXHN9XSspPy0tW147e31dKj86W157fTtdKj97W159XSo/fSg/Ols7XFxuXXwkKT8vZ2ltLFxuICAgIG1peGluQXBwbHk6IC9AYXBwbHlcXHMqXFwoP1teKTtdKlxcKT9cXHMqKD86WztcXG5dfCQpPy9naW0sXG4gICAgdmFyQXBwbHk6IC9bXjs6XSo/OlteO10qP3ZhclxcKFteO10qXFwpKD86WztcXG5dfCQpPy9naW0sXG4gICAga2V5ZnJhbWVzUnVsZTogL15AW15cXHNdKmtleWZyYW1lcy8sXG4gICAgbXVsdGlwbGVTcGFjZXM6IC9cXHMrL2dcbn07XG52YXIgVkFSX1NUQVJUID0gJy0tJztcbnZhciBNRURJQV9TVEFSVCA9ICdAbWVkaWEnO1xudmFyIEFUX1NUQVJUID0gJ0AnO1xuZnVuY3Rpb24gZmluZFJlZ2V4KHJlZ2V4LCBjc3NUZXh0LCBvZmZzZXQpIHtcbiAgICByZWdleFsnbGFzdEluZGV4J10gPSAwO1xuICAgIHZhciByID0gY3NzVGV4dC5zdWJzdHJpbmcob2Zmc2V0KS5tYXRjaChyZWdleCk7XG4gICAgaWYgKHIpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gb2Zmc2V0ICsgclsnaW5kZXgnXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICAgIGVuZDogc3RhcnQgKyByWzBdLmxlbmd0aFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbnZhciBWQVJfVVNBR0VfU1RBUlQgPSAvXFxidmFyXFwoLztcbnZhciBWQVJfQVNTSUdOX1NUQVJUID0gL1xcQi0tW1xcdy1dK1xccyo6LztcbnZhciBDT01NRU5UUyA9IC9cXC9cXCpbXipdKlxcKisoW14vKl1bXipdKlxcKispKlxcLy9naW07XG52YXIgVFJBSUxJTkdfTElORVMgPSAvXltcXHQgXStcXG4vZ207XG5mdW5jdGlvbiByZXNvbHZlVmFyKHByb3BzLCBwcm9wLCBmYWxsYmFjaykge1xuICAgIGlmIChwcm9wc1twcm9wXSkge1xuICAgICAgICByZXR1cm4gcHJvcHNbcHJvcF07XG4gICAgfVxuICAgIGlmIChmYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gZXhlY3V0ZVRlbXBsYXRlKGZhbGxiYWNrLCBwcm9wcyk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbn1cbmZ1bmN0aW9uIGZpbmRWYXJFbmRJbmRleChjc3NUZXh0LCBvZmZzZXQpIHtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIHZhciBpID0gb2Zmc2V0O1xuICAgIGZvciAoOyBpIDwgY3NzVGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IGNzc1RleHRbaV07XG4gICAgICAgIGlmIChjID09PSAnKCcpIHtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYyA9PT0gJyknKSB7XG4gICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICAgICAgaWYgKGNvdW50IDw9IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGk7XG59XG5mdW5jdGlvbiBwYXJzZVZhcihjc3NUZXh0LCBvZmZzZXQpIHtcbiAgICB2YXIgdmFyUG9zID0gZmluZFJlZ2V4KFZBUl9VU0FHRV9TVEFSVCwgY3NzVGV4dCwgb2Zmc2V0KTtcbiAgICBpZiAoIXZhclBvcykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIGVuZFZhciA9IGZpbmRWYXJFbmRJbmRleChjc3NUZXh0LCB2YXJQb3Muc3RhcnQpO1xuICAgIHZhciB2YXJDb250ZW50ID0gY3NzVGV4dC5zdWJzdHJpbmcodmFyUG9zLmVuZCwgZW5kVmFyIC0gMSk7XG4gICAgdmFyIF9hID0gdmFyQ29udGVudC5zcGxpdCgnLCcpLCBwcm9wTmFtZSA9IF9hWzBdLCBmYWxsYmFjayA9IF9hLnNsaWNlKDEpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0OiB2YXJQb3Muc3RhcnQsXG4gICAgICAgIGVuZDogZW5kVmFyLFxuICAgICAgICBwcm9wTmFtZTogcHJvcE5hbWUudHJpbSgpLFxuICAgICAgICBmYWxsYmFjazogZmFsbGJhY2subGVuZ3RoID4gMCA/IGZhbGxiYWNrLmpvaW4oJywnKS50cmltKCkgOiB1bmRlZmluZWRcbiAgICB9O1xufVxuZnVuY3Rpb24gY29tcGlsZVZhcihjc3NUZXh0LCB0ZW1wbGF0ZSwgb2Zmc2V0KSB7XG4gICAgdmFyIHZhck1ldGEgPSBwYXJzZVZhcihjc3NUZXh0LCBvZmZzZXQpO1xuICAgIGlmICghdmFyTWV0YSkge1xuICAgICAgICB0ZW1wbGF0ZS5wdXNoKGNzc1RleHQuc3Vic3RyaW5nKG9mZnNldCwgY3NzVGV4dC5sZW5ndGgpKTtcbiAgICAgICAgcmV0dXJuIGNzc1RleHQubGVuZ3RoO1xuICAgIH1cbiAgICB2YXIgcHJvcE5hbWUgPSB2YXJNZXRhLnByb3BOYW1lO1xuICAgIHZhciBmYWxsYmFjayA9IHZhck1ldGEuZmFsbGJhY2sgIT0gbnVsbCA/IGNvbXBpbGVUZW1wbGF0ZSh2YXJNZXRhLmZhbGxiYWNrKSA6IHVuZGVmaW5lZDtcbiAgICB0ZW1wbGF0ZS5wdXNoKGNzc1RleHQuc3Vic3RyaW5nKG9mZnNldCwgdmFyTWV0YS5zdGFydCksIGZ1bmN0aW9uIChwYXJhbXMpIHsgcmV0dXJuIHJlc29sdmVWYXIocGFyYW1zLCBwcm9wTmFtZSwgZmFsbGJhY2spOyB9KTtcbiAgICByZXR1cm4gdmFyTWV0YS5lbmQ7XG59XG5mdW5jdGlvbiBleGVjdXRlVGVtcGxhdGUodGVtcGxhdGUsIHByb3BzKSB7XG4gICAgdmFyIGZpbmFsID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZW1wbGF0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcyA9IHRlbXBsYXRlW2ldO1xuICAgICAgICBmaW5hbCArPSAodHlwZW9mIHMgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgPyBzXG4gICAgICAgICAgICA6IHMocHJvcHMpO1xuICAgIH1cbiAgICByZXR1cm4gZmluYWw7XG59XG5mdW5jdGlvbiBmaW5kRW5kVmFsdWUoY3NzVGV4dCwgb2Zmc2V0KSB7XG4gICAgdmFyIG9uU3RyID0gZmFsc2U7XG4gICAgdmFyIGRvdWJsZSA9IGZhbHNlO1xuICAgIHZhciBpID0gb2Zmc2V0O1xuICAgIGZvciAoOyBpIDwgY3NzVGV4dC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYyA9IGNzc1RleHRbaV07XG4gICAgICAgIGlmIChvblN0cikge1xuICAgICAgICAgICAgaWYgKGRvdWJsZSAmJiBjID09PSAnXCInKSB7XG4gICAgICAgICAgICAgICAgb25TdHIgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZG91YmxlICYmIGMgPT09ICdcXCcnKSB7XG4gICAgICAgICAgICAgICAgb25TdHIgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjID09PSAnXCInKSB7XG4gICAgICAgICAgICAgICAgb25TdHIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGRvdWJsZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjID09PSAnXFwnJykge1xuICAgICAgICAgICAgICAgIG9uU3RyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkb3VibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGMgPT09ICc7Jykge1xuICAgICAgICAgICAgICAgIHJldHVybiBpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGMgPT09ICd9Jykge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpO1xufVxuZnVuY3Rpb24gcmVtb3ZlQ3VzdG9tQXNzaWducyhjc3NUZXh0KSB7XG4gICAgdmFyIGZpbmFsID0gJyc7XG4gICAgdmFyIG9mZnNldCA9IDA7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGFzc2lnblBvcyA9IGZpbmRSZWdleChWQVJfQVNTSUdOX1NUQVJULCBjc3NUZXh0LCBvZmZzZXQpO1xuICAgICAgICB2YXIgc3RhcnQgPSBhc3NpZ25Qb3MgPyBhc3NpZ25Qb3Muc3RhcnQgOiBjc3NUZXh0Lmxlbmd0aDtcbiAgICAgICAgZmluYWwgKz0gY3NzVGV4dC5zdWJzdHJpbmcob2Zmc2V0LCBzdGFydCk7XG4gICAgICAgIGlmIChhc3NpZ25Qb3MpIHtcbiAgICAgICAgICAgIG9mZnNldCA9IGZpbmRFbmRWYWx1ZShjc3NUZXh0LCBzdGFydCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmluYWw7XG59XG5mdW5jdGlvbiBjb21waWxlVGVtcGxhdGUoY3NzVGV4dCkge1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgY3NzVGV4dCA9IGNzc1RleHQucmVwbGFjZShDT01NRU5UUywgJycpO1xuICAgIGNzc1RleHQgPSByZW1vdmVDdXN0b21Bc3NpZ25zKGNzc1RleHQpXG4gICAgICAgIC5yZXBsYWNlKFRSQUlMSU5HX0xJTkVTLCAnJyk7XG4gICAgdmFyIHNlZ21lbnRzID0gW107XG4gICAgd2hpbGUgKGluZGV4IDwgY3NzVGV4dC5sZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSBjb21waWxlVmFyKGNzc1RleHQsIHNlZ21lbnRzLCBpbmRleCk7XG4gICAgfVxuICAgIHJldHVybiBzZWdtZW50cztcbn1cbmZ1bmN0aW9uIHJlc29sdmVWYWx1ZXMoc2VsZWN0b3JzKSB7XG4gICAgdmFyIHByb3BzID0ge307XG4gICAgc2VsZWN0b3JzLmZvckVhY2goZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICAgIHNlbGVjdG9yLmRlY2xhcmF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChkZWMpIHtcbiAgICAgICAgICAgIHByb3BzW2RlYy5wcm9wXSA9IGRlYy52YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgdmFyIHByb3BzVmFsdWVzID0ge307XG4gICAgdmFyIGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhwcm9wcyk7XG4gICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICB2YXIgZGlydHkgPSBmYWxzZTtcbiAgICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgdmFyIGtleSA9IF9hWzBdLCB2YWx1ZSA9IF9hWzFdO1xuICAgICAgICAgICAgdmFyIHByb3BWYWx1ZSA9IGV4ZWN1dGVUZW1wbGF0ZSh2YWx1ZSwgcHJvcHNWYWx1ZXMpO1xuICAgICAgICAgICAgaWYgKHByb3BWYWx1ZSAhPT0gcHJvcHNWYWx1ZXNba2V5XSkge1xuICAgICAgICAgICAgICAgIHByb3BzVmFsdWVzW2tleV0gPSBwcm9wVmFsdWU7XG4gICAgICAgICAgICAgICAgZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFkaXJ0eSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiYnJlYWtcIjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIHZhciBzdGF0ZV8xID0gX2xvb3BfMSgpO1xuICAgICAgICBpZiAoc3RhdGVfMSA9PT0gXCJicmVha1wiKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBwcm9wc1ZhbHVlcztcbn1cbmZ1bmN0aW9uIGdldFNlbGVjdG9ycyhyb290LCBpbmRleCkge1xuICAgIGlmIChpbmRleCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICB9XG4gICAgaWYgKCFyb290LnJ1bGVzKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgdmFyIHNlbGVjdG9ycyA9IFtdO1xuICAgIHJvb3QucnVsZXNcbiAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAocnVsZSkgeyByZXR1cm4gcnVsZS50eXBlID09PSB0eXBlcy5TVFlMRV9SVUxFOyB9KVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbiAocnVsZSkge1xuICAgICAgICB2YXIgZGVjbGFyYXRpb25zID0gZ2V0RGVjbGFyYXRpb25zKHJ1bGUuY3NzVGV4dCk7XG4gICAgICAgIGlmIChkZWNsYXJhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcnVsZS5wYXJzZWRTZWxlY3Rvci5zcGxpdCgnLCcpLmZvckVhY2goZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBzZWxlY3Rvci50cmltKCk7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uczogZGVjbGFyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICBzcGVjaWZpY2l0eTogY29tcHV0ZVNwZWNpZmljaXR5KCksXG4gICAgICAgICAgICAgICAgICAgIG51OiBpbmRleFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaW5kZXgrKztcbiAgICB9KTtcbiAgICByZXR1cm4gc2VsZWN0b3JzO1xufVxuZnVuY3Rpb24gY29tcHV0ZVNwZWNpZmljaXR5KF9zZWxlY3Rvcikge1xuICAgIHJldHVybiAxO1xufVxudmFyIElNUE9SVEFOVCA9ICchaW1wb3J0YW50JztcbnZhciBGSU5EX0RFQ0xBUkFUSU9OUyA9IC8oPzpefFs7XFxze11cXHMqKSgtLVtcXHctXSo/KVxccyo6XFxzKig/OigoPzonKD86XFxcXCd8LikqPyd8XCIoPzpcXFxcXCJ8LikqP1wifFxcKFteKV0qP1xcKXxbXn07e10pKyl8XFx7KFtefV0qKVxcfSg/Oig/PVs7XFxzfV0pfCQpKS9nbTtcbmZ1bmN0aW9uIGdldERlY2xhcmF0aW9ucyhjc3NUZXh0KSB7XG4gICAgdmFyIGRlY2xhcmF0aW9ucyA9IFtdO1xuICAgIHZhciB4QXJyYXk7XG4gICAgd2hpbGUgKHhBcnJheSA9IEZJTkRfREVDTEFSQVRJT05TLmV4ZWMoY3NzVGV4dC50cmltKCkpKSB7XG4gICAgICAgIHZhciBfYSA9IG5vcm1hbGl6ZVZhbHVlKHhBcnJheVsyXSksIHZhbHVlID0gX2EudmFsdWUsIGltcG9ydGFudCA9IF9hLmltcG9ydGFudDtcbiAgICAgICAgZGVjbGFyYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgcHJvcDogeEFycmF5WzFdLnRyaW0oKSxcbiAgICAgICAgICAgIHZhbHVlOiBjb21waWxlVGVtcGxhdGUodmFsdWUpLFxuICAgICAgICAgICAgaW1wb3J0YW50OiBpbXBvcnRhbnQsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZGVjbGFyYXRpb25zO1xufVxuZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICB2YXIgcmVnZXggPSAvXFxzKy9naW07XG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKHJlZ2V4LCAnICcpLnRyaW0oKTtcbiAgICB2YXIgaW1wb3J0YW50ID0gdmFsdWUuZW5kc1dpdGgoSU1QT1JUQU5UKTtcbiAgICBpZiAoaW1wb3J0YW50KSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyKDAsIHZhbHVlLmxlbmd0aCAtIElNUE9SVEFOVC5sZW5ndGgpLnRyaW0oKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBpbXBvcnRhbnQ6IGltcG9ydGFudFxuICAgIH07XG59XG5mdW5jdGlvbiBnZXRBY3RpdmVTZWxlY3RvcnMoaG9zdEVsLCBob3N0U2NvcGVNYXAsIGdsb2JhbFNjb3Blcykge1xuICAgIC8vIGNvbXB1dGVzIHRoZSBjc3Mgc2NvcGVzIHRoYXQgbWlnaHQgYWZmZWN0IHRoaXMgcGFydGljdWxhciBlbGVtZW50XG4gICAgLy8gYXZvaWRpbmcgdXNpbmcgc3ByZWFkIGFycmF5cyB0byBhdm9pZCB0cyBoZWxwZXIgZm5zIHdoZW4gaW4gZXM1XG4gICAgdmFyIHNjb3BlcyA9IFtdO1xuICAgIHZhciBzY29wZXNGb3JFbGVtZW50ID0gZ2V0U2NvcGVzRm9yRWxlbWVudChob3N0U2NvcGVNYXAsIGhvc3RFbCk7XG4gICAgLy8gZ2xvYmFsU2NvcGVzIGFyZSBhbHdheXMgdG9vayBpbnRvIGFjY291bnRcbiAgICBnbG9iYWxTY29wZXMuZm9yRWFjaChmdW5jdGlvbiAocykgeyByZXR1cm4gc2NvcGVzLnB1c2gocyk7IH0pO1xuICAgIC8vIHRoZSBwYXJlbnQgc2NvcGVzIGFyZSBjb21wdXRlZCBieSB3YWxraW5nIHBhcmVudCBkb20gdW50aWwgPGh0bWw+IGlzIHJlYWNoZWRcbiAgICBzY29wZXNGb3JFbGVtZW50LmZvckVhY2goZnVuY3Rpb24gKHMpIHsgcmV0dXJuIHNjb3Blcy5wdXNoKHMpOyB9KTtcbiAgICAvLyBlYWNoIHNjb3BlIG1pZ2h0IGhhdmUgYW4gYXJyYXkgb2YgYXNzb2NpYXRlZCBzZWxlY3RvcnNcbiAgICAvLyBsZXQncyBmbGF0dGVuIHRoZSBjb21wbGV0ZSBhcnJheSBvZiBzZWxlY3RvcnMgZnJvbSBhbGwgdGhlIHNjb3Blc1xuICAgIHZhciBzZWxlY3RvclNldCA9IGdldFNlbGVjdG9yc0ZvclNjb3BlcyhzY29wZXMpO1xuICAgIC8vIHdlIGZpbHRlciB0byBvbmx5IHRoZSBzZWxlY3RvcnMgdGhhdCBtYXRjaGVzIHRoZSBob3N0RWxcbiAgICB2YXIgYWN0aXZlU2VsZWN0b3JzID0gc2VsZWN0b3JTZXQuZmlsdGVyKGZ1bmN0aW9uIChzZWxlY3RvcikgeyByZXR1cm4gbWF0Y2hlcyhob3N0RWwsIHNlbGVjdG9yLnNlbGVjdG9yKTsgfSk7XG4gICAgLy8gc29ydCBzZWxlY3RvcnMgYnkgc3BlY2lmaXR5XG4gICAgcmV0dXJuIHNvcnRTZWxlY3RvcnMoYWN0aXZlU2VsZWN0b3JzKTtcbn1cbmZ1bmN0aW9uIGdldFNjb3Blc0ZvckVsZW1lbnQoaG9zdFRlbXBsYXRlTWFwLCBub2RlKSB7XG4gICAgdmFyIHNjb3BlcyA9IFtdO1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIHZhciBzY29wZSA9IGhvc3RUZW1wbGF0ZU1hcC5nZXQobm9kZSk7XG4gICAgICAgIGlmIChzY29wZSkge1xuICAgICAgICAgICAgc2NvcGVzLnB1c2goc2NvcGUpO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuICAgIHJldHVybiBzY29wZXM7XG59XG5mdW5jdGlvbiBnZXRTZWxlY3RvcnNGb3JTY29wZXMoc2NvcGVzKSB7XG4gICAgdmFyIHNlbGVjdG9ycyA9IFtdO1xuICAgIHNjb3Blcy5mb3JFYWNoKGZ1bmN0aW9uIChzY29wZSkge1xuICAgICAgICBzZWxlY3RvcnMucHVzaC5hcHBseShzZWxlY3RvcnMsIHNjb3BlLnNlbGVjdG9ycyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNlbGVjdG9ycztcbn1cbmZ1bmN0aW9uIHNvcnRTZWxlY3RvcnMoc2VsZWN0b3JzKSB7XG4gICAgc2VsZWN0b3JzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgaWYgKGEuc3BlY2lmaWNpdHkgPT09IGIuc3BlY2lmaWNpdHkpIHtcbiAgICAgICAgICAgIHJldHVybiBhLm51IC0gYi5udTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYS5zcGVjaWZpY2l0eSAtIGIuc3BlY2lmaWNpdHk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNlbGVjdG9ycztcbn1cbmZ1bmN0aW9uIG1hdGNoZXMoZWwsIHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yID09PSAnOnJvb3QnIHx8IHNlbGVjdG9yID09PSAnaHRtbCcgfHwgZWwubWF0Y2hlcyhzZWxlY3Rvcik7XG59XG5mdW5jdGlvbiBwYXJzZUNTUyhvcmlnaW5hbCkge1xuICAgIHZhciBhc3QgPSBwYXJzZShvcmlnaW5hbCk7XG4gICAgdmFyIHRlbXBsYXRlID0gY29tcGlsZVRlbXBsYXRlKG9yaWdpbmFsKTtcbiAgICB2YXIgc2VsZWN0b3JzID0gZ2V0U2VsZWN0b3JzKGFzdCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb3JpZ2luYWw6IG9yaWdpbmFsLFxuICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICAgIHNlbGVjdG9yczogc2VsZWN0b3JzLFxuICAgICAgICB1c2VzQ3NzVmFyczogdGVtcGxhdGUubGVuZ3RoID4gMVxuICAgIH07XG59XG5mdW5jdGlvbiBhZGRHbG9iYWxTdHlsZShnbG9iYWxTY29wZXMsIHN0eWxlRWwpIHtcbiAgICB2YXIgY3NzID0gcGFyc2VDU1Moc3R5bGVFbC5pbm5lckhUTUwpO1xuICAgIGNzcy5zdHlsZUVsID0gc3R5bGVFbDtcbiAgICBnbG9iYWxTY29wZXMucHVzaChjc3MpO1xufVxuZnVuY3Rpb24gdXBkYXRlR2xvYmFsU2NvcGVzKHNjb3Blcykge1xuICAgIHZhciBzZWxlY3RvcnMgPSBnZXRTZWxlY3RvcnNGb3JTY29wZXMoc2NvcGVzKTtcbiAgICB2YXIgcHJvcHMgPSByZXNvbHZlVmFsdWVzKHNlbGVjdG9ycyk7XG4gICAgc2NvcGVzLmZvckVhY2goZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgIGlmIChzY29wZS51c2VzQ3NzVmFycykge1xuICAgICAgICAgICAgc2NvcGUuc3R5bGVFbC5pbm5lckhUTUwgPSBleGVjdXRlVGVtcGxhdGUoc2NvcGUudGVtcGxhdGUsIHByb3BzKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuZnVuY3Rpb24gcmVTY29wZShzY29wZSwgc2NvcGVJZCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9IHNjb3BlLnRlbXBsYXRlLm1hcChmdW5jdGlvbiAoc2VnbWVudCkge1xuICAgICAgICByZXR1cm4gKHR5cGVvZiBzZWdtZW50ID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgID8gcmVwbGFjZVNjb3BlKHNlZ21lbnQsIHNjb3BlLnNjb3BlSWQsIHNjb3BlSWQpXG4gICAgICAgICAgICA6IHNlZ21lbnQ7XG4gICAgfSk7XG4gICAgdmFyIHNlbGVjdG9ycyA9IHNjb3BlLnNlbGVjdG9ycy5tYXAoZnVuY3Rpb24gKHNlbCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgc2VsLCB7IHNlbGVjdG9yOiByZXBsYWNlU2NvcGUoc2VsLnNlbGVjdG9yLCBzY29wZS5zY29wZUlkLCBzY29wZUlkKSB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgc2NvcGUsIHsgdGVtcGxhdGU6IHRlbXBsYXRlLFxuICAgICAgICBzZWxlY3RvcnM6IHNlbGVjdG9ycyxcbiAgICAgICAgc2NvcGVJZDogc2NvcGVJZCB9KTtcbn1cbmZ1bmN0aW9uIHJlcGxhY2VTY29wZShvcmlnaW5hbCwgb2xkU2NvcGVJZCwgbmV3U2NvcGVJZCkge1xuICAgIG9yaWdpbmFsID0gcmVwbGFjZUFsbChvcmlnaW5hbCwgXCJcXFxcLlwiICsgb2xkU2NvcGVJZCwgXCIuXCIgKyBuZXdTY29wZUlkKTtcbiAgICByZXR1cm4gb3JpZ2luYWw7XG59XG5mdW5jdGlvbiByZXBsYWNlQWxsKGlucHV0LCBmaW5kLCByZXBsYWNlKSB7XG4gICAgcmV0dXJuIGlucHV0LnJlcGxhY2UobmV3IFJlZ0V4cChmaW5kLCAnZycpLCByZXBsYWNlKTtcbn1cbmZ1bmN0aW9uIGxvYWREb2N1bWVudChkb2MsIGdsb2JhbFNjb3Blcykge1xuICAgIGxvYWREb2N1bWVudFN0eWxlcyhkb2MsIGdsb2JhbFNjb3Blcyk7XG4gICAgcmV0dXJuIGxvYWREb2N1bWVudExpbmtzKGRvYywgZ2xvYmFsU2NvcGVzKTtcbn1cbmZ1bmN0aW9uIGxvYWREb2N1bWVudExpbmtzKGRvYywgZ2xvYmFsU2NvcGVzKSB7XG4gICAgdmFyIHByb21pc2VzID0gW107XG4gICAgdmFyIGxpbmtFbG1zID0gZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpbmtbcmVsPVwic3R5bGVzaGVldFwiXVtocmVmXScpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlua0VsbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcHJvbWlzZXMucHVzaChhZGRHbG9iYWxMaW5rKGRvYywgZ2xvYmFsU2NvcGVzLCBsaW5rRWxtc1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufVxuZnVuY3Rpb24gbG9hZERvY3VtZW50U3R5bGVzKGRvYywgZ2xvYmFsU2NvcGVzKSB7XG4gICAgdmFyIHN0eWxlRWxtcyA9IGRvYy5xdWVyeVNlbGVjdG9yQWxsKCdzdHlsZTpub3QoW2RhdGEtc3R5bGVzXSknKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlRWxtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBhZGRHbG9iYWxTdHlsZShnbG9iYWxTY29wZXMsIHN0eWxlRWxtc1tpXSk7XG4gICAgfVxufVxuZnVuY3Rpb24gYWRkR2xvYmFsTGluayhkb2MsIGdsb2JhbFNjb3BlcywgbGlua0VsbSkge1xuICAgIHZhciB1cmwgPSBsaW5rRWxtLmhyZWY7XG4gICAgcmV0dXJuIGZldGNoKHVybCkudGhlbihmdW5jdGlvbiAocnNwKSB7IHJldHVybiByc3AudGV4dCgpOyB9KS50aGVuKGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIGlmIChoYXNDc3NWYXJpYWJsZXModGV4dCkgJiYgbGlua0VsbS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICBpZiAoaGFzUmVsYXRpdmVVcmxzKHRleHQpKSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IGZpeFJlbGF0aXZlVXJscyh0ZXh0LCB1cmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHN0eWxlRWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgICAgIHN0eWxlRWwuc2V0QXR0cmlidXRlKCdkYXRhLXN0eWxlcycsICcnKTtcbiAgICAgICAgICAgIHN0eWxlRWwuaW5uZXJIVE1MID0gdGV4dDtcbiAgICAgICAgICAgIGFkZEdsb2JhbFN0eWxlKGdsb2JhbFNjb3Blcywgc3R5bGVFbCk7XG4gICAgICAgICAgICBsaW5rRWxtLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlRWwsIGxpbmtFbG0pO1xuICAgICAgICAgICAgbGlua0VsbS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH0pO1xufVxuLy8gVGhpcyByZWdleHAgdHJpZXMgdG8gZGV0ZXJtaW5lIHdoZW4gYSB2YXJpYWJsZSBpcyBkZWNsYXJlZCwgZm9yIGV4YW1wbGU6XG4vL1xuLy8gLm15LWVsIHsgLS1oaWdobGlnaHQtY29sb3I6IGdyZWVuOyB9XG4vL1xuLy8gYnV0IHdlIGRvbid0IHdhbnQgdG8gdHJpZ2dlciB3aGVuIGEgY2xhc3NuYW1lIHVzZXMgXCItLVwiIG9yIGEgcHNldWRvLWNsYXNzIGlzXG4vLyB1c2VkLiBXZSBhc3N1bWUgdGhhdCB0aGUgb25seSBjaGFyYWN0ZXJzIHRoYXQgY2FuIHByZWNlZWQgYSB2YXJpYWJsZVxuLy8gZGVjbGFyYXRpb24gYXJlIFwie1wiLCBmcm9tIGFuIG9wZW5pbmcgYmxvY2ssIFwiO1wiIGZyb20gYSBwcmVjZWVkaW5nIHJ1bGUsIG9yIGFcbi8vIHNwYWNlLiBUaGlzIHByZXZlbnRzIHRoZSByZWdleHAgZnJvbSBtYXRjaGluZyBhIHdvcmQgaW4gYSBzZWxlY3Rvciwgc2luY2Vcbi8vIHRoZXkgd291bGQgbmVlZCB0byBzdGFydCB3aXRoIGEgXCIuXCIgb3IgXCIjXCIuIChXZSBhc3N1bWUgZWxlbWVudCBuYW1lcyBkb24ndFxuLy8gc3RhcnQgd2l0aCBcIi0tXCIpLlxudmFyIENTU19WQVJJQUJMRV9SRUdFWFAgPSAvW1xcczt7XS0tWy1hLXpBLVowLTldK1xccyo6L207XG5mdW5jdGlvbiBoYXNDc3NWYXJpYWJsZXMoY3NzKSB7XG4gICAgcmV0dXJuIGNzcy5pbmRleE9mKCd2YXIoJykgPiAtMSB8fCBDU1NfVkFSSUFCTEVfUkVHRVhQLnRlc3QoY3NzKTtcbn1cbi8vIFRoaXMgcmVnZXhwIGZpbmQgYWxsIHVybCgpIHVzYWdlcyB3aXRoIHJlbGF0aXZlIHVybHNcbnZhciBDU1NfVVJMX1JFR0VYUCA9IC91cmxbXFxzXSpcXChbXFxzXSpbJ1wiXT8oPyFbaHR0cHwvXSkoW15cXCdcXFwiXFwpXSopW1xcc10qWydcIl0/XFwpW1xcc10qL2dpbTtcbmZ1bmN0aW9uIGhhc1JlbGF0aXZlVXJscyhjc3MpIHtcbiAgICBDU1NfVVJMX1JFR0VYUC5sYXN0SW5kZXggPSAwO1xuICAgIHJldHVybiBDU1NfVVJMX1JFR0VYUC50ZXN0KGNzcyk7XG59XG5mdW5jdGlvbiBmaXhSZWxhdGl2ZVVybHMoY3NzLCBvcmlnaW5hbFVybCkge1xuICAgIC8vIGdldCB0aGUgYmFzZXBhdGggZnJvbSB0aGUgb3JpZ2luYWwgaW1wb3J0IHVybFxuICAgIHZhciBiYXNlUGF0aCA9IG9yaWdpbmFsVXJsLnJlcGxhY2UoL1teL10qJC8sICcnKTtcbiAgICAvLyByZXBsYWNlIHRoZSByZWxhdGl2ZSB1cmwsIHdpdGggdGhlIG5ldyByZWxhdGl2ZSB1cmxcbiAgICByZXR1cm4gY3NzLnJlcGxhY2UoQ1NTX1VSTF9SRUdFWFAsIGZ1bmN0aW9uIChmdWxsTWF0Y2gsIHVybCkge1xuICAgICAgICAvLyByaGUgbmV3IHJlbGF0aXZlIHBhdGggaXMgdGhlIGJhc2UgcGF0aCArIHVyaVxuICAgICAgICAvLyBUT0RPOiBub3JtYWxpemUgcmVsYXRpdmUgVVJMXG4gICAgICAgIHZhciByZWxhdGl2ZVVybCA9IGJhc2VQYXRoICsgdXJsO1xuICAgICAgICByZXR1cm4gZnVsbE1hdGNoLnJlcGxhY2UodXJsLCByZWxhdGl2ZVVybCk7XG4gICAgfSk7XG59XG52YXIgQ3VzdG9tU3R5bGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ3VzdG9tU3R5bGUod2luLCBkb2MpIHtcbiAgICAgICAgdGhpcy53aW4gPSB3aW47XG4gICAgICAgIHRoaXMuZG9jID0gZG9jO1xuICAgICAgICB0aGlzLmNvdW50ID0gMDtcbiAgICAgICAgdGhpcy5ob3N0U3R5bGVNYXAgPSBuZXcgV2Vha01hcCgpO1xuICAgICAgICB0aGlzLmhvc3RTY29wZU1hcCA9IG5ldyBXZWFrTWFwKCk7XG4gICAgICAgIHRoaXMuZ2xvYmFsU2NvcGVzID0gW107XG4gICAgICAgIHRoaXMuc2NvcGVzTWFwID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICBDdXN0b21TdHlsZS5wcm90b3R5cGUuaW5pdFNoaW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgX3RoaXMud2luLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbG9hZERvY3VtZW50KF90aGlzLmRvYywgX3RoaXMuZ2xvYmFsU2NvcGVzKS50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlc29sdmUoKTsgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBDdXN0b21TdHlsZS5wcm90b3R5cGUuYWRkTGluayA9IGZ1bmN0aW9uIChsaW5rRWwpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgcmV0dXJuIGFkZEdsb2JhbExpbmsodGhpcy5kb2MsIHRoaXMuZ2xvYmFsU2NvcGVzLCBsaW5rRWwpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMudXBkYXRlR2xvYmFsKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgQ3VzdG9tU3R5bGUucHJvdG90eXBlLmFkZEdsb2JhbFN0eWxlID0gZnVuY3Rpb24gKHN0eWxlRWwpIHtcbiAgICAgICAgYWRkR2xvYmFsU3R5bGUodGhpcy5nbG9iYWxTY29wZXMsIHN0eWxlRWwpO1xuICAgICAgICB0aGlzLnVwZGF0ZUdsb2JhbCgpO1xuICAgIH07XG4gICAgQ3VzdG9tU3R5bGUucHJvdG90eXBlLmNyZWF0ZUhvc3RTdHlsZSA9IGZ1bmN0aW9uIChob3N0RWwsIGNzc1Njb3BlSWQsIGNzc1RleHQsIGlzU2NvcGVkKSB7XG4gICAgICAgIGlmICh0aGlzLmhvc3RTY29wZU1hcC5oYXMoaG9zdEVsKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdob3N0IHN0eWxlIGFscmVhZHkgY3JlYXRlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBiYXNlU2NvcGUgPSB0aGlzLnJlZ2lzdGVySG9zdFRlbXBsYXRlKGNzc1RleHQsIGNzc1Njb3BlSWQsIGlzU2NvcGVkKTtcbiAgICAgICAgdmFyIHN0eWxlRWwgPSB0aGlzLmRvYy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBpZiAoIWJhc2VTY29wZS51c2VzQ3NzVmFycykge1xuICAgICAgICAgICAgLy8gVGhpcyBjb21wb25lbnQgZG9lcyBub3QgdXNlIChyZWFkKSBjc3MgdmFyaWFibGVzXG4gICAgICAgICAgICBzdHlsZUVsLmlubmVySFRNTCA9IGNzc1RleHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNTY29wZWQpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgY29tcG9uZW50IGlzIGR5bmFtaWM6IHVzZXMgY3NzIHZhciBhbmQgaXMgc2NvcGVkXG4gICAgICAgICAgICBzdHlsZUVsWydzLXNjJ10gPSBjc3NTY29wZUlkID0gYmFzZVNjb3BlLnNjb3BlSWQgKyBcIi1cIiArIHRoaXMuY291bnQ7XG4gICAgICAgICAgICBzdHlsZUVsLmlubmVySFRNTCA9ICcvKm5lZWRzIHVwZGF0ZSovJztcbiAgICAgICAgICAgIHRoaXMuaG9zdFN0eWxlTWFwLnNldChob3N0RWwsIHN0eWxlRWwpO1xuICAgICAgICAgICAgdGhpcy5ob3N0U2NvcGVNYXAuc2V0KGhvc3RFbCwgcmVTY29wZShiYXNlU2NvcGUsIGNzc1Njb3BlSWQpKTtcbiAgICAgICAgICAgIHRoaXMuY291bnQrKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgY29tcG9uZW50IHVzZXMgY3NzIHZhcnMsIGJ1dCBpdCdzIG5vLWVuY2Fwc3VsYXRpb24gKGdsb2JhbCBzdGF0aWMpXG4gICAgICAgICAgICBiYXNlU2NvcGUuc3R5bGVFbCA9IHN0eWxlRWw7XG4gICAgICAgICAgICBpZiAoIWJhc2VTY29wZS51c2VzQ3NzVmFycykge1xuICAgICAgICAgICAgICAgIHN0eWxlRWwuaW5uZXJIVE1MID0gZXhlY3V0ZVRlbXBsYXRlKGJhc2VTY29wZS50ZW1wbGF0ZSwge30pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5nbG9iYWxTY29wZXMucHVzaChiYXNlU2NvcGUpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVHbG9iYWwoKTtcbiAgICAgICAgICAgIHRoaXMuaG9zdFNjb3BlTWFwLnNldChob3N0RWwsIGJhc2VTY29wZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0eWxlRWw7XG4gICAgfTtcbiAgICBDdXN0b21TdHlsZS5wcm90b3R5cGUucmVtb3ZlSG9zdCA9IGZ1bmN0aW9uIChob3N0RWwpIHtcbiAgICAgICAgdmFyIGNzcyA9IHRoaXMuaG9zdFN0eWxlTWFwLmdldChob3N0RWwpO1xuICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICBjc3MucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ob3N0U3R5bGVNYXAuZGVsZXRlKGhvc3RFbCk7XG4gICAgICAgIHRoaXMuaG9zdFNjb3BlTWFwLmRlbGV0ZShob3N0RWwpO1xuICAgIH07XG4gICAgQ3VzdG9tU3R5bGUucHJvdG90eXBlLnVwZGF0ZUhvc3QgPSBmdW5jdGlvbiAoaG9zdEVsKSB7XG4gICAgICAgIHZhciBzY29wZSA9IHRoaXMuaG9zdFNjb3BlTWFwLmdldChob3N0RWwpO1xuICAgICAgICBpZiAoc2NvcGUgJiYgc2NvcGUudXNlc0Nzc1ZhcnMgJiYgc2NvcGUuaXNTY29wZWQpIHtcbiAgICAgICAgICAgIHZhciBzdHlsZUVsID0gdGhpcy5ob3N0U3R5bGVNYXAuZ2V0KGhvc3RFbCk7XG4gICAgICAgICAgICBpZiAoc3R5bGVFbCkge1xuICAgICAgICAgICAgICAgIHZhciBzZWxlY3RvcnMgPSBnZXRBY3RpdmVTZWxlY3RvcnMoaG9zdEVsLCB0aGlzLmhvc3RTY29wZU1hcCwgdGhpcy5nbG9iYWxTY29wZXMpO1xuICAgICAgICAgICAgICAgIHZhciBwcm9wcyA9IHJlc29sdmVWYWx1ZXMoc2VsZWN0b3JzKTtcbiAgICAgICAgICAgICAgICBzdHlsZUVsLmlubmVySFRNTCA9IGV4ZWN1dGVUZW1wbGF0ZShzY29wZS50ZW1wbGF0ZSwgcHJvcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBDdXN0b21TdHlsZS5wcm90b3R5cGUudXBkYXRlR2xvYmFsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB1cGRhdGVHbG9iYWxTY29wZXModGhpcy5nbG9iYWxTY29wZXMpO1xuICAgIH07XG4gICAgQ3VzdG9tU3R5bGUucHJvdG90eXBlLnJlZ2lzdGVySG9zdFRlbXBsYXRlID0gZnVuY3Rpb24gKGNzc1RleHQsIHNjb3BlSWQsIGlzU2NvcGVkKSB7XG4gICAgICAgIHZhciBzY29wZSA9IHRoaXMuc2NvcGVzTWFwLmdldChzY29wZUlkKTtcbiAgICAgICAgaWYgKCFzY29wZSkge1xuICAgICAgICAgICAgc2NvcGUgPSBwYXJzZUNTUyhjc3NUZXh0KTtcbiAgICAgICAgICAgIHNjb3BlLnNjb3BlSWQgPSBzY29wZUlkO1xuICAgICAgICAgICAgc2NvcGUuaXNTY29wZWQgPSBpc1Njb3BlZDtcbiAgICAgICAgICAgIHRoaXMuc2NvcGVzTWFwLnNldChzY29wZUlkLCBzY29wZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNjb3BlO1xuICAgIH07XG4gICAgcmV0dXJuIEN1c3RvbVN0eWxlO1xufSgpKTtcbnZhciB3aW4gPSB3aW5kb3c7XG5mdW5jdGlvbiBuZWVkc1NoaW0oKSB7XG4gICAgcmV0dXJuICEod2luLkNTUyAmJiB3aW4uQ1NTLnN1cHBvcnRzICYmIHdpbi5DU1Muc3VwcG9ydHMoJ2NvbG9yJywgJ3ZhcigtLWMpJykpO1xufVxuaWYgKCF3aW4uX19zdGVuY2lsX2Nzc3NoaW0gJiYgbmVlZHNTaGltKCkpIHtcbiAgICB3aW4uX19zdGVuY2lsX2Nzc3NoaW0gPSBuZXcgQ3VzdG9tU3R5bGUod2luLCBkb2N1bWVudCk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9