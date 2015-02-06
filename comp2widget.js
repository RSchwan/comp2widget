#!/usr/bin/env node

var program = require('commander'),
    hb = require('handlebars'),
    http = require('http'),
    path = require('path'),
    tmp = require('os').tmpdir(),
    fs = require('fs'),
    _ = require('underscore'),
    colors = require('colors'),
    ProgressBar = require('progress');

program
    .version('1.0.0')
    .usage('<component name ...> [options]')
    .option('-s, --sdk <version>', 'SDK version to use')
    .option('-o, --out <name>', 'output name')
    .option('-n, --nocache', 'don\'t use cached api.json')
    .parse(process.argv);

if (!program.args.length)
{
    program.help();
}

getSDKVersions(function (versions)
{
    var sdkVersion = program.sdk || versions[0];
    if (!_.contains(versions, sdkVersion))
    {
        var message = 'There is no such SDK version!\nChoose one: ';
        _.each(versions, function (element)
        {
            message += element + ', ';
        });
        console.log(colors.red(message));

        process.exit(1);
    }

    getJSON(sdkVersion, function (json)
    {
        if (_.isUndefined(json[program.args[0]]))
        {
            var message = 'The component "' + program.args[0] + '" doesn\'t exists';
            console.log(colors.red(message));

            process.exit(1);
        }

        var outPath = program.out || program.args[0] + '2widget.js';

        generateFile(json[program.args[0]], outPath, function ()
        {
            var message = 'Finish!\n'.green + 'Add following to the top of the index.js file from you widget:\n';
            var code = 'require(WPATH(\'' + outPath.replace('.js', '') + '\')).extend(exports, args, $.yourComponent);';
            message += code.yellow;
            console.log(message);
        });
    });
});

function getSDKVersions(callback)
{
    var html = '';

    http.get('http://docs.appcelerator.com/titanium/data/index.html', function (response)
    {
        response.on('data', function (chunk)
        {
            html += chunk;
        });

        response.on('end', function ()
        {
            var result = [];

            var pattern = /class="arrow-link">([\d.]+)<\/a><\/li>/g;
            var match;
            while ((match = pattern.exec(html)) !== null)
            {
                result.push(match[1]);
            }

            callback(result);
        })
    });
}

function downloadAPIJson(sdkVersion, callback)
{
    var data = '';

    http.get('http://docs.appcelerator.com/titanium/data/' + sdkVersion + '/api.json', function (response)
    {
        var length = parseInt(response.headers['content-length'], 10);

        var bar = new ProgressBar('Downloading api.json (' + sdkVersion + ') [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: length
        });

        response.on('data', function (chunk)
        {
            bar.tick(chunk.length);

            data += chunk;
        });

        response.on('end', function ()
        {
            var json = JSON.parse(data);

            storeJSON(sdkVersion, json);
            callback(json);
        })
    });
}

function getJSON(sdkVersion, callback)
{
    if (program.nocache == undefined && checkJSON(sdkVersion))
    {
        restoreJSON(sdkVersion, function (json)
        {
            callback(json);
        });
    } else
    {
        downloadAPIJson(sdkVersion, function (json)
        {
            callback(json);
        });
    }
}

function generateFile(jsonData, outPath, callback)
{
    fs.readFile(path.join(__dirname, 'template.stub'), function (err, data)
    {
        if (err) throw err;

        var template = hb.compile(data.toString());
        var result = template(jsonData);
        fs.writeFile(outPath, result, function (err)
        {
            if (err) throw err;

            callback();
        });
    });
}

function storeJSON(sdkVersion, json)
{
    fs.writeFile(path.join(tmp, 'titanium_api_' + sdkVersion + '.json'), JSON.stringify(json), function (err)
    {
        if (err) throw err;
    })
}

function restoreJSON(sdkVersion, callback)
{
    fs.readFile(path.join(tmp, 'titanium_api_' + sdkVersion + '.json'), function (err, data)
    {
        if (err) throw err;

        callback(JSON.parse(data));
    })
}

function checkJSON(sdkVersion)
{
    return fs.existsSync(path.join(tmp, 'titanium_api_' + sdkVersion + '.json'));
}