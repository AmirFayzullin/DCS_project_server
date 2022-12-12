const {run: runHTTPServer} = require("./expressServer/expressServer");


const main = async () => {
    runHTTPServer();
};

main();