#!/usr/bin/env node

var glob = require("glob");
var commander = require("commander");
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
var yaml = require('js-yaml');

var server = require("./lib/server");
var docGenerator = require("./lib/docGenerator");



commander
    .version('0.0.1')
    .option('-s,--server','create a api server')
    .option('-p,--port [port]', 'http server port. default 8877','8877')
    .option('-o,--output [output]','generate document to the output path. defaults to \"build\"')
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
    var output = commander.output;
    if(typeof commander.output == "boolean"){
        output = "build";
    }
    console.log(output);
    docGenerator.config({
        output:output
    });
    fse.removeSync( path.join(process.cwd(),output) );
}



glob("**/*.{json,yaml,yml}",function(err,files){
//glob("test.json",function(err,files){
    if(err){
        return console.log(err);
    }
    var docs = {};
    var st = null;
    for (var i = 0, len = files.length; i < len; i++) {
        (function(i){
            var filepath = process.cwd()+"/"+files[i];
            fs.readFile(filepath,"utf-8",function(err,data){
                if(err){
                    return console.log(err);
                }
                try {
                    var config;
                    if(/\S+.(yaml|yml)$/gi.test(files[i])){
                        config = yaml.load(data);
                    }else{
                        config = JSON.parse(data);
                    }
                    if(config.route&&commander.server){
                        server.addRoute(config,files[i],filepath.substring(0,filepath.lastIndexOf("/")+1));
                    }
                    if(config.doc && commander.output){
                        console.log("begin to generate document");
                        var result = docGenerator.gen(config,filepath.substring(0,filepath.lastIndexOf("/")+1));
                        var path = config.doc.path;
                        docs[path] = docs[path] || "";
                        docs[path] += result+"\n -------- \n";
                        clearTimeout(st);
                        st = setTimeout(function(){
                            docGenerator.writeFile(docs);
                        },3000);
                    }
                }catch(err){
                    console.log("parse file " + files[i]+" error")
                    console.log(err);
                }
            });
        })(i);
    }
});

