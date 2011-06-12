require.paths.push(__dirname + '/node_modules');

var sys = require('sys'),
    path = require('path'),
    fs = require('fs'),
    less = require('less');

var app = require('express').createServer();

app.get('/*.css', function(req, res, next) {
    var websitesDir = process.env.WEBSITES_DIR;

    if (!websitesDir) {
        res.send('WEBSITES_DIR env variable not set', { 'Content-Type': 'text/plain' }, 500);
        return;
    }

    var hostname = req.headers.host.split(':')[0];

    var lessPathname = req.params[0] + '.less';
    var lessPathnameAbsolute = path.join(websitesDir, hostname, lessPathname);

    var cssPathname = req.params[0] + '.css';
    var cssPathnameAbsolute = path.join(websitesDir, hostname, cssPathname);

    path.exists(lessPathnameAbsolute, function(exists) {
        // try plain .css file if .less file does not exist
        if (!exists) {
            path.exists(cssPathnameAbsolute, function(exists) {
                if (!exists) {
                    res.send('Could not locate corresponding .less/.css file', { 'Content-Type': 'text/plain' }, 404);
                    return;
                }

                fs.readFile(cssPathnameAbsolute, 'utf-8', function(err, fileContent) {
                    if (err) {
                        next(err);
                        return;
                    }

                    res.send(fileContent, { 'Content-Type': 'text/css' }, 200);
                });
            });

            return;
        }

        // output parsed .less file
        fs.readFile(lessPathnameAbsolute, 'utf-8', function(err, fileContent) {
            if (err) {
                next(err);
                return;
            }

            try {
                var parser = new(less.Parser)({
                    paths: ['.'],
                    filename: path.basename(lessPathnameAbsolute)
                });

                parser.parse(fileContent, function (e, tree) {
                    res.send(tree.toCSS({ compress: false }), { 'Content-Type': 'text/css' }, 200);
                });
            } catch(e) {
                res.send('Parse error: \n' + sys.inspect(e), { 'Content-Type': 'text/plain' }, 500);
                console.log(e);
            }
        }); 
    });
});

app.listen(3000);
