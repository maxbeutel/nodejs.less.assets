require.paths.push(__dirname + '/node_modules');

var sys = require('sys'),
    path = require('path'),
    fs = require('fs'),
    less = require('less'),
    Step = require('step');

var app = require('express').createServer();

app.get('/*.css', function(req, res, next) {
    var websitesDir = process.env.WEBSITES_DIR;

    if (!websitesDir) {
        res.send('WEBSITES_DIR env variable not set', {'Content-Type': 'text/plain'}, 500);
        return;
    }

    var hostname = req.headers.host.split(':')[0];

    var lessPathname = path.normalize(req.params[0] + '.less');
    var lessPathnameAbsolute = path.join(websitesDir, hostname, lessPathname);

    var cssPathname = path.normalize(req.params[0] + '.css');
    var cssPathnameAbsolute = path.join(websitesDir, hostname, cssPathname);

    Step(
        function readLessFile() {
            fs.readFile(lessPathnameAbsolute, this);
        },
        function extractCssFromLessFileOrFallback(err, fileContent) {
            // less file not found
            // fallback to css file instead
            if (err) {
                fs.readFile(cssPathnameAbsolute, this);
            // parse less file
            } else {
                var parser = new(less.Parser)({
                    paths: ['.'],
                    filename: path.basename(lessPathnameAbsolute)
                });

                parser.parse(fileContent.toString(), this);
            }
        },
        function handleParserResult(err, parserResult) {
            if (err) {
                throw err;
            }

            // we used the fallback
            if (parserResult instanceof Buffer) {
                this(null, parserResult);
            // else finish conversion to CSS
            } else {
                this(null, parserResult.toCSS());
            }
        },
        function sendResponse(err, parsedCss) {
            if (err) {
                res.send('Error sending .less/.css file\n' + sys.inspect(err), {'Content-Type': 'text/plain'}, 500);
            } else {
                res.send(parsedCss, {'Content-Type': 'text/css'}, 200);
            }
        }
    );
});

app.listen(3000);
