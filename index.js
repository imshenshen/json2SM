#!/usr/bin/env node

var glob = require("glob");
var commander = require("commander");
var fs = require("fs");
var server = require("./lib/server");



commander
    .version('0.0.1')
    .option('-p,--port <port>', 'http server port',parseInt)
    .parse(process.argv);

server.start({
    port:commander.port
});

glob("**/*.json",function(err,files){
    console.log(files);
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
                    if(config.route){
                        server.addRoute(config,files[i]);
                    }
                }catch(err){
                    console.log("parse json file " + files[i]+" error")
                    console.log(err);
                }
            });
        })(i);
    }
});

