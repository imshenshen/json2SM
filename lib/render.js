module.exports = function(schema, justDesc) {
    //console.log("justDESC : %s",justDesc);

    var faker = require("faker");
    faker.locale="zh_CN";
    var randexp = require("randexp");

    var res = null;
    if (schema.type == "object") {
        res = {};
        genObjNode(res, schema.properties);
    } else if (schema.type == "array") {
        res = [];
        if(justDesc){
            schema.maxItems = 1;
            schema.minItems = 1;
        }else{
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
            if(justDesc){
                itemConfig.maxItems = 1;
                itemConfig.minItems = 1;
            }else{
                itemConfig.maxItems = itemConfig.maxItems || 1;
                itemConfig.minItems = itemConfig.minItems || 1;
            }
            for (var i = itemConfig.minItems, len = itemConfig.maxItems + 1; i < len; i++) {
                genListNode(result, itemConfig.items);
            }

        }
        parent.push(result);
    }

    function genObjNode(parent, props) {
        for (var prop in props) {
            var result = null;
            var tempConfig = props[prop];
            if(typeof tempConfig != "object"){
                parent[prop] = tempConfig;
            }else if (tempConfig.type == "object") {
                result = {};
                parent[prop] = result;
                genObjNode(result, tempConfig.properties);
            } else if (tempConfig.type == "array") {
                result = [];
                if(justDesc){
                    tempConfig.maxItems = 1;
                    tempConfig.minItems = 1;
                }else{
                    tempConfig.maxItems = tempConfig.maxItems || 1;
                    tempConfig.minItems = tempConfig.minItems || 1;
                }
                parent[prop] = result;
                for (var i = 0, len = parseInt(Math.random()*(tempConfig.maxItems-tempConfig.minItems+1)+tempConfig.minItems); i < len; i++) {
                    genListNode(result, tempConfig.items);
                }
            } else {
                parent[prop] = genData(tempConfig);

            }
        }
    }

    function genData(config) {
        var result = "";
        if(justDesc){
            return config.desc  || "";
        }
        if (config.faker) {
            result =  faker.fake("{{" + config.faker + "}}");
        } else if (config.pattern) {
            result = new randexp(config.pattern).gen();
        } else {
            result =  "no data";
        }
        if(config.type=="integer"){
             result = parseInt(result);
        }
        return result ;
    }

    return res;
    //console.log(JSON.stringify(res));

}

