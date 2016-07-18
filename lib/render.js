
function render(schema, justDesc, schemaPath) {
    //console.log("justDESC : %s",justDesc);
    var path = require("path");
    var fs = require("fs");
    var yaml = require('js-yaml');
    var _ = require("lodash");

    var faker = require("faker");
    faker.locale = "zh_CN";
    var randexp = require("randexp");

    var res = null;
    if (schema.type == "object") {
        res = {};
        genObjNode(res, schema.properties);
    } else if (schema.type == "array") {
        res = [];
        if (justDesc) {
            schema.maxItems = 1;
            schema.minItems = 1;
        } else {
            schema.maxItems = schema.maxItems || 1;
            schema.minItems = schema.minItems || 1;
        }

        for (var i = schema.minItems, len = schema.maxItems + 1; i < len; i++) {
            genListNode(res, schema.items);
        }
    }

    function genListNode(parent, itemConfig) {
        var result = null
        if (itemConfig.type == "object") {
            result = {};
            genObjNode(result, itemConfig.properties);
        } else if (itemConfig.type == "array") {
            result = [];
            if (justDesc) {
                itemConfig.maxItems = 1;
                itemConfig.minItems = 1;
            } else {
                itemConfig.maxItems = itemConfig.maxItems || 1;
                itemConfig.minItems = itemConfig.minItems || 1;
            }
            for (var i = itemConfig.minItems, len = itemConfig.maxItems + 1; i < len; i++) {
                genListNode(result, itemConfig.items);
            }
        }
        parent.push(result);
    }
    function genIncludeNode(parent,includePath){
        var nextLevelPath = "";
        if(includePath.indexOf(".")==0){
            nextLevelPath = path.join(schemaPath,includePath);
        }else{
            nextLevelPath = path.join(process.cwd(),includePath);
        }
        //todo 有空换成 node-config
        var includedSchema = fs.readFileSync(nextLevelPath,"utf8");
        try {
            if(/\S+.(yaml|yml)$/gi.test(nextLevelPath)){
                includedSchema = yaml.load(includedSchema);
            }else{
                includedSchema = JSON.parse(includedSchema);
            }
        }catch(err){
            console.log("parse included file " + nextLevelPath  +" error");
            console.log(err);
            includedSchema = null;
        }
        if (includedSchema) {
            parent = _.assign(parent || {}, render({
                type: "object",
                properties: includedSchema
            }, justDesc, schemaPath));
        }
    }

    function genObjNode(parent, props) {
        for (var prop in props) {
            var result = null;
            var tempConfig = props[prop] || {};
            if(prop == '$include'){
                if(_.isString(tempConfig)){
                    genIncludeNode(parent,tempConfig);
                }else if(_.isArray(tempConfig)){
                    for (var i = 0, len = tempConfig.length; i < len; i++) {
                        var includeConfig = tempConfig[i];
                        if(_.isString(includeConfig)){
                            genIncludeNode(parent,includeConfig);
                        }else if(_.isObject(includeConfig)){
                            // {path:,rename:,with:,without}
                            for (var includeProp in includeConfig) {
                                genIncludeNode(parent,includeConfig[includeProp]);
                            }
                        }
                    }
                }
            } else if (typeof tempConfig != "object") {
                // code:200 这种形式的直接赋值
                parent[prop] = tempConfig;
            } else if (tempConfig.type) {
                // code:
                //      type: object/array 这种形式
                if (tempConfig.type == "object") {
                    result = {};
                    parent[prop] = result;
                    genObjNode(result, tempConfig.properties);
                } else if (tempConfig.type == "array") {
                    result = [];
                    if (justDesc) {
                        tempConfig.maxItems = 1;
                        tempConfig.minItems = 1;
                    } else {
                        tempConfig.maxItems = tempConfig.maxItems || 1;
                        tempConfig.minItems = tempConfig.minItems || 1;
                    }
                    parent[prop] = result;
                    for (var i = 0, len = parseInt(Math.random() * (tempConfig.maxItems - tempConfig.minItems + 1) + tempConfig.minItems); i < len; i++) {
                        genListNode(result, tempConfig.items);
                    }
                }
            } else if(tempConfig.$extend){

            }else {
                // 需要生成数据
                parent[prop] = genData(tempConfig);

            }
        }
    }

    function genData(config) {
        var result = "";
        if (justDesc) {
            return config.desc || "";
        }
        if (config.faker) {
            if (config.faker.indexOf("{{") != -1) {
                result = faker.fake(config.faker);
            } else {
                var funArray = config.faker.split(".");
                result = faker[funArray[0]][funArray[1]]();
            }
        } else if (config.pattern) {
            result = new randexp(config.pattern).gen();
        } else {
            result = "no data";
        }
        if (config.type == "integer") {
            result = parseInt(result);
        }
        return result;
    }

    return res;
    //console.log(JSON.stringify(res));

}


module.exports = render;
