var Filter   = require('broccoli-filter');
var csssplit = require('./csssplit.js');

module.exports = CSSSplitter;
CSSSplitter.prototype = Object.create(Filter.prototype);
CSSSplitter.prototype.constructor = CSSSplitter;

function CSSSplitter () {
  if (!(this instanceof CSSSplitter)) return new CSSSplitter(); 	
};

CSSSplitter.prototype.extensions = ['css']

CSSSplitter.prototype.targetExtension = 'css'

CSSSplitter.prototype.processFile = function(srcDir, destDir, relativePath) {
  	var self = this;
  	var string = fs.readFileSync(srcDir + '/' + relativePath, { encoding: 'utf8' });
  	return Promise.resolve(self.processString(string, relativePath))
  		.then(function (outputStrings) {
   	  		var outputPath = self.getDestFilePath(relativePath);
   	  		for (var i=0; i<outputStrings.length; i++) {
   	  			var path = (destDir + '/' + outputPath).replace('/\.css$/', '');
   	  			path = i === 0 ? path : path + '.' + i;
   	  			path = path + '.css';  
   	  			fs.writeFileSync(path, outputStrings[i], { encoding: 'utf8' });
   	  		}
    	});	
}

CSSSplitter.prototype.processString = function(string) {
	var strings = csssplit(string, 4096);
	strings[0] = string; // make the first css file the full file so >IE9 requires only one file  
	return strings;
}