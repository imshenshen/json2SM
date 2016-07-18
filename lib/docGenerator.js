var json2md = require("json2md");
var render = require("./render.js");
var fse = require("fs-extra");
var path = require("path");
var fs = require("fs");

var output;

module.exports = {
    config:function(config){
        output = config.output;
    },
    gen: function(schema, filename, filePath) {
        var markdown = [];
        if (schema.doc) {
            console.log("gen doc : file %s :", filename);
            markdown.push({
                h3: schema.doc.title
            });
            if (schema.doc.desc) {
                markdown.push({
                    p: schema.doc.desc
                });
            }
            if (schema.route){
                markdown.push({
                    p: schema.route
                });
            }
            if (schema.params) {
                markdown.push({
                    h4: "请求参数"
                });
                var paramsArray = [];
                for (var par in schema.params) {
                    var tempObj = schema.params[par] || {};
                    paramsArray.push([par, "" + (tempObj.necessary||'false'), tempObj.desc||""]);
                }
                markdown.push({
                    table: {
                        headers: ["param", "必选", "说明"],
                        rows: paramsArray
                    }
                });
                if (schema.result) {
                    markdown.push({
                        h4: "返回数据"
                    });
                    markdown.push({
                        code: {
                            language: "js",
                            content: JSON.stringify(render(schema.result,true,filePath),null,4)
                        }
                    });
                }
            }
            return json2md(markdown);
        }
        return "";

    },
    writeFile: function(data) {
        for (var tpath in data) {
            var result = data[tpath];

            (function(tpath,result){
                console.log(tpath);
                fse.ensureFile(tpath, function() {
                    fs.writeFile(tpath,result,"utf8",function(){

                    });
                    //fs.readFile(tpath, "utf8", function(err, data) {
                        //var result = data + "------\n" + text;
                    //});
                })
            })(path.join(process.cwd(), output , tpath) , result)
        }
    }
}
