var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var Writer = require('broccoli-writer')
var helpers = require('broccoli-kitchen-sink-helpers')
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

CSSS.prototype.getCacheDir = function () {
	return quickTemp.makeOrReuse(this, 'tmpCacheDir')
}

CSSS.prototype.write = function (readTree, destDir) {
	var self = this;

	return readTree(self.inputTree).then(function(srcDir) {
		console.log(srcDir, destDir);

		var files = helpers.multiGlob(["**/*.css"], {
			cwd:  srcDir,
			root: srcDir,
		    nomount: false
		});

		console.log(files);

		for (var i=0; i < files.length; i++) {
			var fileSourcePath = path.join(srcDir, files[i]);
			var fileDestPath   = path.join(destDir, files[i]);
			var string = fs.readFileSync(fileSourcePath, { encoding: 'utf8' });
			var pages = self.split(string, MAX_SELECTORS);
			pages[0] = string;

			for (var j=0; j<pages.length; j++) {
				var finalDestPath = fileDestPath.replace(/\.css$/, '');
				finalDestPath = j === 0 ? finalDestPath : finalDestPath + '.' + j;
				finalDestPath = finalDestPath + '.css';	  
				self._writeFileSync(finalDestPath, pages[j], { encoding: 'utf8' });
			}
		} 

	});
}

CSSS.prototype._writeFileSync = function(destPath, content) {
	if (destPath[destPath.length -1] === '/') {
    	destPath = destPath.slice(0, -1)
  	}

  	destDir = path.dirname(destPath);
  	if (!fs.existsSync(destDir)) {
    	mkdirp.sync(destDir)
  	}
  	fs.writeFileSync(destPath, content, { encoding: 'utf8' });
}

CSSS.prototype.split = function(string) {
	function clone(ast) { return css.parse(css.stringify(ast)); }

    var ast   = css.parse(string);
    var pages = [];
    var count = 0;
    var page  = null;

    function pushPage() {
        count = 0;
        page  = clone(ast);
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

    return pages.map(css.stringify);

}