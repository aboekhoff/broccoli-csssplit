var css = require('css');
module.exports = csssplit;

function csssplit(cssString, maxRules) {
    return _splitCSS(_parseCSS(cssString), maxRules);
};

function parseCSS(cssString) {
    if(typeof cssString !== 'string') {
        throw new Error('cssString must be a string');
    }

    if(cssString.length < 1) {
        throw new Error('cssSting must not be empty');
    }

    return css.parse(cssString, {position: true});
};

function _splitCSS (ast, maxRules) {
    return _toPages(_calcPageCount(ast, maxRules), ast, maxRules)

    .map(function (page) {

        return css.stringify(page);

    });
};

function _calcPageCount (ast, maxRules) {
    return Math.floor(ast.stylesheet.rules.length / maxRules) +
        Math.min(1, ast.stylesheet.rules.length % maxRules);
};

function _toPages (pageCount, ast, maxRules) {
    var pages = [], remaining, clone, from, to;

    remaining = pageCount;

    while (remaining > 0) {

        clone = _cloneAST(ast);

        pages.push(clone);

        from = _from(pageCount, remaining, maxRules);

        to = _to(from, maxRules, ast);

        clone.stylesheet.rules = clone.stylesheet.rules.slice(from, to);

        remaining -= 1;
    }

    return pages;
};

function _cloneAST (ast) {
    return JSON.parse(JSON.stringify(ast));
};

function _from (pageCount, remaining, maxRules) {
    return (pageCount - remaining) * maxRules;
};

function _to (from, maxRules, ast) {
    return Math.min(from + maxRules, ast.stylesheet.rules.length);
};