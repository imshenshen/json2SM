var Hapi = require("hapi");
var server = new Hapi.Server();
var render = require("./render");

module.exports = {
    start: function(config) {
        server.connection({
            port: config.port
        });
        server.start();
    },
    addRoute: function(config, fileName) {
        // get,/user
        console.log("add a new route: " + config.route);
        try {
            var configArray = config.route.split(",");
            var method = configArray[0]
            server.route({
                method: method,
                path: configArray[1],
                handler: function(request, reply) {
                    reply(render(config));
                }
            });

        } catch (err) {
            console.log("route define error in %s", fileName);
        }
    }
}


