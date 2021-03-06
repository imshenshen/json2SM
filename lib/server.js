var Hapi = require("hapi");
var server = new Hapi.Server();
var render = require("./render");

module.exports = {
    start: function(config) {
        server.connection({
            port: config.port,
            routes:{
                cors: {
                    origin: [ "*" ],
                    credentials: true
                }
            }
        });
        server.start();
    },
    addRoute: function(config, fileName,filePath) {
        // get,/user
        try {
            var configArray = config.route.split(",");
            var method = configArray[0]
            server.route({
                method: method,
                path: configArray[1],
                handler: function(request, reply) {
                    reply(render(config.result,false,filePath));
                }
            });
            console.log("add a new route: " + config.route);
        } catch (err) {
            console.log("route define error in %s", fileName);
            console.log(err);
        }
    }
}


