module.exports = function(schema) {

    var faker = require("faker");
    faker.locale="zh_CN";
    var randexp = require("randexp");

    var res = null;
    if (schema.type == "object") {
        res = {};
        genObjNode(res, schema.properties);
    } else if (schema.type == "array") {
        res = [];
        schema.maxItems = schema.maxItems || 1;
        schema.minItems = schema.minItems || 1;
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
            itemConfig.maxItems = itemConfig.maxItems || 1;
            itemConfig.minItems = itemConfig.minItems || 1;
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
                tempConfig.maxItems = tempConfig.maxItems || 1;
                tempConfig.minItems = tempConfig.minItems || 1;
                parent[prop] = result;
                for (var i = tempConfig.minItems, len = tempConfig.maxItems + 1; i < len; i++) {
                    genListNode(result, tempConfig.items);
                }
            } else {
                parent[prop] = genData(tempConfig);

            }
        }
    }

    function genData(config) {
        if (config.faker) {
            return faker.fake("{{" + config.faker + "}}");
        } else if (config.pattern) {
            return new randexp(config.pattern).gen();

        } else {
            return "no data";
        }
    }

    return res;
    //console.log(JSON.stringify(res));

}

