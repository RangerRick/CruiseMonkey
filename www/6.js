(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[6],{

/***/ "./node_modules/@ionic/pwa-elements/dist/esm-es5/shadow-css-9e778f69-c68d0961.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/@ionic/pwa-elements/dist/esm-es5/shadow-css-9e778f69-c68d0961.js ***!
  \***************************************************************************************/
/*! exports provided: scopeCss */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scopeCss", function() { return scopeCss; });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * This file is a port of shadowCSS from webcomponents.js to TypeScript.
 * https://github.com/webcomponents/webcomponentsjs/blob/4efecd7e0e/src/ShadowCSS/ShadowCSS.js
 * https://github.com/angular/angular/blob/master/packages/compiler/src/shadow_css.ts
 */
var safeSelector = function (selector) {
    var placeholders = [];
    var index = 0;
    var content;
    // Replaces attribute selectors with placeholders.
    // The WS in [attr="va lue"] would otherwise be interpreted as a selector separator.
    selector = selector.replace(/(\[[^\]]*\])/g, function (_, keep) {
        var replaceBy = "__ph-" + index + "__";
        placeholders.push(keep);
        index++;
        return replaceBy;
    });
    // Replaces the expression in `:nth-child(2n + 1)` with a placeholder.
    // WS and "+" would otherwise be interpreted as selector separators.
    content = selector.replace(/(:nth-[-\w]+)(\([^)]+\))/g, function (_, pseudo, exp) {
        var replaceBy = "__ph-" + index + "__";
        placeholders.push(exp);
        index++;
        return pseudo + replaceBy;
    });
    var ss = {
        content: content,
        placeholders: placeholders,
    };
    return ss;
};
var restoreSafeSelector = function (placeholders, content) {
    return content.replace(/__ph-(\d+)__/g, function (_, index) { return placeholders[+index]; });
};
var _polyfillHost = '-shadowcsshost';
var _polyfillSlotted = '-shadowcssslotted';
// note: :host-context pre-processed to -shadowcsshostcontext.
var _polyfillHostContext = '-shadowcsscontext';
var _parenSuffix = ')(?:\\((' +
    '(?:\\([^)(]*\\)|[^)(]*)+?' +
    ')\\))?([^,{]*)';
var _cssColonHostRe = new RegExp('(' + _polyfillHost + _parenSuffix, 'gim');
var _cssColonHostContextRe = new RegExp('(' + _polyfillHostContext + _parenSuffix, 'gim');
var _cssColonSlottedRe = new RegExp('(' + _polyfillSlotted + _parenSuffix, 'gim');
var _polyfillHostNoCombinator = _polyfillHost + '-no-combinator';
var _polyfillHostNoCombinatorRe = /-shadowcsshost-no-combinator([^\s]*)/;
var _shadowDOMSelectorsRe = [
    /::shadow/g,
    /::content/g
];
var _selectorReSuffix = '([>\\s~+\[.,{:][\\s\\S]*)?$';
var _polyfillHostRe = /-shadowcsshost/gim;
var _colonHostRe = /:host/gim;
var _colonSlottedRe = /::slotted/gim;
var _colonHostContextRe = /:host-context/gim;
var _commentRe = /\/\*\s*[\s\S]*?\*\//g;
var stripComments = function (input) {
    return input.replace(_commentRe, '');
};
var _commentWithHashRe = /\/\*\s*#\s*source(Mapping)?URL=[\s\S]+?\*\//g;
var extractCommentsWithHash = function (input) {
    return input.match(_commentWithHashRe) || [];
};
var _ruleRe = /(\s*)([^;\{\}]+?)(\s*)((?:{%BLOCK%}?\s*;?)|(?:\s*;))/g;
var _curlyRe = /([{}])/g;
var OPEN_CURLY = '{';
var CLOSE_CURLY = '}';
var BLOCK_PLACEHOLDER = '%BLOCK%';
var processRules = function (input, ruleCallback) {
    var inputWithEscapedBlocks = escapeBlocks(input);
    var nextBlockIndex = 0;
    return inputWithEscapedBlocks.escapedString.replace(_ruleRe, function () {
        var m = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            m[_i] = arguments[_i];
        }
        var selector = m[2];
        var content = '';
        var suffix = m[4];
        var contentPrefix = '';
        if (suffix && suffix.startsWith('{' + BLOCK_PLACEHOLDER)) {
            content = inputWithEscapedBlocks.blocks[nextBlockIndex++];
            suffix = suffix.substring(BLOCK_PLACEHOLDER.length + 1);
            contentPrefix = '{';
        }
        var cssRule = {
            selector: selector,
            content: content
        };
        var rule = ruleCallback(cssRule);
        return "" + m[1] + rule.selector + m[3] + contentPrefix + rule.content + suffix;
    });
};
var escapeBlocks = function (input) {
    var inputParts = input.split(_curlyRe);
    var resultParts = [];
    var escapedBlocks = [];
    var bracketCount = 0;
    var currentBlockParts = [];
    for (var partIndex = 0; partIndex < inputParts.length; partIndex++) {
        var part = inputParts[partIndex];
        if (part === CLOSE_CURLY) {
            bracketCount--;
        }
        if (bracketCount > 0) {
            currentBlockParts.push(part);
        }
        else {
            if (currentBlockParts.length > 0) {
                escapedBlocks.push(currentBlockParts.join(''));
                resultParts.push(BLOCK_PLACEHOLDER);
                currentBlockParts = [];
            }
            resultParts.push(part);
        }
        if (part === OPEN_CURLY) {
            bracketCount++;
        }
    }
    if (currentBlockParts.length > 0) {
        escapedBlocks.push(currentBlockParts.join(''));
        resultParts.push(BLOCK_PLACEHOLDER);
    }
    var strEscapedBlocks = {
        escapedString: resultParts.join(''),
        blocks: escapedBlocks
    };
    return strEscapedBlocks;
};
var insertPolyfillHostInCssText = function (selector) {
    selector = selector
        .replace(_colonHostContextRe, _polyfillHostContext)
        .replace(_colonHostRe, _polyfillHost)
        .replace(_colonSlottedRe, _polyfillSlotted);
    return selector;
};
var convertColonRule = function (cssText, regExp, partReplacer) {
    // m[1] = :host(-context), m[2] = contents of (), m[3] rest of rule
    return cssText.replace(regExp, function () {
        var m = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            m[_i] = arguments[_i];
        }
        if (m[2]) {
            var parts = m[2].split(',');
            var r = [];
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i].trim();
                if (!p)
                    break;
                r.push(partReplacer(_polyfillHostNoCombinator, p, m[3]));
            }
            return r.join(',');
        }
        else {
            return _polyfillHostNoCombinator + m[3];
        }
    });
};
var colonHostPartReplacer = function (host, part, suffix) {
    return host + part.replace(_polyfillHost, '') + suffix;
};
var convertColonHost = function (cssText) {
    return convertColonRule(cssText, _cssColonHostRe, colonHostPartReplacer);
};
var colonHostContextPartReplacer = function (host, part, suffix) {
    if (part.indexOf(_polyfillHost) > -1) {
        return colonHostPartReplacer(host, part, suffix);
    }
    else {
        return host + part + suffix + ', ' + part + ' ' + host + suffix;
    }
};
var convertColonSlotted = function (cssText, slotAttr) {
    var regExp = _cssColonSlottedRe;
    return cssText.replace(regExp, function () {
        var m = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            m[_i] = arguments[_i];
        }
        if (m[2]) {
            var compound = m[2].trim();
            var suffix = m[3];
            var sel = '.' + slotAttr + ' > ' + compound + suffix;
            return sel;
        }
        else {
            return _polyfillHostNoCombinator + m[3];
        }
    });
};
var convertColonHostContext = function (cssText) {
    return convertColonRule(cssText, _cssColonHostContextRe, colonHostContextPartReplacer);
};
var convertShadowDOMSelectors = function (cssText) {
    return _shadowDOMSelectorsRe.reduce(function (result, pattern) { return result.replace(pattern, ' '); }, cssText);
};
var makeScopeMatcher = function (scopeSelector) {
    var lre = /\[/g;
    var rre = /\]/g;
    scopeSelector = scopeSelector.replace(lre, '\\[').replace(rre, '\\]');
    return new RegExp('^(' + scopeSelector + ')' + _selectorReSuffix, 'm');
};
var selectorNeedsScoping = function (selector, scopeSelector) {
    var re = makeScopeMatcher(scopeSelector);
    return !re.test(selector);
};
var applySimpleSelectorScope = function (selector, scopeSelector, hostSelector) {
    // In Android browser, the lastIndex is not reset when the regex is used in String.replace()
    _polyfillHostRe.lastIndex = 0;
    if (_polyfillHostRe.test(selector)) {
        var replaceBy_1 = "." + hostSelector;
        return selector
            .replace(_polyfillHostNoCombinatorRe, function (_, selector) {
            return selector.replace(/([^:]*)(:*)(.*)/, function (_, before, colon, after) {
                return before + replaceBy_1 + colon + after;
            });
        })
            .replace(_polyfillHostRe, replaceBy_1 + ' ');
    }
    return scopeSelector + ' ' + selector;
};
var applyStrictSelectorScope = function (selector, scopeSelector, hostSelector) {
    var isRe = /\[is=([^\]]*)\]/g;
    scopeSelector = scopeSelector.replace(isRe, function (_) {
        var parts = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            parts[_i - 1] = arguments[_i];
        }
        return parts[0];
    });
    var className = '.' + scopeSelector;
    var _scopeSelectorPart = function (p) {
        var scopedP = p.trim();
        if (!scopedP) {
            return '';
        }
        if (p.indexOf(_polyfillHostNoCombinator) > -1) {
            scopedP = applySimpleSelectorScope(p, scopeSelector, hostSelector);
        }
        else {
            // remove :host since it should be unnecessary
            var t = p.replace(_polyfillHostRe, '');
            if (t.length > 0) {
                var matches = t.match(/([^:]*)(:*)(.*)/);
                if (matches) {
                    scopedP = matches[1] + className + matches[2] + matches[3];
                }
            }
        }
        return scopedP;
    };
    var safeContent = safeSelector(selector);
    selector = safeContent.content;
    var scopedSelector = '';
    var startIndex = 0;
    var res;
    var sep = /( |>|\+|~(?!=))\s*/g;
    // If a selector appears before :host it should not be shimmed as it
    // matches on ancestor elements and not on elements in the host's shadow
    // `:host-context(div)` is transformed to
    // `-shadowcsshost-no-combinatordiv, div -shadowcsshost-no-combinator`
    // the `div` is not part of the component in the 2nd selectors and should not be scoped.
    // Historically `component-tag:host` was matching the component so we also want to preserve
    // this behavior to avoid breaking legacy apps (it should not match).
    // The behavior should be:
    // - `tag:host` -> `tag[h]` (this is to avoid breaking legacy apps, should not match anything)
    // - `tag :host` -> `tag [h]` (`tag` is not scoped because it's considered part of a
    //   `:host-context(tag)`)
    var hasHost = selector.indexOf(_polyfillHostNoCombinator) > -1;
    // Only scope parts after the first `-shadowcsshost-no-combinator` when it is present
    var shouldScope = !hasHost;
    while ((res = sep.exec(selector)) !== null) {
        var separator = res[1];
        var part_1 = selector.slice(startIndex, res.index).trim();
        shouldScope = shouldScope || part_1.indexOf(_polyfillHostNoCombinator) > -1;
        var scopedPart = shouldScope ? _scopeSelectorPart(part_1) : part_1;
        scopedSelector += scopedPart + " " + separator + " ";
        startIndex = sep.lastIndex;
    }
    var part = selector.substring(startIndex);
    shouldScope = shouldScope || part.indexOf(_polyfillHostNoCombinator) > -1;
    scopedSelector += shouldScope ? _scopeSelectorPart(part) : part;
    // replace the placeholders with their original values
    return restoreSafeSelector(safeContent.placeholders, scopedSelector);
};
var scopeSelector = function (selector, scopeSelectorText, hostSelector, slotSelector) {
    return selector.split(',')
        .map(function (shallowPart) {
        if (slotSelector && shallowPart.indexOf('.' + slotSelector) > -1) {
            return shallowPart.trim();
        }
        if (selectorNeedsScoping(shallowPart, scopeSelectorText)) {
            return applyStrictSelectorScope(shallowPart, scopeSelectorText, hostSelector).trim();
        }
        else {
            return shallowPart.trim();
        }
    })
        .join(', ');
};
var scopeSelectors = function (cssText, scopeSelectorText, hostSelector, slotSelector, commentOriginalSelector) {
    return processRules(cssText, function (rule) {
        var selector = rule.selector;
        var content = rule.content;
        if (rule.selector[0] !== '@') {
            selector = scopeSelector(rule.selector, scopeSelectorText, hostSelector, slotSelector);
        }
        else if (rule.selector.startsWith('@media') || rule.selector.startsWith('@supports') ||
            rule.selector.startsWith('@page') || rule.selector.startsWith('@document')) {
            content = scopeSelectors(rule.content, scopeSelectorText, hostSelector, slotSelector);
        }
        var cssRule = {
            selector: selector.replace(/\s{2,}/g, ' ').trim(),
            content: content
        };
        return cssRule;
    });
};
var scopeCssText = function (cssText, scopeId, hostScopeId, slotScopeId, commentOriginalSelector) {
    cssText = insertPolyfillHostInCssText(cssText);
    cssText = convertColonHost(cssText);
    cssText = convertColonHostContext(cssText);
    cssText = convertColonSlotted(cssText, slotScopeId);
    cssText = convertShadowDOMSelectors(cssText);
    if (scopeId) {
        cssText = scopeSelectors(cssText, scopeId, hostScopeId, slotScopeId);
    }
    cssText = cssText.replace(/-shadowcsshost-no-combinator/g, "." + hostScopeId);
    cssText = cssText.replace(/>\s*\*\s+([^{, ]+)/gm, ' $1 ');
    return cssText.trim();
};
var scopeCss = function (cssText, scopeId, commentOriginalSelector) {
    var hostScopeId = scopeId + '-h';
    var slotScopeId = scopeId + '-s';
    var commentsWithHash = extractCommentsWithHash(cssText);
    cssText = stripComments(cssText);
    var orgSelectors = [];
    if (commentOriginalSelector) {
        var processCommentedSelector_1 = function (rule) {
            var placeholder = "/*!@___" + orgSelectors.length + "___*/";
            var comment = "/*!@" + rule.selector + "*/";
            orgSelectors.push({ placeholder: placeholder, comment: comment });
            rule.selector = placeholder + rule.selector;
            return rule;
        };
        cssText = processRules(cssText, function (rule) {
            if (rule.selector[0] !== '@') {
                return processCommentedSelector_1(rule);
            }
            else if (rule.selector.startsWith('@media') || rule.selector.startsWith('@supports') ||
                rule.selector.startsWith('@page') || rule.selector.startsWith('@document')) {
                rule.content = processRules(rule.content, processCommentedSelector_1);
                return rule;
            }
            return rule;
        });
    }
    var scopedCssText = scopeCssText(cssText, scopeId, hostScopeId, slotScopeId);
    cssText = [scopedCssText].concat(commentsWithHash).join('\n');
    if (commentOriginalSelector) {
        orgSelectors.forEach(function (_a) {
            var placeholder = _a.placeholder, comment = _a.comment;
            cssText = cssText.replace(placeholder, comment);
        });
    }
    return cssText;
};



/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGlvbmljL3B3YS1lbGVtZW50cy9kaXN0L2VzbS1lczUvc2hhZG93LWNzcy05ZTc3OGY2OS1jNjhkMDk2MS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUVBQWlFLDZCQUE2QixFQUFFO0FBQ2hHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsRUFBRSxFQUFFLGNBQWMsUUFBUSxLQUFLLFVBQVU7QUFDakUsb0JBQW9CO0FBQ3BCLG1CQUFtQjtBQUNuQixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHVCQUF1QjtBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEM7QUFDMUM7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQiwrQkFBK0I7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsdUJBQXVCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsa0JBQWtCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHVCQUF1QjtBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvRUFBb0UscUNBQXFDLEVBQUU7QUFDM0c7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix1QkFBdUI7QUFDL0M7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsR0FBRztBQUM5QztBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsNkNBQTZDO0FBQzVFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNvQiIsImZpbGUiOiI2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqXG4gKiBUaGlzIGZpbGUgaXMgYSBwb3J0IG9mIHNoYWRvd0NTUyBmcm9tIHdlYmNvbXBvbmVudHMuanMgdG8gVHlwZVNjcmlwdC5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJjb21wb25lbnRzL3dlYmNvbXBvbmVudHNqcy9ibG9iLzRlZmVjZDdlMGUvc3JjL1NoYWRvd0NTUy9TaGFkb3dDU1MuanNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvYmxvYi9tYXN0ZXIvcGFja2FnZXMvY29tcGlsZXIvc3JjL3NoYWRvd19jc3MudHNcbiAqL1xudmFyIHNhZmVTZWxlY3RvciA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgIHZhciBwbGFjZWhvbGRlcnMgPSBbXTtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBjb250ZW50O1xuICAgIC8vIFJlcGxhY2VzIGF0dHJpYnV0ZSBzZWxlY3RvcnMgd2l0aCBwbGFjZWhvbGRlcnMuXG4gICAgLy8gVGhlIFdTIGluIFthdHRyPVwidmEgbHVlXCJdIHdvdWxkIG90aGVyd2lzZSBiZSBpbnRlcnByZXRlZCBhcyBhIHNlbGVjdG9yIHNlcGFyYXRvci5cbiAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoLyhcXFtbXlxcXV0qXFxdKS9nLCBmdW5jdGlvbiAoXywga2VlcCkge1xuICAgICAgICB2YXIgcmVwbGFjZUJ5ID0gXCJfX3BoLVwiICsgaW5kZXggKyBcIl9fXCI7XG4gICAgICAgIHBsYWNlaG9sZGVycy5wdXNoKGtlZXApO1xuICAgICAgICBpbmRleCsrO1xuICAgICAgICByZXR1cm4gcmVwbGFjZUJ5O1xuICAgIH0pO1xuICAgIC8vIFJlcGxhY2VzIHRoZSBleHByZXNzaW9uIGluIGA6bnRoLWNoaWxkKDJuICsgMSlgIHdpdGggYSBwbGFjZWhvbGRlci5cbiAgICAvLyBXUyBhbmQgXCIrXCIgd291bGQgb3RoZXJ3aXNlIGJlIGludGVycHJldGVkIGFzIHNlbGVjdG9yIHNlcGFyYXRvcnMuXG4gICAgY29udGVudCA9IHNlbGVjdG9yLnJlcGxhY2UoLyg6bnRoLVstXFx3XSspKFxcKFteKV0rXFwpKS9nLCBmdW5jdGlvbiAoXywgcHNldWRvLCBleHApIHtcbiAgICAgICAgdmFyIHJlcGxhY2VCeSA9IFwiX19waC1cIiArIGluZGV4ICsgXCJfX1wiO1xuICAgICAgICBwbGFjZWhvbGRlcnMucHVzaChleHApO1xuICAgICAgICBpbmRleCsrO1xuICAgICAgICByZXR1cm4gcHNldWRvICsgcmVwbGFjZUJ5O1xuICAgIH0pO1xuICAgIHZhciBzcyA9IHtcbiAgICAgICAgY29udGVudDogY29udGVudCxcbiAgICAgICAgcGxhY2Vob2xkZXJzOiBwbGFjZWhvbGRlcnMsXG4gICAgfTtcbiAgICByZXR1cm4gc3M7XG59O1xudmFyIHJlc3RvcmVTYWZlU2VsZWN0b3IgPSBmdW5jdGlvbiAocGxhY2Vob2xkZXJzLCBjb250ZW50KSB7XG4gICAgcmV0dXJuIGNvbnRlbnQucmVwbGFjZSgvX19waC0oXFxkKylfXy9nLCBmdW5jdGlvbiAoXywgaW5kZXgpIHsgcmV0dXJuIHBsYWNlaG9sZGVyc1sraW5kZXhdOyB9KTtcbn07XG52YXIgX3BvbHlmaWxsSG9zdCA9ICctc2hhZG93Y3NzaG9zdCc7XG52YXIgX3BvbHlmaWxsU2xvdHRlZCA9ICctc2hhZG93Y3Nzc2xvdHRlZCc7XG4vLyBub3RlOiA6aG9zdC1jb250ZXh0IHByZS1wcm9jZXNzZWQgdG8gLXNoYWRvd2Nzc2hvc3Rjb250ZXh0LlxudmFyIF9wb2x5ZmlsbEhvc3RDb250ZXh0ID0gJy1zaGFkb3djc3Njb250ZXh0JztcbnZhciBfcGFyZW5TdWZmaXggPSAnKSg/OlxcXFwoKCcgK1xuICAgICcoPzpcXFxcKFteKShdKlxcXFwpfFteKShdKikrPycgK1xuICAgICcpXFxcXCkpPyhbXix7XSopJztcbnZhciBfY3NzQ29sb25Ib3N0UmUgPSBuZXcgUmVnRXhwKCcoJyArIF9wb2x5ZmlsbEhvc3QgKyBfcGFyZW5TdWZmaXgsICdnaW0nKTtcbnZhciBfY3NzQ29sb25Ib3N0Q29udGV4dFJlID0gbmV3IFJlZ0V4cCgnKCcgKyBfcG9seWZpbGxIb3N0Q29udGV4dCArIF9wYXJlblN1ZmZpeCwgJ2dpbScpO1xudmFyIF9jc3NDb2xvblNsb3R0ZWRSZSA9IG5ldyBSZWdFeHAoJygnICsgX3BvbHlmaWxsU2xvdHRlZCArIF9wYXJlblN1ZmZpeCwgJ2dpbScpO1xudmFyIF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IgPSBfcG9seWZpbGxIb3N0ICsgJy1uby1jb21iaW5hdG9yJztcbnZhciBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yUmUgPSAvLXNoYWRvd2Nzc2hvc3Qtbm8tY29tYmluYXRvcihbXlxcc10qKS87XG52YXIgX3NoYWRvd0RPTVNlbGVjdG9yc1JlID0gW1xuICAgIC86OnNoYWRvdy9nLFxuICAgIC86OmNvbnRlbnQvZ1xuXTtcbnZhciBfc2VsZWN0b3JSZVN1ZmZpeCA9ICcoWz5cXFxcc34rXFxbLix7Ol1bXFxcXHNcXFxcU10qKT8kJztcbnZhciBfcG9seWZpbGxIb3N0UmUgPSAvLXNoYWRvd2Nzc2hvc3QvZ2ltO1xudmFyIF9jb2xvbkhvc3RSZSA9IC86aG9zdC9naW07XG52YXIgX2NvbG9uU2xvdHRlZFJlID0gLzo6c2xvdHRlZC9naW07XG52YXIgX2NvbG9uSG9zdENvbnRleHRSZSA9IC86aG9zdC1jb250ZXh0L2dpbTtcbnZhciBfY29tbWVudFJlID0gL1xcL1xcKlxccypbXFxzXFxTXSo/XFwqXFwvL2c7XG52YXIgc3RyaXBDb21tZW50cyA9IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgIHJldHVybiBpbnB1dC5yZXBsYWNlKF9jb21tZW50UmUsICcnKTtcbn07XG52YXIgX2NvbW1lbnRXaXRoSGFzaFJlID0gL1xcL1xcKlxccyojXFxzKnNvdXJjZShNYXBwaW5nKT9VUkw9W1xcc1xcU10rP1xcKlxcLy9nO1xudmFyIGV4dHJhY3RDb21tZW50c1dpdGhIYXNoID0gZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgcmV0dXJuIGlucHV0Lm1hdGNoKF9jb21tZW50V2l0aEhhc2hSZSkgfHwgW107XG59O1xudmFyIF9ydWxlUmUgPSAvKFxccyopKFteO1xce1xcfV0rPykoXFxzKikoKD86eyVCTE9DSyV9P1xccyo7Pyl8KD86XFxzKjspKS9nO1xudmFyIF9jdXJseVJlID0gLyhbe31dKS9nO1xudmFyIE9QRU5fQ1VSTFkgPSAneyc7XG52YXIgQ0xPU0VfQ1VSTFkgPSAnfSc7XG52YXIgQkxPQ0tfUExBQ0VIT0xERVIgPSAnJUJMT0NLJSc7XG52YXIgcHJvY2Vzc1J1bGVzID0gZnVuY3Rpb24gKGlucHV0LCBydWxlQ2FsbGJhY2spIHtcbiAgICB2YXIgaW5wdXRXaXRoRXNjYXBlZEJsb2NrcyA9IGVzY2FwZUJsb2NrcyhpbnB1dCk7XG4gICAgdmFyIG5leHRCbG9ja0luZGV4ID0gMDtcbiAgICByZXR1cm4gaW5wdXRXaXRoRXNjYXBlZEJsb2Nrcy5lc2NhcGVkU3RyaW5nLnJlcGxhY2UoX3J1bGVSZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbSA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgbVtfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZWxlY3RvciA9IG1bMl07XG4gICAgICAgIHZhciBjb250ZW50ID0gJyc7XG4gICAgICAgIHZhciBzdWZmaXggPSBtWzRdO1xuICAgICAgICB2YXIgY29udGVudFByZWZpeCA9ICcnO1xuICAgICAgICBpZiAoc3VmZml4ICYmIHN1ZmZpeC5zdGFydHNXaXRoKCd7JyArIEJMT0NLX1BMQUNFSE9MREVSKSkge1xuICAgICAgICAgICAgY29udGVudCA9IGlucHV0V2l0aEVzY2FwZWRCbG9ja3MuYmxvY2tzW25leHRCbG9ja0luZGV4KytdO1xuICAgICAgICAgICAgc3VmZml4ID0gc3VmZml4LnN1YnN0cmluZyhCTE9DS19QTEFDRUhPTERFUi5sZW5ndGggKyAxKTtcbiAgICAgICAgICAgIGNvbnRlbnRQcmVmaXggPSAneyc7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNzc1J1bGUgPSB7XG4gICAgICAgICAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgICAgICAgICBjb250ZW50OiBjb250ZW50XG4gICAgICAgIH07XG4gICAgICAgIHZhciBydWxlID0gcnVsZUNhbGxiYWNrKGNzc1J1bGUpO1xuICAgICAgICByZXR1cm4gXCJcIiArIG1bMV0gKyBydWxlLnNlbGVjdG9yICsgbVszXSArIGNvbnRlbnRQcmVmaXggKyBydWxlLmNvbnRlbnQgKyBzdWZmaXg7XG4gICAgfSk7XG59O1xudmFyIGVzY2FwZUJsb2NrcyA9IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgIHZhciBpbnB1dFBhcnRzID0gaW5wdXQuc3BsaXQoX2N1cmx5UmUpO1xuICAgIHZhciByZXN1bHRQYXJ0cyA9IFtdO1xuICAgIHZhciBlc2NhcGVkQmxvY2tzID0gW107XG4gICAgdmFyIGJyYWNrZXRDb3VudCA9IDA7XG4gICAgdmFyIGN1cnJlbnRCbG9ja1BhcnRzID0gW107XG4gICAgZm9yICh2YXIgcGFydEluZGV4ID0gMDsgcGFydEluZGV4IDwgaW5wdXRQYXJ0cy5sZW5ndGg7IHBhcnRJbmRleCsrKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gaW5wdXRQYXJ0c1twYXJ0SW5kZXhdO1xuICAgICAgICBpZiAocGFydCA9PT0gQ0xPU0VfQ1VSTFkpIHtcbiAgICAgICAgICAgIGJyYWNrZXRDb3VudC0tO1xuICAgICAgICB9XG4gICAgICAgIGlmIChicmFja2V0Q291bnQgPiAwKSB7XG4gICAgICAgICAgICBjdXJyZW50QmxvY2tQYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRCbG9ja1BhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBlc2NhcGVkQmxvY2tzLnB1c2goY3VycmVudEJsb2NrUGFydHMuam9pbignJykpO1xuICAgICAgICAgICAgICAgIHJlc3VsdFBhcnRzLnB1c2goQkxPQ0tfUExBQ0VIT0xERVIpO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRCbG9ja1BhcnRzID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRQYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJ0ID09PSBPUEVOX0NVUkxZKSB7XG4gICAgICAgICAgICBicmFja2V0Q291bnQrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY3VycmVudEJsb2NrUGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICBlc2NhcGVkQmxvY2tzLnB1c2goY3VycmVudEJsb2NrUGFydHMuam9pbignJykpO1xuICAgICAgICByZXN1bHRQYXJ0cy5wdXNoKEJMT0NLX1BMQUNFSE9MREVSKTtcbiAgICB9XG4gICAgdmFyIHN0ckVzY2FwZWRCbG9ja3MgPSB7XG4gICAgICAgIGVzY2FwZWRTdHJpbmc6IHJlc3VsdFBhcnRzLmpvaW4oJycpLFxuICAgICAgICBibG9ja3M6IGVzY2FwZWRCbG9ja3NcbiAgICB9O1xuICAgIHJldHVybiBzdHJFc2NhcGVkQmxvY2tzO1xufTtcbnZhciBpbnNlcnRQb2x5ZmlsbEhvc3RJbkNzc1RleHQgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICBzZWxlY3RvciA9IHNlbGVjdG9yXG4gICAgICAgIC5yZXBsYWNlKF9jb2xvbkhvc3RDb250ZXh0UmUsIF9wb2x5ZmlsbEhvc3RDb250ZXh0KVxuICAgICAgICAucmVwbGFjZShfY29sb25Ib3N0UmUsIF9wb2x5ZmlsbEhvc3QpXG4gICAgICAgIC5yZXBsYWNlKF9jb2xvblNsb3R0ZWRSZSwgX3BvbHlmaWxsU2xvdHRlZCk7XG4gICAgcmV0dXJuIHNlbGVjdG9yO1xufTtcbnZhciBjb252ZXJ0Q29sb25SdWxlID0gZnVuY3Rpb24gKGNzc1RleHQsIHJlZ0V4cCwgcGFydFJlcGxhY2VyKSB7XG4gICAgLy8gbVsxXSA9IDpob3N0KC1jb250ZXh0KSwgbVsyXSA9IGNvbnRlbnRzIG9mICgpLCBtWzNdIHJlc3Qgb2YgcnVsZVxuICAgIHJldHVybiBjc3NUZXh0LnJlcGxhY2UocmVnRXhwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBtID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBtW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1bMl0pIHtcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IG1bMl0uc3BsaXQoJywnKTtcbiAgICAgICAgICAgIHZhciByID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHAgPSBwYXJ0c1tpXS50cmltKCk7XG4gICAgICAgICAgICAgICAgaWYgKCFwKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICByLnB1c2gocGFydFJlcGxhY2VyKF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IsIHAsIG1bM10pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByLmpvaW4oJywnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yICsgbVszXTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbnZhciBjb2xvbkhvc3RQYXJ0UmVwbGFjZXIgPSBmdW5jdGlvbiAoaG9zdCwgcGFydCwgc3VmZml4KSB7XG4gICAgcmV0dXJuIGhvc3QgKyBwYXJ0LnJlcGxhY2UoX3BvbHlmaWxsSG9zdCwgJycpICsgc3VmZml4O1xufTtcbnZhciBjb252ZXJ0Q29sb25Ib3N0ID0gZnVuY3Rpb24gKGNzc1RleHQpIHtcbiAgICByZXR1cm4gY29udmVydENvbG9uUnVsZShjc3NUZXh0LCBfY3NzQ29sb25Ib3N0UmUsIGNvbG9uSG9zdFBhcnRSZXBsYWNlcik7XG59O1xudmFyIGNvbG9uSG9zdENvbnRleHRQYXJ0UmVwbGFjZXIgPSBmdW5jdGlvbiAoaG9zdCwgcGFydCwgc3VmZml4KSB7XG4gICAgaWYgKHBhcnQuaW5kZXhPZihfcG9seWZpbGxIb3N0KSA+IC0xKSB7XG4gICAgICAgIHJldHVybiBjb2xvbkhvc3RQYXJ0UmVwbGFjZXIoaG9zdCwgcGFydCwgc3VmZml4KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBob3N0ICsgcGFydCArIHN1ZmZpeCArICcsICcgKyBwYXJ0ICsgJyAnICsgaG9zdCArIHN1ZmZpeDtcbiAgICB9XG59O1xudmFyIGNvbnZlcnRDb2xvblNsb3R0ZWQgPSBmdW5jdGlvbiAoY3NzVGV4dCwgc2xvdEF0dHIpIHtcbiAgICB2YXIgcmVnRXhwID0gX2Nzc0NvbG9uU2xvdHRlZFJlO1xuICAgIHJldHVybiBjc3NUZXh0LnJlcGxhY2UocmVnRXhwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBtID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBtW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1bMl0pIHtcbiAgICAgICAgICAgIHZhciBjb21wb3VuZCA9IG1bMl0udHJpbSgpO1xuICAgICAgICAgICAgdmFyIHN1ZmZpeCA9IG1bM107XG4gICAgICAgICAgICB2YXIgc2VsID0gJy4nICsgc2xvdEF0dHIgKyAnID4gJyArIGNvbXBvdW5kICsgc3VmZml4O1xuICAgICAgICAgICAgcmV0dXJuIHNlbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yICsgbVszXTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbnZhciBjb252ZXJ0Q29sb25Ib3N0Q29udGV4dCA9IGZ1bmN0aW9uIChjc3NUZXh0KSB7XG4gICAgcmV0dXJuIGNvbnZlcnRDb2xvblJ1bGUoY3NzVGV4dCwgX2Nzc0NvbG9uSG9zdENvbnRleHRSZSwgY29sb25Ib3N0Q29udGV4dFBhcnRSZXBsYWNlcik7XG59O1xudmFyIGNvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMgPSBmdW5jdGlvbiAoY3NzVGV4dCkge1xuICAgIHJldHVybiBfc2hhZG93RE9NU2VsZWN0b3JzUmUucmVkdWNlKGZ1bmN0aW9uIChyZXN1bHQsIHBhdHRlcm4pIHsgcmV0dXJuIHJlc3VsdC5yZXBsYWNlKHBhdHRlcm4sICcgJyk7IH0sIGNzc1RleHQpO1xufTtcbnZhciBtYWtlU2NvcGVNYXRjaGVyID0gZnVuY3Rpb24gKHNjb3BlU2VsZWN0b3IpIHtcbiAgICB2YXIgbHJlID0gL1xcWy9nO1xuICAgIHZhciBycmUgPSAvXFxdL2c7XG4gICAgc2NvcGVTZWxlY3RvciA9IHNjb3BlU2VsZWN0b3IucmVwbGFjZShscmUsICdcXFxcWycpLnJlcGxhY2UocnJlLCAnXFxcXF0nKTtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cCgnXignICsgc2NvcGVTZWxlY3RvciArICcpJyArIF9zZWxlY3RvclJlU3VmZml4LCAnbScpO1xufTtcbnZhciBzZWxlY3Rvck5lZWRzU2NvcGluZyA9IGZ1bmN0aW9uIChzZWxlY3Rvciwgc2NvcGVTZWxlY3Rvcikge1xuICAgIHZhciByZSA9IG1ha2VTY29wZU1hdGNoZXIoc2NvcGVTZWxlY3Rvcik7XG4gICAgcmV0dXJuICFyZS50ZXN0KHNlbGVjdG9yKTtcbn07XG52YXIgYXBwbHlTaW1wbGVTZWxlY3RvclNjb3BlID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IpIHtcbiAgICAvLyBJbiBBbmRyb2lkIGJyb3dzZXIsIHRoZSBsYXN0SW5kZXggaXMgbm90IHJlc2V0IHdoZW4gdGhlIHJlZ2V4IGlzIHVzZWQgaW4gU3RyaW5nLnJlcGxhY2UoKVxuICAgIF9wb2x5ZmlsbEhvc3RSZS5sYXN0SW5kZXggPSAwO1xuICAgIGlmIChfcG9seWZpbGxIb3N0UmUudGVzdChzZWxlY3RvcikpIHtcbiAgICAgICAgdmFyIHJlcGxhY2VCeV8xID0gXCIuXCIgKyBob3N0U2VsZWN0b3I7XG4gICAgICAgIHJldHVybiBzZWxlY3RvclxuICAgICAgICAgICAgLnJlcGxhY2UoX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvclJlLCBmdW5jdGlvbiAoXywgc2VsZWN0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5yZXBsYWNlKC8oW146XSopKDoqKSguKikvLCBmdW5jdGlvbiAoXywgYmVmb3JlLCBjb2xvbiwgYWZ0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmVmb3JlICsgcmVwbGFjZUJ5XzEgKyBjb2xvbiArIGFmdGVyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAucmVwbGFjZShfcG9seWZpbGxIb3N0UmUsIHJlcGxhY2VCeV8xICsgJyAnKTtcbiAgICB9XG4gICAgcmV0dXJuIHNjb3BlU2VsZWN0b3IgKyAnICcgKyBzZWxlY3Rvcjtcbn07XG52YXIgYXBwbHlTdHJpY3RTZWxlY3RvclNjb3BlID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IpIHtcbiAgICB2YXIgaXNSZSA9IC9cXFtpcz0oW15cXF1dKilcXF0vZztcbiAgICBzY29wZVNlbGVjdG9yID0gc2NvcGVTZWxlY3Rvci5yZXBsYWNlKGlzUmUsIGZ1bmN0aW9uIChfKSB7XG4gICAgICAgIHZhciBwYXJ0cyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgcGFydHNbX2kgLSAxXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnRzWzBdO1xuICAgIH0pO1xuICAgIHZhciBjbGFzc05hbWUgPSAnLicgKyBzY29wZVNlbGVjdG9yO1xuICAgIHZhciBfc2NvcGVTZWxlY3RvclBhcnQgPSBmdW5jdGlvbiAocCkge1xuICAgICAgICB2YXIgc2NvcGVkUCA9IHAudHJpbSgpO1xuICAgICAgICBpZiAoIXNjb3BlZFApIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgICAgICBpZiAocC5pbmRleE9mKF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IpID4gLTEpIHtcbiAgICAgICAgICAgIHNjb3BlZFAgPSBhcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUocCwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSA6aG9zdCBzaW5jZSBpdCBzaG91bGQgYmUgdW5uZWNlc3NhcnlcbiAgICAgICAgICAgIHZhciB0ID0gcC5yZXBsYWNlKF9wb2x5ZmlsbEhvc3RSZSwgJycpO1xuICAgICAgICAgICAgaWYgKHQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBtYXRjaGVzID0gdC5tYXRjaCgvKFteOl0qKSg6KikoLiopLyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVkUCA9IG1hdGNoZXNbMV0gKyBjbGFzc05hbWUgKyBtYXRjaGVzWzJdICsgbWF0Y2hlc1szXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNjb3BlZFA7XG4gICAgfTtcbiAgICB2YXIgc2FmZUNvbnRlbnQgPSBzYWZlU2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIHNlbGVjdG9yID0gc2FmZUNvbnRlbnQuY29udGVudDtcbiAgICB2YXIgc2NvcGVkU2VsZWN0b3IgPSAnJztcbiAgICB2YXIgc3RhcnRJbmRleCA9IDA7XG4gICAgdmFyIHJlcztcbiAgICB2YXIgc2VwID0gLyggfD58XFwrfH4oPyE9KSlcXHMqL2c7XG4gICAgLy8gSWYgYSBzZWxlY3RvciBhcHBlYXJzIGJlZm9yZSA6aG9zdCBpdCBzaG91bGQgbm90IGJlIHNoaW1tZWQgYXMgaXRcbiAgICAvLyBtYXRjaGVzIG9uIGFuY2VzdG9yIGVsZW1lbnRzIGFuZCBub3Qgb24gZWxlbWVudHMgaW4gdGhlIGhvc3QncyBzaGFkb3dcbiAgICAvLyBgOmhvc3QtY29udGV4dChkaXYpYCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAgIC8vIGAtc2hhZG93Y3NzaG9zdC1uby1jb21iaW5hdG9yZGl2LCBkaXYgLXNoYWRvd2Nzc2hvc3Qtbm8tY29tYmluYXRvcmBcbiAgICAvLyB0aGUgYGRpdmAgaXMgbm90IHBhcnQgb2YgdGhlIGNvbXBvbmVudCBpbiB0aGUgMm5kIHNlbGVjdG9ycyBhbmQgc2hvdWxkIG5vdCBiZSBzY29wZWQuXG4gICAgLy8gSGlzdG9yaWNhbGx5IGBjb21wb25lbnQtdGFnOmhvc3RgIHdhcyBtYXRjaGluZyB0aGUgY29tcG9uZW50IHNvIHdlIGFsc28gd2FudCB0byBwcmVzZXJ2ZVxuICAgIC8vIHRoaXMgYmVoYXZpb3IgdG8gYXZvaWQgYnJlYWtpbmcgbGVnYWN5IGFwcHMgKGl0IHNob3VsZCBub3QgbWF0Y2gpLlxuICAgIC8vIFRoZSBiZWhhdmlvciBzaG91bGQgYmU6XG4gICAgLy8gLSBgdGFnOmhvc3RgIC0+IGB0YWdbaF1gICh0aGlzIGlzIHRvIGF2b2lkIGJyZWFraW5nIGxlZ2FjeSBhcHBzLCBzaG91bGQgbm90IG1hdGNoIGFueXRoaW5nKVxuICAgIC8vIC0gYHRhZyA6aG9zdGAgLT4gYHRhZyBbaF1gIChgdGFnYCBpcyBub3Qgc2NvcGVkIGJlY2F1c2UgaXQncyBjb25zaWRlcmVkIHBhcnQgb2YgYVxuICAgIC8vICAgYDpob3N0LWNvbnRleHQodGFnKWApXG4gICAgdmFyIGhhc0hvc3QgPSBzZWxlY3Rvci5pbmRleE9mKF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IpID4gLTE7XG4gICAgLy8gT25seSBzY29wZSBwYXJ0cyBhZnRlciB0aGUgZmlyc3QgYC1zaGFkb3djc3Nob3N0LW5vLWNvbWJpbmF0b3JgIHdoZW4gaXQgaXMgcHJlc2VudFxuICAgIHZhciBzaG91bGRTY29wZSA9ICFoYXNIb3N0O1xuICAgIHdoaWxlICgocmVzID0gc2VwLmV4ZWMoc2VsZWN0b3IpKSAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgc2VwYXJhdG9yID0gcmVzWzFdO1xuICAgICAgICB2YXIgcGFydF8xID0gc2VsZWN0b3Iuc2xpY2Uoc3RhcnRJbmRleCwgcmVzLmluZGV4KS50cmltKCk7XG4gICAgICAgIHNob3VsZFNjb3BlID0gc2hvdWxkU2NvcGUgfHwgcGFydF8xLmluZGV4T2YoX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvcikgPiAtMTtcbiAgICAgICAgdmFyIHNjb3BlZFBhcnQgPSBzaG91bGRTY29wZSA/IF9zY29wZVNlbGVjdG9yUGFydChwYXJ0XzEpIDogcGFydF8xO1xuICAgICAgICBzY29wZWRTZWxlY3RvciArPSBzY29wZWRQYXJ0ICsgXCIgXCIgKyBzZXBhcmF0b3IgKyBcIiBcIjtcbiAgICAgICAgc3RhcnRJbmRleCA9IHNlcC5sYXN0SW5kZXg7XG4gICAgfVxuICAgIHZhciBwYXJ0ID0gc2VsZWN0b3Iuc3Vic3RyaW5nKHN0YXJ0SW5kZXgpO1xuICAgIHNob3VsZFNjb3BlID0gc2hvdWxkU2NvcGUgfHwgcGFydC5pbmRleE9mKF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IpID4gLTE7XG4gICAgc2NvcGVkU2VsZWN0b3IgKz0gc2hvdWxkU2NvcGUgPyBfc2NvcGVTZWxlY3RvclBhcnQocGFydCkgOiBwYXJ0O1xuICAgIC8vIHJlcGxhY2UgdGhlIHBsYWNlaG9sZGVycyB3aXRoIHRoZWlyIG9yaWdpbmFsIHZhbHVlc1xuICAgIHJldHVybiByZXN0b3JlU2FmZVNlbGVjdG9yKHNhZmVDb250ZW50LnBsYWNlaG9sZGVycywgc2NvcGVkU2VsZWN0b3IpO1xufTtcbnZhciBzY29wZVNlbGVjdG9yID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBzY29wZVNlbGVjdG9yVGV4dCwgaG9zdFNlbGVjdG9yLCBzbG90U2VsZWN0b3IpIHtcbiAgICByZXR1cm4gc2VsZWN0b3Iuc3BsaXQoJywnKVxuICAgICAgICAubWFwKGZ1bmN0aW9uIChzaGFsbG93UGFydCkge1xuICAgICAgICBpZiAoc2xvdFNlbGVjdG9yICYmIHNoYWxsb3dQYXJ0LmluZGV4T2YoJy4nICsgc2xvdFNlbGVjdG9yKSA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gc2hhbGxvd1BhcnQudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3Rvck5lZWRzU2NvcGluZyhzaGFsbG93UGFydCwgc2NvcGVTZWxlY3RvclRleHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwbHlTdHJpY3RTZWxlY3RvclNjb3BlKHNoYWxsb3dQYXJ0LCBzY29wZVNlbGVjdG9yVGV4dCwgaG9zdFNlbGVjdG9yKS50cmltKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2hhbGxvd1BhcnQudHJpbSgpO1xuICAgICAgICB9XG4gICAgfSlcbiAgICAgICAgLmpvaW4oJywgJyk7XG59O1xudmFyIHNjb3BlU2VsZWN0b3JzID0gZnVuY3Rpb24gKGNzc1RleHQsIHNjb3BlU2VsZWN0b3JUZXh0LCBob3N0U2VsZWN0b3IsIHNsb3RTZWxlY3RvciwgY29tbWVudE9yaWdpbmFsU2VsZWN0b3IpIHtcbiAgICByZXR1cm4gcHJvY2Vzc1J1bGVzKGNzc1RleHQsIGZ1bmN0aW9uIChydWxlKSB7XG4gICAgICAgIHZhciBzZWxlY3RvciA9IHJ1bGUuc2VsZWN0b3I7XG4gICAgICAgIHZhciBjb250ZW50ID0gcnVsZS5jb250ZW50O1xuICAgICAgICBpZiAocnVsZS5zZWxlY3RvclswXSAhPT0gJ0AnKSB7XG4gICAgICAgICAgICBzZWxlY3RvciA9IHNjb3BlU2VsZWN0b3IocnVsZS5zZWxlY3Rvciwgc2NvcGVTZWxlY3RvclRleHQsIGhvc3RTZWxlY3Rvciwgc2xvdFNlbGVjdG9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChydWxlLnNlbGVjdG9yLnN0YXJ0c1dpdGgoJ0BtZWRpYScpIHx8IHJ1bGUuc2VsZWN0b3Iuc3RhcnRzV2l0aCgnQHN1cHBvcnRzJykgfHxcbiAgICAgICAgICAgIHJ1bGUuc2VsZWN0b3Iuc3RhcnRzV2l0aCgnQHBhZ2UnKSB8fCBydWxlLnNlbGVjdG9yLnN0YXJ0c1dpdGgoJ0Bkb2N1bWVudCcpKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gc2NvcGVTZWxlY3RvcnMocnVsZS5jb250ZW50LCBzY29wZVNlbGVjdG9yVGV4dCwgaG9zdFNlbGVjdG9yLCBzbG90U2VsZWN0b3IpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjc3NSdWxlID0ge1xuICAgICAgICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yLnJlcGxhY2UoL1xcc3syLH0vZywgJyAnKS50cmltKCksXG4gICAgICAgICAgICBjb250ZW50OiBjb250ZW50XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBjc3NSdWxlO1xuICAgIH0pO1xufTtcbnZhciBzY29wZUNzc1RleHQgPSBmdW5jdGlvbiAoY3NzVGV4dCwgc2NvcGVJZCwgaG9zdFNjb3BlSWQsIHNsb3RTY29wZUlkLCBjb21tZW50T3JpZ2luYWxTZWxlY3Rvcikge1xuICAgIGNzc1RleHQgPSBpbnNlcnRQb2x5ZmlsbEhvc3RJbkNzc1RleHQoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IGNvbnZlcnRDb2xvbkhvc3QoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IGNvbnZlcnRDb2xvbkhvc3RDb250ZXh0KGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSBjb252ZXJ0Q29sb25TbG90dGVkKGNzc1RleHQsIHNsb3RTY29wZUlkKTtcbiAgICBjc3NUZXh0ID0gY29udmVydFNoYWRvd0RPTVNlbGVjdG9ycyhjc3NUZXh0KTtcbiAgICBpZiAoc2NvcGVJZCkge1xuICAgICAgICBjc3NUZXh0ID0gc2NvcGVTZWxlY3RvcnMoY3NzVGV4dCwgc2NvcGVJZCwgaG9zdFNjb3BlSWQsIHNsb3RTY29wZUlkKTtcbiAgICB9XG4gICAgY3NzVGV4dCA9IGNzc1RleHQucmVwbGFjZSgvLXNoYWRvd2Nzc2hvc3Qtbm8tY29tYmluYXRvci9nLCBcIi5cIiArIGhvc3RTY29wZUlkKTtcbiAgICBjc3NUZXh0ID0gY3NzVGV4dC5yZXBsYWNlKC8+XFxzKlxcKlxccysoW157LCBdKykvZ20sICcgJDEgJyk7XG4gICAgcmV0dXJuIGNzc1RleHQudHJpbSgpO1xufTtcbnZhciBzY29wZUNzcyA9IGZ1bmN0aW9uIChjc3NUZXh0LCBzY29wZUlkLCBjb21tZW50T3JpZ2luYWxTZWxlY3Rvcikge1xuICAgIHZhciBob3N0U2NvcGVJZCA9IHNjb3BlSWQgKyAnLWgnO1xuICAgIHZhciBzbG90U2NvcGVJZCA9IHNjb3BlSWQgKyAnLXMnO1xuICAgIHZhciBjb21tZW50c1dpdGhIYXNoID0gZXh0cmFjdENvbW1lbnRzV2l0aEhhc2goY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHN0cmlwQ29tbWVudHMoY3NzVGV4dCk7XG4gICAgdmFyIG9yZ1NlbGVjdG9ycyA9IFtdO1xuICAgIGlmIChjb21tZW50T3JpZ2luYWxTZWxlY3Rvcikge1xuICAgICAgICB2YXIgcHJvY2Vzc0NvbW1lbnRlZFNlbGVjdG9yXzEgPSBmdW5jdGlvbiAocnVsZSkge1xuICAgICAgICAgICAgdmFyIHBsYWNlaG9sZGVyID0gXCIvKiFAX19fXCIgKyBvcmdTZWxlY3RvcnMubGVuZ3RoICsgXCJfX18qL1wiO1xuICAgICAgICAgICAgdmFyIGNvbW1lbnQgPSBcIi8qIUBcIiArIHJ1bGUuc2VsZWN0b3IgKyBcIiovXCI7XG4gICAgICAgICAgICBvcmdTZWxlY3RvcnMucHVzaCh7IHBsYWNlaG9sZGVyOiBwbGFjZWhvbGRlciwgY29tbWVudDogY29tbWVudCB9KTtcbiAgICAgICAgICAgIHJ1bGUuc2VsZWN0b3IgPSBwbGFjZWhvbGRlciArIHJ1bGUuc2VsZWN0b3I7XG4gICAgICAgICAgICByZXR1cm4gcnVsZTtcbiAgICAgICAgfTtcbiAgICAgICAgY3NzVGV4dCA9IHByb2Nlc3NSdWxlcyhjc3NUZXh0LCBmdW5jdGlvbiAocnVsZSkge1xuICAgICAgICAgICAgaWYgKHJ1bGUuc2VsZWN0b3JbMF0gIT09ICdAJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9jZXNzQ29tbWVudGVkU2VsZWN0b3JfMShydWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHJ1bGUuc2VsZWN0b3Iuc3RhcnRzV2l0aCgnQG1lZGlhJykgfHwgcnVsZS5zZWxlY3Rvci5zdGFydHNXaXRoKCdAc3VwcG9ydHMnKSB8fFxuICAgICAgICAgICAgICAgIHJ1bGUuc2VsZWN0b3Iuc3RhcnRzV2l0aCgnQHBhZ2UnKSB8fCBydWxlLnNlbGVjdG9yLnN0YXJ0c1dpdGgoJ0Bkb2N1bWVudCcpKSB7XG4gICAgICAgICAgICAgICAgcnVsZS5jb250ZW50ID0gcHJvY2Vzc1J1bGVzKHJ1bGUuY29udGVudCwgcHJvY2Vzc0NvbW1lbnRlZFNlbGVjdG9yXzEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBydWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJ1bGU7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgc2NvcGVkQ3NzVGV4dCA9IHNjb3BlQ3NzVGV4dChjc3NUZXh0LCBzY29wZUlkLCBob3N0U2NvcGVJZCwgc2xvdFNjb3BlSWQpO1xuICAgIGNzc1RleHQgPSBbc2NvcGVkQ3NzVGV4dF0uY29uY2F0KGNvbW1lbnRzV2l0aEhhc2gpLmpvaW4oJ1xcbicpO1xuICAgIGlmIChjb21tZW50T3JpZ2luYWxTZWxlY3Rvcikge1xuICAgICAgICBvcmdTZWxlY3RvcnMuZm9yRWFjaChmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgIHZhciBwbGFjZWhvbGRlciA9IF9hLnBsYWNlaG9sZGVyLCBjb21tZW50ID0gX2EuY29tbWVudDtcbiAgICAgICAgICAgIGNzc1RleHQgPSBjc3NUZXh0LnJlcGxhY2UocGxhY2Vob2xkZXIsIGNvbW1lbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNzc1RleHQ7XG59O1xuZXhwb3J0IHsgc2NvcGVDc3MgfTtcbiJdLCJzb3VyY2VSb290IjoiIn0=