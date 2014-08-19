var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var Writer = require('broccoli-writer')
var helpers = require('broccoli-kitchen-sink-helpers')
var walkSync = require('walk-sync')
var mapSeries = require('promise-map-series')
var css = require('css');

var MAX_SELECTORS = 4095;

module.exports = CSSS
CSSS.prototype = Object.create(Writer.prototype)
CSSS.prototype.constructor = CSSS

function CSSS (inputTree, options) {
	if (!(this instanceof CSSS)) { return new CSSS(inputTree, options); }
	this.inputTree = inputTree
	this.options = options || {}
}

CSSS.prototype.write = function (readTree, destDir) {
	var self = this;

	return readTree(self.inputTree).then(function(srcDir) {
        var paths = walkSync(srcDir);

        return mapSeries(paths, function(relativePath) {
            if (/\/$/.test(relativePath)) {
                mkdirp.sync(destDir + '/' + relativePath)
            } else {
                helpers.copyPreserveSync(
                    path.join(srcDir, relativePath),
                    path.join(destDir, relativePath)
                )

                if (/\.css$/.test(relativePath)) {
                    var srcPath  = path.join(srcDir, relativePath);
                    var destPath = path.join(destDir, relativePath);
                    var rawcss   = fs.readFileSync(srcPath, { encoding: 'utf8' });
                    var pages    = self.split(rawcss, MAX_SELECTORS);

                    for (var i=1; i<pages.length; i++) {
                        var finalDestPath = destPath.replace(/\.css$/, '.' + i + '.css');
                        fs.writeFileSync(finalDestPath, css.stringify(pages[i]), { encoding: 'utf8'}); 
                    }

                }

            }

        }); 

	});

}

CSSS.prototype.split = function(string) {
    var ast   = css.parse(string);
    var pages = [];
    var count = 0;
    var page  = null;

    function pushPage() {
        count = 0;
        page  = { type: "stylesheet", stylesheet: { rules: [] } }; 
        page.stylesheet.rules = [];
        pages.push(page);
    }

    pushPage();

    ast.stylesheet.rules.forEach(function(rule) {
    	if (rule.selectors) {
        	if (count + rule.selectors.length >= MAX_SELECTORS) { pushPage(); }
        	count += rule.selectors.length; 
        }
        page.stylesheet.rules.push(rule);
    })

    return pages 

}