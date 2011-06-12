require.paths.push(__dirname + '/../node_modules');

var sys = require('sys'),
    path = require('path'),
    fs = require('fs'),
    less = require('less'),
    Step = require('step');


/*
/home/max/websites/test.project/css/main.less
/home/max/websites/test.project/css/main.css
/home/max/websites/test.project/css/plain.less
/home/max/websites/test.project/css/plain.css
*/

var lessFile = '/home/max/websites/test.project/css/plain.less';
var cssFile = '/home/max/websites/test.project/css/plain.css';

Step(
    function readSelf() {
        fs.readFile(lessFile, this);
    },
    function capitalize(err, text) {
        // less file not found
        if (err) {
            return fs.readFile(cssFile, this);
        } else {
            // @TODO: do translating from less to css here
            return text.toString().toUpperCase();
        }
    },
    function showIt(err, newText) {
        if (err) {
            // @TODO: neither less nor css file could be found, send error!
        } else {
            // @TODO: send newText (is Buffer)!
        }
    }
);
