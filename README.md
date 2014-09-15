#Split Your CSS With Broccoli

Pass your tree to broccoli-csssplit and it will split any
file (eg. foo.css) with more than 4095 selectors into separate files.

Be sure to select CSS files *only* in your input tree. `broccoli-caching-writer` will ensure that it can skip CSS Spliting if the files have not changed.

```js
var pickFiles = require('broccoli-static-compiler');

var styles = pickFiles(tree, {
  srcDir: '/css',
  files: ['app.css'],
  destDir: '/css'
});

module.exports = csss(styles);
```