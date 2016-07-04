#!/usr/bin/env node

var glob = require("glob");
var commander = require("commander");
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");

var server = require("./lib/server");
var docGenerator = require("./lib/docGenerator");



commander
    .version('0.0.1')
    .option('-s,--server','create a api server')
    .option('-p,--port [port]', 'http server port. default 8877','8877')
    .option('-o,--output','generate document to the output path. defaults to \"build\"',"build")
    .parse(process.argv);

if(commander.server){
    var port = commander.port;
    console.log(port);
    server.start({
        port:port
    });
    console.log("create an api server on port %s : ", port);
}
if(commander.output){
    console.log(commander.output);
    var output = commander.output;
    docGenerator.config({
        output:output
    });
    fse.removeSync( path.join(process.cwd(),output) );
}



glob("**/*.json",function(err,files){
//glob("test.json",function(err,files){
    if(err){
        return console.log(err);
    }
    for (var i = 0, len = files.length; i < len; i++) {
        (function(i){
            fs.readFile(process.cwd()+"/"+files[i],"utf-8",function(err,data){
                if(err){
                    return console.log(err);
                }
                try {
                    var config = JSON.parse(data);
                    if(config.route&&commander.server){
                        server.addRoute(config,files[i]);
                    }
                    if(config.doc && commander.output){
                        console.log("begin to generate document");
                        var result = docGenerator.gen(config,files[i]);
                        docGenerator.writeFile(config.doc,result);
                    }
                }catch(err){
                    console.log("parse json file " + files[i]+" error")
                    console.log(err);
                }
            });
        })(i);
    }
});

